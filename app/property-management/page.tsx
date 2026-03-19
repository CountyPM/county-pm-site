export default function PropertyManagementPage() {
  return (
    <main>
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Ventura County Property Management
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
            Property management with strategy, not just rent collection.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-600">
            County Property Management is being positioned as a real estate
            asset advisor for owners who want more than basic operations. The
            goal is to help owners decide whether management, sale timing, or a
            hold strategy is the best next move.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <a
              href="/property-strategy-session"
              className="rounded bg-black px-5 py-3 text-white"
            >
              Book Property Strategy Session
            </a>

            <a
              href="/owners"
              className="rounded border border-gray-300 px-5 py-3 text-gray-900"
            >
              Explore Owner Options
            </a>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Leasing and marketing support
              </h2>
              <p className="mt-3 text-gray-600">
                Present the property professionally and attract qualified tenant
                interest.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Tenant screening and placement
              </h2>
              <p className="mt-3 text-gray-600">
                Move from inquiry to placement with clear processes and a more
                stable management experience.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Maintenance coordination
              </h2>
              <p className="mt-3 text-gray-600">
                Coordinate requests and protect the owner experience without
                turning every issue into chaos.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Owner communication and reporting
              </h2>
              <p className="mt-3 text-gray-600">
                Keep owners informed with a more professional and organized
                operating rhythm.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Rent collection and oversight
              </h2>
              <p className="mt-3 text-gray-600">
                Support the financial side of management while keeping the
                bigger ownership picture in view.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Long-term property guidance
              </h2>
              <p className="mt-3 text-gray-600">
                Help owners decide whether renting still serves their goals or
                whether another move makes more sense.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-3xl font-semibold text-gray-900">
              Why owners choose CPM
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              Many owners do not just need someone to manage rent and
              maintenance. They need a trusted local advisor who understands how
              property decisions affect long-term flexibility, timing, and
              value.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8">
            <h3 className="text-2xl font-semibold text-gray-900">
              Advisory-first positioning
            </h3>
            <p className="mt-4 text-gray-600">
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