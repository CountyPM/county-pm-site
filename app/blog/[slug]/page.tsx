import { notFound } from 'next/navigation'
import { getAllPosts, getPostBySlug } from '@/lib/blog'

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
            <p>{post.publishedAt}</p>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-20">
          <article className="rounded-3xl border border-gray-200 bg-white p-10">
            {post.content.map((paragraph, index) => (
              <p
                key={index}
                className={index === 0 ? 'text-lg leading-8 text-gray-700' : 'mt-6 text-lg leading-8 text-gray-700'}
              >
                {paragraph}
              </p>
            ))}
          </article>
        </div>
      </section>
    </main>
  )
}