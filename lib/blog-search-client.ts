'use client'

// lib/blog-search-client.ts
//
// Client-side search orchestration shared by the /blog landing search
// (HomeSearch) and the /blog/all explorer (BlogExplorer):
//
//   1. lazy, module-cached loading of the two static assets —
//      /search-index.json   (keyword index; built every deploy, gitignored)
//      /search-embeddings.json (semantic vectors; committed, PC-generated)
//   2. keyword search (lib/blog-search.ts) — instant, always available
//   3. semantic re-rank: embed the query via POST /api/search-embed, cosine
//      against the post vectors, fuse with the keyword ranking via
//      Reciprocal Rank Fusion (rank-based, so no score-scale tuning), and
//      surface strong semantic-only hits keywords missed.
//
// Semantic is a PROGRESSIVE ENHANCEMENT: any failure (route 503 because
// GEMINI_API_KEY isn't set on Vercel, network hiccup, missing embeddings
// file) resolves to the keyword results unchanged. Callers show keyword
// results immediately and re-render once/if the fused ranking lands.

import type { BlogPostMeta } from '@/lib/blog'
import {
  searchPosts,
  type SearchRecord,
  type SearchResult,
} from '@/lib/blog-search'

// --- RRF fusion constants ---------------------------------------------------
const RRF_K = 60 // standard damping: score contribution = w / (K + rank)
const KEYWORD_WEIGHT = 1.0
const SEMANTIC_WEIGHT = 0.9 // keywords stay slightly authoritative
const SEMANTIC_TOP = 30 // how deep the semantic ranking contributes
const SEMANTIC_FLOOR = 0.55 // absolute cosine floor — below this, not a hit
const SEMANTIC_ONLY_FLOOR = 0.62 // stricter bar to ADD a post keywords missed
const SEMANTIC_MIN_QUERY = 4 // don't burn API calls on 2–3 char fragments

// --- keyword index loading (module-cached, one fetch per session) -----------
let indexCache: SearchRecord[] | null = null
let indexPromise: Promise<SearchRecord[]> | null = null

export function loadIndex(): Promise<SearchRecord[]> {
  if (indexCache) return Promise.resolve(indexCache)
  if (!indexPromise) {
    indexPromise = fetch('/search-index.json')
      .then((r) => {
        if (!r.ok) throw new Error(`search index: HTTP ${r.status}`)
        return r.json()
      })
      .then((data: SearchRecord[]) => {
        indexCache = data
        return data
      })
      .catch((err) => {
        indexPromise = null // allow retry on next focus
        throw err
      })
  }
  return indexPromise
}

// --- embeddings loading -----------------------------------------------------
type EmbeddingsFile = {
  model: string
  dim: number
  posts: Array<{ slug: string; h: string; v: string }>
}
type DecodedEmbeddings = { dim: number; vectors: Map<string, Int8Array> }

let embCache: DecodedEmbeddings | null = null
let embPromise: Promise<DecodedEmbeddings> | null = null

function decodeBase64(b64: string): Int8Array {
  const bin = atob(b64)
  const out = new Int8Array(bin.length)
  for (let i = 0; i < bin.length; i++) {
    const b = bin.charCodeAt(i)
    out[i] = b > 127 ? b - 256 : b
  }
  return out
}

function loadEmbeddings(): Promise<DecodedEmbeddings> {
  if (embCache) return Promise.resolve(embCache)
  if (!embPromise) {
    embPromise = fetch('/search-embeddings.json')
      .then((r) => {
        if (!r.ok) throw new Error(`embeddings: HTTP ${r.status}`)
        return r.json()
      })
      .then((data: EmbeddingsFile) => {
        const vectors = new Map<string, Int8Array>()
        for (const p of data.posts) vectors.set(p.slug, decodeBase64(p.v))
        embCache = { dim: data.dim, vectors }
        return embCache
      })
      .catch((err) => {
        embPromise = null
        throw err
      })
  }
  return embPromise
}

// --- query embedding (per-query, session-cached) ----------------------------
const queryVecCache = new Map<string, Int8Array>()

