#!/usr/bin/env node
/**
 * check-faq-sources.mjs — CPM FAQ source-link validation routine (GEO track B).
 *
 * The FAQ hub publishes objective answers backed by external source links
 * (e.g. the California rent-control entry cites two leginfo.ca.gov statutes).
 * The moment those links go live they start aging: pages move, get redirected,
 * or have their content quietly edited. This routine reads every FAQ entry's
 * `sources[]`, checks each URL, and flags rot so a human can fix the frontmatter
 * before a crawler (or a reader) hits a dead or stale citation.
 *
 * Three classes of rot are detected:
 *   1. LIVENESS — dead links (4xx/5xx, DNS failure, connection error, timeout).
 *   2. REDIRECTS — 3xx responses, reported with their destination and whether
 *      the move is permanent (301/308 → worth updating the source URL) or
 *      temporary (302/307).
 *   3. DRIFT — the page is still live but its visible content changed since the
 *      last accepted baseline. A signal to re-read the source and confirm the
 *      answer still matches; not an automated edit.
 *
 * The baseline (scripts/faq-source-baseline.json) is the known-good snapshot.
 * It's committed so drift detection is stable across machines and CI. First time
 * a URL is seen it's recorded silently (NEW). Drift keeps being reported on every
 * run until a human reviews and accepts it with --update-baseline.
 *
 * Usage:
 *   node scripts/check-faq-sources.mjs [options]
 *
 * Options:
 *   --json <path>          Also write a full JSON report to <path>.
 *   --update-baseline      Accept the current content of every reachable URL as
 *     (alias --accept)     the new baseline. Run this after reviewing drift, or
 *                          once to seed the baseline the first time.
 *   --strict               Exit non-zero on warnings (redirects/drift) too, not
 *                          just on dead links. Useful as a CI gate.
 *   --timeout <ms>         Per-request timeout (default 15000).
 *   --concurrency <n>      Max parallel requests (default 4).
 *   --baseline <path>      Baseline state file (default scripts/faq-source-baseline.json).
 *   --quiet                Only print problems and the summary line.
 *
 * Exit codes:
 *   0  all clean (or only warnings without --strict)
 *   1  warnings present (redirects/drift) and --strict was passed
 *   2  failures present (dead links / errors)
 */

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const FAQ_DIR = path.join(REPO_ROOT, 'content/faq')
const DEFAULT_BASELINE = path.join(REPO_ROOT, 'scripts/faq-source-baseline.json')
const MAX_REDIRECTS = 5
const UA =
  'Mozilla/5.0 (compatible; CPM-FAQ-link-check/1.0; +https://www.c-p-m.com/faq)'

// ---------- arg parsing ----------
function parseArgs(argv) {
  const opts = {
    timeout: 15000,
    concurrency: 4,
    baseline: DEFAULT_BASELINE,
    updateBaseline: false,
    strict: false,
    quiet: false,
    json: null,
  }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--update-baseline' || a === '--accept') opts.updateBaseline = true
    else if (a === '--strict') opts.strict = true
    else if (a === '--quiet') opts.quiet = true
    else if (a === '--json') opts.json = argv[++i]
    else if (a === '--baseline') opts.baseline = argv[++i]
    else if (a === '--timeout') opts.timeout = parseInt(argv[++i], 10)
    else if (a === '--concurrency') opts.concurrency = parseInt(argv[++i], 10)
    else if (a === '--help' || a === '-h') {
      console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(2, 50).join('\n'))
      process.exit(0)
    } else {
      console.error(`Unknown argument: ${a}`)
      process.exit(2)
    }
  }
  return opts
}

