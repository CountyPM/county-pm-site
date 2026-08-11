#!/usr/bin/env node
// scripts/build-search-index.mjs
//
// Build-time search index for the blog search (/blog landing + /blog/all
// explorer). Emits public/search-index.json — one record per post: identity +
// filter fields, headings, a display excerpt for result cards, and (since the
// full-body upgrade) the complete markdown-stripped body for deep keyword and
// phrase matching. The file is generated on every build (chained into
// `prebuild`) and gitignored; never edit it by hand.
//
// Size discipline: full bodies push the raw file to ~600–800KB, which gzips
// to ~200KB on the wire and is only fetched lazily on first focus of a search
// input. Budget warning at 1.5MB raw.
//
// Exempt posts (decision_intent: []) are INCLUDED — they're searchable,
// they just never match an intent filter.
//
// Usage: node scripts/build-search-index.mjs [--quiet]

import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const ROOT = process.cwd()
const BLOG_DIR = path.join(ROOT, 'content/blog')
const OUT = path.join(ROOT, 'public/search-index.json')
const EXCERPT_CAP = 1200 // lead excerpt (scored higher than the deep body)
const BODY_CAP = 20000 // full body cap — no current post comes close
const quiet = process.argv.includes('--quiet')

/** Strip markdown/MDX syntax down to plain prose for indexing. */
function stripMarkdown(md) {
  return md
    .replace(/```[\s\S]*?```/g, ' ') // fenced code
    .replace(/<[^>\n]+>/g, ' ') // inline HTML/JSX tags
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links -> label
    .replace(/^#{1,6}\s+/gm, '') // heading markers
    .replace(/^\s*[-*+]\s+/gm, '') // list bullets
    .replace(/^\s*\d+\.\s+/gm, '') // numbered lists
    .replace(/^\s*>\s?/gm, '') // blockquotes
    .replace(/[*_~`]/g, '') // emphasis markers
    .replace(/\|/g, ' ') // table pipes
    .replace(/\s+/g, ' ') // collapse whitespace
    .trim()
}

/** Pull H2/H3 heading text out of the markdown body. */
function extractHeadings(md) {
  const out = []
  const re = /^#{2,3}\s+(.+?)\s*$/gm
  let m
  while ((m = re.exec(md)) !== null) {
    const h = m[1].replace(/[*_~`]/g, '').trim()
    if (h) out.push(h)
  }
  return out
}

const files = fs
  .readdirSync(BLOG_DIR)
  .filter((f) => f.endsWith('.mdx'))
  .sort()

const records = []
for (const file of files) {
  const slug = file.replace(/\.mdx$/, '')
  const { data, content } = matter(fs.readFileSync(path.join(BLOG_DIR, file), 'utf8'))

  const plain = stripMarkdown(content)
  records.push({
    slug,
    title: String(data.title || ''),
    subtitle: data.subtitle
      ? String(data.subtitle)
      : String(data.excerpt || ''),
    category: String(data.category || ''),
    intent: Array.isArray(data.decision_intent)
      ? data.decision_intent.map(String)
      : [],
    series: data.series ? String(data.series) : null,
    seriesPart: Number.isInteger(Number(data.seriesPart)) && Number(data.seriesPart) > 0
      ? Number(data.seriesPart)
      : null,
    date: String(data.publishedAt || ''),
    headings: extractHeadings(content),
    excerpt: plain.slice(0, EXCERPT_CAP),
    // Full stripped body for deep keyword/phrase search (overlaps `excerpt`;
    // the scorer weights excerpt higher, body lower, so the overlap is fine).
    body: plain.slice(0, BODY_CAP),
    // Display fields so client components can render PostCards straight from
    // the index without shipping the whole post list as props.
    excerptDisplay: String(data.excerpt || ''),
    heroImage: data.heroImage ? String(data.heroImage) : null,
    heroImageAlt: data.heroImageAlt ? String(data.heroImageAlt) : null,
  })
}

// seriesTotal: how many posts share each series name (mirrors lib/blog.ts).
const seriesCounts = new Map()
for (const r of records)
  if (r.series) seriesCounts.set(r.series, (seriesCounts.get(r.series) || 0) + 1)
for (const r of records) r.seriesTotal = r.series ? seriesCounts.get(r.series) : null

// Newest first, matching the site's default ordering.
records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, JSON.stringify(records))

const kb = (fs.statSync(OUT).size / 1024).toFixed(1)
if (!quiet) console.log(`search-index: ${records.length} posts, ${kb}KB → public/search-index.json`)
if (fs.statSync(OUT).size > 1500 * 1024)
  console.warn(`⚠ search-index.json is ${kb}KB — over the 1.5MB budget; lower BODY_CAP.`)
