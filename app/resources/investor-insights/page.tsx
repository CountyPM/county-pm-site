// app/resources/investor-insights/page.tsx

import InvestorLeadForm from '@/components/forms/InvestorLeadForm'
import Link from 'next/link'

export const metadata = {
  title: 'Investor Insights for Ventura County Rental Owners | County Property Management',
  description:
    'Learn how County Property Management helps Ventura County rental owners reduce conflicts of interest, protect income, screen tenants, reduce vacancy, and make better hold, rent, or sell decisions.',
}

const insights = [
  {
    title: 'Conflict-free maintenance decisions',
    description:
      'Your property manager should not profit from unnecessary repairs or vendor markups. CPM focuses on trusted vendors, fair pricing, and decisions that protect the owner’s bottom line.',
  },
  {
    title: 'Tenant screening as investment protection',
    description:
      'The tenant you place determines rent reliability, property condition, turnover risk, and whether problems escalate. Screening is one of the most important financial decisions in property management.',
  },
  {
    title: 'Vacancy reduction and NOI',
    description:
      'Every day a unit sits vacant is income you do not recover. CPM moves quickly from notice to assessment, make-ready, marketing, and showings to reduce avoidable vacancy loss.',
  },
  {
    title: 'Transparent owner reporting through AppFolio',
    description:
      'Owners should have access to financial reports, rent collection status, and year-end records without waiting for a callback. CPM uses AppFolio to keep property information accessible.',
  },
  {
    title: 'Direct broker-level management',
    description:
      'CPM is intentionally sized so owners are not handed off to a rotating cast of junior coordinators. You work directly with experienced Ventura County property management leadership.',
  },
]

export default function InvestorInsightsPage() {
  return (
    <main className="bg-white text-neutral-950">
      <section className="border-b border-neutral-200 bg-neutral-950 text-white">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24 lg:px-8">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-400">
            Investor Insights
          </p>

          <div className="max-w-3xl">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              What Good Property Management Actually Looks Like
            </h1>

            <p className="mt-6 text-lg leading-8 text-neutral-300">
              For Ventura County rental owners evaluating management, switching
              managers, or deciding whether to hold, rent, or sell.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/property-strategy-session"
                className="inline-flex items-center justify-center rounded-md bg-white px-6 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200"
              >
                Schedule a Property Strategy Session
              </Link>

              <a
                href="#investor-insights"
                className="inline-flex items-center justify-center rounded-md border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Get Investor Insights
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Built for owners
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">
              Property management should protect the asset, not just process the rent.
            </h2>
          </div>

          <div className="space-y-5 text-base leading-8 text-neutral-700">
            <p>
              Rental ownership decisions are rarely simple. Some owners are
              deciding whether to keep a long-held property. Others are comparing
              management companies, preparing for a vacancy, or wondering whether
              their current manager is truly protecting their investment.
            </p>

            <p>
              County Property Management helps Ventura County owners look at the
              full picture: tenant quality, vacancy risk, maintenance decisions,
              financial reporting, market timing, and long-term asset value.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
            What matters
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">
            Five areas where the right manager can change the outcome
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {insights.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-xl font-semibold text-neutral-950">
                {item.title}
              </h3>
              <p className="mt-4 text-base leading-7 text-neutral-700">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="investor-insights"
        className="border-y border-neutral-200 bg-neutral-50"
      >
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Get investor insights
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">
              Receive practical guidance for owning rental property in Ventura County.
            </h2>

            <p className="mt-5 text-base leading-8 text-neutral-700">
              This investor series covers management conflicts of interest,
              tenant screening, vacancy reduction, owner reporting, and the
              decisions that affect long-term rental performance.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <InvestorLeadForm />
          </div>
        </div>
      </section>

      <section className="bg-neutral-950 text-white">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-400">
            Ready to talk through your property?
          </p>
          <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Schedule a Property Strategy Session with County Property Management.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-neutral-300">
            If you are deciding whether to rent, sell, hold, switch managers, or
            improve the performance of a rental property, CPM can help you think
            through the options.
          </p>

          <div className="mt-8">
            <Link
              href="/property-strategy-session"
              className="inline-flex items-center justify-center rounded-md bg-white px-6 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200"
            >
              Schedule a Property Strategy Session
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}