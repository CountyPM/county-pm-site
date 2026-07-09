// geo-citation-record.mjs — records the results of an AI-citation spot check
// (item #3, the OUTCOME end). The actual browsing is done by an agent driving a
// real, signed-in browser via the Chrome MCP (the owner chose browser automation
// over paid APIs — see docs/CPM_Decision_Log.md item #3 kickoff). This script is
// the durable ledger: it takes the observed results, merges them onto the fixed
// probe set (geo-citation-probes.json), computes the summary, and writes
// geo-citation-report.json for the readout assembler (geo-readout.mjs).
//
// WHY A SEPARATE RECORDER: the browser step can't run headless/unattended (it
// needs signed-in sessions and occasional babysitting), so it's decoupled from
// the writer. The browser task produces a small results array; this turns that
// into the same shaped report the trend doc + email expect, whether it ran today
// or two weeks ago.
//
// A "cited" result = c-p-m.com appeared as a linked source OR County Property
// Management was named in the engine's answer.
//
// USAGE
//   node scripts/geo-citation-record.mjs --template            # print blank scaffold
//   node scripts/geo-citation-record.mjs --results run.json     # merge a results array
//   node scripts/geo-citation-record.mjs --results run.json --dry
//   node scripts/geo-citation-record.mjs --summary              # recompute from report
//
// results.json shape (array):
//   [ { "id": "local-pm-ventura", "engine": "chatgpt", "cited": true,
//       "position": 1, "note": "named + linked in sources" }, ... ]

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PROBES_PATH = path.join(REPO_ROOT, 'scripts/geo-citation-probes.json')
const REPORT_PATH = path.join(REPO_ROOT, 'geo-citation-report.json')

function parseArgs(argv) {
  const o = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--results') o.results = argv[++i]
    else if (a === '--out') o.out = argv[++i]
    else if (a === '--template') o.template = true
    else if (a === '--summary') o.summary = true
    else if (a === '--dry') o.dry = true
  }
  return o
}

function loadProbes() {
  const j = JSON.parse(fs.readFileSync(PROBES_PATH, 'utf8'))
  return j
}

function loadReport() {
  try {
    return JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'))
  } catch {
    return null
  }
}

// build the empty scaffold: every probe × every engine, cited=null (unknown)
export function buildScaffold(probeDoc) {
  const engines = probeDoc.engines
  return {
    generatedAt: new Date().toISOString(),
    site: probeDoc.site,
    brand: probeDoc.brand,
    engines,
    probes: probeDoc.probes.map((p) => ({
      id: p.id,
      intent: p.intent,
      question: p.question,
      targetUrl: p.targetUrl,
      results: Object.fromEntries(engines.map((e) => [e, { cited: null, position: null, note: '' }])),
    })),
  }
}

// merge a results array onto a report (mutates + returns it)
export function applyResults(report, results) {
  const byId = new Map(report.probes.map((p) => [p.id, p]))
  const unknownIds = []
  for (const r of results) {
    const probe = byId.get(r.id)
    if (!probe) { unknownIds.push(r.id); continue }
    if (!probe.results[r.engine]) probe.results[r.engine] = { cited: null, position: null, note: '' }
    probe.results[r.engine] = {
      cited: r.cited === true || r.cited === 'true' || r.cited === 'y',
      position: r.position ?? null,
      note: r.note || '',
    }
  }
  report.generatedAt = new Date().toISOString()
  return { report, unknownIds }
}

// summary: per-engine cited/checked and an overall cited rate over CHECKED cells
export function summarize(report) {
  const engines = report.engines
  const byEngine = {}
  let citedTotal = 0, checkedTotal = 0
  for (const e of engines) byEngine[e] = { cited: 0, checked: 0 }
  for (const p of report.probes) {
    for (const e of engines) {
      const cell = p.results[e]
      if (!cell || cell.cited === null) continue // unchecked ⇒ excluded from rate
      byEngine[e].checked++
      checkedTotal++
      if (cell.cited) { byEngine[e].cited++; citedTotal++ }
    }
  }
  const pct = (c, n) => (n ? Math.round((c / n) * 100) : null)
  const byEnginePct = Object.fromEntries(
    engines.map((e) => [e, { ...byEngine[e], pct: pct(byEngine[e].cited, byEngine[e].checked) }])
  )
  // per-intent breakdown (local vs informational vs decision)
  const byIntent = {}
  for (const p of report.probes) {
    const it = p.intent || 'other'
    byIntent[it] = byIntent[it] || { cited: 0, checked: 0 }
    for (const e of engines) {
      const cell = p.results[e]
      if (!cell || cell.cited === null) continue
      byIntent[it].checked++
      if (cell.cited) byIntent[it].cited++
    }
  }
  for (const it of Object.keys(byIntent)) byIntent[it].pct = pct(byIntent[it].cited, byIntent[it].checked)
  return {
    citedTotal,
    checkedTotal,
    overallPct: pct(citedTotal, checkedTotal),
    byEngine: byEnginePct,
    byIntent,
  }
}

function main() {
  const o = parseArgs(process.argv.slice(2))
  const probeDoc = loadProbes()

  if (o.template) {
    console.log(JSON.stringify(buildScaffold(probeDoc), null, 2))
    return
  }

  if (o.summary) {
    const report = loadReport()
    if (!report) { console.error('no geo-citation-report.json yet'); process.exit(1) }
    report.summary = summarize(report)
    console.log(JSON.stringify(report.summary, null, 2))
    return
  }

  if (!o.results) {
    console.error('nothing to do — pass --results <file>, --template, or --summary')
    process.exit(1)
  }

  // start from existing report (preserve prior-engine cells) or a fresh scaffold
  let report = loadReport()
  if (!report || report.probes?.length !== probeDoc.probes.length) report = buildScaffold(probeDoc)

  const results = JSON.parse(fs.readFileSync(path.resolve(o.results), 'utf8'))
  if (!Array.isArray(results)) { console.error('results file must be a JSON array'); process.exit(1) }
  const { unknownIds } = applyResults(report, results)
  report.summary = summarize(report)

  if (unknownIds.length) console.error(`  warning: ${unknownIds.length} unknown probe id(s): ${[...new Set(unknownIds)].join(', ')}`)
  console.log(`  merged ${results.length} result(s); overall cited ${report.summary.overallPct ?? '—'}% (${report.summary.citedTotal}/${report.summary.checkedTotal} checked cells)`)
  for (const e of report.engines) {
    const b = report.summary.byEngine[e]
    console.log(`    ${e}: ${b.pct ?? '—'}%  (${b.cited}/${b.checked})`)
  }

  if (o.dry) { console.log('\n(dry — not written)'); return }
  const outPath = o.out ? path.resolve(o.out) : REPORT_PATH
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2))
  console.log(`\nwrote ${path.relative(REPO_ROOT, outPath)}`)
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (invokedDirectly) {
  try { main() } catch (e) { console.error('geo-citation-record failed:', e); process.exit(1) }
}
