// send-heartbeat.mjs — the SIGNAL half of priority item #2.
//
// The pipeline auto-publishes but used to no-op silently: a stalled week, or
// drafts stuck unpublished in the queue (the exact 07/02 failure mode), was
// invisible until someone dug by hand. This emits a dated signal after each
// publish run to the blog inbox the owner already watches, so both failure modes
// are visible without a manual dig.
//
// It gathers three things and emails a compact summary:
//   1. OUTPUT end — the inspect-report.json written by inspect-live-posts.mjs
//      (did the live pages actually render?).
//   2. INPUT end — the FAQ draft queue depth: how many entries are drafted
//      (content/faq-drafts/) vs how many are live (content/faq/). A growing gap
//      is the 07/02 stall.
//   3. RUN outcome — counts passed in by the runner (--published / --failed /
//      --state) so "publish ran: committed / no-op / failed" is on the record.
//
// The subject line is scannable: "[CPM blog ✓]" when clean, "[CPM blog ⚠]" when
// something needs attention (a live check failed, a run failed, or the draft
// backlog crossed the stall threshold).
//
// USAGE (called by the Windows runners; see post-blog-inbox.ps1 / publish-faq.ps1)
//   node scripts/send-heartbeat.mjs --context blog --published 2 --failed 0 --state published
//   node scripts/send-heartbeat.mjs --context faq  --state no-op
//   node scripts/send-heartbeat.mjs --context faq  --only-problems   # send only if attention needed
//   node scripts/send-heartbeat.mjs --context blog --dry             # compose + print, do not send

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { sendSignal } from './lib-mail.mjs'

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const REPORT_PATH = path.join(REPO_ROOT, 'inspect-report.json')
const FAQ_DIR = path.join(REPO_ROOT, 'content/faq')
const FAQ_DRAFTS_DIR = path.join(REPO_ROOT, 'content/faq-drafts')

function parseArgs(argv) {
  const o = { context: 'blog', stallThreshold: 25 }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--context') o.context = argv[++i]
    else if (a === '--published') o.published = Number(argv[++i])
    else if (a === '--failed') o.failed = Number(argv[++i])
    else if (a === '--state') o.state = argv[++i]
    else if (a === '--stall-threshold') o.stallThreshold = Number(argv[++i])
    else if (a === '--only-problems') o.onlyProblems = true
    else if (a === '--dry' || a === '--no-send') o.dry = true
  }
  return o
}

function countMd(dir) {
  try {
    return fs.readdirSync(dir).filter((f) => f.endsWith('.md')).length
  } catch {
    return 0
  }
}

function readReport() {
  try {
    return JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'))
  } catch {
    return null
  }
}

async function main() {
  const o = parseArgs(process.argv.slice(2))
  const now = new Date()
  const stamp = now.toISOString()

  const liveFaq = countMd(FAQ_DIR)
  const draftFaq = countMd(FAQ_DRAFTS_DIR)
  const report = readReport()

  const lines = []
  lines.push(`CPM pipeline heartbeat — ${stamp}`)
  lines.push(`context: ${o.context}`)
  lines.push('')

  // --- run outcome ---
  const runFailed = Number.isFinite(o.failed) ? o.failed : 0
  const runPublished = Number.isFinite(o.published) ? o.published : null
  lines.push('RUN')
  if (o.state) lines.push(`  state: ${o.state}`)
  if (runPublished !== null) lines.push(`  published this run: ${runPublished}`)
  if (Number.isFinite(o.failed)) lines.push(`  failed/left-in-inbox this run: ${o.failed}`)
  lines.push('')

  // --- output-end (live inspection) ---
  let inspectProblem = false
  lines.push('OUTPUT — live inspection')
  if (!report) {
    lines.push('  no inspect-report.json found (inspection did not run this cycle)')
  } else if (report.note === 'no-targets') {
    lines.push('  no new blog/FAQ content to inspect')
  } else {
    const passed = report.passed?.length ?? 0
    const failed = report.failed?.length ?? 0
    lines.push(`  ${passed}/${report.targetCount ?? passed + failed} live pages verified (after ${report.attempts ?? '?'} attempt(s))`)
    if (failed > 0) {
      inspectProblem = true
      for (const t of report.targets || []) {
        if (t.pass) continue
        const bad = (t.checks || []).filter((c) => !c.ok).map((c) => c.name).join(', ')
        lines.push(`  ✗ ${t.kind} ${t.slug} — failed: ${bad}`)
        lines.push(`      ${t.url}`)
      }
    }
    if (report.error) {
      inspectProblem = true
      lines.push(`  inspection crashed: ${report.error}`)
    }
  }
  lines.push('')

  // --- input-end (draft queue depth) ---
  const stall = draftFaq >= o.stallThreshold
  lines.push('INPUT — FAQ draft queue')
  lines.push(`  drafted (content/faq-drafts): ${draftFaq}`)
  lines.push(`  live (content/faq): ${liveFaq}`)
  if (stall) {
    lines.push(`  ⚠ ${draftFaq} drafts are queued but unpublished (>= ${o.stallThreshold}).`)
    lines.push('    This is the 07/02 stall shape: drafted answers never authored/promoted to the hub.')
  }
  lines.push('')

  const problem = inspectProblem || runFailed > 0 || stall
  const mark = problem ? '⚠' : '✓'
  lines.push(problem ? 'ATTENTION: at least one signal needs a look (see ⚠ above).' : 'All clear.')

  const subject = `[CPM blog ${mark}] ${o.context} run ${now.toISOString().slice(0, 16).replace('T', ' ')}`
  const text = lines.join('\n')

  if (o.onlyProblems && !problem) {
    console.log('heartbeat: all clear and --only-problems set — no email sent.')
    console.log(text)
    return 0
  }

  if (o.dry) {
    console.log('--- heartbeat (dry run, not sent) ---')
    console.log('Subject:', subject)
    console.log(text)
    return 0
  }

  try {
    const res = await sendSignal({ subject, text })
    console.log(`heartbeat: sent to ${res.to} (${subject})`)
    return 0
  } catch (e) {
    // A failed heartbeat must never fail the publish run — just log loudly.
    console.error(`heartbeat: FAILED to send (${e.message}). Summary follows:`)
    console.error(text)
    return 0
  }
}

main().then((c) => process.exit(c))
