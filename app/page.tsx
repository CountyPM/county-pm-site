export default function HomePage() {
  return (
    <main>

      {/* HERO SECTION */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Ventura County Real Estate Advisor
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
            Not sure whether to sell, rent, or hold your property?
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-600">
            County Property Management helps property owners evaluate the best
            strategy based on timing, equity, and long-term goals.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="/property-strategy-session"
              className="rounded bg-black px-6 py-3 text-white"
            >
              Book Property Strategy Session
            </a>

            <a
              href="/rent-vs-sell"
              className="rounded border border-gray-300 px-6 py-3"
            >
              Explore Rent vs Sell
            </a>
          </div>
        </div>
      </section>

      {/* DECISION FRAMEWORK */}
      <section className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h2 className="text-3xl font-semibold text-gray-900">
            Every property has three possible paths
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border bg-white p-8">
              <h3 className="text-xl font-semibold">Rent</h3>
              <p className="mt-3 text-gray-600">
                Generate income and maintain flexibility while the market evolves.
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-8">
              <h3 className="text-xl font-semibold">Sell</h3>
              <p className="mt-3 text-gray-600">
                Capture equity and transition into your next opportunity.
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-8">
              <h3 className="text-xl font-semibold">Hold</h3>
              <p className="mt-3 text-gray-600">
                Position the property for long-term appreciation and future decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FUNNEL ENTRY */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-3xl font-semibold text-gray-900 text-center">
            How can we help you today?
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-3">

            <a href="/property-strategy-session" className="rounded-2xl border p-8 hover:shadow">
              <h3 className="text-xl font-semibold">Property Owners</h3>
              <p className="mt-3 text-gray-600">
                Evaluate whether to rent, sell, or hold your property.
              </p>
            </a>

            <a href="/rent-vs-sell" className="rounded-2xl border p-8 hover:shadow">
              <h3 className="text-xl font-semibold">Considering Selling</h3>
              <p className="mt-3 text-gray-600">
                Compare selling now vs generating rental income.
              </p>
            </a>

            <a href="/agents" className="rounded-2xl border p-8 hover:shadow">
              <h3 className="text-xl font-semibold">Real Estate Agents</h3>
              <p className="mt-3 text-gray-600">
                Refer clients with confidence and receive future listing opportunities.
              </p>
            </a>

          </div>
        </div>
      </section>

      {/* AUTHORITY SECTION */}
      <section className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center">
          <h2 className="text-3xl font-semibold text-gray-900">
            Trusted real estate guidance in Ventura County
          </h2>

          <p className="mt-6 text-lg text-gray-600">
            Richard Miller brings over 40 years of real estate experience,
            helping property owners make strategic decisions — not just transactions.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-black">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center text-white">
          <h2 className="text-3xl font-semibold">
            Start with a Property Strategy Session
          </h2>

          <p className="mt-4 text-gray-300">
            Get clarity on whether your property should be rented, sold, or held.
          </p>

          <a
            href="/property-strategy-session"
            className="mt-8 inline-block rounded bg-white px-6 py-3 text-black"
          >
            Book Strategy Session
          </a>
        </div>
      </section>

    </main>
  )
}