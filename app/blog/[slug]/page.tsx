import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getAllPosts, getPostBySlug } from '@/lib/blog'
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
      </article>

      {/* INVESTOR LEAD FORM — Investor Education category only */}
      {post.category === 'Investor Education' && (
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
    </main>
  )
}