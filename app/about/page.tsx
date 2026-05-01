export default function AboutPage() {
  return (
    <main>
      <section className="bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            About County Property Management
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--cpm-text)] md:text-6xl">
            A property management company built around better owner decisions.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--cpm-muted)]">
            County Property Management is being rebuilt as a Ventura County real
            estate asset advisor. The goal is to help owners evaluate whether a
            property should be rented, sold, or held based on the owner’s
            actual situation.
          </p>
        </div>
      </section>

      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-page)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2">
          <div className="cpm-card rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-[var(--cpm-text)]">
              What makes this model different
            </h2>
            <p className="mt-4 text-[var(--cpm-muted)]">
              Instead of pushing every owner toward one result, the site is
              designed to open a decision conversation. That approach tends to
              create stronger trust and better long-term relationships.
            </p>
          </div>

          <div className="cpm-card rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-[var(--cpm-text)]">
              Built around long-term value
            </h2>
            <p className="mt-4 text-[var(--cpm-muted)]">
              Owners, agents, tenants, and partners each enter the site through
              a specialized funnel intended to support long-term alignment
              rather than one-off transactions.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}