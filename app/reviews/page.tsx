export default function ReviewsPage() {
  return (
    <main>
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Client Feedback
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
            We value your feedback.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-600">
            This page will support the review-routing process: strong reviews
            can be directed to Google, while lower feedback can be captured
            internally so the team can respond privately.
          </p>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <div className="rounded-2xl border border-gray-200 bg-white p-8">
            <h2 className="text-2xl font-semibold text-gray-900">
              Leave Your Feedback
            </h2>

            <form className="mt-8 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Rating
                </label>
                <select className="mt-2 w-full rounded border border-gray-300 px-4 py-3">
                  <option>Choose a rating</option>
                  <option>5 - Excellent</option>
                  <option>4 - Good</option>
                  <option>3 - Fair</option>
                  <option>2 - Poor</option>
                  <option>1 - Very Poor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
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
                  Comments
                </label>
                <textarea className="mt-2 min-h-[140px] w-full rounded border border-gray-300 px-4 py-3" />
              </div>

              <button
                type="button"
                className="w-full rounded bg-black px-5 py-3 text-white"
              >
                Submit Feedback
              </button>
            </form>

            <p className="mt-6 text-sm text-gray-500">
              Review routing logic will be connected in the next build phase.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}