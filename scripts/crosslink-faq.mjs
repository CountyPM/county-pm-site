#!/usr/bin/env node
/**
 * crosslink-faq.mjs — CPM FAQ pipeline, track A slice 3 (subsidiary registry + cross-linking).
 *
 * The hub's 30+ answers were authored as standalone passages. This engine builds
 * the INTERLINK layer: it DETECTS which entries genuinely relate to each other
 * and PROPOSES a reciprocal `related: [slug]` link for review. As with the rest of
 * track A (draft-faq-entries / reconcile-faq), the script only detects + drafts;
 * a human/Claude confirms each proposal; an explicit --apply step writes the link
 * into both entries (append-only, reciprocal, idempotent); validate-faq.mjs gates;
 * the two-stage publish ships it. Cross-links are low-risk additive edits — no
 * legal/financial claim changes — so they publish full-auto once confirmed.
 *
 * Why links (the GEO payoff): answer engines evaluate passages and reward topical
 * authority. A connected graph of "related questions" + shared authoritative
 * entities (statutes/orgs) tells a retriever these passages belong to one
 * well-covered subject area, and gives it more citable surface per query.
 *
 * TWO MODES
 *   (default) DETECT  — read the corpus index, score every entry pair on four
 *                       deterministic signals (below), keep the strongest links
 *                       per entry, and write one review packet per proposed pair
 *                       to content/faq-crosslink/ for Claude/human to confirm.
 *   --apply           — scan content/faq-crosslink/ for packets marked
 *                       `status: confirmed`, and write the link into BOTH entries'
 *                       `related:` frontmatter (reciprocal, deduped, idempotent).
 *                       Never publishes.
 *
 * SIGNALS (deterministic, explainable — recorded on every packet):
 *   co-citation   shared derivedFrom blog, OR a blog post that spokes (faq:) to
 *                 both entries. Strong: the answers share source material.
 *   shared-statute the same normalized statute/code ref appears in both answers
 *                 (reuses the slice-2 extractFacts sniff). Strong topical bond.
 *   token-overlap jaccard of the entries' salient terms. Adds recall.
 *   shared-topic  same topic cluster. Weak on its own (already co-located on one
 *                 page), so a link is NEVER proposed on shared-topic alone.
 *
 * Usage:
 *   node scripts/crosslink-faq.mjs [--index p] [--out-dir p] [--faq-dir p]
 *                                  [--min 3] [--jac 0.12] [--cap 4]
 *                                  [--json p] [--force] [--dry-run] [--quiet]
 *   node scripts/crosslink-faq.mjs --apply [--crosslink-dir p] [--faq-dir p]
 *                                  [--json p] [--dry-run] [--quiet]
 *
 * Options (detect):
 *   --index <path>     Corpus index (default scripts/faq-corpus-index.json). Run index:faq-corpus first.
 *   --out-dir <path>   Review queue for packets (default content/faq-crosslink).
 *   --faq-dir <path>   Live hub, read for idempotency (default content/faq).
 *   --min <n>          Minimum pair score to propose a link (default 3).
 *   --jac <0..1>       Token-overlap floor that counts as a "structural" signal (default 0.12).
 *   --cap <n>          Max proposed links kept per entry (default 4).
 *   --json <path>      Also write the run report as JSON.
 *   --force            Overwrite an existing packet (loses any in-progress edit — off by default).
 *   --dry-run          Report only; write no packets.
 *   --quiet            Suppress the human summary.
 * Options (apply):
 *   --crosslink-dir <p> Packet queue to read (default content/faq-crosslink).
 *   --faq-dir <p>       Live hub to write into (default content/faq).
 *   --json <path>       Machine-readable apply report.
 *   --dry-run           Show what would be linked; write nothing.
 *   --quiet             Suppress the human summary.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const fail = (msg) => {
  console.error(`\n✗ ${msg}\n`)
  process.exit(1)
}

function parseArgs(argv) {
  const opts = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--apply' || a === '--force' || a === '--dry-run' || a === '--quiet')
      opts[a.slice(2).replace(/-/g, '')] = true
    else if (a.startsWith('--')) opts[a.slice(2)] = argv[++i]
    else opts._.push(a)
  }
  return opts
}

// ---------- text utils (same shape as reconcile-faq.mjs / draft-faq-entries.mjs) ----------
const STOP = new Set(
  ('a an the and or but if then is are was were be been being do does did have has had of to in on for ' +
    'with at by from as it its this that these those you your i we they he she them his her our about into ' +
    'can could should would will may might must not no yes my me us who what when where why how which whom ' +
    'than too very just so up out off over under again more most some any all each')
    .split(' ')
)

function tokens(s) {
  return new Set(
    String(s)
      .toLowerCase()
      .replace(/[^a-z0-9%]+/g, ' ')
      .split(' ')
      .filter((t) => t.length >= 3 && !STOP.has(t))
  )
}

function jaccard(a, b) {
  if (!a.size || !b.size) return 0
  let inter = 0
  for (const t of a) if (b.has(t)) inter++
  return inter / (a.size + b.size - inter)
}

const asArray = (v) => (Array.isArray(v) ? v.map(String) : [])
const intersect = (a, b) => a.filter((x) => b.includes(x))
const round = (n) => Number(Number(n).toFixed(3))

// Statute/code references, normalized to their numeric core so "§1947.12",
// "civil code 1947.12" and "section 1947.12" collapse to one token. Same
// extraction as reconcile-faq.mjs sniffContradiction (kept standalone).
function statuteRefs(text) {
  const t = ` ${String(text).toLowerCase()} `
  const out = new Set()
  for (const m of t.matchAll(/(?:§|section|sec\.?|civ\.?\s*code|code\s+section|ccp|civil\s+code)\s*#?\s*(\d{2,4}(?:\.\d+)*)/g))
    out.add(m[1])
  for (const m of t.matchAll(/\b(ab|sb)\s?-?\s?(\d{2,4})\b/g)) out.add(`${m[1]}${m[2]}`)
  for (const m of t.matchAll(/\bsection\s+(121|1031)\b/g)) out.add(m[1])
  for (const m of t.matchAll(/\b(1031)\s+exchange\b/g)) out.add(m[1])
  return out
}

// Weights — deterministic and explainable. Co-citation and shared statute are the
// strong relatedness signals (shared source material / shared legal subject);
// token overlap adds recall; shared topic is a weak tiebreaker because same-topic
// entries already share a page.
const W = { coCitation: 3, sharedStatute: 3, jaccard: 5, sharedTopic: 1 }

// ===================================================================
// DETECT MODE
// ===================================================================
function runDetect(opts) {
  const indexPath = path.resolve(REPO_ROOT, opts.index || 'scripts/faq-corpus-index.json')
  const outDir = path.resolve(REPO_ROOT, opts['out-dir'] || 'content/faq-crosslink')
  const faqDir = path.resolve(REPO_ROOT, opts['faq-dir'] || 'content/faq')
  const minScore = opts.min != null ? Number(opts.min) : 3
  const jacFloor = opts.jac != null ? Number(opts.jac) : 0.12
  const cap = opts.cap != null ? Number(opts.cap) : 4

  if (!fs.existsSync(indexPath))
    fail(`Corpus index not found at ${path.relative(REPO_ROOT, indexPath)}. Run: node scripts/build-faq-corpus-index.mjs`)
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'))
  const blog = index.blog || []
  const faq = index.faq || []
  if (faq.length < 2) fail(`Need at least 2 FAQ entries to cross-link (found ${faq.length}).`)

  // Pre-compute per-entry features once.
  const entries = faq.map((e) => ({
    slug: e.slug,
    question: e.question,
    topic: e.topic,
    derivedFrom: asArray(e.derivedFrom),
    related: asArray(e.related),
    toks: tokens(`${e.question} ${e.answerText || ''}`),
    statutes: statuteRefs(`${e.question} ${e.answerText || ''}`),
  }))
  // Refresh `related` from the live entries (index may be stale vs. an in-flight apply).
  for (const e of entries) {
    const p = path.join(faqDir, `${e.slug}.md`)
    if (!fs.existsSync(p)) continue
    try {
      const live = matter(fs.readFileSync(p, 'utf8'))
      e.related = asArray(live.data.related)
    } catch {
      /* keep index value */
    }
  }
  // Posts that spoke to >=2 entries become a co-citation bridge between them.
  const spokePosts = blog
    .map((p) => ({ slug: p.slug, title: p.title, faqSlugs: asArray(p.faqSlugs) }))
    .filter((p) => p.faqSlugs.length >= 2)

  const bySlug = new Map(entries.map((e) => [e.slug, e]))
  const alreadyLinked = (aSlug, bSlug) => {
    const a = bySlug.get(aSlug)
    const b = bySlug.get(bSlug)
    return Boolean((a && a.related.includes(bSlug)) || (b && b.related.includes(aSlug)))
  }

  // Score every unordered pair.
  const scored = []
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const a = entries[i]
      const b = entries[j]

      const sharedDerived = intersect(a.derivedFrom, b.derivedFrom)
      const sharedSpokes = spokePosts
        .filter((p) => p.faqSlugs.includes(a.slug) && p.faqSlugs.includes(b.slug))
        .map((p) => p.slug)
      const coCitations = Array.from(new Set([...sharedDerived, ...sharedSpokes]))
      const sharedStatutes = [...a.statutes].filter((s) => b.statutes.has(s))
      const sharedTopic = a.topic === b.topic
      const jac = jaccard(a.toks, b.toks)

      // A link needs a STRUCTURAL bond — never propose on shared-topic alone.
      const structural =
        coCitations.length > 0 || sharedStatutes.length > 0 || jac >= jacFloor
      if (!structural) continue

      const score =
        W.coCitation * coCitations.length +
        W.sharedStatute * sharedStatutes.length +
        W.jaccard * jac +
        (sharedTopic ? W.sharedTopic : 0)

      if (score < minScore) continue

      const reasons = []
      if (coCitations.length)
        reasons.push(`co-citation: shares source post(s) ${coCitations.join(', ')}`)
      if (sharedStatutes.length)
        reasons.push(`shared statute ${sharedStatutes.join(', ')}`)
      if (jac >= jacFloor) reasons.push(`token overlap ${round(jac)}`)
      if (sharedTopic) reasons.push(`same topic "${a.topic}"`)

      scored.push({
        a: a.slug,
        b: b.slug,
        score: round(score),
        crossTopic: !sharedTopic,
        coCitations,
        sharedStatutes,
        jaccard: round(jac),
        sharedTopic,
        reasons,
        aQuestion: a.question,
        bQuestion: b.question,
      })
    }
  }

  // Per-entry cap: keep a pair if it ranks within --cap for EITHER endpoint, so a
  // strong link is never dropped just because one side is link-rich.
  const rankFor = new Map() // slug -> [pairs sorted desc by score]
  for (const e of entries) rankFor.set(e.slug, [])
  for (const p of scored) {
    rankFor.get(p.a).push(p)
    rankFor.get(p.b).push(p)
  }
  const keep = new Set()
  for (const [, list] of rankFor) {
    list.sort((x, y) => y.score - x.score)
    for (const p of list.slice(0, cap)) keep.add(`${p.a}__${p.b}`)
  }

  const proposed = []
  const skippedExisting = []
  for (const p of scored) {
    if (!keep.has(`${p.a}__${p.b}`)) continue
    if (alreadyLinked(p.a, p.b)) {
      skippedExisting.push({ a: p.a, b: p.b, score: p.score })
      continue
    }
    proposed.push(p)
  }
  proposed.sort((x, y) => y.score - x.score)

  // Write one packet per proposed pair (canonical filename: slugs sorted).
  let written = 0
  let queued = 0
  if (!opts['dry-run'] && proposed.length) fs.mkdirSync(outDir, { recursive: true })
  for (const p of proposed) {
    const [lo, hi] = [p.a, p.b].sort()
    const file = `${lo}__${hi}.md`
    const packetPath = path.join(outDir, file)
    if (fs.existsSync(packetPath) && !opts.force) {
      p.packetStatus = 'exists-skipped'
      queued++
      continue
    }
    if (!opts['dry-run']) fs.writeFileSync(packetPath, buildPacket(p))
    p.packetStatus = opts['dry-run'] ? 'dry-run' : 'written'
    if (!opts['dry-run']) written++
  }

  const report = {
    mode: 'detect',
    generatedAt: new Date().toISOString(),
    indexGeneratedAt: index.generatedAt,
    params: { minScore, jacFloor, cap },
    counts: {
      faq: entries.length,
      proposed: proposed.length,
      written,
      queued,
      skippedExisting: skippedExisting.length,
    },
    proposed,
    skippedExisting,
  }
  if (opts.json) fs.writeFileSync(path.resolve(REPO_ROOT, opts.json), JSON.stringify(report, null, 2))

  if (!opts.quiet) {
    console.log(`\nCPM FAQ cross-link — detect${opts['dry-run'] ? ' (dry-run)' : ''}`)
    console.log(`  FAQ entries        ${entries.length}`)
    console.log(`  → proposed links   ${proposed.length}${opts['dry-run'] ? '' : ` (${written} packet${written === 1 ? '' : 's'} written, ${queued} already queued)`}`)
    console.log(`  → already linked   ${skippedExisting.length} (idempotent skip)`)
    if (proposed.length) {
      console.log(`\n  Proposed (packets in ${path.relative(REPO_ROOT, outDir)}):`)
      for (const p of proposed)
        console.log(`    • ${p.a} ↔ ${p.b}  [score ${p.score}${p.crossTopic ? ' · cross-topic' : ''}]  ${p.reasons.join('; ')}`)
    }
    console.log(`\n  Next: open each packet, keep the strong links (delete the file to reject), set status: confirmed, then run --apply. Nothing committed.\n`)
  }
}