// ---------- collecting sources from the FAQ corpus ----------
// Mirrors normalizeSources() in lib/faq.ts: a source is {label, url} and both
// must be non-empty to count.
function collectSources() {
  if (!fs.existsSync(FAQ_DIR)) return []
  const byUrl = new Map() // url -> { url, refs: [{slug, label}] }
  for (const file of fs.readdirSync(FAQ_DIR)) {
    if (!file.endsWith('.md')) continue
    const slug = file.replace(/\.md$/, '')
    const raw = fs.readFileSync(path.join(FAQ_DIR, file), 'utf8')
    const { data } = matter(raw)
    const sources = Array.isArray(data.sources) ? data.sources : []
    for (const s of sources) {
      if (!s || typeof s !== 'object') continue
      const label = String(s.label || '').trim()
      const url = String(s.url || '').trim()
      if (!label || !url) continue
      let rec = byUrl.get(url)
      if (!rec) {
        rec = { url, refs: [] }
        byUrl.set(url, rec)
      }
      rec.refs.push({ slug, label })
    }
  }
  return [...byUrl.values()]
}

// ---------- fetching ----------
// Follow redirects manually so we can capture the chain (status + destination)
// while still ending up with the final body for fingerprinting.
async function fetchWithChain(url, timeoutMs) {
  const chain = []
  let current = url
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    let res
    try {
      res = await fetch(current, {
        redirect: 'manual',
        signal: controller.signal,
        headers: { 'User-Agent': UA, Accept: 'text/html,*/*' },
      })
    } catch (err) {
      clearTimeout(timer)
      const code = err?.cause?.code || err?.name || 'FETCH_FAILED'
      return {
        ok: false,
        error: err?.name === 'AbortError' ? `timeout after ${timeoutMs}ms` : code,
        chain,
        finalUrl: current,
      }
    }
    clearTimeout(timer)

    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      const location = new URL(res.headers.get('location'), current).toString()
      chain.push({ from: current, status: res.status, to: location })
      current = location
      continue
    }

    let body = ''
    if (res.status >= 200 && res.status < 300) {
      try {
        body = await res.text()
      } catch {
        body = ''
      }
    } else {
      // drain so the socket can close
      try {
        await res.text()
      } catch {
        /* ignore */
      }
    }
    return {
      ok: res.status >= 200 && res.status < 300,
      status: res.status,
      chain,
      finalUrl: res.url || current,
      body,
    }
  }
  return { ok: false, error: `too many redirects (>${MAX_REDIRECTS})`, chain, finalUrl: current }
}

// Reduce an HTML page to a stable fingerprint of its *visible* content. Strips
// scripts, styles, comments, and all tags — which removes per-request noise like
// JSF ViewState tokens, CSRF nonces, and CSS — then collapses whitespace and
// hashes. Drift means the readable substance of the cited page changed.
function fingerprint(html) {
  const text = String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return {
    hash: crypto.createHash('sha256').update(text).digest('hex'),
    length: text.length,
  }
}

// ---------- baseline ----------
function loadBaseline(file) {
  if (!fs.existsSync(file)) return { version: 1, urls: {} }
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'))
    return { version: parsed.version || 1, urls: parsed.urls || {} }
  } catch {
    console.error(`! baseline at ${file} is unreadable; treating as empty.`)
    return { version: 1, urls: {} }
  }
}

function saveBaseline(file, baseline) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(baseline, null, 2) + '\n')
}

// ---------- concurrency helper ----------
async function mapLimit(items, limit, fn) {
  const results = new Array(items.length)
  let i = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++
      results[idx] = await fn(items[idx], idx)
    }
  })
  await Promise.all(workers)
  return results
}

// ---------- main ----------
const opts = parseArgs(process.argv.slice(2))
const sources = collectSources()

console.log(`\nCPM FAQ source-link check — ${new Date().toISOString()}`)
if (sources.length === 0) {
  console.log('\nNo source links found across the FAQ corpus. Nothing to check.\n')
  process.exit(0)
}
console.log(`Checking ${sources.length} unique URL(s)...\n`)

const baseline = loadBaseline(opts.baseline)
let baselineDirty = false

