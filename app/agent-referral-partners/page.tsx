export default function AgentReferralPartnersPage() {
  return (
    <main>
      <section className="bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Referral Partner Program
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--cpm-text)] md:text-6xl">
            A referral structure built for long-term trust.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--cpm-muted)]">
            County Property Management partners with real estate agents who want
            a dependable property management resource, timely communication, and
            a relationship model that respects the referring agent.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="/contact"
              className="rounded btn-primary px-6 py-3 text-white"
            >
              Contact About Partnership
            </a>

            <a
              href="/agents"
              className="rounded border border-gray-300 px-6 py-3 text-[var(--cpm-text)]"
            >
              Back to Agents Page
            </a>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="cpm-card rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-[var(--cpm-text)]">
                What referral partners can expect
              </h2>

              <ul className="mt-6 space-y-4 text-[var(--cpm-muted)]">
                <li>• Responsive communication</li>
                <li>• Clear handling of owner needs and expectations</li>
                <li>• A consultative rent / sell / hold framework</li>
                <li>• Support for clients who are not ready to sell immediately</li>
                <li>• A structured relationship that encourages future collaboration</li>
              </ul>
            </div>

            <div className="cpm-card rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-[var(--cpm-text)]">
                Ideal partner profile
              </h2>

              <ul className="mt-6 space-y-4 text-[var(--cpm-muted)]">
                <li>• Agents who do not provide property management directly</li>
                <li>• Agents who want a trusted referral destination for owners</li>
                <li>• Agents who value responsiveness and long-term client care</li>
                <li>• Agents who want to preserve future listing relationships</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-surface)]">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <div className="rounded-3xl border border-[var(--cpm-border)] bg-[var(--cpm-page)] p-10">
            <h2 className="text-3xl font-semibold text-[var(--cpm-text)]">
              Why this model works
            </h2>

            <p className="mt-6 text-lg leading-8 text-[var(--cpm-muted)]">
              Many owners are hesitant to sell immediately, but open to renting
              if the economics make sense. This creates a strong opportunity for
              agents to serve clients better by introducing them to a trusted
              management partner instead of forcing a premature sale decision.
            </p>

            <p className="mt-6 text-lg leading-8 text-[var(--cpm-muted)]">
              Over time, this creates stronger owner relationships and a more
              reliable referral pipeline for both sides.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--cpm-border)] btn-primary">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center text-white">
          <h2 className="text-3xl font-semibold">
            Interested in becoming a referral partner?
          </h2>

          <p className="mt-4 text-gray-300">
            Start a conversation with County Property Management about how the
            referral relationship can work for your clients and your business.
          </p>

          <a
            href="/contact"
            className="mt-8 inline-block rounded bg-[var(--cpm-surface)] px-6 py-3 text-[var(--cpm-page)]"
          >
            Contact CPM
          </a>
        </div>
      </section>
    </main>
  )
}