import Link from 'next/link'
import { getAllPosts } from '@/lib/blog'

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <main>
      {/* HERO */}
      <section className="bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--cpm-primary-soft)]">
            Real Estate Resource Center
          </p>

          <h1 className="mt-4 max-w-5xl text-4xl font-bold tracking-tight text-[var(--cpm-text)] md:text-6xl">
            Insights for Ventura County property owners, agents, and tenants.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--cpm-muted)]">
            County Property Management’s resource center is designed to support
            owner strategy, property management education, agent partnerships,
            and long-term real estate decision-making throughout Ventura County.
          </p>
        </div>
      </section>

      {/* BLOG GRID */}
      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group relative overflow-hidden rounded-3xl border border-[var(--cpm-border)] bg-[var(--cpm-surface)] transition hover:border-[var(--cpm-primary-soft)]"
              >
                <div className="relative h-[420px] w-full overflow-hidden">
                  {/* HERO IMAGE */}
                  {post.heroImage ? (
                    <img
                      src={post.heroImage}
                      alt={post.heroImageAlt || post.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-[var(--cpm-surface)]" />
                  )}

                  {/* OVERLAY */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/10" />

                  {/* CONTENT */}
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#e6ad2e]">
                        {post.category}
                      </p>

                      <p className="text-xs text-white/80">
                        {post.publishedAt}
                      </p>
                    </div>

                    <h2 className="mt-3 text-2xl font-semibold leading-tight text-white transition group-hover:text-[#e6ad2e]">
                      {post.title}
                    </h2>

                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/80">
                      {post.excerpt}
                    </p>

                    <div className="mt-5 flex items-center text-sm font-semibold text-[#e6ad2e]">
                      Read Article
                      <span className="ml-2 transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}