import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  BLOG_CATEGORIES,
  getCategoryBySlug,
  getPostsByCategory,
} from '@/lib/blog-categories'
import PostCard from '../../PostCard'

type PageProps = {
  params: Promise<{ category: string }>
}

export function generateStaticParams() {
  return BLOG_CATEGORIES.map((c) => ({ category: c.slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const { category: slug } = await params
  const cat = getCategoryBySlug(slug)

  if (!cat) {
    return {}
  }

  return {
    title: `${cat.name} | County Property Management Blog`,
    description: cat.description,
  }
}

export default async function BlogCategoryPage({ params }: PageProps) {
  const { category: slug } = await params
  const cat = getCategoryBySlug(slug)

  if (!cat) {
    notFound()
  }

  const posts = getPostsByCategory(cat.name)

  return (
    <main>
      {/* HERO */}
      <section className="bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <Link
            href="/blog"
            className="text-sm font-semibold text-[var(--cpm-primary-soft)] transition hover:text-[var(--cpm-text)]"
          >
            ← All topics
          </Link>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--cpm-primary-soft)]">
            Real Estate Resource Center
          </p>

          <h1 className="mt-4 max-w-5xl text-4xl font-bold tracking-tight text-[var(--cpm-text)] md:text-6xl">
            {cat.name}
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--cpm-muted)]">
            {cat.description}
          </p>

          <p className="mt-4 text-sm text-[var(--cpm-muted)]">
            {posts.length} {posts.length === 1 ? 'article' : 'articles'}
          </p>
        </div>
      </section>

      {/* POSTS */}
      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          {posts.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <p className="text-lg text-[var(--cpm-muted)]">
              New articles in this topic are on the way.{' '}
              <Link
                href="/blog"
                className="font-semibold text-[var(--cpm-primary-soft)]"
              >
                Browse all topics →
              </Link>
            </p>
          )}
        </div>
      </section>
    </main>
  )
}
