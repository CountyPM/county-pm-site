#!/usr/bin/env node
// scripts/build-embeddings.mjs
//
// Semantic-search document embeddings for the blog (contextual search layer).
// One vector per post → public/search-embeddings.json, which IS COMMITTED to
// the repo (unlike search-index.json): the Vercel build has no GEMINI_API_KEY,
// so vectors must ride in with the content. Regenerated on the PC:
//   - by the publish runner (post-blog-inbox.ps1) after new posts land, and
//   - manually via `npm run embed:blog` after editing posts.
//
// INCREMENTAL: each entry stores a sha256 of its source text + model config;
// unchanged posts are never re-embedded, so a normal run embeds only the new
// or edited posts (usually 1–3 API calls). Deleted posts are dropped.
//
// Model: gemini-embedding-001 at 768 dims (free tier available — same key as
// the hero-image stage, .env.images). Documents embed with taskType
// RETRIEVAL_DOCUMENT; queries (app/api/search-embed) use RETRIEVAL_QUERY.
// Vectors are L2-normalized then int8-quantized (×127) and base64-packed:
// ~1KB per post, so cosine ≈ dot(int8a, int8b)/127² client-side.
//
// Network note: Google's API is NOT reachable from the sandbox — run this on
// the host. `--mock` generates deterministic fake vectors for pipeline tests.
//
// Usage: node scripts/build-embeddings.mjs [--quiet] [--force] [--mock] [--dry-run]

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const BLOG_DIR = path.join(REPO_ROOT, 'content/blog')
const OUT = path.join(REPO_ROOT, 'public/search-embeddings.json')

const MODEL = 'gemini-embedding-001'
const DIM = 768
const DOC_CHAR_CAP = 6000 // stay safely under the model's input token limit
const BATCH = 10 // embedContent calls per burst before a courtesy pause

const quiet = process.argv.includes('--quiet')
const force = process.argv.includes('--force')
const mock = process.argv.includes('--mock')
const dryRun = process.argv.includes('--dry-run')

// --- env (same pattern as gen-hero.mjs) -------------------------------------
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
const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || ''

// --- doc text ---------------------------------------------------------------
function stripMarkdown(md) {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>\n]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/[*_~`]/g, '')
    .replace(/\|/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function docText(data, content) {
  const headings = []
  const re = /^#{2,3}\s+(.+?)\s*$/gm
  let m
  while ((m = re.exec(content)) !== null) headings.push(m[1].replace(/[*_~`]/g, '').trim())
  const parts = [
    String(data.title || ''),
    String(data.subtitle || data.excerpt || ''),
    String(data.category || ''),
    headings.join('. '),
    stripMarkdown(content),
  ]
  return parts.filter(Boolean).join('\n').slice(0, DOC_CHAR_CAP)
}

// --- vector packing ---------------------------------------------------------
function quantize(vec) {
  // L2-normalize, then int8 (×127). Dot of two packed vectors /127² ≈ cosine.
  let norm = 0
  for (const x of vec) norm += x * x
  norm = Math.sqrt(norm) || 1
  const q = Buffer.alloc(vec.length)
  for (let i = 0; i < vec.length; i++) {
    q[i] = Math.max(-127, Math.min(127, Math.round((vec[i] / norm) * 127))) & 0xff
  }
  return q.toString('base64')
}

// Deterministic fake embedding for --mock pipeline tests: hash-seeded PRNG.
function mockVector(text) {
  const out = new Array(DIM)
  let seed = crypto.createHash('sha256').update(text).digest()
  let j = 0
  for (let i = 0; i < DIM; i++) {
    if (j >= seed.length - 4) {
      seed = crypto.createHash('sha256').update(seed).digest()
      j = 0
    }
    out[i] = (seed.readInt32LE(j) / 2 ** 31)
    j += 4
  }
  return out
}

// --- Gemini call ------------------------------------------------------------
async function embed(text) {
  if (mock) return mockVector(text)
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:embedContent`,
    {
      method: 'POST',
      headers: { 'x-goog-api-key': API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: { parts: [{ text }] },
        taskType: 'RETRIEVAL_DOCUMENT',
        outputDimensionality: DIM,
      }),
    }
  )
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`embedContent HTTP ${res.status}: ${body.slice(0, 300)}`)
  }
  const json = await res.json()
  const values = json?.embedding?.values
  if (!Array.isArray(values) || values.length !== DIM)
    throw new Error(`embedContent: bad vector (len ${values?.length})`)
  return values
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// --- main -------------------------------------------------------------------
async function main() {
  if (!mock && !API_KEY) {
    console.error('build-embeddings: no GEMINI_API_KEY in .env.images — aborting (non-fatal for the site; search falls back to keyword-only).')
    process.exit(1)
  }

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.mdx')).sort()

  // Load the existing file for incremental reuse.
  let prev = new Map()
  if (!force && fs.existsSync(OUT)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(OUT, 'utf8'))
      if (parsed.model === MODEL && parsed.dim === DIM)
        for (const p of parsed.posts) prev.set(p.slug, p)
    } catch { /* regenerate from scratch */ }
  }

  const posts = []
  let reused = 0
  let embedded = 0
  let failed = 0
  let sincePause = 0

  for (const file of files) {
    const slug = file.replace(/\.mdx$/, '')
    const { data, content } = matter(fs.readFileSync(path.join(BLOG_DIR, file), 'utf8'))
    const text = docText(data, content)
    const hash = crypto
      .createHash('sha256')
      .update(`${MODEL}:${DIM}:${mock ? 'mock' : 'live'}:${text}`)
      .digest('hex')
      .slice(0, 16)

    const cached = prev.get(slug)
    if (cached && cached.h === hash) {
      posts.push(cached)
      reused++
      continue
    }
    if (dryRun) {
      console.log(`would embed: ${slug}`)
      embedded++
      continue
    }
    try {
      if (sincePause >= BATCH) {
        await sleep(1200)
        sincePause = 0
      }
      const vec = await embed(text)
      posts.push({ slug, h: hash, v: quantize(vec) })
      embedded++
      sincePause++
    } catch (err) {
      failed++
      console.error(`embed FAILED for ${slug}: ${err.message}`)
      // Keep a stale vector if we have one — better than dropping the post.
      if (cached) posts.push(cached)
    }
  }

  if (dryRun) {
    console.log(`dry-run: ${reused} up-to-date, ${embedded} would embed.`)
    return
  }

  fs.writeFileSync(OUT, JSON.stringify({ model: MODEL, dim: DIM, posts }))
  const kb = (fs.statSync(OUT).size / 1024).toFixed(1)
  if (!quiet || failed > 0)
    console.log(
      `search-embeddings: ${posts.length} posts (${reused} reused, ${embedded} embedded, ${failed} failed), ${kb}KB → public/search-embeddings.json`
    )
  // Exit nonzero only if we produced nothing usable at all.
  if (posts.length === 0) process.exit(1)
}

main().catch((err) => {
  console.error(`build-embeddings: ${err.message}`)
  process.exit(1)
})
