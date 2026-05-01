export default function OwnersPage() {
  return (
    <main>
      <section className="bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            For Ventura County Property Owners
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--cpm-text)] md:text-6xl">
            Advisory-first guidance for owners deciding what to do next.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--cpm-muted)]">
            Whether you are thinking about renting, selling, or holding your
            property, County Property Management is being built to help you
            evaluate the right move before you commit.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <a
              href="/property-strategy-session"
              className="rounded btn-primary px-5 py-3 text-white"
            >
              Book Property Strategy Session
            </a>

            <a
              href="/property-management"
              className="rounded border border-gray-300 px-5 py-3 text-[var(--cpm-text)]"
            >
              Explore Property Management
            </a>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-page)]">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-16 md:grid-cols-3">
          <div className="cpm-card rounded-2xl p-6">
            <h2 className="text-2xl font-semibold text-[var(--cpm-text)]">Pre-Movers</h2>
            <p className="mt-3 text-[var(--cpm-muted)]">
              Owners preparing to relocate who want to compare selling now
              versus converting the property into a rental.
            </p>
          </div>

          <div className="cpm-card rounded-2xl p-6">
            <h2 className="text-2xl font-semibold text-[var(--cpm-text)]">
              Long-Time Owners
            </h2>
            <p className="mt-3 text-[var(--cpm-muted)]">
              Owners with strong equity who want to weigh income, flexibility,
              timing, and long-term value carefully.
            </p>
          </div>

          <div className="cpm-card rounded-2xl p-6">
            <h2 className="text-2xl font-semibold text-[var(--cpm-text)]">
              Hold or Wait Scenarios
            </h2>
            <p className="mt-3 text-[var(--cpm-muted)]">
              Owners who are not ready to act immediately and want a measured
              plan instead of a rushed decision.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}