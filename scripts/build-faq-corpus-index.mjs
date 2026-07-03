#!/usr/bin/env node
/**
 * build-faq-corpus-index.mjs — CPM FAQ pipeline, track A (foundation).
 *
 * Builds a single queryable index of the content corpus that every other
 * track-A subsystem reads:
 *   - blog posts        (content/blog/<slug>.mdx)        — public
 *   - FAQ entries       (content/faq/<slug>.md)          — public, the live hub
 *   - feedstock Q&A     (sidecar <slug>.json `faq[]`)    — public Q&A only
 *
 * The sidecars also carry PRIVATE fields (gemini_prompt, source_chat_context).
 * Those must NEVER enter the index — the repo is public. This script reads a
 * strict allow-list of sidecar fields and asserts the banned keys are absent
 * from the serialized output before writing (privacy guard, mirrors post-blog).
 *
 * Output is a DERIVED artifact (regenerable from the corpus), so it is gitignored
 * rather than committed — no churn, no chance of leaking sidecar content.
 *
 * Usage:
 *   node scripts/build-faq-corpus-index.mjs [options]
 *
 * Options:
 *   --sidecar-dir <paths> Where blog sidecars live. Accepts a COMMA-SEPARATED list;
 *                         feedstock is merged + deduped across dirs. Default
 *                         ./.blog-sidecar. In practice point at .blog-processed
 *                         (where post-blog.mjs / the Track D inbox runner write each
 *                         emailed post's parsed faq[]) plus .faq-backfill (legacy
 *                         seam). Missing dirs are skipped — feedstock just excludes them.
 *   --out <path>          Index output path (default scripts/faq-corpus-index.json).
 *   --quiet               Suppress the human summary.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const BLOG_DIR = path.join(REPO_ROOT, 'content/blog')
const FAQ_DIR = path.join(REPO_ROOT, 'content/faq')

const INDEX_VERSION = 1
// Private sidecar fields that must never reach the index (repo is public).
const BANNED_SIDECAR_FIELDS = ['gemini_prompt', 'source_chat_context']

const fail = (msg) => {
  console.error(`\n✗ ${msg}\n`)
  process.exit(1)
}

function parseArgs(argv) {
  const opts = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--quiet') opts.quiet = true
    else if (a.startsWith('--')) opts[a.slice(2)] = argv[++i]
    else opts._.push(a)
  }
  return opts
}

// Flatten MDX/Markdown to lowercased plain text for keyword/overlap matching.
function toPlainText(md) {
  return String(md)
    .replace(/```[\s\S]*?```/g, ' ') // fenced code
    .replace(/`[^`]*`/g, ' ') // inline code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links -> text
    .replace(/<[^>]+>/g, ' ') // jsx/html tags
    .replace(/[#>*_~`|]/g, ' ') // md markers
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

const asArray = (v) => (Array.isArray(v) ? v.map(String) : [])

function readBlog() {
  if (!fs.existsSync(BLOG_DIR)) return []
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => {
      const slug = f.replace(/\.mdx$/, '')
      const { data, content } = matter(fs.readFileSync(path.join(BLOG_DIR, f), 'utf8'))
      const bodyText = toPlainText(content)
      return {
        slug,
        title: String(data.title || ''),
        category: data.category ? String(data.category) : null,
        tags: asArray(data.tags),
        decisionIntent: asArray(data.decision_intent),
        excerpt: String(data.excerpt || ''),
        faqSlugs: asArray(data.faq), // existing spoke links (hub references)
        bodyText,
        wordCount: bodyText ? bodyText.split(' ').length : 0,
      }
    })
    .sort((a, b) => a.slug.localeCompare(b.slug))
}

function readFaq() {
  if (!fs.existsSync(FAQ_DIR)) return []
  return fs
    .readdirSync(FAQ_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const slug = f.replace(/\.md$/, '')
      const { data, content } = matter(fs.readFileSync(path.join(FAQ_DIR, f), 'utf8'))
      const annotations = Array.isArray(data.annotations) ? data.annotations : []
      const annotationTypes = annotations.map((a) => String((a && a.type) || 'additive'))
      const sources = Array.isArray(data.sources) ? data.sources : []
      return {
        slug,
        question: String(data.question || ''),
        topic: String(data.topic || 'general'),
        topicTitle: String(data.topicTitle || data.topic || 'General'),
        type: data.type === 'objective' ? 'objective' : 'subjective',
        derivedFrom: asArray(data.derivedFrom),
        related: asArray(data.related), // existing cross-links (slice 3) — detector dedupes against these
        created: String(data.created || ''),
        order: typeof data.order === 'number' ? data.order : 999,
        sourceCount: sources.length,
        annotationCount: annotations.length,
        annotationTypes,
        hasContradiction: annotationTypes.includes('contradiction'),
        // escalation rule (framing doc): 3 annotations OR any contradiction-grade note
        needsRewrite: annotations.length >= 3 || annotationTypes.includes('contradiction'),
        answerText: toPlainText(content),
      }
    })
    .sort((a, b) => a.slug.localeCompare(b.slug))
}

// Harvest ONLY the public Q&A from sidecars. Strict allow-list — never touch the
// private fields.
function readFeedstock(sidecarDir) {
  if (!fs.existsSync(sidecarDir)) return { feedstock: [], sidecarsRead: 0, missing: true }
  const files = fs.readdirSync(sidecarDir).filter((f) => f.endsWith('.json'))
  const feedstock = []
  let sidecarsRead = 0
  for (const f of files) {
    let parsed
    try {
      parsed = JSON.parse(fs.readFileSync(path.join(sidecarDir, f), 'utf8'))
    } catch {
      continue // skip malformed sidecar
    }
    sidecarsRead++
    const sourceSlug = String(parsed.slug || f.replace(/\.json$/, ''))
    const faq = Array.isArray(parsed.faq) ? parsed.faq : []
    for (const qa of faq) {
      if (!qa || typeof qa !== 'object') continue
      const q = String(qa.q || '').trim()
      const a = String(qa.a || '').trim()
      if (q && a) feedstock.push({ sourceSlug, q, a })
    }
  }
  return { feedstock, sidecarsRead, missing: false }
}

// ---------- main ----------
const opts = parseArgs(process.argv.slice(2))
// --sidecar-dir accepts a comma-separated LIST so one run can harvest both the
// live new-post archive (.blog-processed — where post-blog.mjs / the Track D inbox
// runner write each emailed post's parsed faq[]) and the legacy backfill seam
// (.faq-backfill). Feedstock is merged and deduped by sourceSlug+question.
const sidecarDirs = String(opts['sidecar-dir'] || '.blog-sidecar')
  .split(',')
  .map((d) => d.trim())
  .filter(Boolean)
  .map((d) => path.resolve(REPO_ROOT, d))
const outPath = path.resolve(REPO_ROOT, opts.out || 'scripts/faq-corpus-index.json')

const blog = readBlog()
const faq = readFaq()

const feedstock = []
const seenQA = new Set()
let sidecarsRead = 0
const missingDirs = []
for (const dir of sidecarDirs) {
  const r = readFeedstock(dir)
  if (r.missing) {
    missingDirs.push(dir)
    continue
  }
  sidecarsRead += r.sidecarsRead
  for (const qa of r.feedstock) {
    const key = `${qa.sourceSlug}::${qa.q}`
    if (seenQA.has(key)) continue
    seenQA.add(key)
    feedstock.push(qa)
  }
}

const index = {
  version: INDEX_VERSION,
  generatedAt: new Date().toISOString(),
  sidecarDirs: sidecarDirs.map((d) => path.relative(REPO_ROOT, d)),
  counts: {
    blog: blog.length,
    faq: faq.length,
    feedstock: feedstock.length,
    sidecarsRead,
  },
  blog,
  faq,
  feedstock,
}

// PRIVACY GUARD — the serialized index must not contain any banned sidecar field.
const serialized = JSON.stringify(index, null, 2)
for (const banned of BANNED_SIDECAR_FIELDS) {
  if (serialized.includes(banned)) fail(`Privacy guard tripped: "${banned}" leaked into the corpus index.`)
}

fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, serialized)

if (!opts.quiet) {
  console.log(`\nCPM FAQ corpus index → ${path.relative(REPO_ROOT, outPath)}`)
  console.log(`  blog posts     ${blog.length}`)
  console.log(`  FAQ entries    ${faq.length}`)
  console.log(`  feedstock Q&A  ${feedstock.length} (from ${sidecarsRead} sidecar${sidecarsRead === 1 ? '' : 's'} across ${sidecarDirs.length} dir${sidecarDirs.length === 1 ? '' : 's'}: ${sidecarDirs.map((d) => path.relative(REPO_ROOT, d)).join(', ')})`)
  if (missingDirs.length) {
    for (const d of missingDirs) console.log(`  note: sidecar dir not found (${path.relative(REPO_ROOT, d)}) — skipped.`)
    if (missingDirs.length === sidecarDirs.length) {
      console.log(`        point --sidecar-dir at .blog-processed (new posts) and/or the CPM-Blog-Processed Drive folder to harvest Q&A.`)
    }
  }
  const needRewrite = faq.filter((e) => e.needsRewrite)
  if (needRewrite.length) {
    console.log(`  ⚠ ${needRewrite.length} entr${needRewrite.length === 1 ? 'y' : 'ies'} flagged for base rewrite (escalation): ${needRewrite.map((e) => e.slug).join(', ')}`)
  }
  console.log('')
}
