#!/usr/bin/env node
/**
 * reconcile-faq.mjs — CPM FAQ pipeline, track A slice 2 (reconciliation engine).
 *
 * As blog posts publish, an existing FAQ answer can quietly go stale: a new post
 * bears on a question the hub already answers, or cites a figure that conflicts
 * with the live answer. This engine DETECTS those touches and PROPOSES a dated,
 * append-only annotation for review — it never rewrites a master answer, never
 * edits prior annotations, and never re-credits a post. Same governing principle
 * as the rest of track A (see draft-faq-entries.mjs / check-faq-sources.mjs):
 * scripts detect + draft; the judgment (annotation TYPE + the note prose, or a
 * consolidated rewrite) is authored by Claude/human; an explicit apply step then
 * appends the confirmed annotation to the live entry; validate-faq.mjs gates;
 * the two-stage publish ships it.
 *
 * TWO MODES
 *   (default) DETECT  — read the corpus index, find (entry × post) touches, sniff
 *                       candidate contradictions, and write one review packet per
 *                       touch to content/faq-reconcile/ with a SUGGESTED annotation
 *                       stub for Claude to confirm/author.
 *   --apply           — scan content/faq-reconcile/ for packets a human/Claude has
 *                       marked `status: confirmed` (note written), append each as an
 *                       annotation to its content/faq/<entry>.md (append-only,
 *                       idempotent), and — if the entry then trips the escalation
 *                       threshold — drop a consolidated REWRITE proposal into the
 *                       review queue (content/faq-drafts/). Never publishes.
 *
 * Touch signals (locked with owner): a post touches an entry if EITHER a backlink
 * exists (entry.derivedFrom ∋ post.slug, or post.faqSlugs ∋ entry.slug) OR token
 * containment of the entry's salient terms within the post body clears --sim.
 * Backlinks are high-precision; similarity adds recall. Both are surfaced as
 * candidates — nothing is auto-applied at detect time.
 *
 * Usage:
 *   node scripts/reconcile-faq.mjs [--index p] [--out-dir p] [--sim 0.5] [--json p] [--force] [--dry-run] [--quiet]
 *   node scripts/reconcile-faq.mjs --apply [--reconcile-dir p] [--faq-dir p] [--draft-dir p] [--json p] [--dry-run] [--quiet]
 *
 * Options (detect):
 *   --index <path>      Corpus index (default scripts/faq-corpus-index.json). Run index:faq-corpus first.
 *   --out-dir <path>    Review queue for packets (default content/faq-reconcile).
 *   --sim <0..1>        Min token-containment of the entry's terms in a post body to call a similarity touch (default 0.5).
 *   --json <path>       Also write the run report as JSON.
 *   --force             Overwrite an existing packet (loses any in-progress note — off by default).
 *   --dry-run           Report only; write no packets.
 *   --quiet             Suppress the human summary.
 * Options (apply):
 *   --reconcile-dir <p> Packet queue to read (default content/faq-reconcile).
 *   --faq-dir <p>       Live hub to append into (default content/faq).
 *   --draft-dir <p>     Rewrite-proposal queue (default content/faq-drafts).
 *   --json <path>       Machine-readable apply report.
 *   --dry-run           Show what would be applied; write nothing.
 *   --quiet             Suppress the human summary.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const today = new Date().toISOString().slice(0, 10)

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

// ---------- text utils (same shape as draft-faq-entries.mjs) ----------
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

// Fraction of the (shorter) entry's salient terms that appear in the post body.
// Better than jaccard here because post bodies dwarf an entry, which would pin
// jaccard near zero even for an on-topic post.
function containment(small, big) {
  if (!small.size) return 0
  let inter = 0
  for (const t of small) if (big.has(t)) inter++
  return inter / small.size
}

const asArray = (v) => (Array.isArray(v) ? v.map(String) : [])

// ---------- objective-fact extraction (deterministic contradiction sniff) ----------
// Pull the kinds of figures a stale legal/financial answer gets wrong: statute
// refs, percentages, day counts, money, and bare years. We compare the figures
// the post and the entry attach to a SHARED statute; a value the post introduces
// that the entry doesn't carry (while the entry carries a different one in that
// category) is a *candidate* contradiction — flagged for Claude, never decided here.
function extractFacts(text) {
  const t = ` ${String(text).toLowerCase()} `
  const grab = (re) => {
    const out = new Set()
    let m
    const r = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g')
    while ((m = r.exec(t))) out.add(m[1] != null ? m[1] : m[0])
    return out
  }
  // statute / code references, normalized to their numeric core so "§1947.12",
  // "civil code 1947.12" and "section 1947.12" collapse to one token.
  const statutes = new Set()
  for (const m of t.matchAll(/(?:§|section|sec\.?|civ\.?\s*code|code\s+section|ccp|civil\s+code)\s*#?\s*(\d{2,4}(?:\.\d+)*)/g))
    statutes.add(m[1])
  for (const m of t.matchAll(/\b(ab|sb)\s?-?\s?(\d{2,4})\b/g)) statutes.add(`${m[1]}${m[2]}`)
  for (const m of t.matchAll(/\bsection\s+(121|1031)\b/g)) statutes.add(m[1])
  for (const m of t.matchAll(/\b(1031)\s+exchange\b/g)) statutes.add(m[1])

  const percents = grab(/(\d+(?:\.\d+)?)\s*(?:%|percent)/)
  const money = new Set([...t.matchAll(/\$\s?(\d[\d,]*(?:\.\d+)?)/g)].map((m) => m[1].replace(/,/g, '')))
  const days = grab(/(\d+)\s*-?\s*(?:day|days|business\s+day)/)
  const years = grab(/\b((?:19|20)\d{2})\b/)
  return {
    statutes,
    percents,
    money,
    days,
    years,
  }
}

const setDiff = (a, b) => [...a].filter((x) => !b.has(x))
const sortedArr = (s) => [...s].sort()

// Compare an entry's facts against a post's. Returns evidence + a candidate-
// contradiction verdict. Conservative: only the presence of a SHARED statute with
// a category where the post introduces a value the entry lacks (and the entry
// holds a different value there) trips the flag.
function sniffContradiction(entryFacts, postFacts) {
  const sharedStatutes = [...entryFacts.statutes].filter((s) => postFacts.statutes.has(s))
  const categories = ['percents', 'money', 'days']
  const conflicts = []
  for (const cat of categories) {
    const ev = entryFacts[cat]
    const pv = postFacts[cat]
    if (!ev.size || !pv.size) continue
    const newInPost = setDiff(pv, ev)
    const onlyInEntry = setDiff(ev, pv)
    if (newInPost.length && onlyInEntry.length) {
      conflicts.push({ category: cat, entry: sortedArr(ev), post: sortedArr(pv), newInPost, onlyInEntry })
    }
  }
  const candidateContradiction = sharedStatutes.length > 0 && conflicts.length > 0
  return { sharedStatutes, conflicts, candidateContradiction }
}

// ===================================================================
// APPLY MODE
// ===================================================================
function runApply(opts) {
  const reconcileDir = path.resolve(REPO_ROOT, opts['reconcile-dir'] || 'content/faq-reconcile')
  const faqDir = path.resolve(REPO_ROOT, opts['faq-dir'] || 'content/faq')
  const draftDir = path.resolve(REPO_ROOT, opts['draft-dir'] || 'content/faq-drafts')
  const ESCALATION_MIN = 3 // ≥3 annotations OR any contradiction → rewrite (mirrors corpus-index needsRewrite)

  if (!fs.existsSync(reconcileDir)) fail(`No reconcile queue at ${path.relative(REPO_ROOT, reconcileDir)} — run detect mode first.`)

  const applied = []
  const skipped = []
  const escalated = []
  const errors = []

  for (const file of fs.readdirSync(reconcileDir).filter((f) => f.endsWith('.md')).sort()) {
    const packetPath = path.join(reconcileDir, file)
    let pkt
    try {
      pkt = matter(fs.readFileSync(packetPath, 'utf8'))
    } catch (e) {
      errors.push({ file, error: `packet parse error: ${e.message}` })
      continue
    }
    const d = pkt.data || {}
    const status = String(d.status || 'draft')
    const prop = d.proposed || {}

    if (status !== 'confirmed') {
      skipped.push({ file, reason: `status is "${status}" (need "confirmed")` })
      continue
    }
    if (!prop.note || !String(prop.note).trim() || /TODO/i.test(String(prop.note))) {
      skipped.push({ file, reason: 'no authored note yet' })
      continue
    }
    const entrySlug = String(d.entry || '')
    const entryPath = path.join(faqDir, `${entrySlug}.md`)
    if (!entrySlug || !fs.existsSync(entryPath)) {
      errors.push({ file, error: `entry "${entrySlug}" not found in ${path.relative(REPO_ROOT, faqDir)}` })
      continue
    }

    let entry
    try {
      entry = matter(fs.readFileSync(entryPath, 'utf8'))
    } catch (e) {
      errors.push({ file, error: `entry parse error: ${e.message}` })
      continue
    }
    const annotations = Array.isArray(entry.data.annotations) ? entry.data.annotations : []

    // Idempotency: never credit the same post twice on one entry.
    const triggeringPost = String(prop.post || d.post || '')
    if (triggeringPost && annotations.some((a) => a && String(a.post || '') === triggeringPost)) {
      skipped.push({ file, reason: `post "${triggeringPost}" already credited on ${entrySlug} — append-only, no dup` })
      continue
    }

    const type = ['additive', 'soft-revision', 'strong-revision', 'contradiction'].includes(prop.type)
      ? prop.type
      : 'additive'
    const annotation = {
      date: /^\d{4}-\d{2}-\d{2}$/.test(String(prop.date)) ? String(prop.date) : today,
      type,
      note: String(prop.note).trim(),
      ...(triggeringPost ? { post: triggeringPost } : {}),
      ...(prop.postUrl ? { postUrl: String(prop.postUrl) } : {}),
    }

    const nextAnnotations = [...annotations, annotation]
    const willEscalate =
      nextAnnotations.length >= ESCALATION_MIN || nextAnnotations.some((a) => a && a.type === 'contradiction')

    if (!opts['dry-run']) {
      // Append-only write: keep the master answer (entry.content) and every prior
      // annotation untouched; only push the new one.
      entry.data.annotations = nextAnnotations
      fs.writeFileSync(entryPath, matter.stringify(entry.content, entry.data))
      // Mark the packet applied so a re-run is a no-op (and leave an audit trail).
      pkt.data.status = 'applied'
      pkt.data.appliedAt = new Date().toISOString()
      fs.writeFileSync(packetPath, matter.stringify(pkt.content, pkt.data))
    }
    applied.push({ file, entry: entrySlug, type, post: triggeringPost, willEscalate })

    if (willEscalate) {
      const rewritePath = path.join(draftDir, `${entrySlug}__rewrite.md`)
      if (!opts['dry-run']) {
        fs.mkdirSync(draftDir, { recursive: true })
        if (!fs.existsSync(rewritePath) || opts.force) {
          fs.writeFileSync(rewritePath, buildRewriteProposal(entrySlug, entry, nextAnnotations))
        }
      }
      escalated.push({ entry: entrySlug, annotations: nextAnnotations.length, rewrite: path.relative(REPO_ROOT, rewritePath) })
    }
  }

  const report = { mode: 'apply', generatedAt: new Date().toISOString(), applied, escalated, skipped, errors }
  if (opts.json) fs.writeFileSync(path.resolve(REPO_ROOT, opts.json), JSON.stringify(report, null, 2))

  if (!opts.quiet) {
    console.log(`\nCPM FAQ reconcile — apply${opts['dry-run'] ? ' (dry-run)' : ''}`)
    console.log(`  applied        ${applied.length}`)
    for (const a of applied)
      console.log(`    • ${a.entry}  ← ${a.post || '(no post)'}  [${a.type}]${a.willEscalate ? '  ⚠ escalates → rewrite' : ''}`)
    if (escalated.length) {
      console.log(`  escalated      ${escalated.length} (rewrite proposal drafted to review queue)`)
      for (const e of escalated) console.log(`    • ${e.entry} (${e.annotations} annotations) → ${e.rewrite}`)
    }
    if (skipped.length) {
      console.log(`  skipped        ${skipped.length}`)
      for (const s of skipped) console.log(`    • ${s.file}: ${s.reason}`)
    }
    if (errors.length) {
      console.log(`  errors         ${errors.length}`)
      for (const e of errors) console.log(`    • ${e.file}: ${e.error}`)
    }
    console.log(
      `\n  Append-only: master answers and prior annotations untouched. Nothing committed/published.` +
        (escalated.length ? ` Author the rewrite proposal(s), then validate:faq → publish.` : '') +
        `\n`
    )
  }
  process.exit(errors.length ? 1 : 0)
}

function buildRewriteProposal(slug, entry, annotations) {
  const fm = {
    rewriteOf: slug,
    topic: entry.data.topic,
    topicTitle: entry.data.topicTitle,
    type: entry.data.type,
    sourcesRequired: entry.data.type === 'objective',
    status: 'draft',
    created: today,
  }
  const annLines = annotations
    .map((a) => `    - (${a.date}) [${a.type}] ${a.note}${a.post ? `  — from: ${a.post}` : ''}`)
    .join('\n')
  const guidance = `<!--
  REWRITE PROPOSAL — drafted by scripts/reconcile-faq.mjs (apply step).
  Entry "${slug}" tripped the escalation threshold (≥3 annotations OR a contradiction).
  The dated annotations below have been accumulating ON TOP of the master answer;
  it is time to fold them into a single clean answer.

  This is a PROPOSAL in the gitignored review queue — the live answer at
  content/faq/${slug}.md is UNCHANGED. The script does not author legal/financial
  prose. Steps (the judgment — Claude in-session / human):
    1. Read the current master answer + every annotation (below).
    2. Write ONE consolidated, current master answer in GEO format (direct answer
       first; each passage stands alone; CPM voice).
    3. ${fm.type === 'objective' ? 'OBJECTIVE: re-verify every figure against a primary source and carry sources[] — validate-faq.mjs blocks an objective entry with no citation.' : 'Subjective: sources optional.'}
    4. Replace the body of content/faq/${slug}.md with the consolidation. Decide
       per the annotation history whether to RESET annotations[] to [] (the answer
       now incorporates them) — keep that edit append-aware and deliberate.
    5. Delete this proposal file.

  CURRENT MASTER ANSWER (content/faq/${slug}.md):
  ----------------------------------------------------------------
${String(entry.content).trim().split('\n').map((l) => '  ' + l).join('\n')}
  ----------------------------------------------------------------

  ACCUMULATED ANNOTATIONS (${annotations.length}):
${annLines}
-->

`
  return matter.stringify(guidance, fm)
}

// ===================================================================
// DETECT MODE
// ===================================================================
function runDetect(opts) {
  const indexPath = path.resolve(REPO_ROOT, opts.index || 'scripts/faq-corpus-index.json')
  const outDir = path.resolve(REPO_ROOT, opts['out-dir'] || 'content/faq-reconcile')
  const simThreshold = opts.sim != null ? Number(opts.sim) : 0.5

  if (!fs.existsSync(indexPath))
    fail(`Corpus index not found at ${path.relative(REPO_ROOT, indexPath)}. Run: node scripts/build-faq-corpus-index.mjs`)
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'))
  const blog = index.blog || []
  const faq = index.faq || []

  // Pre-tokenize / pre-extract facts once.
  const posts = blog.map((p) => ({
    ...p,
    bodyTokens: tokens(p.bodyText || ''),
    facts: extractFacts(p.bodyText || ''),
    faqSlugs: asArray(p.faqSlugs),
  }))
  const entries = faq.map((e) => ({
    ...e,
    salientTokens: tokens(`${e.question} ${e.answerText || ''}`),
    facts: extractFacts(`${e.question} ${e.answerText || ''}`),
    derivedFrom: asArray(e.derivedFrom),
    annotationPosts: [], // filled from live entry below for idempotency
  }))

  // Idempotency at detect time: read the live entry's already-credited posts so we
  // never re-propose for a post that's already annotated on that entry.
  const faqDir = path.resolve(REPO_ROOT, opts['faq-dir'] || 'content/faq')
  for (const e of entries) {
    const p = path.join(faqDir, `${e.slug}.md`)
    if (!fs.existsSync(p)) continue
    try {
      const live = matter(fs.readFileSync(p, 'utf8'))
      const anns = Array.isArray(live.data.annotations) ? live.data.annotations : []
      e.annotationPosts = anns.map((a) => String((a && a.post) || '')).filter(Boolean)
    } catch {
      /* fall back to index annotationCount only */
    }
  }

  const touches = []
  for (const e of entries) {
    for (const p of posts) {
      const backlink = e.derivedFrom.includes(p.slug) || p.faqSlugs.includes(e.slug)
      const contain = containment(e.salientTokens, p.bodyTokens)
      const sim = jaccard(e.salientTokens, p.bodyTokens)
      const similar = contain >= simThreshold
      if (!backlink && !similar) continue

      // idempotency — already credited?
      if (e.annotationPosts.includes(p.slug)) {
        touches.push({ entry: e.slug, post: p.slug, status: 'already-credited', backlink, containment: round(contain) })
        continue
      }

      const sniff = sniffContradiction(e.facts, p.facts)
      const signal = backlink && similar ? 'both' : backlink ? 'backlink' : 'similarity'
      const suggestedType = sniff.candidateContradiction ? 'contradiction' : 'additive'
      // detect-time escalation hint (count-based; the apply step is authoritative)
      const wouldEscalate = (e.annotationCount || 0) + 1 >= 3 || sniff.candidateContradiction
      touches.push({
        entry: e.slug,
        post: p.slug,
        status: 'candidate',
        signal,
        backlink,
        containment: round(contain),
        jaccard: round(sim),
        candidateContradiction: sniff.candidateContradiction,
        sharedStatutes: sniff.sharedStatutes,
        conflicts: sniff.conflicts,
        suggestedType,
        wouldEscalate,
        postTitle: p.title,
        question: e.question,
      })
    }
  }

  const candidates = touches.filter((t) => t.status === 'candidate')
  const alreadyCredited = touches.filter((t) => t.status === 'already-credited')

  // Write one packet per candidate.
  let written = 0
  let skipped = 0
  if (!opts['dry-run'] && candidates.length) fs.mkdirSync(outDir, { recursive: true })
  for (const c of candidates) {
    const file = `${c.entry}__${c.post}.md`
    const packetPath = path.join(outDir, file)
    if (fs.existsSync(packetPath) && !opts.force) {
      c.packetStatus = 'exists-skipped'
      skipped++
      continue
    }
    if (!opts['dry-run']) fs.writeFileSync(packetPath, buildPacket(c))
    c.packetStatus = opts['dry-run'] ? 'dry-run' : 'written'
    if (!opts['dry-run']) written++
  }

  const report = {
    mode: 'detect',
    generatedAt: new Date().toISOString(),
    indexGeneratedAt: index.generatedAt,
    counts: { blog: posts.length, faq: entries.length, candidates: candidates.length, alreadyCredited: alreadyCredited.length, written, skipped },
    candidates,
    alreadyCredited,
  }
  if (opts.json) fs.writeFileSync(path.resolve(REPO_ROOT, opts.json), JSON.stringify(report, null, 2))

  if (!opts.quiet) {
    console.log(`\nCPM FAQ reconcile — detect${opts['dry-run'] ? ' (dry-run)' : ''}`)
    console.log(`  blog posts        ${posts.length}`)
    console.log(`  FAQ entries       ${entries.length}`)
    console.log(`  → touch candidates ${candidates.length}${opts['dry-run'] ? '' : ` (${written} packet${written === 1 ? '' : 's'} written, ${skipped} already queued)`}`)
    console.log(`  → already credited ${alreadyCredited.length} (idempotent skip)`)
    const contradictions = candidates.filter((c) => c.candidateContradiction)
    if (contradictions.length) {
      console.log(`\n  ⚠ candidate contradictions (Claude confirms strength):`)
      for (const c of contradictions)
        console.log(`    • ${c.entry} ← ${c.post}  shared statute ${c.sharedStatutes.join(', ')}; ${c.conflicts.map((k) => `${k.category}: entry ${k.entry.join('/')} vs post ${k.post.join('/')}`).join('; ')}`)
    }
    if (candidates.length) {
      console.log(`\n  Candidates (packets in ${path.relative(REPO_ROOT, outDir)}):`)
      for (const c of candidates)
        console.log(`    • ${c.entry} ← ${c.post}  [${c.signal}${c.backlink ? '' : ` contain ${c.containment}`} | suggest ${c.suggestedType}${c.wouldEscalate ? ' | would escalate' : ''}]`)
    }
    console.log(`\n  Next: open each packet, set the annotation type + write the note, set status: confirmed, then run --apply. Nothing committed.\n`)
  }
}

