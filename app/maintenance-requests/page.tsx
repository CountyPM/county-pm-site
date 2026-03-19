export default function MaintenanceRequestsPage() {
  return (
    <main>
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Maintenance Support
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
            Maintenance Requests
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-600">
            Tenant maintenance requests are handled through the secure resident
            portal. This keeps requests organized, trackable, and routed
            through the proper system.
          </p>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-start">
          <div className="rounded-2xl border border-gray-200 bg-white p-8">
            <h2 className="text-2xl font-semibold text-gray-900">
              How to submit a request
            </h2>

            <ul className="mt-6 space-y-4 text-gray-600">
              <li>• Log in to the Tenant Portal</li>
              <li>• Submit the issue through your resident account</li>
              <li>• Include as much detail as possible</li>
              <li>• Follow emergency instructions if the issue is urgent</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-8">
            <h2 className="text-2xl font-semibold text-gray-900">
              Go to Tenant Portal
            </h2>
            <p className="mt-4 text-gray-600">
              Maintenance requests are generated through the AppFolio tenant
              portal.
            </p>

            <a
              href="/tenant-portal"
              className="mt-6 inline-flex rounded bg-black px-5 py-3 text-white"
            >
              Access Tenant Portal
            </a>

            <p className="mt-6 text-sm text-gray-500">
              For office assistance, call (805) 482-9800 or email cpm@c-p-m.com.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}