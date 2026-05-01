export default function TenantHomebuyerPage() {
  return (
    <main>
      <section className="bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Tenant to Homebuyer Path
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--cpm-text)] md:text-6xl">
            Thinking about buying a home in the future?
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--cpm-muted)]">
            County Property Management helps tenants explore what homeownership
            could look like by providing education, guidance, and introductions
            to trusted real estate professionals in Ventura County.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="/contact"
              className="rounded btn-primary px-6 py-3 text-white"
            >
              Ask About Homeownership Options
            </a>

            <a
              href="/agents"
              className="rounded border border-gray-300 px-6 py-3 text-[var(--cpm-text)]"
            >
              Meet Our Trusted Agent Network
            </a>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-center text-3xl font-semibold text-[var(--cpm-text)]">
            Buying a home may be closer than you think
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="cpm-card rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-[var(--cpm-text)]">
                Start with education
              </h3>
              <p className="mt-3 text-[var(--cpm-muted)]">
                Learn the basic steps involved in moving from renting to buying
                without pressure or rushed decisions.
              </p>
            </div>

            <div className="cpm-card rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-[var(--cpm-text)]">
                Understand your options
              </h3>
              <p className="mt-3 text-[var(--cpm-muted)]">
                Explore what timing, budget, financing, and local market
                conditions may mean for your next step.
              </p>
            </div>

            <div className="cpm-card rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-[var(--cpm-text)]">
                Connect with trusted professionals
              </h3>
              <p className="mt-3 text-[var(--cpm-muted)]">
                Get introduced to vetted real estate agents who can help you
                move forward when you are ready.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-surface)]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="grid gap-10 md:grid-cols-2 md:items-start">
            <div>
              <h2 className="text-3xl font-semibold text-[var(--cpm-text)]">
                Good reasons to start exploring now
              </h2>

              <ul className="mt-8 space-y-4 text-[var(--cpm-muted)]">
                <li>• You want to understand what buying might look like in the next 6–24 months</li>
                <li>• You want clarity before making a major financial decision</li>
                <li>• You want a trusted introduction instead of a cold sales process</li>
                <li>• You are curious whether staying in Ventura County as an owner is realistic</li>
                <li>• You want to plan ahead rather than wait until the last minute</li>
              </ul>
            </div>

            <div className="cpm-card rounded-2xl p-8">
              <h3 className="text-2xl font-semibold text-[var(--cpm-text)]">
                What this page is for
              </h3>

              <p className="mt-4 text-[var(--cpm-muted)]">
                This is not a high-pressure sales page. It is a starting point
                for tenants who want education, better information, and a path
                toward future ownership if the timing is right.
              </p>

              <a
                href="/contact"
                className="mt-8 inline-block rounded btn-primary px-6 py-3 text-white"
              >
                Start the Conversation
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
              Want to compare renting versus buying with your own numbers?
            </h2>

            <p className="mt-4 text-lg leading-8 text-[var(--cpm-muted)]">
              Use the Rent vs Buy Calculator to estimate monthly ownership costs,
              long-term financial differences, and how timing may affect the decision.
            </p>

            <div className="mt-8">
              <a
                href="/tenant-homebuyer/rent-vs-buy-calculator"
                className="rounded btn-primary px-6 py-3 text-white transition hover:opacity-90"
              >
                Open the Calculator
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <div className="rounded-3xl border border-[var(--cpm-border)] bg-[var(--cpm-surface)] p-10 text-center">
            <h2 className="text-3xl font-semibold text-[var(--cpm-text)]">
              When you are ready, we can help you take the next step.
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[var(--cpm-muted)]">
              County Property Management can help guide you toward the right
              next conversation and connect you with trusted local professionals
              when buying becomes the right move.
            </p>

            <a
              href="/contact"
              className="mt-8 inline-block rounded btn-primary px-6 py-3 text-white"
            >
              Contact CPM
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}