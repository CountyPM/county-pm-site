import ReviewForm from '@/components/forms/ReviewForm'

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
            Thank you for taking a moment to share your experience with County
            Property Management. Your feedback helps us improve and serve our
            clients better.
          </p>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <div className="rounded-2xl border border-gray-200 bg-white p-8">
            <h2 className="text-2xl font-semibold text-gray-900">
              Leave Your Feedback
            </h2>

            <p className="mt-3 text-gray-600">
              If you had a positive experience, we may invite you to share it
              publicly. If not, we want to hear from you directly and make it
              right.
            </p>

            <ReviewForm />
          </div>
        </div>
      </section>
    </main>
  )
}