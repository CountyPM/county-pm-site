// inspect-live-posts.mjs — post-publish OUTPUT-END check for the CPM pipeline.
//
// Priority item #2 (docs/CPM_Decision_Log.md): the pipeline auto-publishes but
// cannot see its own output — the 07/02 FAQ leak shipped live and stayed
// invisible until a human looked. After a post/FAQ ships and Vercel deploys,
// this fetches the LIVE url(s) and asserts the content actually rendered, not
// just that git succeeded.
//
// Runs on WINDOWS (the runner host) where the network is reachable; the Linux
// sandbox cannot fetch, so this must NOT be wired into a sandbox task.
//
// Checks — blog post: page 200; correct page (slug in canonical/og, not a soft
// 404); title rendered; hero asset resolves + is referenced; when the post
// declares `faq:`, the "Related questions" spoke rendered. FAQ entry: topic page
// 200; the #<slug> anchor rendered; question rendered; when sources[] exist
// (objective entries) the Sources block rendered (first source url present — we
// do NOT re-fetch the external source; that is Track B's check:faq-sources job).
//
// Every request is cache-busted and the target set is retried over a propagation
// window, so a slow-but-good Vercel deploy is never false-alarmed.
//
// Targets default to content/blog + content/faq files changed in <since>..HEAD
// (--since <sha>, default HEAD~1); --slug / --faq-slug override. Exit 0 = all
// passed (or nothing to inspect); 1 = a hard failure. Always writes
// inspect-report.json (gitignored), which send-heartbeat.mjs reads.

import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import matter from 'gray-matter'

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const BLOG_DIR = path.join(REPO_ROOT, 'content/blog')
const FAQ_DIR = path.join(REPO_ROOT, 'content/faq')
const REPORT_PATH = path.join(REPO_ROOT, 'inspect-report.json')
const DEFAULT_BASE = 'https://www.c-p-m.com'

function parseArgs(argv) {
  const opts = { slugs: [], faqSlugs: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--dry-run') opts.dryRun = true
    else if (a === '--slug') opts.slugs.push(argv[++i])
    else if (a === '--faq-slug') opts.faqSlugs.push(argv[++i])
    else if (a === '--since') opts.since = argv[++i]
    else if (a === '--base') opts.base = argv[++i]
    else if (a === '--attempts') opts.attempts = Number(argv[++i])
    else if (a === '--interval') opts.intervalMs = Number(argv[++i]) * 1000
  }
  return opts
}

