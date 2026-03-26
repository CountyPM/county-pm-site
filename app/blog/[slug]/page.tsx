import { notFound } from 'next/navigation'
import { getAllPosts, getPostBySlug } from '@/lib/blog'
import BlogLeadForm from '@/components/forms/BlogLeadForm'

type BlogPostPageProps = {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({
    slug: post.slug,
  }))
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return (
    <main>
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-24">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-gray-500">
            {post.category}
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            {post.title}
          </h1>

          <div className="mt-6 text-sm text-gray-500">
            <p>{post.author}</p>
            <p>{new Date(post.publishedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-20">
          <article className="rounded-3xl border border-gray-200 bg-white p-10">
            {post.content.map((paragraph, index) => (
              <div key={index}>
                <p
                  className={
                    index === 0
                      ? 'text-lg leading-8 text-gray-700'
                      : 'mt-6 text-lg leading-8 text-gray-700'
                  }
                >
                  {paragraph}
                </p>

                {index === 1 && (
                  <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
                    <p className="text-gray-800 font-medium">
                      Need help deciding what to do with your property?
                </p>
                <a
                  href="/property-strategy-session"
                  className="mt-4 inline-block rounded bg-black px-5 py-2 text-white"
                >
                  Get a Strategy Recommendation
                </a>
              </div>
            )}
          </div>
        ))}
          </article>

          <div className="mt-12 rounded-2xl border border-gray-200 bg-white p-8 text-center">
            <h3 className="text-2xl font-semibold text-gray-900">
              Not sure what to do with your property?
            </h3>

            <p className="mt-4 text-gray-600">
              Get a clear rent, sell, or hold strategy based on your situation.
            </p>

            <a
              href="/property-strategy-session"
              className="mt-6 inline-block rounded bg-black px-6 py-3 text-white"
            >
              Book a Strategy Session
            </a>
          </div>

          <div className="mt-12">
            <BlogLeadForm />
          </div>
        </div>
      </section>
    </main>
  )
}