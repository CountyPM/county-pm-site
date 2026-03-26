export default function AgentReferralPartnersPage() {
  return (
    <main>
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Referral Partner Program
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
            A referral structure built for long-term trust.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-600">
            County Property Management partners with real estate agents who want
            a dependable property management resource, timely communication, and
            a relationship model that respects the referring agent.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="/contact"
              className="rounded bg-black px-6 py-3 text-white"
            >
              Contact About Partnership
            </a>

            <a
              href="/agents"
              className="rounded border border-gray-300 px-6 py-3 text-gray-900"
            >
              Back to Agents Page
            </a>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <h2 className="text-2xl font-semibold text-gray-900">
                What referral partners can expect
              </h2>

              <ul className="mt-6 space-y-4 text-gray-600">
                <li>• Responsive communication</li>
                <li>• Clear handling of owner needs and expectations</li>
                <li>• A consultative rent / sell / hold framework</li>
                <li>• Support for clients who are not ready to sell immediately</li>
                <li>• A structured relationship that encourages future collaboration</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <h2 className="text-2xl font-semibold text-gray-900">
                Ideal partner profile
              </h2>

              <ul className="mt-6 space-y-4 text-gray-600">
                <li>• Agents who do not provide property management directly</li>
                <li>• Agents who want a trusted referral destination for owners</li>
                <li>• Agents who value responsiveness and long-term client care</li>
                <li>• Agents who want to preserve future listing relationships</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <div className="rounded-3xl border border-gray-200 bg-gray-50 p-10">
            <h2 className="text-3xl font-semibold text-gray-900">
              Why this model works
            </h2>

            <p className="mt-6 text-lg leading-8 text-gray-600">
              Many owners are hesitant to sell immediately, but open to renting
              if the economics make sense. This creates a strong opportunity for
              agents to serve clients better by introducing them to a trusted
              management partner instead of forcing a premature sale decision.
            </p>

            <p className="mt-6 text-lg leading-8 text-gray-600">
              Over time, this creates stronger owner relationships and a more
              reliable referral pipeline for both sides.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-black">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center text-white">
          <h2 className="text-3xl font-semibold">
            Interested in becoming a referral partner?
          </h2>

          <p className="mt-4 text-gray-300">
            Start a conversation with County Property Management about how the
            referral relationship can work for your clients and your business.
          </p>

          <a
            href="/contact"
            className="mt-8 inline-block rounded bg-white px-6 py-3 text-black"
          >
            Contact CPM
          </a>
        </div>
      </section>
    </main>
  )
}