import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import {
  getFaqTopics,
  getFaqTopic,
  faqAnswerPlainText,
  type FaqEntry,
} from '@/lib/faq'

type PageProps = {
  params: Promise<{ topic: string }>
}

export function generateStaticParams() {
  return getFaqTopics().map((topic) => ({ topic: topic.slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const { topic: topicSlug } = await params
  const topic = getFaqTopic(topicSlug)

  if (!topic) {
    return {}
  }

  return {
    title: `${topic.title} | County Property Management FAQ`,
    description:
      topic.description ||
      `Answers about ${topic.title.toLowerCase()} for Ventura County property owners and tenants.`,
  }
}

const ANNOTATION_LABELS: Record<FaqEntry['annotations'][number]['type'], string> =
  {
    additive: 'Added',
    'soft-revision': 'Revised',
    'strong-revision': 'Significantly revised',
    contradiction: 'Correction',
  }

export default async function FaqTopicPage({ params }: PageProps) {
  const { topic: topicSlug } = await params
  const topic = getFaqTopic(topicSlug)

  if (!topic) {
    notFound()
  }

  // FAQPage structured data — built AFTER the visible answers below, emitted at
  // the end of the rendered output (GEO rule: visible answer first, schema second).
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: topic.entries.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faqAnswerPlainText(entry),
      },
    })),
  }

  return (
    <main className="bg-[var(--cpm-page)]">
      <article className="mx-auto max-w-3xl px-6 py-20">
        <header className="mb-12">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--cpm-primary-soft)]">
            <Link href="/faq" className="transition hover:text-[var(--cpm-text)]">
              ← All FAQs
            </Link>
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-[var(--cpm-text)] md:text-5xl">
            {topic.title}
          </h1>

          {topic.description ? (
            <p className="mt-6 text-lg leading-8 text-[var(--cpm-muted)]">
              {topic.description}
            </p>
          ) : null}
        </header>

        <div className="space-y-16">
          {topic.entries.map((entry) => (
            // Each Q&A is a standalone passage with a stable #anchor so it can be
            // linked and cited individually (the per-blog spokes point here).
            <section key={entry.slug} id={entry.slug} className="scroll-mt-24">
              <h2 className="text-2xl font-semibold tracking-tight text-[var(--cpm-text)] md:text-3xl">
                {entry.question}
              </h2>

              <div className="blog-content mt-5">
                <MDXRemote source={entry.answer} />
              </div>

              {entry.sources.length > 0 ? (
                <div className="mt-6 rounded-2xl border border-[var(--cpm-border)] bg-[var(--cpm-surface)] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--cpm-muted)]">
                    Sources
                  </p>
                  <ul className="mt-3 space-y-2">
                    {entry.sources.map((source) => (
                      <li key={source.url} className="text-sm">
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--cpm-primary-soft)] underline underline-offset-4 hover:text-[var(--cpm-text)]"
                        >
                          {source.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {entry.annotations.length > 0 ? (
                <div className="mt-6 border-l-2 border-[var(--cpm-primary-soft)] pl-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--cpm-muted)]">
                    Updates
                  </p>
                  <ul className="mt-3 space-y-4">
                    {entry.annotations.map((annotation, i) => (
                      <li key={`${annotation.date}-${i}`} className="text-sm">
                        <p className="font-medium text-[var(--cpm-text)]">
                          {ANNOTATION_LABELS[annotation.type]} · {annotation.date}
                        </p>
                        <p className="mt-1 leading-6 text-[var(--cpm-muted)]">
                          {annotation.note}
                        </p>
                        {annotation.post || annotation.postUrl ? (
                          <p className="mt-1">
                            <Link
                              href={
                                annotation.postUrl || `/blog/${annotation.post}`
                              }
                              className="text-[var(--cpm-primary-soft)] underline underline-offset-4 hover:text-[var(--cpm-text)]"
                            >
                              Source post →
                            </Link>
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          ))}
        </div>
      </article>

      {/* FAQPage JSON-LD — after the visible answers above */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
    </main>
  )
}
