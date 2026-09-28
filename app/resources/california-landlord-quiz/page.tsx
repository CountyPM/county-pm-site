import type { Metadata } from 'next'
import Link from 'next/link'
import LandlordComplianceQuiz from '@/components/quiz/LandlordComplianceQuiz'
import { LANDLORD_COMPLIANCE_QUESTIONS } from '@/components/quiz/landlord-compliance-questions'
import { SITE_URL } from '@/lib/site'
import { ORG_ID, jsonLd } from '@/lib/structured-data'

const PATH = '/resources/california-landlord-quiz'
const PAGE_URL = `${SITE_URL}${PATH}`

const TITLE = 'California Landlord Quiz: Are You Legally Compliant?'
const DESCRIPTION =
  'A 20-question self-assessment for California rental owners. Each question is a rule with statutory damages attached, from the rental ad to the security deposit, and every answer links to the article that explains it.'

export const metadata: Metadata = {
  title: `${TITLE} | County Property Management`,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: 'website',
    siteName: 'County Property Management',
  },
}

// Structured data: WebPage + BreadcrumbList, and deliberately NO FAQPage. The
// answers only appear after a tap, so they are not in the initial HTML —
// marking them up as visible Q&A would be schema that doesn't match the
// rendered page (the same mismatch the FAQ hub guards against). If a Q&A rich
// result is wanted later, render all twenty Q&As in a static section below the
// quiz and mark THAT up.
function quizPageLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': PAGE_URL,
        url: PAGE_URL,
        name: TITLE,
        description: DESCRIPTION,
        inLanguage: 'en-US',
        isPartOf: { '@type': 'WebSite', url: SITE_URL, name: 'County Property Management' },
        publisher: { '@id': ORG_ID, name: 'County Property Management', url: SITE_URL },
        about: [
          { '@type': 'Thing', name: 'California landlord-tenant law' },
          { '@type': 'Place', name: 'Ventura County, California' },
        ],
        audience: { '@type': 'Audience', audienceType: 'California residential rental property owners' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'California Landlord Quiz', item: PAGE_URL },
        ],
      },
    ],
  }
}

const PHASE_SUMMARY = [
  {
    label: 'Before the tenant moves in',
    count: LANDLORD_COMPLIANCE_QUESTIONS.filter((q) => q.phase === 'before').length,
    body: 'The rental ad, screening fees, disclosures, the Assembly Bill 1482 exemption notice, the security deposit cap, and move-in photographs.',
  },
  {
    label: 'During the tenancy',
    count: LANDLORD_COMPLIANCE_QUESTIONS.filter((q) => q.phase === 'during').length,
    body: 'Late fees, payment methods, entry notice, retaliation, rent increase notice and caps, local ordinances, assistance animals, just cause, and relocation assistance.',
  },
  {
    label: 'When it ends',
    count: LANDLORD_COMPLIANCE_QUESTIONS.filter((q) => q.phase === 'after').length,
    body: 'The pre-move-out inspection, the twenty-one-day itemized statement, and what counts as ordinary wear and tear.',
  },
]

export default function CaliforniaLandlordQuizPage() {
  return (
    <main>
      {/* HERO */}
      <section className="bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--cpm-primary-soft)]">
              Landlord Self-Assessment
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--cpm-text)] md:text-6xl">
              Are you legally compliant as a California landlord?
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--cpm-muted)]">
              Twenty questions, each one a California rule with money attached
              to getting it wrong. You&rsquo;ll see what you got right, what
              each miss costs, and the article that explains every rule.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <a href="#quiz" className="btn-primary px-6 py-3 text-base">
                Take the Quiz
              </a>

              <Link
                href="/property-strategy-session"
                className="rounded-full border border-[var(--cpm-border)] px-6 py-3 text-[var(--cpm-text)] transition hover:border-[var(--cpm-primary-soft)]"
              >
                Book a Property Strategy Session
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* QUIZ */}
      <section
        id="quiz"
        className="scroll-mt-20 border-t border-[var(--cpm-border)] bg-[var(--cpm-page)]"
      >
        <div className="mx-auto max-w-6xl px-4 py-20">
          <LandlordComplianceQuiz />
        </div>
      </section>

      {/* FRAMING */}
      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-surface)]">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <h2 className="text-3xl font-semibold text-[var(--cpm-text)]">
            What the quiz covers
          </h2>
          <p className="mt-4 max-w-3xl leading-7 text-[var(--cpm-muted)]">
            The questions run in the order an owner meets them over the life of
            a tenancy. Each one is covered in depth on the County Property
            Management blog, mostly in The Tenancy Clock and The Evidence
            Standard series.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {PHASE_SUMMARY.map((phase) => (
              <div
                key={phase.label}
                className="rounded-2xl border border-[var(--cpm-border)] bg-[var(--cpm-page)] p-6"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--cpm-accent)]">
                  {phase.count} questions
                </p>
                <h3 className="mt-2 text-xl font-semibold text-[var(--cpm-text)]">
                  {phase.label}
                </h3>
                <p className="mt-3 leading-7 text-[var(--cpm-muted)]">{phase.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm font-semibold">
            <Link
              href="/blog/guide"
              className="text-[var(--cpm-primary-soft)] transition hover:text-[var(--cpm-text)]"
            >
              Read the series in order — the Reading Guide →
            </Link>
            <Link
              href="/faq"
              className="text-[var(--cpm-primary-soft)] transition hover:text-[var(--cpm-text)]"
            >
              Browse the FAQ →
            </Link>
          </div>

          <p className="mt-10 max-w-3xl text-sm leading-6 text-[var(--cpm-muted)]">
            This quiz is general information about California residential
            landlord-tenant rules, not legal advice. Local ordinances can be
            stricter than state law, and the rules change. Confirm the current
            requirements for your property before you act.
          </p>
        </div>
      </section>

      {/* WebPage + BreadcrumbList JSON-LD — after the visible content. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(quizPageLd()) }}
      />
    </main>
  )
}
