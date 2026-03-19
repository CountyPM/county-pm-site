export default function OwnerPortalPage() {
  return (
    <main>
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Secure Owner Access
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
            Owner Portal
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-600">
            Access owner-side statements, updates, documents, and secure
            property information through the AppFolio owner portal.
          </p>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-start">
          <div className="rounded-2xl border border-gray-200 bg-white p-8">
            <h2 className="text-2xl font-semibold text-gray-900">
              What you can do in the portal
            </h2>

            <ul className="mt-6 space-y-4 text-gray-600">
              <li>• Review owner statements</li>
              <li>• Access account documents</li>
              <li>• View property-related updates</li>
              <li>• Stay connected through a secure login</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-8">
            <h2 className="text-2xl font-semibold text-gray-900">
              Access Owner Portal
            </h2>
            <p className="mt-4 text-gray-600">
              Use the secure AppFolio owner portal to review account and
              property information.
            </p>

            <a
              href="https://countypm.appfolio.com/oportal/users/log_in"
              className="mt-6 inline-flex rounded bg-black px-5 py-3 text-white"
            >
              Open Owner Portal
            </a>

            <p className="mt-6 text-sm text-gray-500">
              Need help? Call (805) 482-9800 or email cpm@c-p-m.com.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}