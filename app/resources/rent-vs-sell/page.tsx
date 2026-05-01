import BlogLeadForm from '@/components/forms/BlogLeadForm'

export default function RentVsSellPage() {
  return (
    <main>
      <section className="bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-5xl px-4 py-24 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Free Resource
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--cpm-text)] md:text-6xl">
            Before you sell, ask one bigger question: could this property create
            wealth?
          </h1>

          <p className="mt-6 text-lg leading-8 text-[var(--cpm-muted)]">
            Many owners focus on the immediate decision without evaluating the
            larger opportunity. This guide helps you think through whether your
            property should be converted into cash now or positioned as a
            long-term asset for income, growth, and potentially acquiring
            additional properties over time.
          </p>
        </div>
      </section>

      {/* FEATURED BLOG POST */}
      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-surface)]">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="cpm-card rounded-2xl p-8 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              Featured Article
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--cpm-text)]">
              The Moment the Math Changes
            </h2>

            <p className="mt-3 text-sm text-gray-500">
              By Richard J. Miller • Wealth Building
            </p>

            <p className="mt-6 text-lg leading-8 text-[var(--cpm-muted)]">
              This article explores the moment people realize they are not just
              buying shelter — they are buying time, leverage, and the future
              version of themselves. It reframes ownership as a practical
              wealth-building decision, not just a housing one.
            </p>

            <p className="mt-4 text-lg leading-8 text-[var(--cpm-muted)]">
              It is especially relevant if you are weighing whether to sell a
              property, keep it as a rental, or think more strategically about
              how one property can become the foundation for long-term equity
              growth and future acquisitions.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="/blog/the-moment-the-math-changes"
                className="rounded btn-primary px-6 py-3 text-white transition hover:opacity-90"
              >
                Read the Full Article
              </a>

              <a
                href="#guide"
                className="rounded border border-gray-300 px-6 py-3 transition hover:bg-gray-100"
              >
                Get the Rent vs Sell Guide
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="cpm-card rounded-2xl p-8 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              Interactive Tool
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--cpm-text)]">
              Want a more hands-on estimate?
            </h2>

            <p className="mt-4 text-lg leading-8 text-[var(--cpm-muted)]">
              Use the Rent vs Sell Calculator to compare estimated rental cash flow,
              selling proceeds, and how the two paths may stack up over time.
            </p>

            <div className="mt-8">
              <a
                href="/resources/rent-vs-sell-calculator"
                className="rounded btn-primary px-6 py-3 text-white transition hover:opacity-90"
              >
                Open the Calculator
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="guide" className="border-t border-[var(--cpm-border)] bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-4xl px-4 py-20">
          <div className="cpm-card rounded-2xl p-10">
            <h2 className="text-2xl font-semibold text-[var(--cpm-text)]">
              What you’ll learn
            </h2>

            <p className="mt-4 text-[var(--cpm-muted)]">
              A good decision solves today. A great decision strengthens
              tomorrow. This guide helps you evaluate whether selling is the
              right move now or whether your property may be better positioned
              as part of a longer-term wealth-building strategy.
            </p>

            <ul className="mt-6 space-y-3 text-[var(--cpm-muted)]">
              <li>
                • How to evaluate whether immediate liquidity or long-term
                income potential is the stronger move
              </li>
              <li>
                • When renting may create more flexibility, leverage, and future
                upside
              </li>
              <li>
                • When selling may still be the better financial decision based
                on your timing and goals
              </li>
              <li>
                • How your current property could factor into building toward
                additional real estate opportunities
              </li>
              <li>
                • How to think through equity, cash flow, property condition,
                and management burden more clearly
              </li>
            </ul>

            <div className="mt-10">
              <BlogLeadForm
                title="Get clarity before you commit"
                description="Use this guide to better understand whether your property is best used for liquidity now or long-term wealth creation."
                buttonText="Get the Guide"
                endpoint="/api/lead-magnet"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}