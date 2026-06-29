#!/usr/bin/env node
/**
 * draft-faq-entries.mjs — CPM FAQ pipeline, track A (write path: classify → source → write).
 *
 * Turns harvested blog FAQ feedstock into candidate hub entries. It does the
 * MECHANICAL parts deterministically (dedupe, topic/type classification, source
 * requirement, draft scaffolding) and stops at the judgment boundary: the actual
 * master answer is written by a human/Claude in-session. Drafts land in a
 * gitignored review queue (content/faq-drafts/), NEVER in content/faq/, and this
 * script never stages, commits, or pushes anything (AGENTS §7 human gate — same
 * shape as scripts/check-faq-sources.mjs).
 *
 * Pipeline:
 *   1. read the corpus index (run build-faq-corpus-index.mjs first)
 *   2. collapse near-duplicate feedstock questions, merging their derivedFrom
 *   3. DEDUPE each against the live hub — already-answered → reconciliation
 *      candidate (that engine is a later track-A slice; here we just flag it)
 *   4. CLASSIFY topic (match an existing cluster or suggest a new one) + type
 *      (objective|subjective)
 *   5. SOURCE: objective answers are flagged as requiring third-party sources[]
 *   6. WRITE: emit a draft work packet per new question for Claude to author
 *
 * Usage:
 *   node scripts/draft-faq-entries.mjs [options]
 *
 * Options:
 *   --index <path>     Corpus index (default scripts/faq-corpus-index.json).
 *   --out-dir <path>   Draft queue (default content/faq-drafts).
 *   --json <path>      Also write the run report as JSON.
 *   --dupe <0..1>      Question-similarity threshold for "already answered" (default 0.5).
 *   --force            Overwrite existing draft files.
 *   --dry-run          Report only; write no draft files.
 *   --quiet            Suppress the human summary.
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
    if (a === '--force' || a === '--dry-run' || a === '--quiet') opts[a.slice(2).replace(/-/g, '')] = true
    else if (a.startsWith('--')) opts[a.slice(2)] = argv[++i]
    else opts._.push(a)
  }
  return opts
}

// ---------- text utils ----------
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

function slugify(s) {
  return String(s)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
}

// Objective = factual/legal/statutory claims that can (and must) carry a source.
const OBJECTIVE_HINTS =
  /\b(law|legal|statute|statutory|rent control|ab\s?1482|civil code|civ\.? code|require[ds]?|must|percent|%|deadline|days?|notice|fee|cost|price|tax|license|dre|eviction|deposit|cap|maximum|minimum|regulation|code|act|section|§)\b/i

function classifyType(q, a) {
  const text = `${q} ${a}`
  if (OBJECTIVE_HINTS.test(text)) {
    const hits = (text.match(OBJECTIVE_HINTS) || []).length
    return { type: 'objective', confidence: hits >= 2 ? 'high' : 'low' }
  }
  return { type: 'subjective', confidence: 'default' }
}

// ---------- main ----------
const opts = parseArgs(process.argv.slice(2))
const indexPath = path.resolve(REPO_ROOT, opts.index || 'scripts/faq-corpus-index.json')
const outDir = path.resolve(REPO_ROOT, opts['out-dir'] || 'content/faq-drafts')
const dupeThreshold = opts.dupe != null ? Number(opts.dupe) : 0.5
const today = new Date().toISOString().slice(0, 10)

if (!fs.existsSync(indexPath))
  fail(`Corpus index not found at ${path.relative(REPO_ROOT, indexPath)}. Run: node scripts/build-faq-corpus-index.mjs`)

const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'))
const faqEntries = index.faq || []
const feedstock = index.feedstock || []

// Source registry (auto-source step): verified primary-source citations for
// recurring objective topics. Objective drafts whose text matches a registry
// entry's keywords get those sources attached automatically; the agent still
// web-researches any objective claim the registry doesn't cover.
let registry = { entries: [] }
const registryPath = path.resolve(REPO_ROOT, opts.registry || 'scripts/faq-source-registry.json')
if (fs.existsSync(registryPath)) {
  try {
    registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'))
  } catch {
    /* malformed registry — proceed with none */
  }
}
function registrySourcesFor(text) {
  const hay = String(text).toLowerCase()
  const ids = []
  const sources = []
  const seen = new Set()
  for (const e of registry.entries || []) {
    if (!(e.match || []).some((kw) => hay.includes(String(kw).toLowerCase()))) continue
    ids.push(e.id)
    for (const s of e.sources || []) {
      if (s && s.url && !seen.has(s.url)) {
        seen.add(s.url)
        sources.push({ label: s.label, url: s.url })
      }
    }
  }
  return { ids, sources }
}

