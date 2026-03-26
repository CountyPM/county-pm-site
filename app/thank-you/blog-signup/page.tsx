export default function BlogSignupThankYouPage() {
  return (
    <main>
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Thank You
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            You’re on the list.
          </h1>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            Thank you for subscribing. We’ll use this to share practical
            property insights, owner guidance, and real estate decision-making
            resources from County Property Management.
          </p>

          <div className="mt-10">
            <a href="/blog" className="rounded bg-black px-5 py-3 text-white">
              Back to Resource Center
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}