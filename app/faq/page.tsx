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

      {/* LANDLORD QUIZ ENTRY POINT */}
      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <Link
            href="/resources/california-landlord-quiz"
            className="group flex flex-col gap-4 rounded-3xl border border-[var(--cpm-border)] bg-[var(--cpm-surface)] p-8 transition hover:border-[var(--cpm-primary-soft)] md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--cpm-accent)]">
                20-question self-assessment
              </p>
              <p className="mt-2 text-2xl font-semibold text-[var(--cpm-text)]">
                Are you legally compliant as a California landlord?
              </p>
              <p className="mt-2 text-[var(--cpm-muted)]">
                Twenty rules with money attached, from the rental ad to the
                security deposit. Every answer links to the article behind it.
              </p>
            </div>
            <span className="flex shrink-0 items-center text-sm font-semibold text-[var(--cpm-primary-soft)] transition group-hover:text-[var(--cpm-text)]">
              Take the quiz
              <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
            </span>
          </Link>
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
