import AppFolioListingsEmbed from '@/components/appfolio/AppFolioListingsEmbed'

export default function AvailableRentalsPage() {
  return (
    <main>
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Ventura County Rentals
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
            Find available rentals in Ventura County.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-600">
            Browse currently available properties below. Listings are powered by
            AppFolio and kept aligned with the County Property Management
            leasing environment.
          </p>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Need help with a rental?
            </h2>
            <p className="mt-3 text-gray-600">
              If you have questions about a property, application steps, or
              availability, call (805) 482-9800 or email cpm@c-p-m.com.
            </p>
          </div>

          <AppFolioListingsEmbed />
        </div>
      </section>
    </main>
  )
}