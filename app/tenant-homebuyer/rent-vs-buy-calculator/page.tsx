import Link from 'next/link'
import RentVsBuyCalculator from '@/components/calculators/RentVsBuyCalculator'

export default function RentVsBuyCalculatorPage() {
  return (
    <main>
      <section className="bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              Decision Tool
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--cpm-text)] md:text-6xl">
              Should you keep renting or start building equity?
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--cpm-muted)]">
              Use this calculator to compare the financial side of renting
              versus buying over time. Then use the result as a starting point
              for a more practical conversation about your budget, timeline, and
              next step.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#calculator"
                className="rounded btn-primary px-6 py-3 text-white transition hover:opacity-90"
              >
                Jump to Calculator
              </a>

              <Link
                href="/tenant-homebuyer"
                className="rounded border border-gray-300 px-6 py-3 text-[var(--cpm-text)] transition hover:bg-[var(--cpm-page)]"
              >
                Back to Tenant Homebuyer
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="calculator" className="border-t border-[var(--cpm-border)] bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <RentVsBuyCalculator />
        </div>
      </section>

      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-surface)]">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <div className="rounded-3xl border border-[var(--cpm-border)] bg-[var(--cpm-page)] p-10">
            <h2 className="text-3xl font-semibold text-[var(--cpm-text)]">
              What this calculator can help you estimate
            </h2>

            <ul className="mt-6 space-y-3 text-[var(--cpm-muted)]">
              <li>• A rough financial comparison between renting and buying</li>
              <li>• How monthly ownership costs may compare with current rent</li>
              <li>• How cash needed up front changes the decision</li>
              <li>• Whether buying starts to make more sense over your timeline</li>
            </ul>

            <p className="mt-6 text-sm leading-6 text-gray-500">
              This tool is meant to help you frame the conversation. It does not
              replace lending guidance, tax advice, legal advice, or a
              personalized review of your options.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}