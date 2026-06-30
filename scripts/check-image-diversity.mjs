#!/usr/bin/env node
/**
 * check-image-diversity.mjs — guardrail for CPM blog hero imagery.
 *
 * Rule (set 2026-06-30): no two hero images should share a dominant visual MOTIF
 * within a rolling window of N posts (default 40), so a visitor scrolling the blog
 * doesn't see the same kind of picture twice in a short span. In a niche like
 * property management the obvious shots (for-sale signs, house keys, paperwork)
 * recur fast, so this flags clustering at prompt-authoring time.
 *
 * It classifies each post by the dominant prop/scene in its gemini_prompt sidecar
 * (.blog-processed/<slug>.json), falling back to heroImageAlt / slug when no prompt
 * exists (the legacy PNG posts show as "uncategorized — content unknown").
 *
 * Usage:
 *   node scripts/check-image-diversity.mjs            # window = 40
 *   node scripts/check-image-diversity.mjs --window 20
 *   node scripts/check-image-diversity.mjs --json     # machine-readable
 *
 * Exit code is non-zero if any within-window collision is found among posts that
 * HAVE a prompt (uncategorized legacy posts never fail the build).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const BLOG_DIR = path.join(REPO_ROOT, 'content/blog')
const SC_DIR = path.join(REPO_ROOT, '.blog-processed')

const args = process.argv.slice(2)
const WINDOW = Number((args[args.indexOf('--window') + 1] && args.includes('--window')) ? args[args.indexOf('--window') + 1] : 40)
const JSON_OUT = args.includes('--json')

// Dominant-motif map — priority order, first match wins (most distinctive prop first).
// Extend this as new shots are introduced.
const MOTIFS = [
  ['for-sale/for-rent sign', /for[- ]?sale|for[- ]?rent|\bsign\b/i],
  ['house keys', /\bkeys?\b/i],
  ['appliance (fridge/etc)', /refrigerator|fridge|appliance|stove|oven|washer|dishwasher/i],
  ['dog / pet', /\bdog\b|retriever|puppy|kitten|\bpet\b/i],
  ['moving boxes', /moving box|\bboxes\b/i],
  ['road / journey', /highway|\broad\b|route|driving/i],
  ['farmland / aerial', /farmland|grove|aerial|rolling .*hills|countryside|orchard/i],
  ['street / neighborhood', /\bstreet\b|neighborhood|suburb|cul-de-sac/i],
  ['porch / doorway', /porch|doorway|threshold|welcome mat|front door|entry/i],
  ['clock / calendar', /clock|calendar|hourglass/i],
  ['documents on desk/table', /paperwork|statement|\bbill\b|document|application|ledger|contract|\bdesk\b/i],
  ['people at a table', /kitchen table|across (a|the) table|lunch table|dining/i],
  ['people (general)', /handshake|shaking hands|professionals|young couple|family|tenant|homeowner|property manager|\bperson\b|\bpeople\b/i],
  ['model house', /model house|miniature house|toy house/i],
  ['home exterior', /townhome|home exterior|house exterior|bungalow|residence|single-family/i],
]
const classify = (t) => { for (const [n, re] of MOTIFS) if (re.test(t)) return n; return 'uncategorized — content unknown' }

function promptFor(slug) {
  const p = path.join(SC_DIR, `${slug}.json`)
  if (!fs.existsSync(p)) return null
  const raw = fs.readFileSync(p, 'utf8')
  try { const j = JSON.parse(raw); return j.gemini_prompt || null } catch {
    const m = raw.match(/"gemini_prompt"\s*:\s*"([^"]+)"/) // tolerate odd encodings
    return m ? m[1] : null
  }
}

const rows = []
for (const f of fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.mdx'))) {
  const slug = f.replace(/\.mdx$/, '')
  const d = matter(fs.readFileSync(path.join(BLOG_DIR, f), 'utf8')).data
  const prompt = promptFor(slug)
  const basis = prompt || d.heroImageAlt || slug.replace(/-/g, ' ')
  rows.push({ slug, date: d.publishedAt || '0000-00-00', motif: classify(basis), hasPrompt: !!prompt })
}
rows.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))

const last = {}
const collisions = []
rows.forEach((r, i) => {
  const prev = last[r.motif]
  // only treat as a real collision when BOTH posts have an authored prompt (known imagery)
  if (prev !== undefined && i - prev < WINDOW && r.hasPrompt && rows[prev].hasPrompt && !r.motif.startsWith('uncategorized')) {
    collisions.push({ motif: r.motif, first: rows[prev].slug, second: r.slug, gap: i - prev })
  }
  last[r.motif] = i
})

if (JSON_OUT) {
  console.log(JSON.stringify({ window: WINDOW, posts: rows, collisions }, null, 2))
} else {
  console.log(`\nCPM hero-image diversity — window ${WINDOW} posts\n`)
  rows.forEach((r, i) => {
    const prev = last === undefined ? undefined : null
    console.log(`${String(i + 1).padStart(2)}. ${r.date} [${r.hasPrompt ? 'P' : ' '}] ${r.motif.padEnd(26)} ${r.slug}`)
  })
  console.log(`\nWithin-${WINDOW} collisions among authored posts: ${collisions.length}`)
  collisions.forEach((c) => console.log(`  ⚠ ${c.motif}:  ${c.first}  →  ${c.second}  (gap ${c.gap})`))
  console.log('')
}
process.exit(collisions.length ? 1 : 0)
