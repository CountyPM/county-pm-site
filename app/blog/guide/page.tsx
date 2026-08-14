import Link from 'next/link'
import { getAllSeries } from '@/lib/blog-series'

export const metadata = {
  title: 'Reading Guide | County Property Management Blog',
  description:
    'Some CPM blog posts are meant to be read in order. This guide lists every multi-part series on the site, in reading order.',
}

export default function BlogGuidePage() {
  const series = getAllSeries()

  return (
    <main>
      {/* HERO */}
      <section className="bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <Link
            href="/blog"
            className="text-sm font-semibold text-[var(--cpm-primary-soft)] transition hover:text-[var(--cpm-text)]"
          >
            ← Back to the blog
          </Link>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--cpm-primary-soft)]">
            Reading Guide
          </p>

          <h1 className="mt-4 max-w-5xl text-4xl font-bold tracking-tight text-[var(--cpm-text)] md:text-6xl">
            Where to start: the series worth reading in order.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--cpm-muted)]">
            Some of these posts are meant to be read in order — this page is
            the map. Everything else on the blog stands alone: browse it by
            topic from the{' '}
            <Link
              href="/blog"
              className="font-semibold text-[var(--cpm-primary-soft)] transition hover:text-[var(--cpm-text)]"
            >
              main blog page
            </Link>
            . — Richard J. Miller, Broker, California DRE #00578068
          </p>
        </div>
      </section>

      {/* SERIES */}
      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="space-y-16">
            {series.map((group) => (
              <div
                key={group.name}
                id={group.name
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-+|-+$/g, '')}
                className="scroll-mt-24"
              >
                <div className="flex flex-wrap items-baseline gap-3">
                  <h2 className="text-2xl font-bold tracking-tight text-[var(--cpm-text)] md:text-3xl">
                    {group.name}
                  </h2>
                  <span className="rounded-md bg-[#e6ad2e] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.06em] text-[#072c49]">
                    {group.posts.length}-part series
                  </span>
                </div>

                {group.description && (
                  <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--cpm-muted)]">
                    {group.description}
                  </p>
                )}

                <ol className="mt-6 space-y-3">
                  {group.posts.map((post) => (
                    <li key={post.slug} className="flex items-baseline gap-4">
                      <span className="w-6 flex-none text-right text-sm font-bold text-[var(--cpm-primary-soft)]">
                        {post.seriesPart}.
                      </span>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-lg font-semibold leading-snug text-[var(--cpm-text)] transition hover:text-[var(--cpm-primary-soft)]"
                      >
                        {post.title}
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>

          {series.length === 0 && (
            <p className="text-lg text-[var(--cpm-muted)]">
              No multi-part series yet — browse the blog by topic instead.
            </p>
          )}
        </div>
      </section>
    </main>
  )
}