const log = (m) => console.log(`  ${m}`)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Entity-tolerant substring matching: live HTML encodes quotes/dashes as
// entities; frontmatter uses raw unicode. Normalize both before comparing.
function decodeEntities(s) {
  return s
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&quot;|&#34;/g, '"')
    .replace(/&amp;|&#38;/g, '&')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&[a-z]+;|&#\d+;|&#x[0-9a-f]+;/gi, ' ')
}
function normalize(s) {
  return decodeEntities(String(s || ''))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}
function tokens(s) {
  return normalize(s)
    .split(' ')
    .filter((w) => w.length >= 4)
}
// Does normalized HTML contain a strong majority of a phrase's significant words?
export function hasPhrase(html, phrase, threshold = 0.7) {
  const toks = tokens(phrase)
  if (toks.length === 0) return true
  const hay = normalize(html)
  const hit = toks.filter((t) => hay.includes(t)).length
  return hit / toks.length >= threshold
}

function changedContentFiles(since) {
  const base = since || 'HEAD~1'
  let out
  try {
    out = execFileSync(
      'git',
      ['diff', '--name-only', '--diff-filter=d', `${base}..HEAD`, '--', 'content/blog', 'content/faq'],
      { cwd: REPO_ROOT, encoding: 'utf8' }
    )
  } catch (e) {
    log(`git diff failed (${e.message.split('\n')[0]}); no git-derived targets.`)
    return { blog: [], faq: [] }
  }
  const files = out.split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
  const blog = files
    .filter((f) => f.startsWith('content/blog/') && f.endsWith('.mdx'))
    .map((f) => path.basename(f, '.mdx'))
  const faq = files
    .filter((f) => f.startsWith('content/faq/') && f.endsWith('.md'))
    .map((f) => path.basename(f, '.md'))
  return { blog, faq }
}

function readFrontmatter(file) {
  return matter(fs.readFileSync(file, 'utf8')).data
}

function planBlog(slug, base) {
  const file = path.join(BLOG_DIR, `${slug}.mdx`)
  if (!fs.existsSync(file)) return null
  const fm = readFrontmatter(file)
  const heroImage = fm.heroImage || null
  const faqRefs = Array.isArray(fm.faq) ? fm.faq.filter(Boolean) : []
  return {
    kind: 'blog',
    slug,
    url: `${base}/blog/${slug}`,
    title: fm.seoTitle || fm.title || slug,
    heroImage,
    heroUrl: heroImage ? `${base}${heroImage}` : null,
    expectSpoke: faqRefs.length > 0,
  }
}

function planFaq(slug, base) {
  const file = path.join(FAQ_DIR, `${slug}.md`)
  if (!fs.existsSync(file)) return null
  const fm = readFrontmatter(file)
  const topic = fm.topic
  if (!topic) return null
  const sources = Array.isArray(fm.sources) ? fm.sources : []
  return {
    kind: 'faq',
    slug,
    topic,
    url: `${base}/faq/${topic}`,
    question: fm.question || slug,
    firstSourceUrl: sources.length > 0 && sources[0] ? sources[0].url || null : null,
  }
}

async function fetchText(url) {
  const bust = url.includes('?') ? '&' : '?'
  const res = await fetch(`${url}${bust}_cb=${Date.now()}`, {
    redirect: 'follow',
    headers: { 'cache-control': 'no-cache', pragma: 'no-cache' },
  })
  const body = res.ok ? await res.text() : ''
  return { status: res.status, ok: res.ok, body }
}
async function fetchStatus(url) {
  const bust = url.includes('?') ? '&' : '?'
  try {
    const res = await fetch(`${url}${bust}_cb=${Date.now()}`, {
      redirect: 'follow',
      headers: { 'cache-control': 'no-cache' },
    })
    return res.status
  } catch {
    return 0
  }
}

// Pure evaluation of already-fetched HTML — no network, so it is unit-testable.
export function evalHtml(t, status, html, heroStatus = null) {
  const checks = []
  const add = (name, ok, detail = '') => checks.push({ name, ok, detail })

  add('http-200', status === 200, `status ${status}`)
  if (status !== 200) return { pass: false, checks }

  if (t.kind === 'blog') {
    add('correct-page', html.includes(t.slug), 'slug present in HTML (canonical/og)')
    add('title-rendered', hasPhrase(html, t.title), 'title tokens present')
    if (t.heroImage) {
      add('hero-referenced', html.includes(t.heroImage), t.heroImage)
      add('hero-resolves', heroStatus === 200, `${t.heroImage} -> ${heroStatus}`)
    }
    if (t.expectSpoke) {
      add('faq-spoke', /Related questions/i.test(html), 'Related questions block')
    }
  } else if (t.kind === 'faq') {
    add('anchor-rendered', new RegExp(`id=["']${t.slug}["']`).test(html), `#${t.slug}`)
    add('question-rendered', hasPhrase(html, t.question), 'question tokens present')
    if (t.firstSourceUrl) {
      add('sources-rendered', html.includes(t.firstSourceUrl), 'first source url present')
    }
  }

  return { pass: checks.every((c) => c.ok), checks }
}

async function evalTarget(t) {
  let page
  try {
    page = await fetchText(t.url)
  } catch (e) {
    return { pass: false, checks: [{ name: 'http', ok: false, detail: `fetch error: ${e.message}` }] }
  }
  let heroStatus = null
  if (t.kind === 'blog' && t.heroImage && page.status === 200) {
    heroStatus = await fetchStatus(t.heroUrl)
  }
  return evalHtml(t, page.status, page.body, heroStatus)
}

async function main() {
  const opts = parseArgs(process.argv.slice(2))
  const base = (opts.base || process.env.CPM_SITE_BASE || DEFAULT_BASE).replace(/\/$/, '')
  const attempts = Number.isFinite(opts.attempts) ? opts.attempts : 8
  const intervalMs = Number.isFinite(opts.intervalMs) ? opts.intervalMs : 20000

  let blogSlugs = [...opts.slugs]
  let faqSlugs = [...opts.faqSlugs]
  if (blogSlugs.length === 0 && faqSlugs.length === 0) {
    const derived = changedContentFiles(opts.since)
    blogSlugs = derived.blog
    faqSlugs = derived.faq
  }

  const targets = []
  for (const s of blogSlugs) {
    const p = planBlog(s, base)
    if (p) targets.push(p)
    else log(`skip blog "${s}" (no content/blog/${s}.mdx)`)
  }
  for (const s of faqSlugs) {
    const p = planFaq(s, base)
    if (p) targets.push(p)
    else log(`skip faq "${s}" (missing file or no topic)`)
  }

  const report = {
    ranAt: new Date().toISOString(),
    base,
    since: opts.since || 'HEAD~1',
    targetCount: targets.length,
    attempts: 0,
    passed: [],
    failed: [],
    targets: [],
    ok: true,
  }

  if (targets.length === 0) {
    log('No blog/FAQ targets to inspect.')
    report.note = 'no-targets'
    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2))
    console.log('\ninspect: nothing to inspect (no new blog/FAQ content).')
    return 0
  }

  log(`Inspecting ${targets.length} target(s) against ${base}`)
  for (const t of targets) log(`  - ${t.kind}: ${t.url}`)

  if (opts.dryRun) {
    report.note = 'dry-run'
    report.targets = targets.map((t) => ({ kind: t.kind, slug: t.slug, url: t.url }))
    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2))
    console.log('\n(dry run — no live requests made)')
    return 0
  }

  const pending = new Map(targets.map((t) => [t.slug + t.kind, t]))
  const results = new Map()
  for (let attempt = 1; attempt <= attempts; attempt++) {
    report.attempts = attempt
    for (const [key, t] of [...pending]) {
      const r = await evalTarget(t)
      results.set(key, { target: t, ...r })
      if (r.pass) pending.delete(key)
    }
    if (pending.size === 0) break
    if (attempt < attempts) {
      log(`attempt ${attempt}/${attempts}: ${pending.size} not yet live — waiting ${intervalMs / 1000}s`)
      await sleep(intervalMs)
    }
  }

  for (const { target, pass, checks } of results.values()) {
    report.targets.push({
      kind: target.kind,
      slug: target.slug,
      url: target.url,
      pass,
      checks: checks.map((c) => ({ name: c.name, ok: c.ok, detail: c.detail })),
    })
    if (pass) report.passed.push(target.url)
    else report.failed.push(target.url)
  }
  report.ok = report.failed.length === 0
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2))

  console.log('')
  for (const t of report.targets) {
    if (t.pass) {
      console.log(`PASS ${t.kind} ${t.slug}`)
    } else {
      console.log(`FAIL ${t.kind} ${t.slug} — ${t.url}`)
      for (const c of t.checks.filter((c) => !c.ok)) console.log(`    x ${c.name}: ${c.detail}`)
    }
  }
  console.log(`\ninspect: ${report.passed.length}/${report.targetCount} passed after ${report.attempts} attempt(s).`)
  return report.ok ? 0 : 1
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
    .then((code) => process.exit(code))
    .catch((e) => {
      console.error('inspect-live-posts fatal:', e)
      try {
        fs.writeFileSync(REPORT_PATH, JSON.stringify({ ranAt: new Date().toISOString(), ok: false, error: String(e) }, null, 2))
      } catch {}
      process.exit(1)
    })
}