// Pre-tokenize existing entries for dedupe + topic matching.
const existing = faqEntries.map((e) => ({
  ...e,
  qTokens: tokens(e.question),
  topicTokens: tokens(`${e.topicTitle} ${e.question} ${e.answerText || ''}`),
}))

// Aggregate per-topic token bags for topic classification.
const topicBags = new Map()
for (const e of existing) {
  if (!topicBags.has(e.topic)) {
    topicBags.set(e.topic, {
      topic: e.topic,
      topicTitle: e.topicTitle,
      tokens: new Set(),
      maxOrder: 0,
      description: null,
    })
  }
  const bag = topicBags.get(e.topic)
  for (const t of e.topicTokens) bag.tokens.add(t)
  if (typeof e.order === 'number' && e.order < 999) bag.maxOrder = Math.max(bag.maxOrder, e.order)
}

// Suggest a topic for a candidate. Two signals, strongest first:
//   1. the nearest existing ENTRY (if it's a near-neighbour but below the dedupe
//      cutoff, the new question belongs in that entry's cluster)
//   2. the aggregated per-topic token bag
// Falls back to a new-topic slug only when neither signal is strong enough.
const TOPIC_FROM_ENTRY = 0.15 // inherit a near-neighbour entry's topic
const TOPIC_FROM_BAG = 0.12 // weaker cluster-level match
function classifyTopic(text, nearestEntry, nearestSim) {
  if (nearestEntry && nearestSim >= TOPIC_FROM_ENTRY) {
    return {
      topic: nearestEntry.topic,
      topicTitle: nearestEntry.topicTitle,
      matched: true,
      via: 'entry',
      score: Number(nearestSim.toFixed(3)),
    }
  }
  const tks = tokens(text)
  let best = null
  let bestScore = 0
  for (const bag of topicBags.values()) {
    const score = jaccard(tks, bag.tokens)
    if (score > bestScore) {
      bestScore = score
      best = bag
    }
  }
  if (best && bestScore >= TOPIC_FROM_BAG) {
    return { topic: best.topic, topicTitle: best.topicTitle, matched: true, via: 'bag', score: Number(bestScore.toFixed(3)) }
  }
  // suggest a new topic slug from the most salient candidate tokens
  const salient = Array.from(tokens(text)).slice(0, 3)
  const slug = slugify(salient.join(' ')) || 'general'
  return { topic: slug, topicTitle: 'TODO: topic title', matched: false, via: 'new', score: Number(bestScore.toFixed(3)) }
}

// 1) Collapse near-duplicate feedstock questions; merge derivedFrom.
const merged = []
for (const item of feedstock) {
  const t = tokens(item.q)
  const hit = merged.find((m) => jaccard(m.qTokens, t) >= 0.6)
  if (hit) {
    if (!hit.derivedFrom.includes(item.sourceSlug)) hit.derivedFrom.push(item.sourceSlug)
    hit.rawAnswers.push({ sourceSlug: item.sourceSlug, a: item.a })
  } else {
    merged.push({ q: item.q, qTokens: t, derivedFrom: [item.sourceSlug], rawAnswers: [{ sourceSlug: item.sourceSlug, a: item.a }] })
  }
}

// 2) For each merged candidate: dedupe against the live hub, then classify.
const drafts = []
const reconciliationCandidates = []

