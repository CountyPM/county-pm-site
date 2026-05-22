export default function PropertyManagementPage() {
  return (
    <main>
      <section className="bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Ventura County Property Management
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--cpm-text)] md:text-6xl">
            Property management with strategy, not just rent collection.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--cpm-muted)]">
            County Property Management is being positioned as a real estate
            asset advisor for owners who want more than basic operations. The
            goal is to help owners decide whether management, sale timing, or a
            hold strategy is the best next move.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <a
              href="/property-strategy-session"
              className="rounded btn-primary px-5 py-3 text-white"
            >
              Book Property Strategy Session
            </a>

            <a
              href="/owners"
              className="rounded border border-gray-300 px-5 py-3 text-[var(--cpm-text)]"
            >
              Explore Owner Options
            </a>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <div className="cpm-card rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-[var(--cpm-text)]">
                Leasing and marketing support
              </h2>
              <p className="mt-3 text-[var(--cpm-muted)]">
                Present the property professionally and attract qualified tenant
                interest.
              </p>
            </div>

            <div className="cpm-card rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-[var(--cpm-text)]">
                Tenant screening and placement
              </h2>
              <p className="mt-3 text-[var(--cpm-muted)]">
                Move from inquiry to placement with clear processes and a more
                stable management experience.
              </p>
            </div>

            <div className="cpm-card rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-[var(--cpm-text)]">
                Maintenance coordination
              </h2>
              <p className="mt-3 text-[var(--cpm-muted)]">
                Coordinate requests and protect the owner experience without
                turning every issue into chaos.
              </p>
            </div>

            <div className="cpm-card rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-[var(--cpm-text)]">
                Owner communication and reporting
              </h2>
              <p className="mt-3 text-[var(--cpm-muted)]">
                Keep owners informed with a more professional and organized
                operating rhythm.
              </p>
            </div>

            <div className="cpm-card rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-[var(--cpm-text)]">
                Rent collection and oversight
              </h2>
              <p className="mt-3 text-[var(--cpm-muted)]">
                Support the financial side of management while keeping the
                bigger ownership picture in view.
              </p>
            </div>

            <div className="cpm-card rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-[var(--cpm-text)]">
                Long-term property guidance
              </h2>
              <p className="mt-3 text-[var(--cpm-muted)]">
                Help owners decide whether renting still serves their goals or
                whether another move makes more sense.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* INVESTOR SECTION */}
      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            For Property Investors
          </p>

          <h2 className="mt-4 text-3xl font-bold tracking-tight text-[var(--cpm-text)] md:text-4xl">
            How CPM differs for investors evaluating management quality.
          </h2>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--cpm-muted)]">
            If you&rsquo;re evaluating a property manager &mdash; or questioning
            whether your current one is truly working in your interest &mdash;
            the questions you ask matter. CPM has put together a free letter
            series covering the conflicts of interest, hidden fees, and process
            gaps most owners never learn about until they cost real money.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <a
              href="/resources/investor-insights"
              className="rounded btn-primary px-5 py-3 text-white"
            >
              Access the Investor Series
            </a>

            <a
              href="/blog/most-property-managers-work-for-themselves"
              className="rounded border border-gray-300 px-5 py-3 text-[var(--cpm-text)]"
            >
              Read the Anchor Article
            </a>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <div className="cpm-card rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-[var(--cpm-text)]">
                No vendor conflicts of interest
              </h3>
              <p className="mt-3 text-[var(--cpm-muted)]">
                CPM has no ownership stake in any maintenance vendor. Repair
                decisions are made on your behalf, not as a revenue opportunity
                for the management company.
              </p>
            </div>

            <div className="cpm-card rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-[var(--cpm-text)]">
                No junior agent runaround
              </h3>
              <p className="mt-3 text-[var(--cpm-muted)]">
                You work with Richard Miller directly &mdash; not a rotating
                cast of coordinators. Forty years of Ventura County market
                experience, available by phone.
              </p>
            </div>

            <div className="cpm-card rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-[var(--cpm-text)]">
                No surprise add-on fees
              </h3>
              <p className="mt-3 text-[var(--cpm-muted)]">
                Transparent management agreement. No inspection up-charges, no
                re-letting fees, no lease renewal extractions stacked on top of
                the base rate.
              </p>
            </div>

            <div className="cpm-card rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-[var(--cpm-text)]">
                24/7 owner reporting
              </h3>
              <p className="mt-3 text-[var(--cpm-muted)]">
                AppFolio-powered owner portal with always-on access to financial
                statements, rent collection records, and year-end tax accounting
                &mdash; no callbacks required.
              </p>
            </div>

            <div className="cpm-card rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-[var(--cpm-text)]">
                Forty years of process
              </h3>
              <p className="mt-3 text-[var(--cpm-muted)]">
                Never lost an eviction for non-payment of rent &mdash; because
                screening, documentation, and process are handled correctly from
                day one.
              </p>
            </div>

            <div className="cpm-card rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-[var(--cpm-text)]">
                Deliberately sized for service
              </h3>
              <p className="mt-3 text-[var(--cpm-muted)]">
                Approximately 140 units under management &mdash; the size where
                personal attention is still possible. Not a portfolio buried in
                a coordinator&rsquo;s queue.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* /INVESTOR SECTION */}

      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-surface)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-3xl font-semibold text-[var(--cpm-text)]">
              Why owners choose CPM
            </h2>
            <p className="mt-4 text-lg leading-8 text-[var(--cpm-muted)]">
              Many owners do not just need someone to manage rent and
              maintenance. They need a trusted local advisor who understands how
              property decisions affect long-term flexibility, timing, and
              value.
            </p>
          </div>

          <div className="cpm-card rounded-2xl p-8">
            <h3 className="text-2xl font-semibold text-[var(--cpm-text)]">
              Advisory-first positioning
            </h3>
            <p className="mt-4 text-[var(--cpm-muted)]">
              The site is being built to support a consultative model:
              management when renting is the right move, referrals when selling
              is better, and ongoing guidance when holding makes the most sense.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}