import Link from 'next/link'
import RentVsSellCalculator from '@/components/calculators/RentVsSellCalculator'

export default function RentVsSellCalculatorPage() {
  return (
    <main>
      <section className="bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              Decision Tool
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--cpm-text)] md:text-6xl">
              Compare renting and selling with a clearer financial starting point
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--cpm-muted)]">
              Use this calculator to estimate rental cash flow, likely selling
              proceeds, and how the two paths may compare over time. Then use
              that estimate as a starting point for a more tailored review.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#calculator"
                className="rounded btn-primary px-6 py-3 text-white transition hover:opacity-90"
              >
                Jump to Calculator
              </a>

              <Link
                href="/resources/rent-vs-sell"
                className="rounded border border-gray-300 px-6 py-3 text-[var(--cpm-text)] transition hover:bg-[var(--cpm-page)]"
              >
                Get the Rent vs Sell Guide
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="calculator" className="border-t border-[var(--cpm-border)] bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <RentVsSellCalculator />
        </div>
      </section>

      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-surface)]">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <div className="rounded-3xl border border-[var(--cpm-border)] bg-[var(--cpm-page)] p-10">
            <h2 className="text-3xl font-semibold text-[var(--cpm-text)]">
              What this calculator can help you estimate
            </h2>

            <ul className="mt-6 space-y-3 text-[var(--cpm-muted)]">
              <li>• Estimated monthly rental cash flow</li>
              <li>• Estimated proceeds if sold now</li>
              <li>• A rough multi-year comparison between the two paths</li>
              <li>
                • Whether a more detailed custom rent analysis is worth
                requesting
              </li>
            </ul>

            <p className="mt-6 text-sm leading-6 text-gray-500">
              This tool is meant to be a practical starting point. It does not
              replace a property-specific rent analysis, tax advice, legal
              advice, or an appraisal.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}