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
  readingTime: string
}

export type BlogPost = BlogPostMeta & {
  content: string
}

export function getAllPosts(): BlogPostMeta[] {
  const files = fs.readdirSync(BLOG_DIR)

  return files
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
        readingTime: readingTime(content).text,
      }
    })
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() -
        new Date(a.publishedAt).getTime()
    )
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
    readingTime: readingTime(content).text,
    content,
  }
}