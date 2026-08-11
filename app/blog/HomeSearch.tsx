'use client'

// app/blog/HomeSearch.tsx
//
// Live search on the /blog landing page. Replaces the old plain GET form
// (which bounced visitors to /blog/all before showing anything): results now
// render inline, right under the search bar, over the FULL corpus — keyword,
// phrase, and semantic (see lib/blog-search-client.ts).
//
// This component owns the whole "find your situation" row (intent chips +
// search input) plus the inline results panel, so the panel can span the full
// section width in normal document flow — the tiles/recent sections below
// simply slide down while results are open and back up when cleared.
//
// Progressive enhancement contract:
// - no JS: the form GET-submits to /blog/all?q=…, which handles the query.
// - JS, no semantic backend: instant keyword/phrase results.
// - full stack: keyword results appear instantly, then re-rank once the
//   semantic pass lands.

import { useRef, useState } from 'react'
import Link from 'next/link'
import type { SearchResult } from '@/lib/blog-search'
import {
  keywordSearch,
  loadIndex,
  recordToPostMeta,
  semanticRerank,
  warmSearch,
} from '@/lib/blog-search-client'
import PostCard from './PostCard'

const MAX_INLINE_RESULTS = 9

type Intent = { key: string; label: string }

export default function HomeSearch({
  intents,
  intentCounts,
  totalPosts,
}: {
  intents: Intent[]
  intentCounts: Record<string, number>
  totalPosts: number
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[] | null>(null)
  const [pending, setPending] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const seqRef = useRef(0)

  function runSearch(q: string) {
    const seq = ++seqRef.current
    if (q.trim().length < 2) {
      setResults(null)
      setPending(false)
      return
    }
    setPending(true)
    loadIndex()
      .then((records) => {
        if (seqRef.current !== seq) return
        const kw = keywordSearch(records, q)
        setResults(kw) // instant keyword pass
        setPending(false)
        // Semantic re-rank arrives when it arrives; never blocks, never throws.
        semanticRerank(records, kw, q).then((fused) => {
          if (seqRef.current === seq) setResults(fused)
        })
      })
      .catch(() => {
        if (seqRef.current === seq) {
          setResults(null)
          setPending(false)
        }
      })
  }

  function onQueryChange(q: string) {
    setQuery(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runSearch(q), 200)
  }

  const active = query.trim().length >= 2 && results !== null
  const shown = active ? results!.slice(0, MAX_INLINE_RESULTS) : []

  return (
    <div>
      {/* FILTER ROW: intent chips (links into /blog/all) + live search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm font-semibold text-[var(--cpm-muted)]">
            I&rsquo;m thinking about&hellip;
          </span>
          {intents.map(({ key, label }) => (
            <Link
              key={key}
              href={`/blog/all?intent=${key}`}
              className="rounded-full border border-[var(--cpm-border)] bg-[var(--cpm-surface)] px-4 py-1.5 text-sm font-semibold text-[var(--cpm-text)] transition hover:border-[#e6ad2e]"
            >
              {label}{' '}
              <span className="text-[var(--cpm-muted)]">
                ({intentCounts[key]})
              </span>
            </Link>
          ))}
          <Link
            href="/blog/all"
            className="rounded-full px-3 py-1.5 text-sm font-semibold text-[var(--cpm-primary-soft)] transition hover:text-[var(--cpm-text)]"
          >
            Browse all {totalPosts} →
          </Link>
        </div>

        {/* Plain GET form — still submits to /blog/all without JS */}
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
            onFocus={warmSearch}
            placeholder="Search articles…"
            aria-label="Search articles"
            className="w-full rounded-full border border-[var(--cpm-border)] bg-[var(--cpm-surface)] px-5 py-2.5 text-sm text-[var(--cpm-text)] placeholder-[var(--cpm-muted)] outline-none transition focus:border-[#e6ad2e]"
          />
        </form>
      </div>

      {/* INLINE RESULTS PANEL — normal flow, full section width */}
      {query.trim().length >= 2 && (
        <div>
          {pending && results === null && (
            <p className="mt-6 text-sm text-[var(--cpm-muted)]">Searching&hellip;</p>
          )}

          {active && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-[var(--cpm-muted)]">
                {results!.length}
                {results!.length === 1 ? ' result for ' : ' results for '}
                &ldquo;{query.trim()}&rdquo;
              </p>
              <Link
                href={`/blog/all?q=${encodeURIComponent(query.trim())}`}
                className="text-sm font-semibold text-[var(--cpm-primary-soft)] transition hover:text-[var(--cpm-text)]"
              >
                Open in the full explorer →
              </Link>
            </div>
          )}

          {active && shown.length > 0 && (
            <div className="mt-6 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {shown.map(({ record, matchedTokens }) => (
                <PostCard
                  key={record.slug}
                  post={recordToPostMeta(record)}
                  highlightTokens={matchedTokens}
                />
              ))}
            </div>
          )}

          {active && results!.length > MAX_INLINE_RESULTS && (
            <p className="mt-8 text-sm text-[var(--cpm-muted)]">
              Showing the top {MAX_INLINE_RESULTS} —{' '}
              <Link
                href={`/blog/all?q=${encodeURIComponent(query.trim())}`}
                className="font-semibold text-[var(--cpm-primary-soft)] transition hover:text-[var(--cpm-text)]"
              >
                see all {results!.length} results
              </Link>
              .
            </p>
          )}

          {active && results!.length === 0 && (
            <div className="mt-6 rounded-3xl border border-[var(--cpm-border)] bg-[var(--cpm-surface)] p-8">
              <p className="text-lg font-semibold text-[var(--cpm-text)]">
                Nothing matched &ldquo;{query.trim()}&rdquo;.
              </p>
              <p className="mt-3 text-sm text-[var(--cpm-muted)]">
                It might be a question worth asking us directly —{' '}
                <Link
                  href="/contact"
                  className="font-semibold text-[var(--cpm-primary-soft)] transition hover:text-[var(--cpm-text)]"
                >
                  get in touch
                </Link>
                .
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
