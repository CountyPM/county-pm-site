// geo-indexation-check.mjs — the INDEXATION half of the GEO effectiveness readout
// (priority item #3). Answers "are our pages actually in the search indexes that
// feed AI answer engines?" without any API credentials, using public `site:`
// queries. Approximate by design — the owner chose the no-setup path over the
// GSC API (see docs/CPM_Decision_Log.md 2026-07-03 item #3 kickoff).
//
// WHERE IT RUNS: the Windows side. It reaches the live network (fetch the
// sitemap + query search engines) and search engines throttle datacenter IPs, so
// this must NOT be wired into the Linux sandbox authoring task. See
// docs/CPM_GEO_Progress_Summary.md §6 (two-host model).
//
// WHAT IT DOES
//   1. Fetches the live sitemap.xml → the canonical universe of URLs we expect
//      indexed (total denominator).
//   2. Runs `site:c-p-m.com` against Bing + DuckDuckGo (scrape-tolerant) and,
//      best-effort, Google. Each adapter returns an approximate indexed count and
//      the result URLs it could see. Any adapter that is blocked/CAPTCHA'd
//      degrades to { ok:false } instead of throwing — a blocked engine must never
//      fail the run.
//   3. Spot-checks a sample of high-value URLs (home, /faq, each FAQ topic page,
//      newest blog posts) with exact `site:<url>` queries, so we see WHICH key
//      pages are present, not just a bulk count.
//   4. Writes geo-index-report.json (gitignored runtime artifact) for the
//      readout assembler (geo-readout.mjs) to fold into the committed trend doc.
//
// USAGE
//   node scripts/geo-indexation-check.mjs                 # full run, all engines
//   node scripts/geo-indexation-check.mjs --engines bing  # one engine
//   node scripts/geo-indexation-check.mjs --sample 8      # cap the URL spot-check
//   node scripts/geo-indexation-check.mjs --self-test     # parser fixtures, no net
//   node scripts/geo-indexation-check.mjs --dry           # run, print, don't write

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const REPORT_PATH = path.join(REPO_ROOT, 'geo-index-report.json')
const DEFAULT_BASE = 'https://www.c-p-m.com'
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const log = (m) => console.log(m)

function parseArgs(argv) {
  const o = { base: DEFAULT_BASE, engines: ['bing', 'ddg', 'google'], sample: 8 }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--base') o.base = argv[++i].replace(/\/+$/, '')
    else if (a === '--engines') o.engines = argv[++i].split(',').map((s) => s.trim()).filter(Boolean)
    else if (a === '--sample') o.sample = Number(argv[++i])
    else if (a === '--out') o.out = argv[++i]
    else if (a === '--self-test') o.selfTest = true
    else if (a === '--dry') o.dry = true
  }
  return o
}

// ── host helpers ───────────────────────────────────────────────────────────
function hostOf(url) {
  try {
    return new URL(url).host.replace(/^www\./, '')
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
  }
}
// path-normalized identity for a URL so bing/ddg/google variants (www, trailing
// slash, http/https) collapse to one comparable key.
function urlKey(u) {
  try {
    const x = new URL(u)
    let p = x.pathname.replace(/\/+$/, '')
    return (x.host.replace(/^www\./, '') + (p || '/')).toLowerCase()
  } catch {
    return String(u).toLowerCase()
  }
}

async function fetchText(url, { timeout = 20000 } = {}) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeout)
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: ctrl.signal,
      headers: {
        'user-agent': UA,
        'accept-language': 'en-US,en;q=0.9',
        accept: 'text/html,application/xhtml+xml',
      },
    })
    const body = await res.text()
    return { status: res.status, ok: res.ok, body }
  } catch (e) {
    return { status: 0, ok: false, body: '', error: String(e && e.message || e) }
  } finally {
    clearTimeout(t)
  }
}

