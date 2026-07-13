// lib/blog.ts
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

export type BlogPostMeta = {
  slug: string
  title: string
  excerpt: string
  publishedAt: string
  author: string
  category: string
  seoTitle?: string
  seoDescription?: string
  heroImage?: string
  heroImageAlt?: string
  showInvestorForm?: boolean
  faq?: string[] // FAQ entry slugs this post references (spoke -> hub)
  series?: string // human-readable series name (e.g. "Next Level Real Estate Investing")
  seriesPart?: number // 1-indexed position within the series
  seriesTotal?: number // computed: number of published posts sharing this series
  readingTime: string
}

export type BlogPost = BlogPostMeta & {
  content: string
}

function toSeriesPart(v: unknown): number | undefined {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : undefined
}

export function getAllPosts(): BlogPostMeta[] {
  const files = fs.readdirSync(BLOG_DIR)

  const posts = files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => {
      const slug = file.replace(/\.mdx$/, '')
      const filePath = path.join(BLOG_DIR, file)
      const raw = fs.readFileSync(filePath, 'utf8')
      const { data, content } = matter(raw)

      return {
        slug,
        title: data.title,
        excerpt: data.excerpt,
        publishedAt: data.publishedAt,
        author: data.author,
        category: data.category,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        heroImage: data.heroImage,
        heroImageAlt: data.heroImageAlt,
        showInvestorForm: Boolean(data.showInvestorForm),
        faq: Array.isArray(data.faq) ? data.faq.map(String) : [],
        series: data.series ? String(data.series) : undefined,
        seriesPart: toSeriesPart(data.seriesPart),
        readingTime: readingTime(content).text,
      } as BlogPostMeta
    })
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() -
        new Date(a.publishedAt).getTime()
    )

  // Compute seriesTotal: how many published posts share each series name.
  const counts = new Map<string, number>()
  for (const p of posts) {
    if (p.series) counts.set(p.series, (counts.get(p.series) || 0) + 1)
  }
  for (const p of posts) {
    if (p.series) p.seriesTotal = counts.get(p.series)
  }

  return posts
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`)

  if (!fs.existsSync(filePath)) {
    return null
  }

  const raw = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(raw)

  return {
    slug,
    title: String(data.title || ''),
    excerpt: String(data.excerpt || ''),
    publishedAt: String(data.publishedAt || ''),
    author: String(data.author || ''),
    category: String(data.category || ''),
    seoTitle: data.seoTitle ? String(data.seoTitle) : undefined,
    seoDescription: data.seoDescription
      ? String(data.seoDescription)
      : undefined,
    heroImage: data.heroImage ? String(data.heroImage) : undefined,
    heroImageAlt: data.heroImageAlt ? String(data.heroImageAlt) : undefined,
    showInvestorForm: Boolean(data.showInvestorForm),
    faq: Array.isArray(data.faq) ? data.faq.map(String) : [],
    series: data.series ? String(data.series) : undefined,
    seriesPart: toSeriesPart(data.seriesPart),
    readingTime: readingTime(content).text,
    content,
  }
}

export type SeriesLink = { slug: string; title: string; seriesPart: number }

export type SeriesContext = {
  name: string
  part: number
  total: number
  prev?: SeriesLink
  next?: SeriesLink
}

/**
 * Series navigation for a single post. Returns null when the post isn't part of
 * a series. Ordering is by `seriesPart` (ascending); posts missing a part number
 * fall back to publish order. Prev/next are the adjacent parts within the series.
 */
export function getSeriesContext(slug: string): SeriesContext | null {
  const all = getAllPosts()
  const current = all.find((p) => p.slug === slug)
  if (!current || !current.series) return null

  const members = all
    .filter((p) => p.series === current.series)
    .sort((a, b) => (a.seriesPart ?? Infinity) - (b.seriesPart ?? Infinity))

  const idx = members.findIndex((p) => p.slug === slug)
  const toLink = (p?: BlogPostMeta): SeriesLink | undefined =>
    p ? { slug: p.slug, title: p.title, seriesPart: p.seriesPart ?? 0 } : undefined

  return {
    name: current.series,
    part: current.seriesPart ?? idx + 1,
    total: members.length,
    prev: toLink(idx > 0 ? members[idx - 1] : undefined),
    next: toLink(idx < members.length - 1 ? members[idx + 1] : undefined),
  }
}
