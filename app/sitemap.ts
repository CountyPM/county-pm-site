import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'
import { getAllPosts } from '@/lib/blog'
import { getFaqTopics } from '@/lib/faq'

type ChangeFrequency = NonNullable<
  MetadataRoute.Sitemap[number]['changeFrequency']
>

// Curated indexable routes. Excludes /api (no content), /thank-you/* (post-
// conversion pages), and dynamic segments (blog/faq, expanded below). Uses the
// /resources/* paths the site's own navigation links to as canonical.
// NOTE: the legacy top-level /rent-vs-sell path now 308-redirects to
// /resources/rent-vs-sell (see next.config.ts); it is intentionally omitted
// here since only the canonical destination should appear in the sitemap.
const STATIC_ROUTES: { path: string; changeFrequency: ChangeFrequency; priority: number }[] = [
  { path: '', changeFrequency: 'weekly', priority: 1.0 },
  { path: '/property-management', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/owners', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/property-strategy-session', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/faq', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/blog', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/available-rentals', changeFrequency: 'daily', priority: 0.7 },
  { path: '/contact', changeFrequency: 'yearly', priority: 0.7 },
  { path: '/resources/rent-vs-sell', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/resources/rent-vs-sell-calculator', changeFrequency: 'yearly', priority: 0.5 },
  { path: '/resources/investor-insights', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/about', changeFrequency: 'yearly', priority: 0.6 },
  { path: '/reviews', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/tenant-homebuyer', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/tenant-homebuyer/rent-vs-buy-calculator', changeFrequency: 'yearly', priority: 0.5 },
  { path: '/agents', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/agent-referral-partners', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/professional-partners', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/vendors', changeFrequency: 'yearly', priority: 0.5 },
  { path: '/maintenance-requests', changeFrequency: 'yearly', priority: 0.5 },
  { path: '/owner-portal', changeFrequency: 'yearly', priority: 0.5 },
  { path: '/tenant-portal', changeFrequency: 'yearly', priority: 0.5 },
  { path: '/equal-housing', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/privacy-policy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
]

function latestDate(dates: string[], fallback: Date): Date {
  const times = dates
    .filter(Boolean)
    .map((d) => new Date(d).getTime())
    .filter((t) => !Number.isNaN(t))
  return times.length ? new Date(Math.max(...times)) : fallback
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  const blogEntries: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: latestDate([post.publishedAt], now),
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  // FAQ topic-cluster pages. lastModified = most recent entry creation or
  // annotation date in the cluster, so living-FAQ updates resurface the page.
  const faqEntries: MetadataRoute.Sitemap = getFaqTopics().map((topic) => ({
    url: `${SITE_URL}/faq/${topic.slug}`,
    lastModified: latestDate(
      topic.entries.flatMap((e) => [
        e.created,
        ...e.annotations.map((a) => a.date),
      ]),
      now
    ),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticEntries, ...blogEntries, ...faqEntries]
}
