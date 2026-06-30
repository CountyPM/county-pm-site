#!/usr/bin/env node
/**
 * gen-hero.mjs — CPM blog hero-image stage (Track C).
 *
 * Turns a post's `gemini_prompt` into a 16:9 hero image and lands it as
 *   public/images/blog/<slug>.webp
 * Two modes:
 *
 *   BACKFILL (existing live posts — prompt lives in the private sidecar):
 *     node scripts/gen-hero.mjs --slug <slug>
 *     node scripts/gen-hero.mjs --all            # every sidecar missing a hero
 *       → generates the webp AND patches content/blog/<slug>.mdx frontmatter
 *         (heroImage + heroImageAlt). Review-first: no git push here.
 *
 *   NEW POST (runner — prompt still in the contract, pre-strip):
 *     node scripts/gen-hero.mjs --contract <file.md> --out <path.webp>
 *       → writes the webp to --out only. post-blog.mjs --hero <path> does the
 *         placement + MDX wiring, so this mode never touches content/blog.
 *
 *   RAW:
 *     node scripts/gen-hero.mjs --prompt "..." --out <path.webp>
 *
 * Options:
 *   --all                 Backfill every .blog-processed/*.json without a hero
 *   --slug <slug>         Backfill one post by slug
 *   --contract <file.md>  New-post mode: read gemini_prompt from a packaged contract
 *   --prompt "<text>"     Raw mode: generate straight from a prompt string
 *   --out <path.webp>     Output path (contract/raw modes; default ./<slug>.webp)
 *   --sidecar-dir <dir>   Where sidecars live (default ./.blog-processed)
 *   --force               Regenerate even if the hero/heroImage already exists
 *   --commit              Backfill: git add+commit the mdx+webp locally (NO push)
 *   --commit-existing     Commit already-generated heroes (no API calls, no push) —
 *                         stages exactly the slugs whose MDX has heroImage + webp on disk
 *   --dry-run             Resolve + report only; no network call, nothing written
 *
 * Config (.env.images, gitignored — see .env.images.sample):
 *   GEMINI_API_KEY=...                  (required for real generation)
 *   GEMINI_IMAGE_MODEL=gemini-2.5-flash-image   (swap to imagen-4.0-fast-generate-001, etc.)
 *
 * Network note: Google's API is NOT reachable from the sandbox — run this on the
 * host (the _gen-heroes.bat helper). --dry-run works anywhere (no network).
 */

import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
// sharp is lazy-loaded inside toHeroWebp() — its native binary is host-specific,
// so --dry-run / --commit-existing run anywhere without it.

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const BLOG_DIR = path.join(REPO_ROOT, 'content/blog')
const IMG_DIR = path.join(REPO_ROOT, 'public/images/blog')
const DEFAULT_SIDECAR_DIR = path.join(REPO_ROOT, '.blog-processed')

// Hero geometry — index card is 420px tall full-width object-cover; post page is a
// full-bleed background-cover under a 78% navy overlay. A wide 16:9 landscape fits both.
const HERO_W = 1600
const HERO_H = 900
const WEBP_QUALITY = 80

const fail = (m) => { console.error(`\n✗ ${m}\n`); process.exit(1) }
const info = (m) => console.log(`  ${m}`)

// ---------- tiny .env loader (no dep) ----------
function loadEnvFile(p) {
  if (!fs.existsSync(p)) return
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i)
    if (!m) continue
    let v = m[2].trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    if (!(m[1] in process.env)) process.env[m[1]] = v
  }
}
loadEnvFile(path.join(REPO_ROOT, '.env.images'))

const MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image'
const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || ''

// ---------- arg parsing ----------
function parseArgs(argv) {
  const o = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
      if (a === '--all' || a === '--force' || a === '--commit' || a === '--commit-existing' || a === '--reencode-existing' || a === '--dry-run') o[a.slice(2)] = true
    else if (a.startsWith('--')) o[a.slice(2)] = argv[++i]
    else o._.push(a)
  }
  return o
}
const opts = parseArgs(process.argv.slice(2))
const DRY = Boolean(opts['dry-run'])

function git(args) {
  return execFileSync('git', ['-C', REPO_ROOT, ...args], { encoding: 'utf8' }).trim()
}

// Reinforce the framing our render needs; the stored prompts already say
// "editorial real-estate photography, no text, no people".
function buildPrompt(base) {
  return (
    String(base).trim() +
    ' — wide 16:9 landscape composition, bright and well-lit, balanced natural daylight, ' +
    'clear legible midtones, professional editorial real-estate photography, ' +
    'no text, no logos, no watermark, no people'
  )
}

