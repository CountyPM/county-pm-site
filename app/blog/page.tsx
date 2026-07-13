import Link from 'next/link'
import { getAllPosts } from '@/lib/blog'
import { getCategoryTiles } from '@/lib/blog-categories'
import PostCard from './PostCard'

const RECENT_COUNT = 6

export default function BlogPage() {
  const tiles = getCategoryTiles()
  const recent = getAllPosts().slice(0, RECENT_COUNT)

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
            County Property Management&rsquo;s resource center is designed to support
            owner strategy, property management education, agent partnerships,
            and long-term real estate decision-making throughout Ventura County.
            Pick the topic that matches your situation, or start with the latest
            articles below.
          </p>
        </div>
      </section>

      {/* CATEGORY TILES */}
      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--cpm-text)] md:text-3xl">
              Browse by topic
            </h2>

            <Link
              href="/blog/guide"
              className="flex items-center text-sm font-semibold text-[var(--cpm-primary-soft)] transition hover:text-[var(--cpm-text)]"
            >
              Some posts are meant to be read in order — see the Reading Guide
              <span className="ml-2 transition-transform hover:translate-x-1">
                →
              </span>
            </Link>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tiles.map((tile) => (
              <Link
                key={tile.slug}
                href={`/blog/category/${tile.slug}`}
                className="group relative overflow-hidden rounded-3xl border border-[var(--cpm-border)] bg-[var(--cpm-surface)] transition hover:border-[var(--cpm-primary-soft)]"
              >
                <div className="relative h-[260px] w-full overflow-hidden">
                  {tile.latestPost?.heroImage ? (
                    <img
                      src={tile.latestPost.heroImage}
                      alt=""
                      aria-hidden="true"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-[var(--cpm-surface)]" />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/20" />

                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#e6ad2e]">
                      {tile.count} {tile.count === 1 ? 'article' : 'articles'}
                    </p>

                    <h3 className="mt-2 text-2xl font-semibold leading-tight text-white transition group-hover:text-[#e6ad2e]">
                      {tile.name}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/80">
                      {tile.description}
                    </p>

                    <div className="mt-4 flex items-center text-sm font-semibold text-[#e6ad2e]">
                      Browse {tile.name}
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

      {/* RECENT POSTS */}
      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--cpm-text)] md:text-3xl">
            Latest articles
          </h2>

          <div className="mt-8 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {recent.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
