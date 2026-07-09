// geo-readout.mjs — assembles the GEO EFFECTIVENESS READOUT (priority item #3),
// the OUTCOME end of the whole initiative. The pipeline authors, publishes,
// inspects, and heartbeats; nothing until now measured whether any of it moved
// the needle it exists for: are our pages indexed, and do AI answer engines cite
// us? This folds the two measurement halves into one dated, committed trend and
// emails a compact summary.
//
// INPUTS (both optional; each half degrades independently):
//   geo-index-report.json     ← geo-indexation-check.mjs  (unattended, site: queries)
//   geo-citation-report.json  ← geo-citation-record.mjs   (browser spot check)
//
// OUTPUTS:
//   docs/CPM_GEO_Readout.md   ← a new dated section PREPENDED under the header
//                               (newest first), so the file is the trend history.
//   email                     ← compact summary via lib-mail.mjs (same Gmail path
//                               as the item #2 heartbeat). Subject scannable:
//                               [CPM GEO ✓] clean / [CPM GEO ⚠] needs a look.
//
// WHERE IT RUNS: Windows side (needs the fresh reports from a networked run and
// commits the doc). Not the sandbox. Missing reports never crash it — a half that
// didn't run this cycle is reported as "not run", which is itself signal.
//
// USAGE
//   node scripts/geo-readout.mjs                 # assemble, write doc, email
//   node scripts/geo-readout.mjs --dry           # compose + print, write nothing
//   node scripts/geo-readout.mjs --no-email      # write doc, skip the email
//   node scripts/geo-readout.mjs --only-problems # email only if ⚠

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { sendSignal } from './lib-mail.mjs'

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const INDEX_REPORT = path.join(REPO_ROOT, 'geo-index-report.json')
const CITE_REPORT = path.join(REPO_ROOT, 'geo-citation-report.json')
const DOC_PATH = path.join(REPO_ROOT, 'docs/CPM_GEO_Readout.md')

// thresholds that trip the ⚠ status (tunable)
const COVERAGE_WARN_PCT = 70      // bulk coverage below this ⇒ attention
const SAMPLE_WARN_PCT = 80        // sampled key-URL presence below this ⇒ attention
const CITATION_WARN_PCT = 25      // overall AI-citation rate below this ⇒ attention
const STALE_DAYS = 45             // a report older than this counts as "not run"

function parseArgs(argv) {
  const o = {}
  for (const a of argv) {
    if (a === '--dry') o.dry = true
    else if (a === '--no-email') o.noEmail = true
    else if (a === '--only-problems') o.onlyProblems = true
  }
  return o
}

function readJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')) } catch { return null }
}
function ageDays(iso) {
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return Infinity
  return (Date.now() - t) / 86400000
}
const pctStr = (n) => (n == null ? '—' : `${n}%`)

function todayStamp() {
  return new Date().toISOString().slice(0, 10)
}

// ── compose the dated markdown section + the email body + the status ──────────
function compose({ index, cite }) {
  const stamp = todayStamp()
  const problems = []
  const md = []
  const email = []

  md.push(`## ${stamp} — GEO readout\n`)

  // ---- Indexation ----
  md.push('### Indexation coverage (search index `site:` probe)\n')
  if (!index || ageDays(index.generatedAt) > STALE_DAYS) {
    md.push('_Indexation check did not run this cycle (no fresh geo-index-report.json)._\n')
    email.push('Indexation: NOT RUN this cycle.')
    problems.push('indexation not run')
  } else {
    const engineLines = index.engines
      .map((e) => `${e.engine} ${e.ok ? '(approx ' + (e.approxIndexed ?? 'n/a') + ')' : '— unavailable' + (e.note ? ' [' + e.note + ']' : '')}`)
      .join(', ')
    md.push(`- Sitemap URLs (denominator): **${index.sitemapCount}**`)
    md.push(`- Bulk coverage ≈ **${pctStr(index.bulkCoveragePct)}** (best engine count ${index.bestBulkCount ?? '—'} vs sitemap ${index.sitemapCount})`)
    md.push(`- Sampled key-URL presence: **${pctStr(index.sampledPct)}** (${index.sampledPresent}/${index.sampleSize})`)
    md.push(`- Engines: ${engineLines}`)
    const missing = (index.sample || []).filter((s) => !s.present).map((s) => s.url)
    if (missing.length) {
      md.push(`- Key URLs NOT found in the sampled index:`)
      for (const u of missing) md.push(`  - \`${u}\``)
    } else if (index.sampleSize) {
      md.push(`- All ${index.sampleSize} sampled key URLs present. ✓`)
    }
    md.push('')
    email.push(`Indexation: bulk ≈ ${pctStr(index.bulkCoveragePct)}, sampled ${pctStr(index.sampledPct)} (${index.sampledPresent}/${index.sampleSize}); sitemap ${index.sitemapCount} URLs.`)
    if (index.bulkCoveragePct != null && index.bulkCoveragePct < COVERAGE_WARN_PCT) problems.push(`bulk coverage ${index.bulkCoveragePct}% < ${COVERAGE_WARN_PCT}%`)
    if (index.sampledPct != null && index.sampledPct < SAMPLE_WARN_PCT) problems.push(`sampled presence ${index.sampledPct}% < ${SAMPLE_WARN_PCT}%`)
    if (missing.length) problems.push(`${missing.length} key URL(s) missing from index`)
  }

  // ---- AI citation ----
  md.push('### AI-citation spot check (answer-engine visibility)\n')
  if (!cite || ageDays(cite.generatedAt) > STALE_DAYS) {
    md.push('_Citation spot check did not run this cycle (no fresh geo-citation-report.json). Run the browser probe set, then `npm run geo:citation-record`._\n')
    email.push('AI-citation: NOT RUN this cycle.')
    problems.push('citation check not run')
  } else {
    const s = cite.summary || {}
    md.push(`- Overall citation rate: **${pctStr(s.overallPct)}** (${s.citedTotal}/${s.checkedTotal} checked engine×probe cells)`)
    if (s.byEngine) {
      md.push('- By engine:')
      for (const [e, b] of Object.entries(s.byEngine)) md.push(`  - ${e}: **${pctStr(b.pct)}** (${b.cited}/${b.checked})`)
    }
    if (s.byIntent) {
      md.push('- By intent:')
      for (const [it, b] of Object.entries(s.byIntent)) md.push(`  - ${it}: ${pctStr(b.pct)} (${b.cited}/${b.checked})`)
    }
    // notable wins/misses
    const wins = [], misses = []
    for (const p of cite.probes || []) {
      for (const [e, cell] of Object.entries(p.results || {})) {
        if (cell.cited === true) wins.push(`${p.id}/${e}${cell.position ? ' (pos ' + cell.position + ')' : ''}`)
        else if (cell.cited === false) misses.push(`${p.id}/${e}`)
      }
    }
    if (wins.length) md.push(`- Cited: ${wins.slice(0, 12).join(', ')}${wins.length > 12 ? ' …' : ''}`)
    if (misses.length) md.push(`- Not cited: ${misses.slice(0, 12).join(', ')}${misses.length > 12 ? ' …' : ''}`)
    md.push('')
    email.push(`AI-citation: overall ${pctStr(s.overallPct)} (${s.citedTotal}/${s.checkedTotal}).`)
    if (s.overallPct != null && s.overallPct < CITATION_WARN_PCT) problems.push(`citation ${s.overallPct}% < ${CITATION_WARN_PCT}%`)
  }

  const clean = problems.length === 0
  md.push(`**Status:** ${clean ? '✓ on track' : '⚠ ' + problems.join('; ')}\n`)
  md.push('---\n')

  const subject = `[CPM GEO ${clean ? '✓' : '⚠'}] readout ${stamp}`
  const emailText = [
    `CPM GEO effectiveness readout — ${stamp}`,
    clean ? 'Status: ✓ on track' : 'Status: ⚠ ' + problems.join('; '),
    '',
    ...email,
    '',
    'Full trend: docs/CPM_GEO_Readout.md',
  ].join('\n')

  return { section: md.join('\n'), subject, emailText, clean, problems }
}

