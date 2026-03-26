import AppFolioListingsEmbed from '@/components/appfolio/AppFolioListingsEmbed'

export default function AvailableRentalsPage() {
  return (
    <main>
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Ventura County Rental Search
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
            Find available rental properties in Ventura County.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-600">
            Browse current rental availability through County Property
            Management’s AppFolio-powered listings. This page is designed to
            make the search experience clearer, while AppFolio remains the live
            source of property availability and listing details.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#rental-search"
              className="rounded bg-black px-6 py-3 text-white"
            >
              View Available Rentals
            </a>

            <a
              href="/contact"
              className="rounded border border-gray-300 px-6 py-3 text-gray-900"
            >
              Contact Leasing Team
            </a>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-center text-3xl font-semibold text-gray-900">
            Before you begin your search
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <h3 className="text-xl font-semibold text-gray-900">
                Search live listings
              </h3>
              <p className="mt-3 text-gray-600">
                The properties below reflect live AppFolio availability and are
                the best place to review current openings.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <h3 className="text-xl font-semibold text-gray-900">
                Review details carefully
              </h3>
              <p className="mt-3 text-gray-600">
                Each listing may include photos, rent, availability, and
                application-related details directly inside the listing system.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <h3 className="text-xl font-semibold text-gray-900">
                Reach out with questions
              </h3>
              <p className="mt-3 text-gray-600">
                If you need help understanding a listing or next steps, County
                Property Management can help direct you.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="rental-search" className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="mb-8 rounded-3xl border border-gray-200 bg-gray-50 p-8">
            <div className="grid gap-8 md:grid-cols-2 md:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                  Live Listings
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-gray-900">
                  Available rentals powered by AppFolio
                </h2>
                <p className="mt-4 text-gray-600">
                  The search experience below is connected to County Property
                  Management’s live leasing environment. Availability, listing
                  details, and updates are maintained there.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Need help with a property?
                </h3>
                <p className="mt-3 text-gray-600">
                  Call <strong>(805) 482-9800</strong> or email{' '}
                  <strong>cpm@c-p-m.com</strong> if you have questions about a
                  listing, availability, or next steps.
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <p className="text-sm text-gray-600">
                Listings are displayed through the secure AppFolio widget below.
              </p>
            </div>

            <div className="p-4 md:p-6">
              <AppFolioListingsEmbed />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center">
            <h2 className="text-3xl font-semibold text-gray-900">
              Not finding the right fit yet?
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-600">
              Rental availability changes over time. If you have questions about
              the current listings or the application process, County Property
              Management can help point you in the right direction.
            </p>

            <a
              href="/contact"
              className="mt-8 inline-block rounded bg-black px-6 py-3 text-white"
            >
              Contact CPM
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}