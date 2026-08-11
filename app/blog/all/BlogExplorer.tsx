'use client'

// app/blog/all/BlogExplorer.tsx
//
// Client half of the /blog/all explorer (findability spec Parts 1–2, adapted
// to the tiled landing): intent filter chips + weighted search over the
// build-time index, with shareable URL state (?intent=selling,holding&q=…).
//
// Behavior contract:
// - Intent chips: multi-select, OR logic. Counts are static (whole corpus).
// - Search operates WITHIN the active intent filter and replaces the grid,
//   ordered by relevance. Clearing the input restores the date-ordered grid.
// - URL state (?intent=…&q=…) is read on mount and written with the native
//   history.replaceState so filtered views can be pasted into emails.
//   Deliberately NOT useSearchParams: that would push this whole component
//   behind a Suspense fallback at prerender time and strip the post grid out
//   of the static HTML — the full date-ordered grid must ship server-side for
//   crawlers and no-JS visitors.
// - The search index (public/search-index.json) is fetched lazily on first
//   focus of the input and cached at module level (lib/blog-search-client).
// - Search is HYBRID: instant keyword/phrase results from the full-body
//   index, then a semantic re-rank (embeddings) when the backend answers —
//   see lib/blog-search-client.ts. Semantic failures fall back silently.

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import type { BlogPostMeta } from '@/lib/blog'
import type { SearchResult } from '@/lib/blog-search'
import {
  keywordSearch,
  loadIndex,
  semanticRerank,
  warmSearch,
} from '@/lib/blog-search-client'
import PostCard from '../PostCard'

export const INTENTS = [
  { key: 'selling', label: 'Selling' },
  { key: 'renting', label: 'Renting' },
  { key: 'holding', label: 'Holding' },
  { key: 'still-deciding', label: 'Still deciding' },
] as const

const SUGGESTED_QUERIES = ['deposit', 'vacancy', '1031', 'pets', 'insurance']

function parseUrlState(): { selected: string[]; query: string } {
  const params = new URLSearchParams(window.location.search)
  return {
    selected: (params.get('intent') || '')
      .split(',')
      .filter((v) => INTENTS.some((i) => i.key === v)),
    query: params.get('q') || '',
  }
}