function round(n) {
  return Number(Number(n).toFixed(3))
}

function buildPacket(c) {
  const fm = {
    entry: c.entry,
    post: c.post,
    signal: c.signal,
    backlink: c.backlink,
    containment: c.containment,
    candidateContradiction: c.candidateContradiction,
    sharedStatutes: c.sharedStatutes,
    status: 'draft', // draft → confirmed (set by Claude/human once the note is written)
    proposed: {
      date: today,
      type: c.suggestedType, // SUGGESTED — confirm or change
      note: 'TODO: author the annotation note (Claude in-session / human).',
      post: c.post,
    },
  }
  const conflictBlock = c.conflicts.length
    ? c.conflicts
        .map(
          (k) =>
            `    ${k.category}: entry has [${k.entry.join(', ')}], post introduces [${k.newInPost.join(', ')}] (post set [${k.post.join(', ')}])`
        )
        .join('\n')
    : '    (none — deterministic sniff found no conflicting figure under a shared statute)'

  const guidance = `<!--
  RECONCILIATION PACKET — drafted by scripts/reconcile-faq.mjs (detect step).
  A blog post appears to bear on an EXISTING hub entry. The script proposes a
  dated, append-only annotation; it does NOT author the note or decide its
  strength. The live answer at content/faq/${c.entry}.md is UNCHANGED.

  TOUCH
    entry        : ${c.entry}
    question     : ${c.question}
    post         : ${c.post}${c.postTitle ? `  ("${c.postTitle}")` : ''}
    signal       : ${c.signal}${c.backlink ? ' (explicit backlink)' : ` (containment ${c.containment} ≥ threshold)`}
    contradiction: ${c.candidateContradiction ? `CANDIDATE — shared statute ${c.sharedStatutes.join(', ')}` : 'none detected'}

  DETERMINISTIC EVIDENCE (figures the sniffer compared):
${conflictBlock}

  TO COMPLETE (the judgment step — Claude in-session / human):
    1. Read the live answer at content/faq/${c.entry}.md and the triggering post.
    2. Decide the annotation TYPE in frontmatter \`proposed.type\`:
         additive         — adds context/nuance; the master answer stays correct.
         soft-revision     — refines/qualifies the answer; no figure is wrong.
         strong-revision   — materially changes the answer's thrust.
         contradiction     — a fact in the post conflicts with the live answer.
       (Suggested above: "${c.suggestedType}". The deterministic sniff only
        proposes "contradiction" when a shared statute carries differing figures —
        verify before keeping it; downgrade if it's really additive.)
    3. Write \`proposed.note\` in CPM voice: what changed and the dated takeaway.
       For objective/legal figures, re-verify against a primary source; if the
       master answer's number is now wrong, that's a contradiction → the entry
       will escalate to a consolidated rewrite on apply.
    4. Set \`status: confirmed\`. Then: node scripts/reconcile-faq.mjs --apply
       appends this annotation to the live entry (append-only, idempotent).
    5. If you decide this post does NOT actually touch the entry, delete this file.
-->

`
  return matter.stringify(guidance, fm)
}

// ---------- entry ----------
const opts = parseArgs(process.argv.slice(2))
if (opts.apply) runApply(opts)
else runDetect(opts)
