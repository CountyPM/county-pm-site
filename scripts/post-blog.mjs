#!/usr/bin/env node
/**
 * post-blog.mjs — CPM blog posting mechanism (PC stage).
 *
 * Converts an iPad-originated packaged contract file (Handoff §3.3) into a
 * publishable MDX post (per docs/CPM_Blog_FieldMapping_Spec.md), places the
 * hero image, writes private fields to a Drive sidecar, commits to git, and —
 * only with --publish — pushes to `main` to trigger the Vercel deploy.
 *
 * SAFE BY DEFAULT: with no --publish flag it converts + commits locally but
 * does NOT push. Going live is the irreversible step and stays behind --publish
 * (Handoff §7: human gate on anything irreversible).
 *
 * Usage:
 *   node scripts/post-blog.mjs <packaged-file.md> [options]
 *
 * Options:
 *   --hero <path>          Hero image to place as public/images/blog/<slug>.webp
 *                          (must already be .webp — conversion is the image stage's job)
 *   --sidecar-dir <path>   Where to write the private <slug>.json sidecar
 *                          (default: ./.blog-sidecar — point this at the CPM-Blog-Processed Drive folder)
 *   --category "<Name>"    Override the derived category (must be in the closed set)
 *   --date YYYY-MM-DD      Override publish date (else uses contract publish_date, else today)
 *   --investor-form        Force the investor lead form ON
 *   --no-investor-form     Force the investor lead form OFF
 *   --force                Allow overwriting an existing slug
 *   --publish              Push to origin/main (LIVE). Without this, no push happens.
 *   --dry-run              Convert and report only; write nothing, commit nothing.
 */

import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const BLOG_DIR = path.join(REPO_ROOT, 'content/blog')
const IMG_DIR = path.join(REPO_ROOT, 'public/images/blog')

// Closed category vocabulary — must match the live corpus. Refuse anything else.
const CATEGORIES = [
  'Investor Education',
  'Owner Services',
  'Property Manager Services',
  'Prospect Services',
  'Rentals',
  'Tenant Services',
]

const fail = (msg) => {
  console.error(`\n✗ ${msg}\n`)
  process.exit(1)
}
const info = (msg) => console.log(`  ${msg}`)

// ---------- arg parsing ----------
function parseArgs(argv) {
  const opts = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--publish' || a === '--dry-run' || a === '--force') opts[a.slice(2)] = true
    else if (a === '--investor-form') opts.investorForm = true
    else if (a === '--no-investor-form') opts.investorForm = false
    else if (a.startsWith('--')) opts[a.slice(2)] = argv[++i]
    else opts._.push(a)
  }
  return opts
}

// ---------- helpers ----------
function slugify(s) {
  return String(s)
    .normalize('NFKD').replace(/[̀-ͯ]/g, '') // strip accents
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
}

function uniqueSlug(base, force) {
  let slug = base
  let n = 2
  while (fs.existsSync(path.join(BLOG_DIR, `${slug}.mdx`))) {
    if (force) return slug // overwrite the base
    slug = `${base}-${n++}`
  }
  return slug
}

