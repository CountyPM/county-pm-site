export default function RentVsSellPage() {
  return (
    <main>
      <section className="bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Property Decision Framework
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--cpm-text)] md:text-6xl">
            Should you rent your property or sell it?
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--cpm-muted)]">
            Many Ventura County property owners are not ready to commit to one
            path immediately. The right decision depends on your timing, equity,
            income goals, flexibility, and long-term plans.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="/property-strategy-session"
              className="rounded btn-primary px-6 py-3 text-white"
            >
              Book Property Strategy Session
            </a>

            <a
              href="/contact"
              className="rounded border border-gray-300 px-6 py-3 text-[var(--cpm-text)]"
            >
              Ask a Question
            </a>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-center text-3xl font-semibold text-[var(--cpm-text)]">
            Rent vs Sell: how to think about the tradeoff
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <div className="cpm-card rounded-2xl p-8">
              <h3 className="text-2xl font-semibold text-[var(--cpm-text)]">
                Renting may make sense if...
              </h3>

              <ul className="mt-6 space-y-4 text-[var(--cpm-muted)]">
                <li>• You want to generate income instead of selling today</li>
                <li>• You may relocate but want to keep the property</li>
                <li>• You believe the market may improve later</li>
                <li>• You want flexibility and a future sale option</li>
                <li>• You are not ready to part with the asset permanently</li>
              </ul>
            </div>

            <div className="cpm-card rounded-2xl p-8">
              <h3 className="text-2xl font-semibold text-[var(--cpm-text)]">
                Selling may make sense if...
              </h3>

              <ul className="mt-6 space-y-4 text-[var(--cpm-muted)]">
                <li>• You want to unlock equity now</li>
                <li>• You do not want the responsibilities of ownership</li>
                <li>• The property no longer fits your long-term plans</li>
                <li>• You want a simpler transition into your next move</li>
                <li>• The current economics do not support renting well</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-surface)]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-center text-3xl font-semibold text-[var(--cpm-text)]">
            Key questions to ask before deciding
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            <div className="cpm-card rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-[var(--cpm-text)]">Timing</h3>
              <p className="mt-3 text-[var(--cpm-muted)]">
                Do you need a quick exit, or can you keep options open?
              </p>
            </div>

            <div className="cpm-card rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-[var(--cpm-text)]">Equity</h3>
              <p className="mt-3 text-[var(--cpm-muted)]">
                Would selling now unlock capital you need for your next move?
              </p>
            </div>

            <div className="cpm-card rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-[var(--cpm-text)]">Income</h3>
              <p className="mt-3 text-[var(--cpm-muted)]">
                Would the rental income justify keeping the property?
              </p>
            </div>

            <div className="cpm-card rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-[var(--cpm-text)]">Flexibility</h3>
              <p className="mt-3 text-[var(--cpm-muted)]">
                Do you want to preserve the option to sell later if conditions improve?
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <div className="rounded-3xl border border-[var(--cpm-border)] bg-[var(--cpm-surface)] p-10 text-center">
            <h2 className="text-3xl font-semibold text-[var(--cpm-text)]">
              The right answer depends on your situation, not a generic formula.
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[var(--cpm-muted)]">
              Some owners are best served by renting for income and flexibility.
              Others are better off selling and redeploying equity. The purpose
              of the Property Strategy Session is to help you evaluate the right
              path before committing.
            </p>

            <a
              href="/property-strategy-session"
              className="mt-8 inline-block rounded btn-primary px-6 py-3 text-white"
            >
              Book Property Strategy Session
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}