const DOC_HEADER = `# CPM GEO Effectiveness Readout

The OUTCOME ledger for the GEO initiative (priority item #3). Each cycle appends a
dated section **at the top** (newest first) with two measurements:

1. **Indexation coverage** — are our pages actually in the search indexes that feed
   AI answer engines? Measured with public \`site:\` queries (no API creds) by
   \`scripts/geo-indexation-check.mjs\`. Approximate by design.
2. **AI-citation spot check** — do ChatGPT / Perplexity / Google's AI Overview name
   County Property Management or link c-p-m.com for the questions our owners ask?
   A fixed probe set (\`scripts/geo-citation-probes.json\`) run in a real signed-in
   browser via the Chrome MCP, recorded by \`scripts/geo-citation-record.mjs\`.

Assembled + emailed by \`scripts/geo-readout.mjs\` (\`npm run geo:readout\`). Runs
Windows-side (needs live network + commits this doc); see the two-host model in
\`docs/CPM_GEO_Progress_Summary.md\` §6. A "not run" half is itself signal.

---
`

function writeDoc(section) {
  let existing = ''
  if (fs.existsSync(DOC_PATH)) existing = fs.readFileSync(DOC_PATH, 'utf8')
  if (!existing.includes('# CPM GEO Effectiveness Readout')) {
    fs.writeFileSync(DOC_PATH, DOC_HEADER + '\n' + section + '\n')
    return
  }
  // insert the new section right after the header's closing '---\n'
  const marker = '\n---\n'
  const idx = existing.indexOf(marker)
  if (idx === -1) {
    fs.writeFileSync(DOC_PATH, existing.trimEnd() + '\n\n' + section + '\n')
    return
  }
  const head = existing.slice(0, idx + marker.length)
  const rest = existing.slice(idx + marker.length)
  fs.writeFileSync(DOC_PATH, head + '\n' + section + '\n' + rest.replace(/^\n+/, ''))
}

async function main() {
  const o = parseArgs(process.argv.slice(2))
  const index = readJson(INDEX_REPORT)
  const cite = readJson(CITE_REPORT)
  const { section, subject, emailText, clean, problems } = compose({ index, cite })

  console.log(section)

  if (o.dry) {
    console.log('--- EMAIL (dry) ---')
    console.log(subject)
    console.log(emailText)
    return
  }

  writeDoc(section)
  console.log(`\nappended section to ${path.relative(REPO_ROOT, DOC_PATH)}`)

  if (o.noEmail) return
  if (o.onlyProblems && clean) { console.log('clean + --only-problems ⇒ no email'); return }
  try {
    const r = await sendSignal({ subject, text: emailText })
    console.log(`emailed readout → ${r.to} (${r.messageId})`)
  } catch (e) {
    console.error(`email failed (non-fatal): ${e.message}`)
  }
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (invokedDirectly) {
  main().catch((e) => { console.error('geo-readout failed:', e); process.exit(1) })
}

export { compose, writeDoc }