// ---------- image generation ----------
// Gemini-native (generateContent) returns inlineData; Imagen (:predict) returns
// predictions[].bytesBase64Encoded. Support both by model-name shape.
async function generateImage(prompt) {
  if (!API_KEY) fail('No GEMINI_API_KEY. Add it to .env.images (see .env.images.sample).')
  const isImagen = /imagen/i.test(MODEL)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:${isImagen ? 'predict' : 'generateContent'}?key=${API_KEY}`
  const body = isImagen
    ? { instances: [{ prompt }], parameters: { sampleCount: 1, aspectRatio: '16:9' } }
    : {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '16:9' } },
      }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    // throw (not process.exit) so we never exit mid-request — that crashed libuv on Windows
    throw new Error(`Image API ${res.status} ${res.statusText} for model "${MODEL}":\n${t.slice(0, 600)}`)
  }
  const json = await res.json()
  let b64
  if (isImagen) {
    b64 = json?.predictions?.[0]?.bytesBase64Encoded
  } else {
    const parts = json?.candidates?.[0]?.content?.parts || []
    b64 = parts.find((p) => p.inlineData?.data)?.inlineData?.data
  }
  if (!b64) throw new Error(`No image data in API response.\n${JSON.stringify(json).slice(0, 600)}`)
  return Buffer.from(b64, 'base64')
}

// Encode any input buffer to a fixed 16:9 webp (cover-crop guarantees geometry).
async function toHeroWebp(buf, destPath) {
  const sharp = (await import('sharp')).default
  fs.mkdirSync(path.dirname(destPath), { recursive: true })
  let p = sharp(buf).resize(HERO_W, HERO_H, { fit: 'cover', position: 'attention' })
  const b = opts.brightness ? Number(opts.brightness) : 0
  if (b && b !== 1) p = p.modulate({ brightness: b }) // optional exposure lift
  await p.webp({ quality: WEBP_QUALITY }).toFile(destPath)
}

// Free fix: brighten already-generated heroes in place (no API calls). Host-only (sharp).
async function reencodeExisting() {
  const sharp = (await import('sharp')).default
  const dir = opts['sidecar-dir'] || DEFAULT_SIDECAR_DIR
  const b = Number(opts.brightness || 1.3)
  const sidecars = fs.readdirSync(dir).filter((f) => f.endsWith('.json'))
  let n = 0
  for (const f of sidecars) {
    const slug = readSidecar(path.join(dir, f)).slug
    if (!slug) continue
    const img = path.join(IMG_DIR, `${slug}.webp`)
    if (!fs.existsSync(img)) continue
    const buf = fs.readFileSync(img) // read fully into memory, then overwrite
    info(`brighten x${b}  ${slug}`)
    if (DRY) continue
    await sharp(buf).modulate({ brightness: b }).webp({ quality: WEBP_QUALITY }).toFile(img)
    n++
  }
  console.log(`\n${DRY ? '[dry-run] ' : ''}brightened ${n} existing hero(es) by x${b}. Review, then commit.`)
}

async function makeWebp(prompt, destPath) {
  info(`prompt          ${prompt.slice(0, 90)}${prompt.length > 90 ? '…' : ''}`)
  info(`model           ${MODEL}`)
  info(`out             ${path.relative(REPO_ROOT, destPath)}  (${HERO_W}x${HERO_H} webp)`)
  if (DRY) { info('--dry-run: no network call, nothing written.'); return false }
  const raw = await generateImage(buildPrompt(prompt))
  await toHeroWebp(raw, destPath)
  const kb = Math.round(fs.statSync(destPath).size / 1024)
  info(`✓ wrote ${path.relative(REPO_ROOT, destPath)} (${kb} KB)`)
  return true
}

// ---------- backfill: sidecar -> webp + MDX frontmatter ----------
function readSidecar(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

async function backfillOne(sidecarPath) {
  const sc = readSidecar(sidecarPath)
  const slug = sc.slug
  if (!slug) { info(`skip ${path.basename(sidecarPath)} — no slug`); return null }
  if (!sc.gemini_prompt) { info(`skip ${slug} — no gemini_prompt`); return null }
  const mdxPath = path.join(BLOG_DIR, `${slug}.mdx`)
  if (!fs.existsSync(mdxPath)) { info(`skip ${slug} — no MDX at ${path.relative(REPO_ROOT, mdxPath)}`); return null }

  const file = fs.readFileSync(mdxPath, 'utf8')
  const parsed = matter(file)
  if (parsed.data.heroImage && !opts.force) { info(`skip ${slug} — already has heroImage (use --force)`); return null }

  const destImg = path.join(IMG_DIR, `${slug}.webp`)
  console.log(`\n• ${slug}`)
  const wrote = await makeWebp(sc.gemini_prompt, destImg)
  if (!wrote) return null // dry-run

  // Patch frontmatter: heroImage + heroImageAlt (alt derived from the post title).
  parsed.data.heroImage = `/images/blog/${slug}.webp`
  parsed.data.heroImageAlt = String(parsed.data.heroImageAlt || parsed.data.title || slug).trim()
  fs.writeFileSync(mdxPath, matter.stringify(parsed.content, parsed.data))
  info(`patched ${path.relative(REPO_ROOT, mdxPath)} (heroImage, heroImageAlt)`)
  return { slug, mdxPath, destImg }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function runBackfill(sidecarPaths) {
  const done = []
  for (const sp of sidecarPaths) {
    const r = await backfillOne(sp)
    if (r) done.push(r)
    if (!DRY) await sleep(1500) // gentle pause so a burst of requests doesn't trip rate limits
  }
  console.log(`\n${DRY ? '[dry-run] ' : ''}backfilled ${done.length} post(s).`)
  if (done.length && opts.commit && !DRY) {
    const files = done.flatMap((d) => [path.relative(REPO_ROOT, d.mdxPath), path.relative(REPO_ROOT, d.destImg)])
    git(['add', ...files])
    git(['commit', '-m', `Add hero images: ${done.map((d) => d.slug).join(', ')}`])
    console.log(`✓ committed ${files.length} files to ${git(['rev-parse', '--abbrev-ref', 'HEAD'])} (NOT pushed — review then push).`)
  } else if (done.length) {
    console.log('Files written locally. Review the images, then commit (or re-run with --commit).')
  }
}

// ---------- main ----------
;(async () => {
  if (opts['reencode-existing']) {
    await reencodeExisting()
    return
  }

  if (opts['commit-existing']) {
    const dir = opts['sidecar-dir'] || DEFAULT_SIDECAR_DIR
    const sidecars = fs.readdirSync(dir).filter((f) => f.endsWith('.json'))
    const files = []
    const slugs = []
    for (const f of sidecars) {
      const slug = readSidecar(path.join(dir, f)).slug
      if (!slug) continue
      const mdxPath = path.join(BLOG_DIR, `${slug}.mdx`)
      const imgPath = path.join(IMG_DIR, `${slug}.webp`)
      if (!fs.existsSync(mdxPath) || !fs.existsSync(imgPath)) continue
      if (!/heroImage:/.test(fs.readFileSync(mdxPath, 'utf8'))) continue
      files.push(path.relative(REPO_ROOT, mdxPath), path.relative(REPO_ROOT, imgPath))
      slugs.push(slug)
    }
    if (!slugs.length) fail('No generated heroes found to commit (run --all first).')
    info(`Committing ${slugs.length} hero(es): ${slugs.join(', ')}`)
    if (DRY) { info('--dry-run: not committing.'); return }
    git(['add', ...files])
    git(['commit', '-m', `Add hero images: ${slugs.join(', ')}`])
    console.log(`✓ committed ${files.length} files to ${git(['rev-parse', '--abbrev-ref', 'HEAD'])} (NOT pushed).`)
    return
  }

  if (opts.all) {
    const dir = opts['sidecar-dir'] || DEFAULT_SIDECAR_DIR
    if (!fs.existsSync(dir)) fail(`Sidecar dir not found: ${dir}`)
    const sidecars = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => path.join(dir, f))
    if (!sidecars.length) fail(`No .json sidecars in ${dir}`)
    info(`Backfill --all: ${sidecars.length} sidecar(s) in ${path.relative(REPO_ROOT, dir)}`)
    await runBackfill(sidecars)
    return
  }

  if (opts.slug) {
    const dir = opts['sidecar-dir'] || DEFAULT_SIDECAR_DIR
    const sp = path.join(dir, `${opts.slug}.json`)
    if (!fs.existsSync(sp)) fail(`No sidecar for slug "${opts.slug}" at ${sp}`)
    await runBackfill([sp])
    return
  }

  if (opts.contract) {
    if (!fs.existsSync(opts.contract)) fail(`Contract not found: ${opts.contract}`)
    const { data } = matter(fs.readFileSync(opts.contract, 'utf8'))
    if (!data.gemini_prompt) fail('Contract has no gemini_prompt.')
    const out = opts.out || path.join(process.cwd(), 'hero.webp')
    console.log(`\nNew-post hero from contract ${path.basename(opts.contract)}`)
    await makeWebp(data.gemini_prompt, out)
    return
  }

  if (opts.prompt) {
    const out = opts.out || path.join(process.cwd(), 'hero.webp')
    console.log('\nRaw-prompt hero')
    await makeWebp(opts.prompt, out)
    return
  }

  fail('Nothing to do. Use --all, --slug <slug>, --contract <file>, or --prompt "...". (--dry-run to preview.)')
})().catch((e) => fail(e.stack || e.message))
