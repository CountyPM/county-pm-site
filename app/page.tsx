export default function HomePage() {
  return (
    <main>
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                Ventura County Real Estate Asset Advisor
              </p>

              <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
                Rent, sell, or hold? Start with the right strategy.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
                County Property Management helps property owners evaluate
                whether a property should be rented, sold, or held based on
                timing, equity, flexibility, and long-term goals.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a
                  href="/property-strategy-session"
                  className="rounded bg-black px-5 py-3 text-white"
                >
                  Book Property Strategy Session
                </a>

                <a
                  href="/property-management"
                  className="rounded border border-gray-300 px-5 py-3 text-gray-900"
                >
                  Explore Property Management
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
                Richard Miller
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-gray-900">
                Trusted Ventura County guidance backed by 40+ years of
                experience.
              </h2>
              <p className="mt-4 text-base leading-7 text-gray-600">
                The new County Property Management site is built around a
                consultative decision framework designed to help owners explore
                whether renting, selling, or holding is the right move.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="text-2xl font-semibold text-gray-900">Rent</h3>
              <p className="mt-3 text-gray-600">
                Explore whether your property can generate income while
                preserving flexibility.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="text-2xl font-semibold text-gray-900">Sell</h3>
              <p className="mt-3 text-gray-600">
                Review whether now is the right time to unlock equity and make
                a clean transition.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="text-2xl font-semibold text-gray-900">Hold</h3>
              <p className="mt-3 text-gray-600">
                Keep your options open and build a plan that aligns with your
                longer-term goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              Quick Access
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-gray-900">
              Preserve the operational functions people already expect.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
            <a
              href="/available-rentals"
              className="rounded-2xl border border-gray-200 bg-gray-50 p-6 hover:bg-gray-100"
            >
              <h3 className="text-xl font-semibold text-gray-900">
                Available Rentals
              </h3>
              <p className="mt-3 text-gray-600">
                Browse currently available rental properties.
              </p>
            </a>

            <a
              href="/tenant-portal"
              className="rounded-2xl border border-gray-200 bg-gray-50 p-6 hover:bg-gray-100"
            >
              <h3 className="text-xl font-semibold text-gray-900">
                Tenant Portal
              </h3>
              <p className="mt-3 text-gray-600">
                Access rent payments, account information, and requests.
              </p>
            </a>

            <a
              href="/owner-portal"
              className="rounded-2xl border border-gray-200 bg-gray-50 p-6 hover:bg-gray-100"
            >
              <h3 className="text-xl font-semibold text-gray-900">
                Owner Portal
              </h3>
              <p className="mt-3 text-gray-600">
                Access statements, updates, and owner-side information.
              </p>
            </a>

            <a
              href="/maintenance-requests"
              className="rounded-2xl border border-gray-200 bg-gray-50 p-6 hover:bg-gray-100"
            >
              <h3 className="text-xl font-semibold text-gray-900">
                Maintenance Requests
              </h3>
              <p className="mt-3 text-gray-600">
                Submit and manage maintenance-related communication.
              </p>
            </a>
            <a
              href="/reviews"
              className="rounded-2xl border border-gray-200 bg-gray-50 p-6 hover:bg-gray-100"
>
              <h3 className="text-xl font-semibold text-gray-900">
                Reviews
              </h3>
              <p className="mt-3 text-gray-600">
                Share feedback and help us improve the client experience.
              </p>
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}