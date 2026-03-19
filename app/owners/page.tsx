export default function OwnersPage() {
  return (
    <main>
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            For Ventura County Property Owners
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
            Advisory-first guidance for owners deciding what to do next.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-600">
            Whether you are thinking about renting, selling, or holding your
            property, County Property Management is being built to help you
            evaluate the right move before you commit.
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
      </section>

      <section className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-16 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-2xl font-semibold text-gray-900">Pre-Movers</h2>
            <p className="mt-3 text-gray-600">
              Owners preparing to relocate who want to compare selling now
              versus converting the property into a rental.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Long-Time Owners
            </h2>
            <p className="mt-3 text-gray-600">
              Owners with strong equity who want to weigh income, flexibility,
              timing, and long-term value carefully.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Hold or Wait Scenarios
            </h2>
            <p className="mt-3 text-gray-600">
              Owners who are not ready to act immediately and want a measured
              plan instead of a rushed decision.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}