// ── sitemap → canonical URL universe ─────────────────────────────────────────
export function parseSitemap(xml) {
  const urls = []
  const re = /<loc>\s*([^<\s]+)\s*<\/loc>/gi
  let m
  while ((m = re.exec(xml))) urls.push(m[1].trim())
  return urls
}

async function getSitemapUrls(base) {
  const { ok, body, status } = await fetchText(`${base}/sitemap.xml`)
  if (!ok) return { urls: [], ok: false, note: `sitemap fetch failed (HTTP ${status})` }
  const urls = parseSitemap(body)
  return { urls, ok: urls.length > 0, note: urls.length ? '' : 'sitemap parsed 0 <loc> entries' }
}

// ── engine adapters ──────────────────────────────────────────────────────────
// Each: (host) -> { engine, ok, approxIndexed:number|null, urls:string[], note }.
// Parsers are deliberately forgiving: unknown markup ⇒ ok:false, never throw.

export function parseBing(html) {
  // Bing shows the estimate in a <span class="sb_count"> and lists results as
  // <cite> or href="http…". We harvest both an estimate and the visible URLs.
  let approx = null
  const cnt = html.match(/sb_count[^>]*>\s*([\d.,]+)\s*results?/i) || html.match(/([\d.,]+)\s+results/i)
  if (cnt) approx = Number(cnt[1].replace(/[.,]/g, '')) || null
  const urls = harvestUrls(html)
  const ok = urls.length > 0 || approx != null
  return { engine: 'bing', ok, approxIndexed: approx, urls, note: ok ? '' : 'no results/CAPTCHA' }
}

