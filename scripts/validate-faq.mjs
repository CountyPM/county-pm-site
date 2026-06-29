#!/usr/bin/env node
/**
 * validate-faq.mjs — pre-publish gate for FAQ hub entries.
 *
 * Replaces a full `next build` as the FAQ validation gate. A full build needs the
 * platform SWC binary and the network, neither of which is available in the
 * scheduled Linux sandbox — but the only thing that can actually break the FAQ
 * routes is bad frontmatter, which we can check with gray-matter alone (pure JS,
 * already installed). Vercel runs the real build on push; this catches the
 * content errors that would fail that build, before anything is committed.
 *
 * Checks every content/faq/<slug>.md for:
 *   - parseable YAML frontmatter
 *   - required fields: question, topic, type ∈ {objective, subjective}, created
 *   - OBJECTIVE entries must carry at least one source {label,url}
 *   - well-formed sources[] (label + http(s) url) and annotations[] (date,type,note)
 *   - non-empty answer body
 *   - no duplicate slugs
 *   - related[] (slice 3): every slug resolves to a real entry, no self-link, and
 *     the link is reciprocal (if A lists B, B must list A)
 *
 * Exit 0 = all valid; exit 1 = one or more invalid (details printed). Pair with a
 * --json <path> machine-readable report.
 *
 * Usage: node scripts/validate-faq.mjs [--json report.json] [--quiet]
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const FAQ_DIR = path.join(REPO_ROOT, 'content/faq')

const opts = { _: [] }
for (let i = 0; i < process.argv.slice(2).length; i++) {
  const a = process.argv.slice(2)[i]
  if (a === '--quiet') opts.quiet = true
  else if (a === '--json') opts.json = process.argv.slice(2)[++i]
}

const ANNOTATION_TYPES = new Set(['additive', 'soft-revision', 'strong-revision', 'contradiction'])
const isUrl = (u) => typeof u === 'string' && /^https?:\/\/\S+$/.test(u)

const results = []
const slugs = new Map()
// slice 3: collected across the first pass so reciprocity can be checked once all
// entries are known.
const relatedBy = new Map() // slug -> string[]
const resultBySlug = new Map() // slug -> result object (to append related errors)

if (!fs.existsSync(FAQ_DIR)) {
  console.error(`✗ No FAQ dir at ${path.relative(REPO_ROOT, FAQ_DIR)}`)
  process.exit(1)
}

for (const file of fs.readdirSync(FAQ_DIR).filter((f) => f.endsWith('.md')).sort()) {
  const slug = file.replace(/\.md$/, '')
  const errors = []
  let data = {}
  let body = ''
  try {
    const parsed = matter(fs.readFileSync(path.join(FAQ_DIR, file), 'utf8'))
    data = parsed.data
    body = parsed.content
  } catch (e) {
    results.push({ slug, ok: false, errors: [`YAML parse error: ${e.message}`] })
    continue
  }

  if (!data.question || !String(data.question).trim()) errors.push('missing `question`')
  if (!data.topic || !String(data.topic).trim()) errors.push('missing `topic`')
  if (data.type !== 'objective' && data.type !== 'subjective') errors.push(`\`type\` must be objective|subjective (got ${JSON.stringify(data.type)})`)
  if (!data.created || !/^\d{4}-\d{2}-\d{2}$/.test(String(data.created))) errors.push('missing/invalid `created` (YYYY-MM-DD)')
  if (!body || !body.trim()) errors.push('empty answer body')

  const sources = Array.isArray(data.sources) ? data.sources : []
  for (const [i, s] of sources.entries()) {
    if (!s || !s.label || !String(s.label).trim()) errors.push(`sources[${i}] missing label`)
    if (!s || !isUrl(s.url)) errors.push(`sources[${i}] missing/invalid url`)
  }
  // The core promise: objective entries never ship without a citation.
  if (data.type === 'objective' && sources.length === 0) errors.push('OBJECTIVE entry has no sources[] — must carry a verified citation before publishing')

  const annotations = Array.isArray(data.annotations) ? data.annotations : []
  for (const [i, a] of annotations.entries()) {
    if (!a || !a.note || !String(a.note).trim()) errors.push(`annotations[${i}] missing note`)
    if (a && a.type && !ANNOTATION_TYPES.has(a.type)) errors.push(`annotations[${i}] invalid type "${a.type}"`)
    if (a && a.date && !/^\d{4}-\d{2}-\d{2}$/.test(String(a.date))) errors.push(`annotations[${i}] invalid date "${a.date}"`)
  }

  if (slugs.has(slug)) errors.push(`duplicate slug (also ${slugs.get(slug)})`)
  slugs.set(slug, file)

  // Collect related[] for the reciprocity pass below (shape errors caught here).
  const related = Array.isArray(data.related) ? data.related.map(String) : []
  if (data.related != null && !Array.isArray(data.related)) errors.push('`related` must be an array of slugs')
  relatedBy.set(slug, related)

  const result = { slug, ok: errors.length === 0, type: data.type, sources: sources.length, errors }
  results.push(result)
  resultBySlug.set(slug, result)
}

// ---- related[] resolution + reciprocity (slice 3) ----
// Every link must point at a real entry, never at itself, and be mutual: if A
// lists B, B must list A. crosslink-faq.mjs --apply writes links reciprocally, so
// a one-sided link means a hand edit or a half-applied packet — block it.
for (const [slug, related] of relatedBy) {
  const result = resultBySlug.get(slug)
  const seen = new Set()
  for (const target of related) {
    if (target === slug) {
      result.errors.push(`related[] self-link "${target}"`)
      continue
    }
    if (seen.has(target)) {
      result.errors.push(`related[] duplicate "${target}"`)
      continue
    }
    seen.add(target)
    if (!relatedBy.has(target)) {
      result.errors.push(`related[] "${target}" does not resolve to a real entry`)
      continue
    }
    if (!relatedBy.get(target).includes(slug)) {
      result.errors.push(`related[] link to "${target}" is not reciprocal (${target} does not list ${slug})`)
    }
  }
  result.ok = result.errors.length === 0
}

const bad = results.filter((r) => !r.ok)
const report = { generatedAt: new Date().toISOString(), total: results.length, valid: results.length - bad.length, invalid: bad.length, results }
if (opts.json) fs.writeFileSync(path.resolve(REPO_ROOT, opts.json), JSON.stringify(report, null, 2))

if (!opts.quiet) {
  console.log(`\nFAQ validation — ${results.length} entr${results.length === 1 ? 'y' : 'ies'}`)
  for (const r of results) {
    if (r.ok) console.log(`  ok   ${r.slug} (${r.type}, ${r.sources} source${r.sources === 1 ? '' : 's'})`)
    else {
      console.log(`  FAIL ${r.slug}`)
      for (const e of r.errors) console.log(`         - ${e}`)
    }
  }
  console.log(bad.length ? `\n✗ ${bad.length} invalid — fix before publishing.\n` : `\n✓ all ${results.length} valid.\n`)
}

process.exit(bad.length ? 1 : 0)