function deriveExcerpt(data, body) {
  if (data.subtitle && String(data.subtitle).trim()) return String(data.subtitle).trim()
  const text = body.replace(/^#.*$/gm, '').replace(/\s+/g, ' ').trim()
  const words = text.split(' ').slice(0, 32).join(' ')
  return words + (text.split(' ').length > 32 ? '…' : '')
}

function deriveAuthor(byline) {
  if (!byline) return 'County Property Management'
  const first = String(byline).split('·')[0].trim().replace(/^By\s+/i, '')
  return first || 'County Property Management'
}

// Deterministic category lookup (Spec §4). Reviewable; override with --category.
function deriveCategory(data) {
  const intent = (data.decision_intent || []).map(String)
  const tags = (data.tags || []).map(String)
  if (intent.includes('selling') || intent.includes('holding') || tags.includes('owner_lead'))
    return 'Investor Education'
  if (intent.includes('renting')) return 'Tenant Services'
  if (intent.includes('still-deciding')) return 'Prospect Services'
  return 'Owner Services'
}

function splitBodyAndFaq(raw) {
  const idx = raw.indexOf('---FAQ---')
  if (idx === -1) return { body: raw.trim(), faqRaw: '' }
  return { body: raw.slice(0, idx).trim(), faqRaw: raw.slice(idx + '---FAQ---'.length).trim() }
}

function parseFaq(faqRaw) {
  if (!faqRaw) return []
  const out = []
  const blocks = faqRaw.split(/\n(?=Q:)/)
  for (const b of blocks) {
    const q = (b.match(/Q:\s*([\s\S]*?)(?:\nA:|$)/) || [])[1]
    const a = (b.match(/A:\s*([\s\S]*)$/) || [])[1]
    if (q && a) out.push({ q: q.trim(), a: a.trim() })
  }
  return out
}

function git(args) {
  return execFileSync('git', ['-C', REPO_ROOT, ...args], { encoding: 'utf8' }).trim()
}

// ---------- frontmatter parse hardening ----------
// A title/subtitle whose text contains a straight double-quote yields invalid
// YAML once the packager wraps it in "..."  (e.g.  title: "Why "No Pets" ...").
// gray-matter then throws and the whole post silently fails to publish. Repair
// the frontmatter's double-quoted scalars (escape stray " and \) and retry once.
function sanitizeFrontmatterQuotes(rawFile) {
  if (!rawFile.startsWith('---')) return rawFile
  const end = rawFile.indexOf('\n---', 3)
  if (end === -1) return rawFile
  const head = rawFile.slice(0, end)
  const rest = rawFile.slice(end)
  const fixed = head
    .split('\n')
    .map((line) => {
      const m = line.match(/^(\s*[A-Za-z0-9_]+:\s*)"(.*)"(\s*)$/)
      if (!m) return line
      const v = m[2]
        .replace(/\\(["\\])/g, '$1') // decode existing escapes -> logical text
        .replace(/\\/g, '\\\\')      // re-encode backslashes
        .replace(/"/g, '\\"')        // re-encode double quotes
      return `${m[1]}"${v}"${m[3]}`
    })
    .join('\n')
  return fixed + rest
}

function parseContract(rawFile) {
  try {
    return matter(rawFile)
  } catch (e) {
    try {
      const parsed = matter(sanitizeFrontmatterQuotes(rawFile))
      console.log('  ⚠ frontmatter had invalid quoting - auto-escaped and re-parsed.')
      return parsed
    } catch {
      fail(
        `Could not parse contract frontmatter as YAML: ${String(e.message).split('\n')[0]}\n` +
          `  Auto-repair also failed. Check title/subtitle for stray quotes or a bare colon.`
      )
    }
  }
}

// ---------- main ----------
const opts = parseArgs(process.argv.slice(2))
const inputPath = opts._[0]
if (!inputPath) fail('No packaged file given. Usage: node scripts/post-blog.mjs <file.md> [options]')
if (!fs.existsSync(inputPath)) fail(`Packaged file not found: ${inputPath}`)

console.log(`\nCPM post-blog — processing ${path.basename(inputPath)}`)

const rawFile = fs.readFileSync(inputPath, 'utf8')
const { data, content } = parseContract(rawFile)
const { body, faqRaw } = splitBodyAndFaq(content)
const faq = parseFaq(faqRaw)

// --- validate inbound contract ---
if (!data.title || !String(data.title).trim()) fail('Contract missing required `title`.')
if (data.status && String(data.status) !== 'ready')
  fail(`Contract status is "${data.status}", expected "ready". Not processing.`)
if (!body) fail('Contract has no article body.')

// --- derive published fields ---
const slugBase = slugify(data.slug || data.title)
const slug = uniqueSlug(slugBase, opts.force)
if (slug !== slugBase && !opts.force) info(`Slug collision avoided: using "${slug}"`)

const publishedAt = String(opts.date || data.publish_date || new Date().toISOString().slice(0, 10))
if (!/^\d{4}-\d{2}-\d{2}$/.test(publishedAt)) fail(`Invalid publish date: "${publishedAt}" (need YYYY-MM-DD).`)

let category = opts.category || deriveCategory(data)
if (!CATEGORIES.includes(category))
  fail(`Category "${category}" not in the closed set: ${CATEGORIES.join(', ')}`)

const excerpt = deriveExcerpt(data, body)
const author = deriveAuthor(data.byline)
const heroProvided = Boolean(opts.hero)
if (heroProvided && !String(opts.hero).toLowerCase().endsWith('.webp'))
  fail(`Hero image must be .webp (got ${path.basename(opts.hero)}). WebP conversion is the image stage's job.`)
const heroImage = heroProvided ? `/images/blog/${slug}.webp` : undefined

const showInvestorForm =
  opts.investorForm !== undefined ? opts.investorForm : category === 'Investor Education'

// --- build published frontmatter (PUBLIC-SAFE ONLY) ---
const fm = {
  title: String(data.title).trim(),
  ...(data.subtitle ? { subtitle: String(data.subtitle).trim() } : {}),
  excerpt,
  publishedAt,
  author,
  category,
  seoTitle: data.seoTitle ? String(data.seoTitle) : String(data.title).trim(),
  seoDescription: data.seoDescription ? String(data.seoDescription) : excerpt,
  ...(heroImage ? { heroImage, heroImageAlt: String(data.heroImageAlt || data.title).trim() } : {}),
  showInvestorForm,
  ...(data.decision_intent ? { decision_intent: data.decision_intent } : {}),
  ...(data.tags ? { tags: data.tags } : {}),
  ...(data.campaign_id ? { campaign_id: data.campaign_id } : {}),
  faq_included: Boolean(data.faq_included),
}

// PRIVACY GUARD — these must never reach the public repo.
for (const banned of ['source_chat_context', 'gemini_prompt']) {
  if (banned in fm) fail(`Privacy guard tripped: "${banned}" must not be in published frontmatter.`)
}

const mdxOut = matter.stringify('\n' + body + '\n', fm)

// --- private sidecar (Drive archive) ---
const sidecar = {
  slug,
  generated_at: new Date().toISOString(),
  source_file: path.basename(inputPath),
  gemini_prompt: data.gemini_prompt || null,
  source_chat_context: data.source_chat_context || null,
  campaign_id: data.campaign_id || null,
  faq_included: Boolean(data.faq_included),
  faq, // parsed Q&A, handed to the (future) FAQ hub stage
}

// --- report ---
console.log('\n  Resolved:')
info(`slug            ${slug}`)
info(`publishedAt     ${publishedAt}`)
info(`category        ${category}${opts.category ? ' (override)' : ' (derived)'}`)
info(`author          ${author}`)
info(`showInvestorForm ${showInvestorForm}`)
info(`hero            ${heroImage || '(none)'}`)
info(`faq parsed      ${faq.length} Q&A`)

if (opts['dry-run']) {
  console.log('\n--dry-run: nothing written.\n')
  process.exit(0)
}

// --- write files ---
const mdxPath = path.join(BLOG_DIR, `${slug}.mdx`)
fs.writeFileSync(mdxPath, mdxOut)
info(`\n  wrote ${path.relative(REPO_ROOT, mdxPath)}`)

const filesToCommit = [path.relative(REPO_ROOT, mdxPath)]

if (heroProvided) {
  fs.mkdirSync(IMG_DIR, { recursive: true })
  const destImg = path.join(IMG_DIR, `${slug}.webp`)
  fs.copyFileSync(opts.hero, destImg)
  info(`  wrote ${path.relative(REPO_ROOT, destImg)}`)
  filesToCommit.push(path.relative(REPO_ROOT, destImg))
}

// sidecar goes OUTSIDE the repo (default ./.blog-sidecar, ideally the Drive folder)
const sidecarDir = opts['sidecar-dir'] || path.join(REPO_ROOT, '.blog-sidecar')
fs.mkdirSync(sidecarDir, { recursive: true })
const sidecarPath = path.join(sidecarDir, `${slug}.json`)
fs.writeFileSync(sidecarPath, JSON.stringify(sidecar, null, 2))
info(`  wrote sidecar ${sidecarPath} (NOT committed)`)

// --- git commit (no push unless --publish) ---
try {
  git(['add', ...filesToCommit])
  git(['commit', '-m', `Add blog post: ${fm.title} (${slug})`])
  info(`\n  committed to ${git(['rev-parse', '--abbrev-ref', 'HEAD'])}`)
} catch (e) {
  fail(`git commit failed:\n${e.stdout || e.message}`)
}

if (opts.publish) {
  try {
    git(['push', 'origin', 'HEAD:main'])
    console.log('\n✓ Pushed to origin/main — Vercel will deploy.\n')
  } catch (e) {
    fail(
      `git push failed (commit is saved locally). Likely a credential issue.\n` +
        `${e.stdout || e.message}`
    )
  }
} else {
  console.log(
    `\n✓ Committed locally, NOT pushed. Review, then publish with:\n` +
      `    git -C "${REPO_ROOT}" push origin HEAD:main\n` +
      `  or re-run with --publish.\n`
  )
}
