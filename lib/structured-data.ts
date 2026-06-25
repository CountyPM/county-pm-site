// lib/structured-data.ts
//
// Centralized JSON-LD (schema.org) builders for the site's structured data
// (GEO track E). Two emitters:
//   - organizationLd(): the sitewide business entity, rendered once per page by
//     the root layout.
//   - blogPostingLd(post): per-post Article data, rendered by the blog route.
//
// Both share ORG_ID so a post's publisher/author can reference the single
// Organization node that the layout already puts on the same page (the layout
// wraps every route, so the org block is present on blog pages too).
//
// schema.org has no dedicated "property management" type; RealEstateAgent is the
// most specific applicable type (a LocalBusiness subtype) and fits the licensed
// California brokerage that operates the brand (RAWA, Inc, DRE #00578068).
import { SITE_URL } from './site'
import type { BlogPost } from './blog'

// Stable IRI for the Organization node, so cross-block @id references resolve.
export const ORG_ID = `${SITE_URL}/#organization`

const ORG_NAME = 'County Property Management'

// Escape "<" so the serialized JSON can be safely inlined inside a <script> tag
// without prematurely closing it (e.g. a "</script>" appearing in any string).
export function jsonLd(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, '\\u003c')
}

// Sitewide business entity. "Lean" field set — only facts already published on
// the site (contact page + footer). No logo/postal address/sameAs yet; add them
// here later and both the org block and every Article publisher pick them up.
export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': ORG_ID,
    name: ORG_NAME,
    legalName: 'RAWA, Inc',
    url: SITE_URL,
    description:
      'Practical property management and real estate guidance for Ventura County owners, residents, and partners.',
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Ventura County, California',
    },
    telephone: '+1-805-482-9800',
    email: 'cpm@c-p-m.com',
    // California Department of Real Estate license for the operating brokerage.
    identifier: {
      '@type': 'PropertyValue',
      propertyID: 'California DRE License',
      value: '00578068',
    },
  }
}

// Per-post Article data. Emitted by the blog route AFTER the visible article body
// (GEO rule: human-readable answer first, machine markup second).
export function blogPostingLd(post: BlogPost) {
  const url = `${SITE_URL}/blog/${post.slug}`

  // Author is a Person when a byline name is present; otherwise it's the org
  // itself (post-blog.mjs defaults author to the company name).
  const author =
    post.author && post.author !== ORG_NAME
      ? { '@type': 'Person', name: post.author }
      : { '@id': ORG_ID, name: ORG_NAME }

  const image = post.heroImage
    ? post.heroImage.startsWith('http')
      ? post.heroImage
      : `${SITE_URL}${post.heroImage}`
    : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    datePublished: post.publishedAt,
    // No separate edit history is tracked; last known modification = publish date.
    dateModified: post.publishedAt,
    author,
    publisher: { '@id': ORG_ID, name: ORG_NAME, url: SITE_URL },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    ...(image ? { image } : {}),
    ...(post.category ? { articleSection: post.category } : {}),
  }
}
