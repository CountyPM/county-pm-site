export default function ProfessionalPartnersThankYouPage() {
  return (
    <main>
      <section className="bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-4xl px-4 py-24 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Thank You
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--cpm-text)] md:text-5xl">
            Your referral partner inquiry has been received
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--cpm-muted)]">
            Thank you for reaching out. We’ve received your information and will
            follow up shortly to learn more about your practice and how we may
            be able to collaborate.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href="/professional-partners"
              className="rounded border border-gray-300 px-6 py-3 text-[var(--cpm-text)] transition hover:bg-[var(--cpm-page)]"
            >
              Back to Professional Partners
            </a>

            <a
              href="/contact"
              className="rounded btn-primary px-6 py-3 text-white transition hover:opacity-90"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}