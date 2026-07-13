import Link from 'next/link'
import type { BlogPostMeta } from '@/lib/blog'

// The blog post card, extracted verbatim from the previous /blog index grid
// so the landing page's "recent posts" strip and the per-category pages
// render identically.
export default function PostCard({ post }: { post: BlogPostMeta }) {
  return (
    <Link
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
          {post.series && (
            <div className="mb-2 flex min-w-0 items-center gap-2">
              {post.seriesPart && post.seriesTotal && (
                <span className="flex-none rounded-md bg-[#e6ad2e] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.06em] text-[#072c49]">
                  Part {post.seriesPart} of {post.seriesTotal}
                </span>
              )}
              <span className="min-w-0 flex-1 truncate text-[11px] font-semibold uppercase tracking-[0.1em] text-white/70">
                {post.series}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#e6ad2e]">
              {post.category}
            </p>

            <p className="text-xs text-white/80">{post.publishedAt}</p>
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
  )
}