function buildPacket(p) {
  const [lo, hi] = [p.a, p.b].sort()
  const fm = {
    a: lo,
    b: hi,
    score: p.score,
    crossTopic: p.crossTopic,
    coCitations: p.coCitations,
    sharedStatutes: p.sharedStatutes,
    jaccard: p.jaccard,
    sharedTopic: p.sharedTopic,
    status: 'draft', // draft → confirmed (set by Claude/human to apply)
  }
  const guidance = `<!--
  CROSS-LINK PACKET — drafted by scripts/crosslink-faq.mjs (detect step).
  Two hub entries look related. The script proposes a RECIPROCAL "related" link;
  it does not author prose and changes no answer. Both answers are UNCHANGED.

  PAIR
    A : ${lo}
        "${lo === p.a ? p.aQuestion : p.bQuestion}"
    B : ${hi}
        "${hi === p.a ? p.aQuestion : p.bQuestion}"
    score      : ${p.score}${p.crossTopic ? '  (cross-topic — high GEO value)' : '  (same topic)'}

  WHY (deterministic signals):
${p.reasons.map((r) => `    - ${r}`).join('\n')}

  TO COMPLETE (the judgment step — Claude in-session / human):
    1. Sanity-check the link: would a reader of A plausibly want B next (and vice
       versa)? Cross-topic links that share a statute or source post are usually
       the best. Token-overlap-only links can be spurious — verify.
    2. If the link is good: set \`status: confirmed\`, then run
         node scripts/crosslink-faq.mjs --apply
       which writes \`related\` into BOTH content/faq/${lo}.md and
       content/faq/${hi}.md (reciprocal, deduped, idempotent).
    3. If the link is NOT worth making: delete this file. Nothing is written.
-->

`
  return matter.stringify(guidance, fm)
}

