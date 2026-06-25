import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getAllPosts, getPostBySlug } from '@/lib/blog'
import { getFaqEntry, faqEntryUrl } from '@/lib/faq'
import { blogPostingLd, jsonLd } from '@/lib/structured-data'
import InvestorLeadForm from '@/components/forms/InvestorLeadForm'

type PageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getAllPosts().map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    return {}
  }

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  // Spoke: resolve referenced FAQ entries from the hub. We render a short
  // reference + link back to the canonical answer — never a copy (avoids drift
  // and duplicate-content penalties; the hub stays the single source of truth).
  const faqRefs = (post.faq || [])
    .map((faqSlug) => getFaqEntry(faqSlug))
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)

  return (
    <main className="bg-[var(--cpm-page)]">
      <article className="mx-auto max-w-4xl px-6 py-20">
        {post.heroImage ? (
          <header
            className="relative mb-12 overflow-hidden rounded-3xl border border-white/10 bg-cover bg-center shadow-2xl"
            style={{
              backgroundImage: `linear-gradient(rgba(7,44,73,0.78), rgba(7,44,73,0.78)), url(${post.heroImage})`,
            }}
          >
            <div className="px-8 py-20 md:px-12 md:py-28">
              <p className="mb-4 text-sm text-[var(--cpm-muted)]">
                {post.category} · {post.readingTime}
              </p>

              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
                {post.title}
              </h1>
            </div>
          </header>
        ) : (
          <header className="mb-12">
            <p className="mb-4 text-sm text-[var(--cpm-muted)]">
              {post.category} · {post.readingTime}
            </p>

            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
              {post.title}
            </h1>
          </header>
        )}

        <div className="blog-content mx-auto max-w-3xl">
          <MDXRemote source={post.content} />
        </div>

        {/* FAQ SPOKE — references to canonical hub answers (links, not copies) */}
        {faqRefs.length > 0 && (
          <section className="mx-auto mt-16 max-w-3xl border-t border-[var(--cpm-border)] pt-10">
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Related questions
            </h2>

            <ul className="mt-6 divide-y divide-[var(--cpm-border)] border-y border-[var(--cpm-border)]">
              {faqRefs.map((entry) => (
                <li key={entry.slug}>
                  <Link
                    href={faqEntryUrl(entry)}
                    className="group flex items-center justify-between gap-4 py-4 text-lg text-white transition hover:text-[#e6ad2e]"
                  >
                    <span>{entry.question}</span>
                    <span className="text-[var(--cpm-muted)] transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <p className="mt-4 text-sm text-[var(--cpm-muted)]">
              Answered in full in our{' '}
              <Link
                href="/faq"
                className="text-[#e6ad2e] underline underline-offset-4"
              >
                FAQ hub
              </Link>
              .
            </p>
          </section>
        )}
      </article>

      {/* INVESTOR LEAD FORM — controlled by the showInvestorForm frontmatter flag */}
      {post.showInvestorForm && (
        <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-surface)]">
          <div className="mx-auto max-w-4xl px-6 py-20">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              Continue the Series
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-[var(--cpm-text)] md:text-4xl">
              Want the full investor letter series?
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--cpm-muted)]">
              Seven short letters on conflict-free property management, tenant
              screening, vacancy economics, and the questions every investor
              should ask their property manager. One letter every few days.
              Unsubscribe anytime.
            </p>

            <div className="mt-10 cpm-card rounded-2xl p-6 md:p-8">
              <InvestorLeadForm />
            </div>
          </div>
        </section>
      )}
      {/* /INVESTOR LEAD FORM */}

      {/* BlogPosting JSON-LD — emitted after the visible article (GEO rule:
          human-readable content first, structured data second). publisher
          references the sitewide Organization node from the root layout. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(blogPostingLd(post)) }}
      />
    </main>
  )
}
