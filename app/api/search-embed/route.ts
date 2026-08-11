// app/api/search-embed/route.ts
//
// Query-time embedding for the blog's semantic search layer. The client
// (lib/blog-search-client.ts) POSTs { q } and gets back { v: number[] } — a
// 768-dim RETRIEVAL_QUERY vector from the same model that embedded the posts
// (scripts/build-embeddings.mjs, gemini-embedding-001).
//
// Requires GEMINI_API_KEY in the Vercel project env (same key as .env.images
// locally). If the key is missing or Google errors, we return an error status
// and the client silently falls back to keyword-only search — semantic is a
// progressive enhancement, never a blocker.

import { NextResponse } from 'next/server'

const MODEL = 'gemini-embedding-001'
const DIM = 768
const MAX_QUERY_CHARS = 200

// Tiny in-memory LRU so repeated queries on a warm serverless instance skip
// the round-trip to Google (typing pauses often re-send similar queries).
const cache = new Map<string, number[]>()
const CACHE_MAX = 500

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'semantic search not configured' }, { status: 503 })
  }

  let q: unknown
  try {
    ;({ q } = await req.json())
  } catch {
    return NextResponse.json({ error: 'bad request' }, { status: 400 })
  }
  if (typeof q !== 'string') {
    return NextResponse.json({ error: 'bad request' }, { status: 400 })
  }
  const query = q.trim().slice(0, MAX_QUERY_CHARS)
  if (query.length < 2) {
    return NextResponse.json({ error: 'query too short' }, { status: 400 })
  }

  const key = query.toLowerCase()
  const hit = cache.get(key)
  if (hit) {
    // refresh LRU position
    cache.delete(key)
    cache.set(key, hit)
    return NextResponse.json({ v: hit })
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:embedContent`,
      {
        method: 'POST',
        headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: { parts: [{ text: query }] },
          taskType: 'RETRIEVAL_QUERY',
          outputDimensionality: DIM,
        }),
        // Keep the user's typing loop snappy: bail before the client gives up.
        signal: AbortSignal.timeout(4000),
      }
    )
    if (!res.ok) {
      return NextResponse.json({ error: 'embed failed' }, { status: 502 })
    }
    const json = await res.json()
    const v: unknown = json?.embedding?.values
    if (!Array.isArray(v) || v.length !== DIM) {
      return NextResponse.json({ error: 'bad vector' }, { status: 502 })
    }

    if (cache.size >= CACHE_MAX) {
      const oldest = cache.keys().next().value
      if (oldest !== undefined) cache.delete(oldest)
    }
    cache.set(key, v as number[])
    return NextResponse.json({ v })
  } catch {
    return NextResponse.json({ error: 'embed timeout' }, { status: 504 })
  }
}
