export default function TenantPortalPage() {
  return (
    <main>
      <section className="bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Resident Access
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--cpm-text)] md:text-6xl">
            Tenant Portal
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--cpm-muted)]">
            Access your secure resident portal to manage rent payments, review
            account information, communicate about your tenancy, and handle
            maintenance-related requests through the AppFolio system.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="https://account.appfolio.com/realms/foliospace/protocol/openid-connect/auth?activation_state&client_id=client-cf2e039959ed8adf2348414d52dc6df789c804cc&portfolio_uuid&redirect_uri=https%3A%2F%2Fcountypm.appfolio.com%2Fconnect%2Fusers%2Foauth%2Fcallback&response_type=code&scope=openid+offline_access&session_timed_out=false&state"
              className="rounded btn-primary px-6 py-3 text-white"
            >
              Open Tenant Portal
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
            What you can do in the tenant portal
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="cpm-card rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-[var(--cpm-text)]">
                Make payments
              </h3>
              <p className="mt-3 text-[var(--cpm-muted)]">
                Access secure rent payment features and review account activity.
              </p>
            </div>

            <div className="cpm-card rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-[var(--cpm-text)]">
                Review account details
              </h3>
              <p className="mt-3 text-[var(--cpm-muted)]">
                View important resident information and stay current on your account.
              </p>
            </div>

            <div className="cpm-card rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-[var(--cpm-text)]">
                Submit maintenance requests
              </h3>
              <p className="mt-3 text-[var(--cpm-muted)]">
                Use the secure system to report issues and keep requests organized.
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
                Before you log in
              </h2>

              <ul className="mt-8 space-y-4 text-[var(--cpm-muted)]">
                <li>• Have your login credentials ready</li>
                <li>• Use the maintenance request tool for non-emergency service issues</li>
                <li>• Keep your contact details current inside the portal when possible</li>
                <li>• Reach out to the office if you need account access help</li>
              </ul>
            </div>

            <div className="cpm-card rounded-2xl p-8">
              <h3 className="text-2xl font-semibold text-[var(--cpm-text)]">
                Need help?
              </h3>

              <p className="mt-4 text-[var(--cpm-muted)]">
                If you need assistance with portal access or have general resident
                questions, County Property Management can help direct you to the
                right next step.
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
            Secure resident access, built to keep communication organized
          </h2>

          <p className="mt-4 cpm-copy">
            The tenant portal is the best place to manage your account and submit
            service-related requests through the proper system.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href="#" className="btn-primary">
              Open Tenant Portal
            </a>

            <a href="/contact" className="btn-secondary">
              Contact CPM
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}