// ===================================================================
// APPLY MODE
// ===================================================================
function runApply(opts) {
  const crosslinkDir = path.resolve(REPO_ROOT, opts['crosslink-dir'] || 'content/faq-crosslink')
  const faqDir = path.resolve(REPO_ROOT, opts['faq-dir'] || 'content/faq')

  if (!fs.existsSync(crosslinkDir))
    fail(`No cross-link queue at ${path.relative(REPO_ROOT, crosslinkDir)} — run detect mode first.`)

  const applied = []
  const skipped = []
  const errors = []

  // Read every confirmed packet first, then write each affected entry ONCE (an
  // entry can appear in several packets). Append-only + deduped + reciprocal.
  const pendingLinks = new Map() // entrySlug -> Set(linkedSlug)
  const packetsToMark = []

  for (const file of fs.readdirSync(crosslinkDir).filter((f) => f.endsWith('.md')).sort()) {
    const packetPath = path.join(crosslinkDir, file)
    let pkt
    try {
      pkt = matter(fs.readFileSync(packetPath, 'utf8'))
    } catch (e) {
      errors.push({ file, error: `packet parse error: ${e.message}` })
      continue
    }
    const d = pkt.data || {}
    const status = String(d.status || 'draft')
    if (status !== 'confirmed') {
      skipped.push({ file, reason: `status is "${status}" (need "confirmed")` })
      continue
    }
    const a = String(d.a || '')
    const b = String(d.b || '')
    if (!a || !b || a === b) {
      errors.push({ file, error: `packet missing a/b or self-link (a="${a}", b="${b}")` })
      continue
    }
    const aPath = path.join(faqDir, `${a}.md`)
    const bPath = path.join(faqDir, `${b}.md`)
    if (!fs.existsSync(aPath)) {
      errors.push({ file, error: `entry "${a}" not found` })
      continue
    }
    if (!fs.existsSync(bPath)) {
      errors.push({ file, error: `entry "${b}" not found` })
      continue
    }
    if (!pendingLinks.has(a)) pendingLinks.set(a, new Set())
    if (!pendingLinks.has(b)) pendingLinks.set(b, new Set())
    pendingLinks.get(a).add(b)
    pendingLinks.get(b).add(a)
    packetsToMark.push({ file, packetPath, pkt, a, b })
  }

  // Write each affected entry once.
  for (const [slug, wanted] of pendingLinks) {
    const entryPath = path.join(faqDir, `${slug}.md`)
    let entry
    try {
      entry = matter(fs.readFileSync(entryPath, 'utf8'))
    } catch (e) {
      errors.push({ file: `${slug}.md`, error: `entry parse error: ${e.message}` })
      continue
    }
    const current = asArray(entry.data.related)
    const next = Array.from(new Set([...current, ...wanted])).filter((s) => s && s !== slug)
    const addedHere = next.filter((s) => !current.includes(s))
    if (!addedHere.length) {
      skipped.push({ file: `${slug}.md`, reason: 'all proposed links already present (idempotent)' })
      continue
    }
    next.sort()
    if (!opts['dry-run']) {
      entry.data.related = next
      fs.writeFileSync(entryPath, matter.stringify(entry.content, entry.data))
    }
    applied.push({ entry: slug, added: addedHere })
  }

  // Mark packets applied (audit trail; re-run is a no-op).
  if (!opts['dry-run']) {
    for (const { packetPath, pkt } of packetsToMark) {
      pkt.data.status = 'applied'
      pkt.data.appliedAt = new Date().toISOString()
      fs.writeFileSync(packetPath, matter.stringify(pkt.content, pkt.data))
    }
  }

  const report = { mode: 'apply', generatedAt: new Date().toISOString(), applied, skipped, errors }
  if (opts.json) fs.writeFileSync(path.resolve(REPO_ROOT, opts.json), JSON.stringify(report, null, 2))

  if (!opts.quiet) {
    console.log(`\nCPM FAQ cross-link — apply${opts['dry-run'] ? ' (dry-run)' : ''}`)
    console.log(`  entries updated   ${applied.length}`)
    for (const a of applied) console.log(`    • ${a.entry}  + related: ${a.added.join(', ')}`)
    if (skipped.length) {
      console.log(`  skipped           ${skipped.length}`)
      for (const s of skipped) console.log(`    • ${s.file}: ${s.reason}`)
    }
    if (errors.length) {
      console.log(`  errors            ${errors.length}`)
      for (const e of errors) console.log(`    • ${e.file}: ${e.error}`)
    }
    console.log(
      `\n  Reciprocal + append-only: answers untouched, links written both ways. Nothing committed/published.` +
        `\n  Next: node scripts/validate-faq.mjs, then the two-stage publish.\n`
    )
  }
  process.exit(errors.length ? 1 : 0)
}

// ---------- entry ----------
const opts = parseArgs(process.argv.slice(2))
if (opts.apply) runApply(opts)
else runDetect(opts)
