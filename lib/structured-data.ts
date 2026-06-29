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
import {
  getRelatedEntries,
  faqEntryUrl,
  faqAnswerPlainText,
  type FaqEntry,
} from './faq'
import { getEntitiesForText, type FaqEntity } from './faq-entities'

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

// ---- FAQ hub structured data (track A slice 3: cross-linking + entities) ----

// Turn the authoritative entities a passage invokes (statutes/orgs from the
// promoted source registry) into schema.org `about` nodes. `sameAs` gives the
// answer engine a canonical URL to resolve each governing law/agency to.
export function faqAboutNodes(entities: FaqEntity[]) {
  return entities.map((e) => ({
    '@type': e.type,
    name: e.name,
    ...(e.sameAs && e.sameAs.length
      ? { sameAs: e.sameAs.length === 1 ? e.sameAs[0] : e.sameAs }
      : {}),
  }))
}

// FAQPage JSON-LD for a topic cluster. Emitted by the topic route AFTER the
// visible answers (GEO rule: human-readable answer first, markup second). Each
// Question is an addressable node (@id = its anchor URL) and carries `about` for
// the entities it invokes; cross-page related entries surface as page-level
// `relatedLink` (valid on WebPage/FAQPage) — the cross-link graph's machine layer.
export function faqPageLd(entries: FaqEntry[]) {
  const onPage = new Set(entries.map((e) => e.slug))
  const relatedLinks = new Set<string>()

  const mainEntity = entries.map((entry) => {
    const url = `${SITE_URL}${faqEntryUrl(entry)}`
    const entities = getEntitiesForText(`${entry.question} ${entry.answer}`)
    for (const r of getRelatedEntries(entry)) {
      // Same-page siblings are already on this FAQPage; only off-page related
      // entries need an explicit link out.
      if (!onPage.has(r.slug)) relatedLinks.add(`${SITE_URL}${faqEntryUrl(r)}`)
    }
    return {
      '@type': 'Question',
      '@id': url,
      url,
      name: entry.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faqAnswerPlainText(entry),
      },
      ...(entities.length ? { about: faqAboutNodes(entities) } : {}),
    }
  })

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity,
    ...(relatedLinks.size ? { relatedLink: Array.from(relatedLinks).sort() } : {}),
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
