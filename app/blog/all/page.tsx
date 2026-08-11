import Link from 'next/link'
import { getAllPosts } from '@/lib/blog'
import BlogExplorer from './BlogExplorer'

// /blog/all — the full-corpus explorer: every article, filterable by
// decision intent (the site's Rent/Hold/Sell framing) and searchable.
// The tiled /blog landing handles browse-by-audience; this page answers
// "show me everything for someone in my position", and its filtered URLs
// (?intent=selling, ?q=deposit) are stable and shareable — they get pasted
// into owner emails.

export const metadata = {
  title: 'All Articles | County Property Management Blog',
  description:
    'Every article from County Property Management — filter by whether you’re selling, renting, holding, or still deciding, or search the full library.',
}

export default function BlogAllPage() {
  const posts = getAllPosts()

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
            All articles
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--cpm-muted)]">
            The whole library — {posts.length} articles. Filter by where you
            are in the decision, or search for the exact question on your
            mind.
          </p>
        </div>
      </section>

      {/* EXPLORER */}
      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <BlogExplorer posts={posts} />
        </div>
      </section>
    </main>
  )
}