const checked = await mapLimit(sources, opts.concurrency, async (src) => {
  const result = await fetchWithChain(src.url, opts.timeout)
  const flags = []
  let severity = 'ok' // ok | warn | fail
  const prev = baseline.urls[src.url]

  if (!result.ok) {
    severity = 'fail'
    if (result.error) flags.push({ kind: result.error.startsWith('timeout') ? 'TIMEOUT' : 'ERROR', detail: result.error })
    else flags.push({ kind: 'DEAD', detail: `HTTP ${result.status}` })
  } else {
    // reachable (2xx). Note any redirect chain as a warning.
    if (result.chain.length > 0) {
      const last = result.chain[result.chain.length - 1]
      const permanent = result.chain.some((h) => h.status === 301 || h.status === 308)
      flags.push({
        kind: 'REDIRECT',
        detail: `${result.chain.map((h) => h.status).join('→')} to ${result.finalUrl}${permanent ? ' (permanent — update source URL)' : ' (temporary)'}`,
      })
      severity = 'warn'
    }

    const fp = fingerprint(result.body)
    result.fingerprint = fp
    if (!prev || !prev.hash) {
      // first time we've seen this URL — record it silently as the baseline
      baseline.urls[src.url] = {
        hash: fp.hash,
        length: fp.length,
        finalUrl: result.finalUrl,
        label: src.refs[0]?.label || '',
        firstSeen: new Date().toISOString().slice(0, 10),
      }
      baselineDirty = true
      flags.push({ kind: 'NEW', detail: 'recorded in baseline' })
    } else if (prev.hash !== fp.hash) {
      flags.push({
        kind: 'DRIFT',
        detail: `content changed (was ${prev.length} chars, now ${fp.length}); re-read source, then accept with --update-baseline`,
      })
      if (severity !== 'fail') severity = 'warn'
      if (opts.updateBaseline) {
        baseline.urls[src.url].hash = fp.hash
        baseline.urls[src.url].length = fp.length
        baseline.urls[src.url].finalUrl = result.finalUrl
        baselineDirty = true
      }
    }
    // refresh hash on accept even when unchanged is unnecessary; only on drift above.
  }

  return { ...src, result, flags, severity }
})

// ---------- report ----------
const ICON = { ok: '✓', warn: '!', fail: '✗' }
const fails = checked.filter((c) => c.severity === 'fail')
const warns = checked.filter((c) => c.severity === 'warn')

for (const c of checked) {
  if (opts.quiet && c.severity === 'ok') continue
  console.log(`${ICON[c.severity]} ${c.url}`)
  const where = c.refs.map((r) => r.slug).join(', ')
  console.log(`    cited in: ${where}`)
  if (c.flags.length === 0) {
    console.log(`    OK (HTTP ${c.result.status}, ${c.result.fingerprint?.length ?? '?'} chars)`)
  }
  for (const f of c.flags) {
    console.log(`    ${f.kind}: ${f.detail}`)
  }
  console.log('')
}

// ---------- baseline persistence ----------
if (baselineDirty) {
  saveBaseline(opts.baseline, baseline)
  console.log(`Baseline updated: ${path.relative(REPO_ROOT, opts.baseline)}`)
}

// ---------- JSON report ----------
if (opts.json) {
  const report = {
    generatedAt: new Date().toISOString(),
    totals: { checked: checked.length, ok: checked.length - fails.length - warns.length, warnings: warns.length, failures: fails.length },
    results: checked.map((c) => ({
      url: c.url,
      severity: c.severity,
      citedIn: c.refs.map((r) => r.slug),
      status: c.result.status ?? null,
      finalUrl: c.result.finalUrl ?? null,
      redirectChain: c.result.chain ?? [],
      contentLength: c.result.fingerprint?.length ?? null,
      flags: c.flags,
      error: c.result.error ?? null,
    })),
  }
  fs.mkdirSync(path.dirname(path.resolve(opts.json)), { recursive: true })
  fs.writeFileSync(opts.json, JSON.stringify(report, null, 2) + '\n')
  console.log(`JSON report written: ${opts.json}`)
}

// ---------- summary + exit ----------
const okCount = checked.length - fails.length - warns.length
console.log(
  `\nSummary: ${checked.length} checked — ${okCount} ok, ${warns.length} warning(s), ${fails.length} failure(s).\n`
)

if (fails.length > 0) process.exit(2)
if (warns.length > 0 && opts.strict) process.exit(1)
process.exit(0)
