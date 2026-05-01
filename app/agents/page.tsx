export default function AgentsPage() {
  return (
    <main>
      <section className="bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Agent Relationships
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--cpm-text)] md:text-6xl">
            A trusted property management partner for real estate agents.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--cpm-muted)]">
            County Property Management works with agents who want a reliable
            place to refer clients needing property management, while preserving
            the long-term relationship and future listing opportunity.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="/agent-referral-partners"
              className="rounded btn-primary px-6 py-3 text-white"
            >
              Explore Referral Partner Program
            </a>

            <a
              href="/contact"
              className="rounded border border-gray-300 px-6 py-3 text-[var(--cpm-text)]"
            >
              Contact CPM
            </a>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-center text-3xl font-semibold text-[var(--cpm-text)]">
            Why agents refer to County Property Management
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="cpm-card rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-[var(--cpm-text)]">
                Protect the relationship
              </h3>
              <p className="mt-3 text-[var(--cpm-muted)]">
                Refer clients needing management without losing the long-term
                connection or future listing opportunity.
              </p>
            </div>

            <div className="cpm-card rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-[var(--cpm-text)]">
                Create a safe referral path
              </h3>
              <p className="mt-3 text-[var(--cpm-muted)]">
                Give owners a trusted property management option when they are
                not ready to sell or need flexibility first.
              </p>
            </div>

            <div className="cpm-card rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-[var(--cpm-text)]">
                Expand lifetime value
              </h3>
              <p className="mt-3 text-[var(--cpm-muted)]">
                Today’s management referral can become tomorrow’s listing when
                the owner decides the time is right to sell.
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
                Ideal referral situations
              </h2>

              <ul className="mt-8 space-y-4 text-[var(--cpm-muted)]">
                <li>• An owner is relocating and not ready to sell</li>
                <li>• A listing expired and the owner may rent until conditions improve</li>
                <li>• A client inherited property and needs guidance</li>
                <li>• An equity-rich owner wants income options before selling</li>
                <li>• A seller needs more time before making a final move</li>
              </ul>
            </div>

            <div className="cpm-card rounded-2xl p-8">
              <h3 className="text-2xl font-semibold text-[var(--cpm-text)]">
                How the relationship works
              </h3>

              <ol className="mt-6 space-y-4 text-[var(--cpm-muted)]">
                <li>1. The agent refers the owner to County Property Management.</li>
                <li>2. CPM helps evaluate whether the property should be rented, sold, or held.</li>
                <li>3. If management is the right move, CPM supports the client operationally.</li>
                <li>4. If the owner later decides to sell, the referring agent remains part of the relationship.</li>
              </ol>

              <a
                href="/agent-referral-partners"
                className="mt-8 inline-block rounded btn-primary px-6 py-3 text-white"
              >
                Learn About Referral Partners
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <div className="rounded-3xl border border-[var(--cpm-border)] bg-[var(--cpm-surface)] p-10 text-center">
            <h2 className="text-3xl font-semibold text-[var(--cpm-text)]">
              Give your clients a better option when selling is not the only path.
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[var(--cpm-muted)]">
              The referral model is designed to support both the owner and the
              agent relationship. Instead of forcing every client into a sale,
              CPM helps create a strategic path that fits the owner’s timing and goals.
            </p>

            <a
              href="/agent-referral-partners"
              className="mt-8 inline-block rounded btn-primary px-6 py-3 text-white"
            >
              View Referral Partner Program
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}