for (const cand of merged) {
  // dedupe against existing entries
  let bestExisting = null
  let bestSim = 0
  for (const e of existing) {
    const sim = jaccard(cand.qTokens, e.qTokens)
    if (sim > bestSim) {
      bestSim = sim
      bestExisting = e
    }
  }
  if (bestExisting && bestSim >= dupeThreshold) {
    reconciliationCandidates.push({
      question: cand.q,
      matchedEntry: bestExisting.slug,
      similarity: Number(bestSim.toFixed(3)),
      derivedFrom: cand.derivedFrom,
      note: 'Already covered by the hub — route to the reconciliation engine (later slice), not a new entry.',
    })
    continue
  }

  const text = `${cand.q} ${cand.rawAnswers.map((r) => r.a).join(' ')}`
  const topic = classifyTopic(text, bestExisting, bestSim)
  const typeInfo = classifyType(cand.q, cand.rawAnswers.map((r) => r.a).join(' '))
  // cap slug length at a word (hyphen) boundary so it never cuts mid-word
  const slug = slugify(cand.q).replace(/^(.{0,60}[a-z0-9])(-.*)?$/, '$1') || `faq-${drafts.length + 1}`

  drafts.push({
    slug,
    question: cand.q,
    topic,
    type: typeInfo,
    derivedFrom: cand.derivedFrom,
    sourcesRequired: typeInfo.type === 'objective',
    nearestExisting: bestExisting ? { slug: bestExisting.slug, similarity: Number(bestSim.toFixed(3)) } : null,
    rawAnswers: cand.rawAnswers,
  })
}

// 3) Emit draft work packets.
let written = 0
let skipped = 0
if (!opts['dry-run'] && drafts.length) fs.mkdirSync(outDir, { recursive: true })

for (const d of drafts) {
  const filePath = path.join(outDir, `${d.slug}.md`)
  if (fs.existsSync(filePath) && !opts.force) {
    d.status = 'exists-skipped'
    skipped++
    continue
  }

  const matchedTopicBag = d.topic.matched ? topicBags.get(d.topic.topic) : null
  const order = matchedTopicBag ? matchedTopicBag.maxOrder + 1 : 1
  if (matchedTopicBag) matchedTopicBag.maxOrder = order // keep ordering monotonic within a run

  // auto-source: attach registry citations for objective drafts that match
  const reg = d.sourcesRequired
    ? registrySourcesFor(`${d.question} ${d.rawAnswers.map((r) => r.a).join(' ')}`)
    : { ids: [], sources: [] }
  d.registryIds = reg.ids
  d.sourcesAttached = reg.sources.length

  const fm = {
    question: d.question,
    topic: d.topic.topic,
    topicTitle: d.topic.topicTitle,
    ...(d.topic.matched ? {} : { topicDescription: 'TODO: one-line topic description' }),
    type: d.type.type,
    derivedFrom: d.derivedFrom,
    created: today,
    order,
    sources: reg.sources, // objective: auto-attached from registry where matched; agent fills gaps
    annotations: [],
  }

  const rawMaterial = d.rawAnswers
    .map((r) => `  Q: ${d.question}\n  A: ${r.a.replace(/\n/g, '\n     ')}   [from: ${r.sourceSlug}]`)
    .join('\n\n')

  const guidance = `<!--
  DRAFT FAQ ENTRY — scaffolded by scripts/draft-faq-entries.mjs. Prose NOT yet authored.
  This file lives in the gitignored review queue. Promote to content/faq/${d.slug}.md
  only after completing the steps below.

  TO COMPLETE (the judgment step — Claude in-session / human):
    1. Write the master answer BELOW this comment in GEO format:
         - Direct answer in the first sentence or two, then expand.
         - Each passage must stand alone (answer engines rank passages, not pages).
         - Rewrite the raw material in CPM's voice; do not paste it.
    2. type=${d.type.type}${
      d.sourcesRequired
        ? d.sourcesAttached
          ? ` → ${d.sourcesAttached} source(s) AUTO-ATTACHED from registry [${d.registryIds.join(', ')}]; verify they fit and web-research any uncovered claim.`
          : ' → REQUIRED: agent must web-source authoritative citations before publishing (none matched the registry).'
        : ' → sources optional.'
    }
    3. Confirm/adjust: topic "${d.topic.topic}" (${d.topic.matched ? `matched, score ${d.topic.score}` : `NEW — rename + set topicTitle/topicDescription`}); type "${d.type.type}" (${d.type.confidence}); order.
    4. Delete this comment + the RAW MATERIAL block, then move the file into content/faq/.

  CLASSIFICATION (suggested — confirm):
    topic       : ${d.topic.topic} (${d.topic.matched ? 'matched ' + d.topic.score : 'new'})
    type        : ${d.type.type} (${d.type.confidence})
    sources     : ${d.sourcesRequired ? (d.sourcesAttached ? `${d.sourcesAttached} auto-attached [${d.registryIds.join(', ')}]` : 'REQUIRED — none in registry, agent web-sources') : 'optional'}
    derivedFrom : ${d.derivedFrom.join(', ')}
    ${d.nearestExisting ? `nearest hub entry: ${d.nearestExisting.slug} (sim ${d.nearestExisting.similarity}) — below dedupe threshold, but glance to be sure it is genuinely new.` : 'nearest hub entry: none'}

  RAW MATERIAL (harvested from the source post FAQ block — rewrite, don't paste):
${rawMaterial}
-->

`

  if (!opts['dry-run']) {
    fs.writeFileSync(filePath, matter.stringify(guidance, fm))
    written++
  }
  d.status = opts['dry-run'] ? 'dry-run' : 'written'
  d.order = order
}