export default function BlogExplorer({ posts }: { posts: BlogPostMeta[] }) {
  // Server render = unfiltered, date-ordered grid; the URL state is applied
  // on mount (see the effect below).
  const [selected, setSelected] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[] | null>(null)
  const [indexReady, setIndexReady] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const seqRef = useRef(0)

  const postBySlug = useMemo(() => {
    const m = new Map<string, BlogPostMeta>()
    posts.forEach((p) => m.set(p.slug, p))
    return m
  }, [posts])

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const { key } of INTENTS) c[key] = 0
    for (const p of posts)
      for (const v of p.decisionIntent) if (v in c) c[v]++
    return c
  }, [posts])

  // --- URL sync (native history: no server round-trip, no scroll jump) ---
  function writeUrl(nextSelected: string[], nextQuery: string) {
    const params = new URLSearchParams()
    if (nextSelected.length > 0) params.set('intent', nextSelected.join(','))
    if (nextQuery.trim().length >= 2) params.set('q', nextQuery.trim())
    const qs = params.toString()
    window.history.replaceState(
      null,
      '',
      qs ? `${window.location.pathname}?${qs}` : window.location.pathname
    )
  }

  function toggleIntent(key: string) {
    const next = selected.includes(key)
      ? selected.filter((k) => k !== key)
      : [...selected, key]
    setSelected(next)
    writeUrl(next, query)
  }

  function clearAll() {
    seqRef.current++ // invalidate any in-flight semantic re-rank
    setSelected([])
    setQuery('')
    setResults(null)
    writeUrl([], '')
  }

  // --- search (hybrid: instant keyword pass, then semantic re-rank) ---
  function runSearch(q: string) {
    const seq = ++seqRef.current
    if (q.trim().length < 2) {
      setResults(null)
      return
    }
    loadIndex()
      .then((records) => {
        if (seqRef.current !== seq) return
        setIndexReady(true)
        const kw = keywordSearch(records, q)
        setResults(kw)
        semanticRerank(records, kw, q).then((fused) => {
          if (seqRef.current === seq) setResults(fused)
        })
      })
      .catch(() => {
        if (seqRef.current === seq) setResults(null) // index unavailable -> keep the browsable grid
      })
  }

  function onQueryChange(q: string) {
    setQuery(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      runSearch(q)
      writeUrl(selected, q)
    }, 150)
  }

  // Apply URL state on mount (pasted ?intent=/?q= links, landing-page form
  // submits) and re-sync if the user navigates history back to this page.
  useEffect(() => {
    const apply = () => {
      const { selected: sel, query: q } = parseUrlState()
      setSelected(sel)
      setQuery(q)
      if (q.trim().length >= 2) runSearch(q)
      else setResults(null)
    }
    apply()
    window.addEventListener('popstate', apply)
    return () => window.removeEventListener('popstate', apply)
  }, [])

  // --- derive the visible set ---
  const intentActive = selected.length > 0
  const matchesIntent = (intent: string[]) =>
    !intentActive || intent.some((v) => selected.includes(v))

  const searching = query.trim().length >= 2 && results !== null

  const visible: Array<{ post: BlogPostMeta; tokens?: string[] }> = searching
    ? results!
        .filter((r) => matchesIntent(r.record.intent))
        .map((r) => ({ post: postBySlug.get(r.record.slug), tokens: r.matchedTokens }))
        .filter((x): x is { post: BlogPostMeta; tokens: string[] } => Boolean(x.post))
    : posts
        .filter((p) => matchesIntent(p.decisionIntent))
        .map((post) => ({ post }))

  const intentLabels = selected
    .map((k) => INTENTS.find((i) => i.key === k)?.label)
    .filter(Boolean)
    .join(' + ')

  return (
    <div>
      {/* FILTER BAR */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm font-semibold text-[var(--cpm-muted)]">
            I&rsquo;m thinking about&hellip;
          </span>
          {INTENTS.map(({ key, label }) => {
            const active = selected.includes(key)
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleIntent(key)}
                aria-pressed={active}
                className={
                  'rounded-full border px-4 py-1.5 text-sm font-semibold transition ' +
                  (active
                    ? 'border-[#e6ad2e] bg-[#e6ad2e] text-[#072c49]'
                    : 'border-[var(--cpm-border)] bg-[var(--cpm-surface)] text-[var(--cpm-text)] hover:border-[var(--cpm-primary-soft)]')
                }
              >
                {label}{' '}
                <span className={active ? 'opacity-80' : 'text-[var(--cpm-muted)]'}>
                  ({counts[key]})
                </span>
              </button>
            )
          })}
          {(intentActive || query) && (
            <button
              type="button"
              onClick={clearAll}
              className="rounded-full px-3 py-1.5 text-sm font-semibold text-[var(--cpm-primary-soft)] transition hover:text-[var(--cpm-text)]"
            >
              Show all ({posts.length})
            </button>
          )}
        </div>

        {/* SEARCH — plain form so it still submits without JS */}
        <form
          action="/blog/all"
          method="get"
          onSubmit={(e) => e.preventDefault()}
          className="md:w-72"
        >
          <input
            type="search"
            name="q"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onFocus={() => {
              warmSearch()
              loadIndex().then(() => setIndexReady(true)).catch(() => {})
            }}
            placeholder="Search articles…"
            aria-label="Search articles"
            className="w-full rounded-full border border-[var(--cpm-border)] bg-[var(--cpm-surface)] px-5 py-2.5 text-sm text-[var(--cpm-text)] placeholder-[var(--cpm-muted)] outline-none transition focus:border-[#e6ad2e]"
          />
        </form>
      </div>

      {/* RESULTS LINE */}
      {searching && (
        <p className="mt-6 text-sm text-[var(--cpm-muted)]">
          {visible.length}
          {visible.length === 1 ? ' result for ' : ' results for '}
          &ldquo;{query.trim()}&rdquo;
          {intentActive ? ` in ${intentLabels}` : ''}
        </p>
      )}
      {!searching && intentActive && (
        <p className="mt-6 text-sm text-[var(--cpm-muted)]">
          {visible.length} {visible.length === 1 ? 'article' : 'articles'} for{' '}
          {intentLabels}
        </p>
      )}
      {query.trim().length >= 2 && !indexReady && results === null && (
        <p className="mt-6 text-sm text-[var(--cpm-muted)]">Searching&hellip;</p>
      )}

      {/* GRID / EMPTY STATES */}
      {visible.length > 0 ? (
        <div className="mt-8 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {visible.map(({ post, tokens }) => (
            <PostCard key={post.slug} post={post} highlightTokens={tokens} />
          ))}
        </div>
      ) : searching ? (
        <div className="mt-10 rounded-3xl border border-[var(--cpm-border)] bg-[var(--cpm-surface)] p-10">
          <p className="text-lg font-semibold text-[var(--cpm-text)]">
            Nothing matched &ldquo;{query.trim()}&rdquo;.
          </p>
          <p className="mt-3 text-sm text-[var(--cpm-muted)]">Try one of these:</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTED_QUERIES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onQueryChange(s)}
                className="rounded-full border border-[var(--cpm-border)] bg-[var(--cpm-page)] px-4 py-1.5 text-sm font-semibold text-[var(--cpm-text)] transition hover:border-[#e6ad2e]"
              >
                {s}
              </button>
            ))}
          </div>
          <p className="mt-6 text-sm text-[var(--cpm-muted)]">
            Can&rsquo;t find what you&rsquo;re looking for? It might be a
            question worth asking us directly —{' '}
            <Link
              href="/contact"
              className="font-semibold text-[var(--cpm-primary-soft)] transition hover:text-[var(--cpm-text)]"
            >
              get in touch
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="mt-10 rounded-3xl border border-[var(--cpm-border)] bg-[var(--cpm-surface)] p-10">
          <p className="text-lg font-semibold text-[var(--cpm-text)]">
            No articles match that combination yet.
          </p>
          <p className="mt-3 text-sm text-[var(--cpm-muted)]">
            <button
              type="button"
              onClick={clearAll}
              className="font-semibold text-[var(--cpm-primary-soft)] transition hover:text-[var(--cpm-text)]"
            >
              Show everything
            </button>{' '}
            instead.
          </p>
        </div>
      )}
    </div>
  )
}
