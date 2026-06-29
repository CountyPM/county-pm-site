#!/usr/bin/env node
/**
 * backfill-faq-feedstock.mjs — CPM FAQ pipeline, track A (backfill seam).
 *
 * The write path harvests FAQ feedstock from blog sidecars, but the 12 posts
 * published before the pipeline existed never produced sidecars (post-blog.mjs
 * strips the ---FAQ--- block to the sidecar at posting time, and these predate
 * it). This script reconstructs feedstock from those posts so the hub can be
 * seeded now — without re-running the posting flow.
 *
 * It does NOT invent answers. It deterministically extracts candidate raw
 * material (each H2/H3 section's heading + lead paragraph) into a per-post
 * CURATION PACKET, then a human/Claude turns that material into real, accurate
 * Q&A (most headings are statements, not questions — they need rephrasing). The
 * harvest step reads the curated packets and emits sidecar-shaped feedstock JSON
 * that build-faq-corpus-index.mjs reads via --sidecar-dir. Same human gate as the
 * rest of track A: extract + scaffold only; the judgment is a person's.
 *
 * Flow:
 *   1. node scripts/backfill-faq-feedstock.mjs                 # scaffold packets
 *   2. <edit content/faq-backfill/*.md — write real Q:/A: pairs>
 *   3. node scripts/backfill-faq-feedstock.mjs --harvest       # -> .faq-backfill/*.json
 *   4. node scripts/build-faq-corpus-index.mjs --sidecar-dir .faq-backfill
 *   5. node scripts/draft-faq-entries.mjs
 *
 * Options:
 *   --harvest          Harvest curated packets into feedstock JSON (mode switch).
 *   --post <slug>      Only this post (repeatable via comma list).
 *   --limit <n>        Scaffold at most n packets.
 *   --packet-dir <p>   Curation packets dir (default content/faq-backfill).
 *   --out-dir <p>      Harvested feedstock dir (default .faq-backfill).
 *   --force            Overwrite existing packets on scaffold.
 *   --quiet            Suppress the summary.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const BLOG_DIR = path.join(REPO_ROOT, 'content/blog')
const FAQ_DIR = path.join(REPO_ROOT, 'content/faq')

const TODO = 'TODO rephrase as a standalone question:'

const fail = (msg) => {
  console.error(`\n✗ ${msg}\n`)
  process.exit(1)
}

function parseArgs(argv) {
  const opts = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--harvest' || a === '--force' || a === '--quiet') opts[a.slice(2)] = true
    else if (a.startsWith('--')) opts[a.slice(2)] = argv[++i]
    else opts._.push(a)
  }
  return opts
}

// Strip inline markdown so headings/answers read as plain prose.
function clean(s) {
  return String(s)
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// Split a post body into {heading, lead} sections by H2/H3. Lead = the first
// paragraph of prose under the heading (the part most likely to be the answer).
function extractSections(body) {
  // Normalize CRLF — the corpus has mixed line endings; a trailing \r breaks the
  // heading regex's end anchor and makes a post look headingless.
  const lines = String(body).replace(/\r\n?/g, '\n').split('\n')
  const sections = []
  let heading = null
  let buf = []
  const flush = () => {
    if (heading == null && buf.length === 0) return
    // lead paragraph = text up to the first blank line after some content
    const lead = []
    for (const l of buf) {
      if (l.trim() === '') {
        if (lead.length) break
        continue
      }
      if (/^#{1,6}\s/.test(l)) break
      lead.push(l.trim())
    }
    const leadText = clean(lead.join(' ')).slice(0, 500)
    if (heading != null || leadText) sections.push({ heading: heading ? clean(heading) : null, lead: leadText })
  }
  for (const l of lines) {
    const m = l.match(/^#{2,3}\s+(.+)$/)
    if (m) {
      flush()
      heading = m[1]
      buf = []
    } else {
      buf.push(l)
    }
  }
  flush()
  return sections.filter((s) => s.lead) // a candidate needs answer material
}

// Reuse post-blog.mjs's Q:/A: block contract so curators use one convention.
function parseFaqBlocks(raw) {
  const idx = raw.indexOf('---FAQ---')
  const faqRaw = idx === -1 ? raw : raw.slice(idx + '---FAQ---'.length)
  const out = []
  for (const b of faqRaw.split(/\n(?=Q:)/)) {
    const q = (b.match(/Q:\s*([\s\S]*?)(?:\nA:|$)/) || [])[1]
    const a = (b.match(/A:\s*([\s\S]*)$/) || [])[1]
    if (q && a) out.push({ q: q.trim(), a: a.trim() })
  }
  return out
}

function existingHubQuestions() {
  if (!fs.existsSync(FAQ_DIR)) return []
  return fs
    .readdirSync(FAQ_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => String(matter(fs.readFileSync(path.join(FAQ_DIR, f), 'utf8')).data.question || ''))
    .filter(Boolean)
}

function listPosts(opts) {
  if (!fs.existsSync(BLOG_DIR)) fail('No content/blog directory.')
  let slugs = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''))
  if (opts.post) {
    const want = new Set(String(opts.post).split(',').map((s) => s.trim()))
    slugs = slugs.filter((s) => want.has(s))
  }
  if (opts.limit) slugs = slugs.slice(0, Number(opts.limit))
  return slugs.sort()
}

// ---------- scaffold ----------
function scaffold(opts, packetDir) {
  const hubQs = existingHubQuestions()
  const dedupGuard = hubQs.length
    ? hubQs.map((q) => `       - ${q}`).join('\n')
    : '       (none yet)'
  fs.mkdirSync(packetDir, { recursive: true })

  let written = 0
  let skipped = 0
  const results = []
  for (const slug of listPosts(opts)) {
    const packetPath = path.join(packetDir, `${slug}.md`)
    if (fs.existsSync(packetPath) && !opts.force) {
      skipped++
      results.push({ slug, status: 'exists-skipped' })
      continue
    }
    const { data, content } = matter(fs.readFileSync(path.join(BLOG_DIR, `${slug}.mdx`), 'utf8'))
    const sections = extractSections(content)

    const stubs = sections
      .map((s) => {
        // Always carry the sentinel so NOTHING harvests until a human confirms the
        // question — even a heading that already ends in "?" (often a section label
        // like "So what does this mean?", not a real FAQ question).
        const hint = s.heading ? ` ${s.heading}` : ' (post lede)'
        return `Q: ${TODO}${hint}\nA: ${s.lead}`
      })
      .join('\n\n')

    const packet = `<!--
  FAQ BACKFILL CURATION PACKET — ${slug}
  Title:    ${clean(data.title || '')}
  Category: ${data.category || '(none)'}

  This is reconstructed raw material from a pre-pipeline post. The Q/A pairs below
  are AUTO-EXTRACTED (each H2/H3 heading + its lead paragraph) and are NOT yet real
  FAQ questions. To curate:
    1. Rewrite every "${TODO}" line into a real, standalone question a Ventura
       County owner/tenant would ask. Delete candidates that aren't genuinely FAQ-worthy.
    2. Tighten each A: to the accurate claim the post makes (this becomes raw material
       the draft step rewrites — it must be FACTUALLY faithful to the post, not polished).
    3. Delete any question already answered by the hub (dedup guard below).
    4. Keep ~3-6 strong questions. Leave the ---FAQ--- marker in place.
  Then run: node scripts/backfill-faq-feedstock.mjs --harvest

  Already in the hub (do NOT duplicate):
${dedupGuard}
-->

---FAQ---

${stubs || `Q: ${TODO} (no sections found — write from the post)\nA: `}
`
    fs.writeFileSync(packetPath, packet)
    written++
    results.push({ slug, status: 'written', candidates: sections.length })
  }
  return { written, skipped, results }
}

// ---------- harvest ----------
function harvest(opts, packetDir, outDir) {
  if (!fs.existsSync(packetDir)) fail(`No packet dir at ${path.relative(REPO_ROOT, packetDir)}. Run scaffold first.`)
  fs.mkdirSync(outDir, { recursive: true })
  const results = []
  let totalQa = 0
  for (const f of fs.readdirSync(packetDir).filter((x) => x.endsWith('.md'))) {
    const slug = f.replace(/\.md$/, '')
    const raw = fs.readFileSync(path.join(packetDir, f), 'utf8')
    const faq = parseFaqBlocks(raw).filter((qa) => qa.q && !qa.q.includes(TODO) && qa.a)
    if (!faq.length) {
      results.push({ slug, qa: 0, status: 'no-curated-qa' })
      continue
    }
    const sidecar = {
      slug,
      generated_at: new Date().toISOString(),
      source: 'backfill',
      faq, // public Q&A only — sidecar shape build-faq-corpus-index.mjs reads
    }
    fs.writeFileSync(path.join(outDir, `${slug}.json`), JSON.stringify(sidecar, null, 2))
    totalQa += faq.length
    results.push({ slug, qa: faq.length, status: 'harvested' })
  }
  return { results, totalQa }
}

// ---------- main ----------
const opts = parseArgs(process.argv.slice(2))
const packetDir = path.resolve(REPO_ROOT, opts['packet-dir'] || 'content/faq-backfill')
const outDir = path.resolve(REPO_ROOT, opts['out-dir'] || '.faq-backfill')

if (opts.harvest) {
  const { results, totalQa } = harvest(opts, packetDir, outDir)
  if (!opts.quiet) {
    console.log(`\nCPM FAQ backfill — harvest`)
    const ok = results.filter((r) => r.status === 'harvested')
    console.log(`  packets harvested  ${ok.length}`)
    console.log(`  curated Q&A        ${totalQa} -> ${path.relative(REPO_ROOT, outDir)}/`)
    for (const r of results) console.log(`    - ${r.slug}: ${r.qa} Q&A${r.status === 'no-curated-qa' ? ' (skipped — still uncurated)' : ''}`)
    console.log(`\n  Next: node scripts/build-faq-corpus-index.mjs --sidecar-dir ${path.relative(REPO_ROOT, outDir)}\n        node scripts/draft-faq-entries.mjs\n`)
  }
} else {
  const { written, skipped, results } = scaffold(opts, packetDir)
  if (!opts.quiet) {
    console.log(`\nCPM FAQ backfill — scaffold`)
    console.log(`  packets written    ${written} -> ${path.relative(REPO_ROOT, packetDir)}/`)
    if (skipped) console.log(`  skipped (exist)    ${skipped} (use --force to overwrite)`)
    for (const r of results.filter((x) => x.status === 'written')) console.log(`    - ${r.slug}.md (${r.candidates} candidate section${r.candidates === 1 ? '' : 's'})`)
    console.log(`\n  Next: curate the Q:/A: pairs in each packet, then run with --harvest.\n`)
  }
}
