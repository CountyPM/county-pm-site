export default function ThankYouStrategySessionPage() {
  return (
    <main>
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Thank You
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Your Property Strategy Session request was received.
          </h1>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            We have your information. The next phase will connect this step to
            booking and CRM workflows, but for now your submission has been
            captured successfully.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href="/" className="rounded bg-black px-5 py-3 text-white">
              Return Home
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
    </main>
  )
}