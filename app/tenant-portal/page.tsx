export default function TenantPortalPage() {
  return (
    <main>
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Secure Resident Access
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
            Tenant Portal
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-600">
            Access your tenant portal for rent payments, account details,
            communication, and maintenance-related activity.
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
              <li>• Pay rent securely</li>
              <li>• Review account information</li>
              <li>• Access communication and updates</li>
              <li>• Submit maintenance requests through the secure system</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-8">
            <h2 className="text-2xl font-semibold text-gray-900">
              Access Tenant Portal
            </h2>
            <p className="mt-4 text-gray-600">
              Use the secure AppFolio portal to manage your resident account.
            </p>

            <a
              href="https://account.appfolio.com/realms/foliospace/protocol/openid-connect/auth?activation_state&client_id=client-cf2e039959ed8adf2348414d52dc6df789c804cc&portfolio_uuid&redirect_uri=https%3A%2F%2Fcountypm.appfolio.com%2Fconnect%2Fusers%2Foauth%2Fcallback&response_type=code&scope=openid+offline_access&session_timed_out=false&state"
              className="mt-6 inline-flex rounded bg-black px-5 py-3 text-white"
            >
              Open Tenant Portal
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