export default function AboutPage() {
  return (
    <main>
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            About County Property Management
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
            A property management company built around better owner decisions.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-600">
            County Property Management is being rebuilt as a Ventura County real
            estate asset advisor. The goal is to help owners evaluate whether a
            property should be rented, sold, or held based on the owner’s
            actual situation.
          </p>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-8">
            <h2 className="text-2xl font-semibold text-gray-900">
              What makes this model different
            </h2>
            <p className="mt-4 text-gray-600">
              Instead of pushing every owner toward one result, the site is
              designed to open a decision conversation. That approach tends to
              create stronger trust and better long-term relationships.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-8">
            <h2 className="text-2xl font-semibold text-gray-900">
              Built around long-term value
            </h2>
            <p className="mt-4 text-gray-600">
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