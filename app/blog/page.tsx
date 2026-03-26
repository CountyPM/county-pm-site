import Link from 'next/link'
import { getAllPosts } from '@/lib/blog'

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <main>
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Real Estate Resource Center
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
            Insights for Ventura County property owners, agents, and tenants.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-600">
            County Property Management’s resource center is being structured to
            support owner strategy, property management education, agent
            partnerships, and long-term real estate decision-making.
          </p>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="rounded-2xl border border-gray-200 bg-white p-8"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-gray-500">
                  {post.category}
                </p>

                <h2 className="mt-4 text-2xl font-semibold text-gray-900">
                  {post.title}
                </h2>

                <p className="mt-4 text-gray-600">{post.excerpt}</p>

                <div className="mt-6 text-sm text-gray-500">
                  <p>{post.author}</p>
                  <p>{post.publishedAt}</p>
                </div>

                <Link
                  href={`/blog/${post.slug}`}
                  className="mt-8 inline-block rounded bg-black px-5 py-3 text-white"
                >
                  Read Article
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}