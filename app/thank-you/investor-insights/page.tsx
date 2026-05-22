// app/thank-you/investor-insights/page.tsx

import Link from 'next/link'

export const metadata = {
  title: 'Investor Insights Requested | County Property Management',
  description:
    'Thank you for requesting investor insights from County Property Management.',
}

export default function InvestorInsightsThankYouPage() {
  return (
    <main className="bg-white text-neutral-950">
      <section className="mx-auto max-w-4xl px-6 py-24 text-center lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
          Investor Insights
        </p>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          Thank you — your request was received.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-neutral-700">
          We’ll send you practical guidance for owning and managing rental
          property in Ventura County.
        </p>

        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-neutral-600">
          If you would like to discuss your property sooner, schedule a Property
          Strategy Session with County Property Management.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/property-strategy-session"
            className="inline-flex items-center justify-center rounded-md bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Schedule a Property Strategy Session
          </Link>

          <Link
            href="/resources/investor-insights"
            className="inline-flex items-center justify-center rounded-md border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-100"
          >
            Back to Investor Insights
          </Link>
        </div>
      </section>
    </main>
  )
}