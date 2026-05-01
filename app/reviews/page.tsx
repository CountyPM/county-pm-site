import ReviewForm from '@/components/forms/ReviewForm'

export default function ReviewsPage() {
  return (
    <main className="bg-[var(--cpm-page)] text-[var(--cpm-text)]">
      {/* HEADER */}
      <section className="bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] cpm-eyebrow">
            Client Feedback
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight cpm-heading md:text-6xl">
            We value your feedback.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 cpm-copy">
            Thank you for taking a moment to share your experience with County
            Property Management. Your feedback helps us improve and serve our
            clients better.
          </p>
        </div>
      </section>

      {/* FORM SECTION */}
      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-surface)]">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <div className="cpm-card rounded-2xl p-8">
            <h2 className="text-2xl font-semibold cpm-heading">
              Leave Your Feedback
            </h2>

            <p className="mt-3 cpm-copy">
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