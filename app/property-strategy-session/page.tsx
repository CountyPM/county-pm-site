export default function PropertyStrategySessionPage() {
  return (
    <main>
      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Central Intake Consultation
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
            Book your Property Strategy Session.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-600">
            This session is designed for property owners who are deciding
            whether a property should be rented, sold, or held. It is built to
            clarify the best next move based on your timing, goals, and
            property situation.
          </p>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold text-gray-900">
              What this session helps you decide
            </h2>

            <ul className="mt-6 space-y-4 text-gray-600">
              <li>• Should this property be rented for income and flexibility?</li>
              <li>• Does selling now make more sense based on timing and equity?</li>
              <li>• Would holding the property create a stronger long-term outcome?</li>
              <li>• Is a future agent referral or advisory follow-up the right move?</li>
            </ul>

            <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Common fit scenarios
              </h3>
              <ul className="mt-4 space-y-3 text-gray-600">
                <li>• Pre-movers who may relocate but are not committed to selling</li>
                <li>• Long-time homeowners with strong equity</li>
                <li>• Owners nearing retirement and evaluating income options</li>
                <li>• Expired-listing owners considering a rent-until-market-improves strategy</li>
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-8">
            <h2 className="text-2xl font-semibold text-gray-900">
              Quick Intake Form
            </h2>
            <p className="mt-3 text-gray-600">
              This is the first step before booking. We will connect this to
              Google Calendar and CRM workflows in the next build phase.
            </p>

            <form className="mt-8 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  className="mt-2 w-full rounded border border-gray-300 px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  className="mt-2 w-full rounded border border-gray-300 px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  className="mt-2 w-full rounded border border-gray-300 px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="text"
                  className="mt-2 w-full rounded border border-gray-300 px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Property Address
                </label>
                <input
                  type="text"
                  className="mt-2 w-full rounded border border-gray-300 px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Are you leaning toward selling, renting, or still deciding?
                </label>
                <select className="mt-2 w-full rounded border border-gray-300 px-4 py-3">
                  <option>Choose one</option>
                  <option>Selling</option>
                  <option>Renting</option>
                  <option>Still deciding</option>
                  <option>Holding</option>
                </select>
              </div>

              <button
                type="button"
                className="w-full rounded bg-black px-5 py-3 text-white"
              >
                Continue to Booking
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}