async function embedQuery(query: string, dim: number): Promise<Int8Array> {
  const key = query.toLowerCase().trim()
  const hit = queryVecCache.get(key)
  if (hit) return hit
  const res = await fetch('/api/search-embed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: query }),
  })
  if (!res.ok) throw new Error(`search-embed: HTTP ${res.status}`)
  const { v } = (await res.json()) as { v: number[] }
  if (!Array.isArray(v) || v.length !== dim) throw new Error('search-embed: bad vector')
  // Normalize + quantize to match the document vectors' representation.
  let norm = 0
  for (const x of v) norm += x * x
  norm = Math.sqrt(norm) || 1
  const q = new Int8Array(dim)
  for (let i = 0; i < dim; i++)
    q[i] = Math.max(-127, Math.min(127, Math.round((v[i] / norm) * 127)))
  if (queryVecCache.size > 200) queryVecCache.clear()
  queryVecCache.set(key, q)
  return q
}

function cosine(a: Int8Array, b: Int8Array): number {
  let dot = 0
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i]
  return dot / (127 * 127)
}

// --- public API -------------------------------------------------------------

/** Instant keyword-only pass (records must already be loaded). */
export function keywordSearch(records: SearchRecord[], query: string): SearchResult[] {
  return searchPosts(records, query)
}

/**
 * Semantic re-rank of keyword results. Resolves to a fused ranking, or to
 * `keywordResults` unchanged on any failure. Never rejects.
 */
export async function semanticRerank(
  records: SearchRecord[],
  keywordResults: SearchResult[],
  query: string
): Promise<SearchResult[]> {
  const q = query.trim()
  if (q.length < SEMANTIC_MIN_QUERY) return keywordResults
  try {
    const emb = await loadEmbeddings()
    const qv = await embedQuery(q, emb.dim)

    // Cosine for every post, ranked.
    const sims: Array<{ slug: string; cos: number }> = []
    for (const [slug, vec] of emb.vectors) {
      const cos = cosine(qv, vec)
      if (cos >= SEMANTIC_FLOOR) sims.push({ slug, cos })
    }
    sims.sort((a, b) => b.cos - a.cos)
    const semTop = sims.slice(0, SEMANTIC_TOP)
    if (semTop.length === 0) return keywordResults

    // Reciprocal Rank Fusion over the two rankings.
    const fused = new Map<
      string,
      { score: number; kw?: SearchResult; cos?: number }
    >()
    keywordResults.forEach((r, i) => {
      fused.set(r.record.slug, {
        score: KEYWORD_WEIGHT / (RRF_K + i + 1),
        kw: r,
      })
    })
    const bySlug = new Map(records.map((r) => [r.slug, r]))
    semTop.forEach(({ slug, cos }, i) => {
      const entry = fused.get(slug) || { score: 0 }
      entry.score += SEMANTIC_WEIGHT / (RRF_K + i + 1)
      entry.cos = cos
      fused.set(slug, entry)
    })

    const out: SearchResult[] = []
    for (const [slug, { score, kw, cos }] of fused) {
      if (kw) {
        out.push({ ...kw, score, semantic: cos !== undefined })
      } else {
        // Semantic-only hit: only admit clearly-related posts.
        if (cos === undefined || cos < SEMANTIC_ONLY_FLOOR) continue
        const record = bySlug.get(slug)
        if (!record) continue
        out.push({ record, score, matchedTokens: [], semantic: true })
      }
    }
    out.sort(
      (a, b) =>
        b.score - a.score ||
        new Date(b.record.date).getTime() - new Date(a.record.date).getTime()
    )
    return out.slice(0, 50)
  } catch {
    return keywordResults // semantic layer unavailable — keyword results stand
  }
}

/** Prefetch both assets (call on input focus so first keystroke is instant). */
export function warmSearch(): void {
  loadIndex().catch(() => {})
  loadEmbeddings().catch(() => {})
}

/** Map an index record to the shape PostCard expects. */
export function recordToPostMeta(r: SearchRecord): BlogPostMeta {
  return {
    slug: r.slug,
    title: r.title,
    excerpt: r.excerptDisplay || r.subtitle,
    publishedAt: r.date,
    author: '',
    category: r.category,
    heroImage: r.heroImage || undefined,
    heroImageAlt: r.heroImageAlt || undefined,
    showInvestorForm: false,
    subtitle: r.subtitle || undefined,
    decisionIntent: r.intent,
    faq: [],
    series: r.series || undefined,
    seriesPart: r.seriesPart || undefined,
    seriesTotal: r.seriesTotal || undefined,
    readingTime: '',
  }
}
