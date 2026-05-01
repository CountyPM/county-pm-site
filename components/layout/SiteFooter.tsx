import Image from 'next/image'
import Link from 'next/link'

const companyName = 'RAWA, Inc'
const dreLicenseNumber = '00578068'
const responsibleBrokerName = 'Richard James Miller'
const responsibleBrokerLicenseNumber = '00578068'

export default function SiteFooter() {
  return (
    <footer className="border-t border-[var(--cpm-border)] bg-[var(--cpm-surface)] text-[var(--cpm-text)]">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <h2 className="text-base font-semibold text-[var(--cpm-text)]">
              County Property Management
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--cpm-muted)]">
              Practical property management and real estate guidance for Ventura
              County owners, residents, and partners.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--cpm-primary-soft)]">
              Quick Links
            </h3>
            <nav className="mt-4 flex flex-col gap-3 text-sm text-[var(--cpm-muted)]">
              <Link href="/property-strategy-session" className="transition hover:text-[var(--cpm-primary-soft)]">
                Property Strategy Session
              </Link>
              <Link href="/resources/rent-vs-sell" className="transition hover:text-[var(--cpm-primary-soft)]">
                Rent vs Sell Guide
              </Link>
              <Link href="/blog" className="transition hover:text-[var(--cpm-primary-soft)]">
                Blog
              </Link>
              <Link href="/contact" className="transition hover:text-[var(--cpm-primary-soft)]">
                Contact
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--cpm-primary-soft)]">
              Portals & Rentals
            </h3>
            <nav className="mt-4 flex flex-col gap-3 text-sm text-[var(--cpm-muted)]">
              <Link href="/available-rentals" className="transition hover:text-[var(--cpm-primary-soft)]">
                Available Rentals
              </Link>
              <Link href="/tenant-portal" className="transition hover:text-[var(--cpm-primary-soft)]">
                Tenant Portal
              </Link>
              <Link href="/owner-portal" className="transition hover:text-[var(--cpm-primary-soft)]">
                Owner Portal
              </Link>
              <Link href="/maintenance-requests" className="transition hover:text-[var(--cpm-primary-soft)]">
                Maintenance Requests
              </Link>
            </nav>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--cpm-primary-soft)]">
              Compliance
            </h3>

            <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--cpm-muted)]">
              <p>
                {companyName}
                <br />
                California DRE License #{dreLicenseNumber}
              </p>

              <p>
                Responsible Broker: {responsibleBrokerName}
                <br />
                California DRE License #{responsibleBrokerLicenseNumber}
              </p>

              <p>
                We are committed to providing equal housing opportunities and do
                not discriminate in housing on the basis of race, color,
                religion, sex, disability, familial status, national origin, or
                any other class protected by applicable law.
              </p>

              <div className="pt-2">
                <Image
                  src="/images/equal-housing-logo.png"
                  alt="Equal Housing Opportunity"
                  width={120}
                  height={60}
                  className="h-auto w-[120px]"
                />
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Link href="/equal-housing" className="transition hover:text-[var(--cpm-primary-soft)]">
                  Equal Housing
                </Link>
                <Link href="/privacy-policy" className="transition hover:text-[var(--cpm-primary-soft)]">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="transition hover:text-[var(--cpm-primary-soft)]">
                  Terms of Use
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-[var(--cpm-border)] pt-6 text-xs leading-5 text-[var(--cpm-muted)]">
          <p>
            The information on this website is for general informational
            purposes only and does not constitute legal, tax, or investment
            advice. Real estate decisions should be made based on your specific
            circumstances and, where appropriate, with guidance from licensed or
            professional advisors.
          </p>
        </div>
      </div>
    </footer>
  )
}