// 4) Report.
const report = {
  generatedAt: new Date().toISOString(),
  indexGeneratedAt: index.generatedAt,
  feedstockTotal: feedstock.length,
  uniqueQuestions: merged.length,
  newDrafts: drafts.filter((d) => d.status === 'written' || d.status === 'dry-run').length,
  skippedExisting: skipped,
  reconciliationCandidates,
  drafts: drafts.map((d) => ({
    slug: d.slug,
    question: d.question,
    topic: d.topic.topic,
    topicMatched: d.topic.matched,
    type: d.type.type,
    sourcesRequired: d.sourcesRequired,
    derivedFrom: d.derivedFrom,
    status: d.status,
  })),
}

if (opts.json) {
  fs.writeFileSync(path.resolve(REPO_ROOT, opts.json), JSON.stringify(report, null, 2))
}

if (!opts.quiet) {
  console.log(`\nCPM FAQ draft run`)
  console.log(`  feedstock Q&A        ${feedstock.length}`)
  console.log(`  unique questions     ${merged.length}`)
  console.log(`  → new drafts         ${report.newDrafts}${opts['dry-run'] ? ' (dry-run, not written)' : ''}`)
  console.log(`  → already answered   ${reconciliationCandidates.length} (reconciliation candidates)`)
  if (skipped) console.log(`  → existing, skipped  ${skipped} (use --force to overwrite)`)
  if (report.newDrafts) {
    console.log(`\n  Drafts (${opts['dry-run'] ? 'would write to' : 'written to'} ${path.relative(REPO_ROOT, outDir)}):`)
    for (const d of drafts.filter((x) => x.status === 'written' || x.status === 'dry-run')) {
      console.log(`    • ${d.slug}.md  [topic ${d.topic.matched ? d.topic.topic : d.topic.topic + ' (NEW)'} | ${d.type.type}${d.sourcesRequired ? ' | needs sources' : ''}]`)
    }
  }
  if (reconciliationCandidates.length) {
    console.log(`\n  Already answered (defer to reconciliation engine):`)
    for (const r of reconciliationCandidates) console.log(`    • "${r.question}" ≈ ${r.matchedEntry} (sim ${r.similarity})`)
  }
  console.log(`\n  Next: open each draft, write the master answer (GEO format), add sources for objective entries, then move it into content/faq/. Nothing was committed.\n`)
}
