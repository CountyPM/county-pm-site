import AppFolioListingsEmbed from '@/components/appfolio/AppFolioListingsEmbed'

export default function AvailableRentalsPage() {
  return (
    <main>
      <section className="bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                Ventura County Rental Search
              </p>

              <h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--cpm-text)] md:text-6xl">
                Find available rentals with a clearer, more guided search
                experience.
              </h1>

              <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--cpm-muted)]">
                Browse current rental availability through County Property
                Management’s AppFolio-powered listings. This page is designed to
                make the search process more useful and more transparent, while
                AppFolio remains the live source of listing details,
                availability, and application steps.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href="#rental-search"
                  className="rounded btn-primary px-6 py-3 text-white transition hover:opacity-90"
                >
                  View Available Rentals
                </a>

                <a
                  href="/contact"
                  className="rounded border border-gray-300 px-6 py-3 text-[var(--cpm-text)] transition hover:bg-[var(--cpm-page)]"
                >
                  Contact Leasing Team
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-[var(--cpm-border)] bg-[var(--cpm-page)] p-8">
              <h2 className="text-2xl font-semibold text-[var(--cpm-text)]">
                Quick access
              </h2>

              <div className="mt-6 space-y-4">
                <a
                  href="#rental-search"
                  className="block cpm-card rounded-2xl p-5 transition hover:shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-[var(--cpm-text)]">
                    Browse Listings
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--cpm-muted)]">
                    View current AppFolio listings, pricing, photos, and
                    availability.
                  </p>
                </a>

                <a
                  href="/tenant-portal"
                  className="block cpm-card rounded-2xl p-5 transition hover:shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-[var(--cpm-text)]">
                    Tenant Portal
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--cpm-muted)]">
                    Current residents can access their portal for payments,
                    documents, and account information.
                  </p>
                </a>

                <a
                  href="/contact"
                  className="block cpm-card rounded-2xl p-5 transition hover:shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-[var(--cpm-text)]">
                    Leasing Questions
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--cpm-muted)]">
                    Reach out if you need help understanding a listing or next
                    steps.
                  </p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-center text-3xl font-semibold text-[var(--cpm-text)]">
            Before you begin your search
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-center text-lg leading-8 text-[var(--cpm-muted)]">
            The goal is to make your search easier from the start: understand
            where the live information lives, what to review carefully, and how
            to move forward if a property looks like a fit.
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="rounded-3xl border border-[var(--cpm-border)] bg-[var(--cpm-surface)] p-8">
              <h3 className="text-xl font-semibold text-[var(--cpm-text)]">
                Search live listings
              </h3>
              <p className="mt-3 leading-7 text-[var(--cpm-muted)]">
                The properties below reflect live AppFolio availability and are
                the best place to review current openings.
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--cpm-border)] bg-[var(--cpm-surface)] p-8">
              <h3 className="text-xl font-semibold text-[var(--cpm-text)]">
                Review details carefully
              </h3>
              <p className="mt-3 leading-7 text-[var(--cpm-muted)]">
                Each listing may include photos, rent, deposit information,
                availability, and application-related details directly inside
                the listing system.
              </p>
            </div>

            <div className="rounded-3xl border border-[var(--cpm-border)] bg-[var(--cpm-surface)] p-8">
              <h3 className="text-xl font-semibold text-[var(--cpm-text)]">
                Reach out when needed
              </h3>
              <p className="mt-3 leading-7 text-[var(--cpm-muted)]">
                If you need help understanding a listing, timing, or next steps,
                County Property Management can help direct you.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="rental-search" className="border-t border-[var(--cpm-border)] bg-[var(--cpm-surface)]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="mb-10 overflow-hidden rounded-[2rem] border border-[var(--cpm-border)] bg-gradient-to-br from-gray-50 to-white shadow-sm">
            <div className="grid gap-8 px-8 py-10 md:grid-cols-[1.2fr_0.8fr] md:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                  Live Listings
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--cpm-text)]">
                  Available rentals powered by AppFolio
                </h2>
                <p className="mt-4 max-w-2xl leading-7 text-[var(--cpm-muted)]">
                  The search experience below is connected to County Property
                  Management’s live leasing environment. Availability, pricing,
                  and property-specific details are maintained there so you can
                  review the most current information in one place.
                </p>
              </div>

              <div className="rounded-3xl border border-[var(--cpm-border)] bg-[var(--cpm-surface)] p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-[var(--cpm-text)]">
                  Need help with a property?
                </h3>
                <p className="mt-3 leading-7 text-[var(--cpm-muted)]">
                  Call <strong>(805) 482-9800</strong> or email{' '}
                  <strong>cpm@c-p-m.com</strong> if you have questions about a
                  listing, availability, or next steps.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <a
                    href="/contact"
                    className="rounded btn-primary px-4 py-2 text-sm text-white transition hover:opacity-90"
                  >
                    Contact CPM
                  </a>
                  <a
                    href="/tenant-portal"
                    className="rounded border border-gray-300 px-4 py-2 text-sm text-[var(--cpm-text)] transition hover:bg-[var(--cpm-page)]"
                  >
                    Tenant Portal
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-[var(--cpm-border)] bg-[var(--cpm-surface)] shadow-sm">
            <div className="border-b border-[var(--cpm-border)] bg-[var(--cpm-page)] px-6 py-4">
              <p className="text-sm text-[var(--cpm-muted)]">
                Listings are displayed through the secure AppFolio widget below.
              </p>
            </div>

            <div className="bg-[var(--cpm-surface)] p-4 md:p-6">
              <AppFolioListingsEmbed />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <div className="rounded-[2rem] border border-[var(--cpm-border)] bg-[var(--cpm-surface)] p-10 text-center shadow-sm">
            <h2 className="text-3xl font-semibold text-[var(--cpm-text)]">
              Not finding the right fit yet?
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[var(--cpm-muted)]">
              Rental availability changes over time. If you have questions about
              the current listings, the leasing process, or what to do next,
              County Property Management can help point you in the right
              direction.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a
                href="/contact"
                className="rounded btn-primary px-6 py-3 text-white transition hover:opacity-90"
              >
                Contact CPM
              </a>

              <a
                href="/tenant-portal"
                className="rounded border border-gray-300 px-6 py-3 text-[var(--cpm-text)] transition hover:bg-[var(--cpm-page)]"
              >
                Tenant Portal
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}