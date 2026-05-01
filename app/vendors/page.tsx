export default function VendorsPage() {
  return (
    <main>
      <section className="bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Vendor Information
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--cpm-text)] md:text-6xl">
            Working with County Property Management as a vendor.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--cpm-muted)]">
            County Property Management works with vendors and contractors who
            support a professional client experience, responsive communication,
            and dependable service standards.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="/contact"
              className="rounded btn-primary px-6 py-3 text-white"
            >
              Contact CPM
            </a>

            <a
              href="/maintenance-requests"
              className="rounded border border-gray-300 px-6 py-3 text-[var(--cpm-text)]"
            >
              Maintenance Information
            </a>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-center text-3xl font-semibold text-[var(--cpm-text)]">
            What CPM values in vendor relationships
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="cpm-card rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-[var(--cpm-text)]">
                Professional communication
              </h3>
              <p className="mt-3 text-[var(--cpm-muted)]">
                Clear updates, reliable responsiveness, and a professional
                approach to tenant and owner-facing work.
              </p>
            </div>

            <div className="cpm-card rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-[var(--cpm-text)]">
                Quality and dependability
              </h3>
              <p className="mt-3 text-[var(--cpm-muted)]">
                Vendors are expected to provide consistent workmanship and
                dependable service.
              </p>
            </div>

            <div className="cpm-card rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-[var(--cpm-text)]">
                Compliance and professionalism
              </h3>
              <p className="mt-3 text-[var(--cpm-muted)]">
                County Property Management values vendors who maintain
                appropriate licensing, insurance, and professional standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-surface)]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="grid gap-10 md:grid-cols-2 md:items-start">
            <div>
              <h2 className="text-3xl font-semibold text-[var(--cpm-text)]">
                Important note about onboarding
              </h2>

              <p className="mt-6 text-lg leading-8 text-[var(--cpm-muted)]">
                Vendor onboarding is handled directly through AppFolio and
                internal CPM processes. This website is not the primary vendor
                onboarding system.
              </p>

              <p className="mt-6 text-lg leading-8 text-[var(--cpm-muted)]">
                This page is intended to provide general vendor information and
                a contact path for appropriate inquiries.
              </p>
            </div>

            <div className="cpm-card rounded-2xl p-8">
              <h3 className="text-2xl font-semibold text-[var(--cpm-text)]">
                Vendor inquiries
              </h3>

              <p className="mt-4 text-[var(--cpm-muted)]">
                If you need to contact County Property Management regarding
                vendor-related questions, please use the contact page and
                include relevant details about your trade or service.
              </p>

              <div className="mt-8 space-y-4 text-[var(--cpm-muted)]">
                <p>
                  <strong>Phone:</strong> (805) 482-9800
                </p>
                <p>
                  <strong>Email:</strong> cpm@c-p-m.com
                </p>
              </div>

              <a
                href="/contact"
                className="mt-8 inline-block rounded btn-primary px-6 py-3 text-white"
              >
                Contact CPM
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--cpm-border)] btn-primary">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center text-white">
          <h2 className="text-3xl font-semibold">
            Vendor relationships matter to the owner and tenant experience.
          </h2>

          <p className="mt-4 text-gray-300">
            County Property Management values vendors who support a responsive,
            professional, and well-managed property experience.
          </p>

          <a
            href="/contact"
            className="mt-8 inline-block rounded bg-[var(--cpm-surface)] px-6 py-3 text-[var(--cpm-page)]"
          >
            Contact CPM
          </a>
        </div>
      </section>
    </main>
  )
}