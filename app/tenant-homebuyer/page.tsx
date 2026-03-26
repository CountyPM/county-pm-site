export default function TenantHomebuyerPage() {
  return (
    <main>
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Tenant to Homebuyer Path
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
            Thinking about buying a home in the future?
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-600">
            County Property Management helps tenants explore what homeownership
            could look like by providing education, guidance, and introductions
            to trusted real estate professionals in Ventura County.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="/contact"
              className="rounded bg-black px-6 py-3 text-white"
            >
              Ask About Homeownership Options
            </a>

            <a
              href="/agents"
              className="rounded border border-gray-300 px-6 py-3 text-gray-900"
            >
              Meet Our Trusted Agent Network
            </a>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-center text-3xl font-semibold text-gray-900">
            Buying a home may be closer than you think
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <h3 className="text-xl font-semibold text-gray-900">
                Start with education
              </h3>
              <p className="mt-3 text-gray-600">
                Learn the basic steps involved in moving from renting to buying
                without pressure or rushed decisions.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <h3 className="text-xl font-semibold text-gray-900">
                Understand your options
              </h3>
              <p className="mt-3 text-gray-600">
                Explore what timing, budget, financing, and local market
                conditions may mean for your next step.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <h3 className="text-xl font-semibold text-gray-900">
                Connect with trusted professionals
              </h3>
              <p className="mt-3 text-gray-600">
                Get introduced to vetted real estate agents who can help you
                move forward when you are ready.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="grid gap-10 md:grid-cols-2 md:items-start">
            <div>
              <h2 className="text-3xl font-semibold text-gray-900">
                Good reasons to start exploring now
              </h2>

              <ul className="mt-8 space-y-4 text-gray-600">
                <li>• You want to understand what buying might look like in the next 6–24 months</li>
                <li>• You want clarity before making a major financial decision</li>
                <li>• You want a trusted introduction instead of a cold sales process</li>
                <li>• You are curious whether staying in Ventura County as an owner is realistic</li>
                <li>• You want to plan ahead rather than wait until the last minute</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8">
              <h3 className="text-2xl font-semibold text-gray-900">
                What this page is for
              </h3>

              <p className="mt-4 text-gray-600">
                This is not a high-pressure sales page. It is a starting point
                for tenants who want education, better information, and a path
                toward future ownership if the timing is right.
              </p>

              <a
                href="/contact"
                className="mt-8 inline-block rounded bg-black px-6 py-3 text-white"
              >
                Start the Conversation
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center">
            <h2 className="text-3xl font-semibold text-gray-900">
              When you are ready, we can help you take the next step.
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-600">
              County Property Management can help guide you toward the right
              next conversation and connect you with trusted local professionals
              when buying becomes the right move.
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