export default function OwnerPortalPage() {
  return (
    <main>
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Owner Access
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
            Owner Portal
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-600">
            Access your secure owner portal to review statements, documents,
            property-related updates, and account information through the
            AppFolio system.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="https://countypm.appfolio.com/oportal/users/log_in"
              className="rounded bg-black px-6 py-3 text-white"
            >
              Open Owner Portal
            </a>

            <a
              href="/property-strategy-session"
              className="rounded border border-gray-300 px-6 py-3 text-gray-900"
            >
              Book Strategy Session
            </a>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-center text-3xl font-semibold text-gray-900">
            What you can do in the owner portal
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <h3 className="text-xl font-semibold text-gray-900">
                Review statements
              </h3>
              <p className="mt-3 text-gray-600">
                Access owner statements and financial reporting in one secure place.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <h3 className="text-xl font-semibold text-gray-900">
                View documents and updates
              </h3>
              <p className="mt-3 text-gray-600">
                Stay connected to important property-related information and records.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <h3 className="text-xl font-semibold text-gray-900">
                Stay organized
              </h3>
              <p className="mt-3 text-gray-600">
                Use the portal as a central place for owner-side account visibility.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="grid gap-10 md:grid-cols-2 md:items-start">
            <div>
              <h2 className="text-3xl font-semibold text-gray-900">
                More than just portal access
              </h2>

              <p className="mt-6 text-lg leading-8 text-gray-600">
                County Property Management is positioned not only as a management
                company, but as a real estate asset advisor. The portal supports
                account access, while the broader relationship helps owners
                evaluate rent, sell, and hold decisions over time.
              </p>

              <a
                href="/owners"
                className="mt-8 inline-block rounded border border-gray-300 px-6 py-3 text-gray-900"
              >
                Explore Owner Guidance
              </a>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8">
              <h3 className="text-2xl font-semibold text-gray-900">
                Need help with access?
              </h3>

              <p className="mt-4 text-gray-600">
                If you need assistance with owner portal access or have broader
                questions about your property strategy, County Property
                Management can help.
              </p>

              <div className="mt-8 space-y-4 text-gray-700">
                <p>
                  <strong>Phone:</strong> (805) 482-9800
                </p>
                <p>
                  <strong>Email:</strong> cpm@c-p-m.com
                </p>
              </div>

              <a
                href="/contact"
                className="mt-8 inline-block rounded bg-black px-6 py-3 text-white"
              >
                Contact CPM
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-black">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center text-white">
          <h2 className="text-3xl font-semibold">
            Secure owner access backed by real estate guidance.
          </h2>

          <p className="mt-4 text-gray-300">
            Use the owner portal for account visibility, and turn to County
            Property Management for broader strategic property guidance.
          </p>

          <a
            href="https://countypm.appfolio.com/oportal/users/log_in"
            className="mt-8 inline-block rounded bg-white px-6 py-3 text-black"
          >
            Open Owner Portal
          </a>
        </div>
      </section>
    </main>
  )
}