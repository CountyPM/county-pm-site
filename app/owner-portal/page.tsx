export default function OwnerPortalPage() {
  return (
    <main>
      <section className="bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Owner Access
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--cpm-text)] md:text-6xl">
            Owner Portal
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--cpm-muted)]">
            Access your secure owner portal to review statements, documents,
            property-related updates, and account information through the
            AppFolio system.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="https://countypm.appfolio.com/oportal/users/log_in"
              className="rounded btn-primary px-6 py-3 text-white"
            >
              Open Owner Portal
            </a>

            <a
              href="/property-strategy-session"
              className="rounded border border-gray-300 px-6 py-3 text-[var(--cpm-text)]"
            >
              Book Strategy Session
            </a>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-center text-3xl font-semibold text-[var(--cpm-text)]">
            What you can do in the owner portal
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="cpm-card rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-[var(--cpm-text)]">
                Review statements
              </h3>
              <p className="mt-3 text-[var(--cpm-muted)]">
                Access owner statements and financial reporting in one secure place.
              </p>
            </div>

            <div className="cpm-card rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-[var(--cpm-text)]">
                View documents and updates
              </h3>
              <p className="mt-3 text-[var(--cpm-muted)]">
                Stay connected to important property-related information and records.
              </p>
            </div>

            <div className="cpm-card rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-[var(--cpm-text)]">
                Stay organized
              </h3>
              <p className="mt-3 text-[var(--cpm-muted)]">
                Use the portal as a central place for owner-side account visibility.
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
                More than just portal access
              </h2>

              <p className="mt-6 text-lg leading-8 text-[var(--cpm-muted)]">
                County Property Management is positioned not only as a management
                company, but as a real estate asset advisor. The portal supports
                account access, while the broader relationship helps owners
                evaluate rent, sell, and hold decisions over time.
              </p>

              <a
                href="/owners"
                className="mt-8 inline-block rounded border border-gray-300 px-6 py-3 text-[var(--cpm-text)]"
              >
                Explore Owner Guidance
              </a>
            </div>

            <div className="cpm-card rounded-2xl p-8">
              <h3 className="text-2xl font-semibold text-[var(--cpm-text)]">
                Need help with access?
              </h3>

              <p className="mt-4 text-[var(--cpm-muted)]">
                If you need assistance with owner portal access or have broader
                questions about your property strategy, County Property
                Management can help.
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

      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <h2 className="text-3xl font-semibold cpm-heading">
            Secure owner access backed by real estate guidance
          </h2>

          <p className="mt-4 cpm-copy">
            Use the owner portal for account visibility, and turn to County Property
            Management for broader strategic property guidance.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href="#" className="btn-primary">
              Open Owner Portal
            </a>

            <a href="/property-strategy-session" className="btn-secondary">
              Book Strategy Session
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}