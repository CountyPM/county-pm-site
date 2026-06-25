import Link from 'next/link'
import { getFaqTopics, faqEntryUrl } from '@/lib/faq'

export const metadata = {
  title: 'Property Management FAQ | County Property Management',
  description:
    'Answers to common questions about property management, conflicts of interest, and California rental law for Ventura County owners and tenants.',
}

export default function FaqIndexPage() {
  const topics = getFaqTopics()

  return (
    <main>
      {/* HERO */}
      <section className="bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--cpm-primary-soft)]">
            Answers &amp; Resources
          </p>

          <h1 className="mt-4 max-w-5xl text-4xl font-bold tracking-tight text-[var(--cpm-text)] md:text-6xl">
            Frequently asked questions.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--cpm-muted)]">
            Clear, sourced answers to the questions Ventura County property
            owners, investors, and tenants ask most — drawn from four decades of
            managing real estate in this market.
          </p>
        </div>
      </section>

      {/* TOPIC CLUSTERS */}
      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-4xl px-4 py-20">
          {topics.length === 0 ? (
            <p className="text-[var(--cpm-muted)]">
              Answers are on the way. Check back soon.
            </p>
          ) : (
            <div className="space-y-14">
              {topics.map((topic) => (
                <div key={topic.slug}>
                  <h2 className="text-2xl font-semibold tracking-tight text-[var(--cpm-text)]">
                    <Link
                      href={`/faq/${topic.slug}`}
                      className="transition hover:text-[var(--cpm-primary-soft)]"
                    >
                      {topic.title}
                    </Link>
                  </h2>

                  {topic.description ? (
                    <p className="mt-2 text-[var(--cpm-muted)]">
                      {topic.description}
                    </p>
                  ) : null}

                  <ul className="mt-6 divide-y divide-[var(--cpm-border)] border-y border-[var(--cpm-border)]">
                    {topic.entries.map((entry) => (
                      <li key={entry.slug}>
                        <Link
                          href={faqEntryUrl(entry)}
                          className="group flex items-center justify-between gap-4 py-4 text-lg text-[var(--cpm-text)] transition hover:text-[var(--cpm-primary-soft)]"
                        >
                          <span>{entry.question}</span>
                          <span className="text-[var(--cpm-muted)] transition-transform group-hover:translate-x-1">
                            →
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
