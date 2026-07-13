// lib/blog-series.ts
// Data layer for the self-updating Reading Guide (/blog/guide). A series
// exists iff posts carry the same `series` frontmatter string; the guide is
// generated from that at build time. Adding a new series requires ONLY the
// contract's series/seriesPart fields — no guide edits, ever.

import { getAllPosts, type BlogPostMeta } from './blog'

export type SeriesGroup = {
  name: string
  description?: string
  /** Posts ordered by seriesPart ascending */
  posts: BlogPostMeta[]
  /** Latest publishedAt in the series (used to order the guide) */
  latestPublishedAt: string
}

// OPTIONAL editorial blurbs, keyed by the exact series name. A series with
// no entry here still appears in the guide (falls back to Part 1's excerpt),
// so this registry is polish, not a maintenance requirement.
const SERIES_DESCRIPTIONS: Record<string, string> = {
  'Next Level Real Estate Investing':
    'For high earners with appreciated California equity. How the current tax code — with bonus depreciation back at 100% — turns a rental into an offset against the income you actually pay tax on.',
  'The 2026 California Rulebook':
    'Sacramento rewrote the landlord playbook. What changed, and what it means at your next move-out, renewal, or disaster.',
  'The Long-Distance Landlord':
    'What actually goes wrong when you own a rental you can\u2019t drive to — and what a documented, defensible operation looks like.',
}

/**
 * All series on the site, each with its posts in reading order.
 * Series are ordered by most recent activity (latest post first), so a new
 * or freshly-extended series floats to the top of the guide automatically.
 */
export function getAllSeries(): SeriesGroup[] {
  const groups = new Map<string, BlogPostMeta[]>()

  for (const post of getAllPosts()) {
    if (!post.series) continue
    const list = groups.get(post.series) || []
    list.push(post)
    groups.set(post.series, list)
  }

  const result: SeriesGroup[] = []
  for (const [name, posts] of groups) {
    posts.sort((a, b) => (a.seriesPart || 0) - (b.seriesPart || 0))
    const latestPublishedAt = posts.reduce(
      (max, p) => (p.publishedAt > max ? p.publishedAt : max),
      ''
    )
    result.push({
      name,
      description: SERIES_DESCRIPTIONS[name] || posts[0]?.excerpt,
      posts,
      latestPublishedAt,
    })
  }

  result.sort((a, b) => b.latestPublishedAt.localeCompare(a.latestPublishedAt))
  return result
}
