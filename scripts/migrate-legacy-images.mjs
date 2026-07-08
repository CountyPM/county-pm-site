#!/usr/bin/env node
/**
 * migrate-legacy-images.mjs — one-time legacy blog image migration (AppFolio/Duda → repo).
 *
 * For each entry in scripts/legacy-image-manifest.json (slug → source CDN URL):
 *   1. downloads the original image from the old site's CDN
 *   2. converts to webp (max 1600px wide, quality 82) via sharp
 *   3. writes public/images/blog/<slug>.webp  (the .mdx frontmatter already points there)
 *
 * Then, for any post whose frontmatter has `gemini_prompt` (the 3 posts whose legacy
 * images were too low-res), shells out to scripts/gen-hero.mjs in raw --prompt mode
 * to generate a fresh 16:9 hero (requires GEMINI_API_KEY in .env.images, same as gen-hero).
 *
 * Usage (on the PC — the CDNs and Google API are not reachable from agent sandboxes):
 *   node scripts/migrate-legacy-images.mjs            # download + convert + generate
 *   node scripts/migrate-legacy-images.mjs --skip-gen # legacy downloads only
 *   node scripts/migrate-legacy-images.mjs --force    # redo even if webp exists
 *
 * Review-first: writes files only; no git operations.
 */
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const IMG_DIR = path.join(REPO, 'public/images/blog')
const MANIFEST = path.join(REPO, 'scripts/legacy-image-manifest.json')
const FORCE = process.argv.includes('--force')
const SKIP_GEN = process.argv.includes('--skip-gen')

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'))
fs.mkdirSync(IMG_DIR, { recursive: true })

const sharp = (await import('sharp')).default

let ok = 0, skipped = 0, failed = []
for (const [slug, url] of Object.entries(manifest)) {
  const out = path.join(IMG_DIR, `${slug}.webp`)
  if (fs.existsSync(out) && !FORCE) { skipped++; continue }
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    await sharp(buf).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 82 }).toFile(out)
    const kb = Math.round(fs.statSync(out).size / 1024)
    console.log(`ok   ${slug}.webp (${kb} KB)`)
    ok++
  } catch (e) {
    console.error(`FAIL ${slug}: ${e.message} <- ${url}`)
    failed.push(slug)
  }
}
console.log(`\nlegacy images: ${ok} converted, ${skipped} already present, ${failed.length} failed`)
if (failed.length) console.log('failed slugs:', failed.join(', '))

if (!SKIP_GEN) {
  // Generate fresh heroes for posts flagged with gemini_prompt
  const dirs = [path.join(REPO, 'content/blog'), path.join(REPO, 'content/blog-staging'), path.join(REPO, 'content/drafts')]
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.mdx'))) {
      const slug = f.replace(/\.mdx$/, '')
      const { data } = matter(fs.readFileSync(path.join(dir, f), 'utf8'))
      if (!data.gemini_prompt) continue
      const out = path.join(IMG_DIR, `${slug}.webp`)
      if (fs.existsSync(out) && !FORCE) { console.log(`gen  ${slug}: hero already exists, skipping`); continue }
      console.log(`gen  ${slug}: generating hero via gen-hero.mjs ...`)
      try {
        execFileSync(process.execPath, [path.join(REPO, 'scripts/gen-hero.mjs'), '--prompt', data.gemini_prompt, '--out', out], { stdio: 'inherit' })
      } catch (e) {
        console.error(`FAIL gen-hero for ${slug}: ${e.message}`)
      }
    }
  }
}
console.log('\nDone. Review public/images/blog, then commit & push to deploy.')
