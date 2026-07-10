#!/usr/bin/env node
// wire-blog-spokes.mjs
// Reciprocal spoke wiring: for every content/faq/*.md, read its `derivedFrom`
// (the blog slugs the answer was derived from). For each of those blog posts,
// ensure the post's frontmatter `faq:` list includes that hub slug.
//
// APPEND-ONLY MERGE: we never remove a hand-curated `faq:` entry. We only add
// derived hub slugs that are missing. Re-running when everything is wired makes
// no changes (idempotent).
//
// Flags:
//   --apply          write changes to disk (default is dry-run: report only)
//   --print-changed  print changed repo-relative paths, one per line, nothing
//                    else (for scoped `git add`); implies quiet-ish output on stderr
//   --quiet          suppress the human summary on stdout
//
// Writing strategy (learned from the earlier manual run, where a naive regex
// strip produced invalid YAML on posts that already had a faq: block):
//   - Post has NO existing `faq:` -> append-only text insertion of a clean
//     `faq:` block right after the closing frontmatter fence's data (clean diff).
//   - Post HAS an existing `faq:` -> use matter.stringify to rewrite, then
//     validate the result re-parses.
// Every written file is re-parsed to confirm valid YAML before it's kept.

import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const ROOT = process.cwd()
const FAQ_DIR = path.join(ROOT, 'content', 'faq')
const BLOG_DIR = path.join(ROOT, 'content', 'blog')

const args = new Set(process.argv.slice(2))
const APPLY = args.has('--apply')
const PRINT_CHANGED = args.has('--print-changed')
const QUIET = args.has('--quiet')

function log(...a) {
  if (!QUIET && !PRINT_CHANGED) console.log(...a)
}
function warn(...a) {
  if (!PRINT_CHANGED) console.warn(...a)
}

function listMd(dir, ext) {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(ext))
    .map((f) => path.join(dir, f))
}

// 1) Build map: blogSlug -> Set(hub faq slugs derived from it)
function buildDerivedMap() {
  const map = new Map() // blogSlug -> Set<faqSlug>
  for (const file of listMd(FAQ_DIR, '.md')) {
    const faqSlug = path.basename(file, '.md')
    let data
    try {
      data = matter(fs.readFileSync(file, 'utf8')).data
    } catch (e) {
      warn(`⚠ skipping unparseable FAQ file ${path.relative(ROOT, file)}: ${e.message}`)
      continue
    }
    const derived = Array.isArray(data.derivedFrom) ? data.derivedFrom.map(String) : []
    for (const blogSlug of derived) {
      if (!blogSlug) continue
      if (!map.has(blogSlug)) map.set(blogSlug, new Set())
      map.get(blogSlug).add(faqSlug)
    }
  }
  return map
}

// Insert a fresh faq: block into a post that has none, using append-only text
// insertion right before the closing frontmatter fence. Keeps the diff minimal
// and avoids re-serializing existing frontmatter (which can reflow quoting).
function insertFaqBlock(raw, slugs) {
  const lines = raw.split('\n')
  if (lines[0].trim() !== '---') return null // no frontmatter fence at top
  let close = -1
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      close = i
      break
    }
  }
  if (close === -1) return null
  const block = ['faq:', ...slugs.map((s) => `  - ${s}`)]
  const out = [...lines.slice(0, close), ...block, ...lines.slice(close)]
  return out.join('\n')
}

function processPost(file, wantSlugs) {
  const raw = fs.readFileSync(file, 'utf8')
  let parsed
  try {
    parsed = matter(raw)
  } catch (e) {
    warn(`⚠ blog post has unparseable frontmatter, skipping: ${path.relative(ROOT, file)} — ${e.message}`)
    return { changed: false, error: true }
  }

  const existing = Array.isArray(parsed.data.faq) ? parsed.data.faq.map(String) : []
  const existingSet = new Set(existing)
  const toAdd = [...wantSlugs].filter((s) => !existingSet.has(s)).sort()
  if (toAdd.length === 0) return { changed: false }

  const merged = [...existing, ...toAdd] // append-only: preserve order + curation
  let next

  if (existing.length === 0) {
    // Clean text insertion (no re-serialization of the rest of the frontmatter).
    next = insertFaqBlock(raw, merged)
    if (next === null) {
      // Fallback to stringify if the fence couldn't be located.
      next = matter.stringify(parsed.content, { ...parsed.data, faq: merged })
    }
  } else {
    // MERGE case: rewrite via stringify so the YAML stays valid.
    next = matter.stringify(parsed.content, { ...parsed.data, faq: merged })
  }

  // Validate the result re-parses and carries the intended faq set.
  try {
    const check = matter(next)
    const got = new Set((check.data.faq || []).map(String))
    for (const s of merged) {
      if (!got.has(s)) throw new Error(`faq slug lost in rewrite: ${s}`)
    }
  } catch (e) {
    warn(`⚠ refusing to write ${path.relative(ROOT, file)} — produced invalid YAML: ${e.message}`)
    return { changed: false, error: true }
  }

  if (APPLY) fs.writeFileSync(file, next)
  return { changed: true, added: toAdd }
}

function main() {
  const derivedMap = buildDerivedMap()
  const changedPaths = []
  let errors = 0
  let posts = 0
  let totalAdded = 0

  for (const [blogSlug, faqSet] of derivedMap) {
    const file = path.join(BLOG_DIR, `${blogSlug}.mdx`)
    if (!fs.existsSync(file)) {
      warn(`⚠ FAQ derivedFrom references a blog post that does not exist: ${blogSlug}.mdx`)
      continue
    }
    posts++
    const res = processPost(file, faqSet)
    if (res.error) errors++
    if (res.changed) {
      const rel = path.relative(ROOT, file)
      changedPaths.push(rel)
      totalAdded += res.added.length
      log(`  ${APPLY ? 'wired' : 'would wire'} ${rel} (+${res.added.length}: ${res.added.join(', ')})`)
    }
  }

  // Final validation: every content/blog/*.mdx parses and every faq: slug
  // resolves to a real content/faq/*.md.
  const faqSlugSet = new Set(listMd(FAQ_DIR, '.md').map((f) => path.basename(f, '.md')))
  let validationErrors = 0
  for (const file of listMd(BLOG_DIR, '.mdx')) {
    let data
    try {
      data = matter(fs.readFileSync(file, 'utf8')).data
    } catch (e) {
      warn(`✗ VALIDATION: ${path.relative(ROOT, file)} frontmatter does not parse: ${e.message}`)
      validationErrors++
      continue
    }
    for (const s of Array.isArray(data.faq) ? data.faq : []) {
      if (!faqSlugSet.has(String(s))) {
        warn(`✗ VALIDATION: ${path.relative(ROOT, file)} references missing FAQ slug: ${s}`)
        validationErrors++
      }
    }
  }

  if (PRINT_CHANGED) {
    for (const p of changedPaths) process.stdout.write(p + '\n')
  } else {
    log('')
    log(
      `${APPLY ? 'Wired' : 'Dry-run'}: ${changedPaths.length} post(s) ${APPLY ? 'changed' : 'would change'}, ` +
        `${totalAdded} spoke(s) added across ${posts} derived post(s).`
    )
    if (errors) log(`⚠ ${errors} post(s) skipped due to write/parse errors.`)
    if (validationErrors) log(`✗ ${validationErrors} validation error(s).`)
  }

  if (validationErrors > 0 || errors > 0) process.exit(1)
}

main()
