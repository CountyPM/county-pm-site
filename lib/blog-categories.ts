// lib/blog-categories.ts
// Canonical blog category registry + computed tile data for the gated
// /blog landing page. The six category names are the enumerated values
// post-blog.mjs classifies into — they must match content/blog frontmatter
// `category:` exactly. Tiles are self-updating: counts and hero images are
// computed from the live post set at build time, so every publish refreshes
// the landing page with no manual maintenance.

import { getAllPosts, type BlogPostMeta } from './blog'

export type BlogCategory = {
  /** Exact frontmatter value, e.g. "Investor Education" */
  name: string
  /** URL segment under /blog/category/, e.g. "investor-education" */
  slug: string
  /** One-line owner-voice description shown on the tile */
  description: string
}

// Fixed editorial order (tiles keep stable positions for repeat visitors).
export const BLOG_CATEGORIES: BlogCategory[] = [
  {
    name: 'Investor Education',
    slug: 'investor-education',
    description:
      'Tax structure, market forces, and the rent-sell-hold decision — the strategy layer of owning rental property.',
  },
  {
    name: 'Owner Services',
    slug: 'owner-services',
    description:
      'What professional management actually does for you: compliance, deposits, documentation, and defensible operations.',
  },
  {
    name: 'Rentals',
    slug: 'rentals',
    description:
      'Pricing, vacancy, showings, and getting the right tenant into the right property.',
  },
  {
    name: 'Tenant Services',
    slug: 'tenant-services',
    description:
      'For renters: your rights, your deposit, and making renting work in your favor.',
  },
  {
    name: 'Prospect Services',
    slug: 'prospect-services',
    description:
      'Thinking about hiring a property manager? Start here.',
  },
  {
    name: 'Property Manager Services',
    slug: 'property-manager-services',
    description:
      'Inside the profession: how a property management operation is run.',
  },
]

export type CategoryTile = BlogCategory & {
  count: number
  /** Most recent post in the category (posts are already sorted desc) */
  latestPost?: BlogPostMeta
}

/** All categories with computed counts + latest-post hero, in editorial order. */
export function getCategoryTiles(): CategoryTile[] {
  const posts = getAllPosts()
  return BLOG_CATEGORIES.map((cat) => {
    const inCat = posts.filter((p) => p.category === cat.name)
    return { ...cat, count: inCat.length, latestPost: inCat[0] }
  })
}

export function getCategoryBySlug(slug: string): BlogCategory | undefined {
  return BLOG_CATEGORIES.find((c) => c.slug === slug)
}

/** Posts in a category, newest first (inherits getAllPosts ordering). */
export function getPostsByCategory(name: string): BlogPostMeta[] {
  return getAllPosts().filter((p) => p.category === name)
}