export function parseDuckDuckGo(html) {
  // html.duckduckgo.com wraps result links as /l/?uddg=<encoded-url>. DDG gives
  // no total count, so approxIndexed stays null (URLs still power the spot-check).
  const urls = []
  const re = /uddg=([^"&]+)/gi
  let m
  while ((m = re.exec(html))) {
    try {
      urls.push(decodeURIComponent(m[1]))
    } catch {
      /* skip malformed */
    }
  }
  const clean = dedupe(urls)
  const ok = clean.length > 0
  return { engine: 'ddg', ok, approxIndexed: null, urls: clean, note: ok ? '' : 'no results/blocked' }
}

export function parseGoogle(html) {
  // Google frequently serves a consent/sorry CAPTCHA to datacenter IPs. Detect
  // that and degrade; otherwise harvest the estimate + result URLs.
  if (/id="?recaptcha|Our systems have detected unusual traffic|consent\.google/i.test(html)) {
    return { engine: 'google', ok: false, approxIndexed: null, urls: [], note: 'consent/CAPTCHA wall' }
  }
  let approx = null
  const cnt = html.match(/About\s+([\d.,]+)\s+results/i) || html.match(/([\d.,]+)\s+results/i)
  if (cnt) approx = Number(cnt[1].replace(/[.,]/g, '')) || null
  const urls = harvestUrls(html)
  const ok = urls.length > 0 || approx != null
  return { engine: 'google', ok, approxIndexed: approx, urls, note: ok ? '' : 'no results/CAPTCHA' }
}

function harvestUrls(html) {
  const urls = []
  const re = /https?:\/\/[^\s"'<>)]+/gi
  let m
  while ((m = re.exec(html))) urls.push(m[0])
  return dedupe(urls)
}
function dedupe(arr) {
  return [...new Set(arr)]
}

const ENGINE_QUERY = {
  bing: (host) => `https://www.bing.com/search?q=${encodeURIComponent('site:' + host)}&count=50&setlang=en`,
  ddg: (host) => `https://html.duckduckgo.com/html/?q=${encodeURIComponent('site:' + host)}`,
  google: (host) => `https://www.google.com/search?q=${encodeURIComponent('site:' + host)}&num=50&hl=en`,
}
const ENGINE_PARSER = { bing: parseBing, ddg: parseDuckDuckGo, google: parseGoogle }

async function queryEngine(engine, host) {
  const buildQuery = ENGINE_QUERY[engine]
  const parse = ENGINE_PARSER[engine]
  if (!buildQuery || !parse) return { engine, ok: false, approxIndexed: null, urls: [], note: 'unknown engine' }
  const { ok, body, status, error } = await fetchText(buildQuery(host))
  if (!ok && !body) {
    return { engine, ok: false, approxIndexed: null, urls: [], note: `fetch failed (HTTP ${status}${error ? ', ' + error : ''})` }
  }
  const parsed = parse(body)
  // keep only URLs on our host
  parsed.urls = parsed.urls.filter((u) => hostOf(u) === host)
  return parsed
}

// exact site: check for one URL — is this specific page present in the index?
async function checkUrlPresence(engine, targetUrl) {
  const buildQuery = ENGINE_QUERY[engine]
  const parse = ENGINE_PARSER[engine]
  if (!buildQuery || !parse) return false
  const q = engine === 'ddg'
    ? `https://html.duckduckgo.com/html/?q=${encodeURIComponent('site:' + targetUrl)}`
    : buildQuery(hostOf(targetUrl)).replace(encodeURIComponent('site:' + hostOf(targetUrl)), encodeURIComponent('site:' + targetUrl))
  const { body } = await fetchText(q)
  const parsed = parse(body || '')
  const want = urlKey(targetUrl)
  return parsed.urls.some((u) => urlKey(u) === want)
}

// choose the high-value URLs to spot-check: home, /faq, faq topic pages, newest blogs
function pickSample(urls, cap) {
  const key = (u) => u.toLowerCase()
  const home = urls.find((u) => /\/$/.test(new URL(u).pathname) || new URL(u).pathname === '' ) || urls[0]
  const faqIndex = urls.find((u) => /\/faq\/?$/.test(key(u)))
  const faqTopics = urls.filter((u) => /\/faq\/[^/]+$/.test(key(u)))
  const blogs = urls.filter((u) => /\/blog\/[^/]+$/.test(key(u))).slice(-4)
  const picked = dedupe([home, faqIndex, ...faqTopics, ...blogs].filter(Boolean))
  return picked.slice(0, cap)
}

// ── self-test: prove the parsers without the network ─────────────────────────
function selfTest() {
  let pass = 0, fail = 0
  const check = (name, cond) => {
    if (cond) { pass++; log(`  ✓ ${name}`) }
    else { fail++; log(`  ✗ ${name}`) }
  }
  check('sitemap parse', (() => {
    const u = parseSitemap('<urlset><url><loc>https://www.c-p-m.com/</loc></url><url><loc>https://www.c-p-m.com/faq</loc></url></urlset>')
    return u.length === 2 && u[1].endsWith('/faq')
  })())
  check('bing count + urls', (() => {
    const r = parseBing('<span class="sb_count">1,234 results</span><a href="https://www.c-p-m.com/faq">x</a>')
    return r.ok && r.approxIndexed === 1234 && r.urls.some((u) => u.includes('/faq'))
  })())
  check('bing CAPTCHA degrades', (() => {
    const r = parseBing('<html>blocked</html>')
    return r.ok === false && r.approxIndexed === null
  })())
  check('ddg uddg decode', (() => {
    const r = parseDuckDuckGo('<a href="/l/?uddg=https%3A%2F%2Fwww.c-p-m.com%2Fblog%2Fx">t</a>')
    return r.ok && r.urls[0] === 'https://www.c-p-m.com/blog/x'
  })())
  check('google consent degrades', (() => {
    const r = parseGoogle('<div>Our systems have detected unusual traffic</div>')
    return r.ok === false && r.note.includes('CAPTCHA')
  })())
  check('urlKey normalizes www + slash', urlKey('https://www.c-p-m.com/faq/') === urlKey('https://c-p-m.com/faq'))
  check('pickSample prioritizes faq+blog', (() => {
    const s = pickSample([
      'https://www.c-p-m.com/',
      'https://www.c-p-m.com/faq',
      'https://www.c-p-m.com/faq/renting',
      'https://www.c-p-m.com/blog/a',
      'https://www.c-p-m.com/blog/b',
    ], 8)
    return s.some((u) => u.endsWith('/faq/renting')) && s.some((u) => u.endsWith('/blog/b'))
  })())
  log(`\nself-test: ${pass} passed, ${fail} failed`)
  process.exit(fail ? 1 : 0)
}

// ── main ─────────────────────────────────────────────────────────────────────
async function main() {
  const o = parseArgs(process.argv.slice(2))
  if (o.selfTest) return selfTest()

  const host = hostOf(o.base)
  log(`GEO indexation check — host ${host}`)

  const sm = await getSitemapUrls(o.base)
  log(`  sitemap: ${sm.urls.length} URLs${sm.note ? ' (' + sm.note + ')' : ''}`)

  const engines = []
  const seenUrls = new Set()
  for (const eng of o.engines) {
    const r = await queryEngine(eng, host)
    r.urls.forEach((u) => seenUrls.add(urlKey(u)))
    log(`  ${eng}: ${r.ok ? 'ok' : 'unavailable'}  approx=${r.approxIndexed ?? '—'}  urls=${r.urls.length}${r.note ? '  (' + r.note + ')' : ''}`)
    engines.push({ engine: r.engine, ok: r.ok, approxIndexed: r.approxIndexed, urlsSeen: r.urls.length, note: r.note })
    await sleep(1500) // be polite between engine hits
  }

  // spot-check high-value URLs against the first engine that came back ok
  const liveEngine = (o.engines.find((e) => engines.find((x) => x.engine === e && x.ok))) || null
  const sample = []
  if (sm.urls.length && liveEngine) {
    const picks = pickSample(sm.urls, o.sample)
    for (const u of picks) {
      const present = await checkUrlPresence(liveEngine, u)
      sample.push({ url: u, present, engine: liveEngine })
      log(`    spot ${present ? '●' : '○'} ${u}`)
      await sleep(1200)
    }
  }

  // coverage estimate: best available bulk count vs sitemap size, plus the
  // sampled presence rate (a cleaner, if smaller, signal).
  const counts = engines.map((e) => e.approxIndexed).filter((n) => typeof n === 'number')
  const bestCount = counts.length ? Math.max(...counts) : null
  const bulkCoveragePct = bestCount != null && sm.urls.length
    ? Math.min(100, Math.round((bestCount / sm.urls.length) * 100))
    : null
  const sampledPresent = sample.filter((s) => s.present).length
  const sampledPct = sample.length ? Math.round((sampledPresent / sample.length) * 100) : null

  const report = {
    generatedAt: new Date().toISOString(),
    base: o.base,
    host,
    sitemapCount: sm.urls.length,
    sitemapOk: sm.ok,
    engines,
    unionUrlsSeen: seenUrls.size,
    bestBulkCount: bestCount,
    bulkCoveragePct,
    sample,
    sampledPresent,
    sampleSize: sample.length,
    sampledPct,
  }

  log(`\n  bulk coverage ≈ ${bulkCoveragePct ?? '—'}%   sampled presence = ${sampledPct ?? '—'}% (${sampledPresent}/${sample.length})`)

  if (o.dry) {
    log('\n(dry run — report not written)')
    log(JSON.stringify(report, null, 2))
    return
  }
  const outPath = o.out ? path.resolve(o.out) : REPORT_PATH
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2))
  log(`\nwrote ${path.relative(REPO_ROOT, outPath)}`)
}

// run only when invoked directly (not when imported by the self-test/other tools)
const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (invokedDirectly) {
  main().catch((e) => {
    console.error('geo-indexation-check failed:', e)
    process.exit(1)
  })
}
