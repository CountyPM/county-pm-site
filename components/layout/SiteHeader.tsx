import Link from 'next/link'
import { NAVIGATION } from '@/lib/navigation'
import { COMPANY, PRIMARY_CTA } from '@/lib/constants'

export default function SiteHeader() {
  return (
    <header className="border-b border-[var(--cpm-border)] bg-[var(--cpm-surface)] text-[var(--cpm-text)]">
      {/* Utility bar */}
      <div className="border-b border-[var(--cpm-border)] bg-[var(--cpm-page)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-end gap-4 px-4 py-2 text-sm text-[var(--cpm-muted)]">
          <Link href="/available-rentals" className="whitespace-nowrap transition hover:text-[var(--cpm-primary-soft)]">
            Available Rentals
          </Link>

          <Link href="/owner-portal" className="whitespace-nowrap transition hover:text-[var(--cpm-primary-soft)]">
            Owner Portal
          </Link>

          <Link href="/tenant-portal" className="whitespace-nowrap transition hover:text-[var(--cpm-primary-soft)]">
          Tenant Portal
          </Link>
        </div>
      </div>

      {/* Main header */}
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="shrink-0 text-lg font-semibold text-[var(--cpm-text)]">
            <Link href="/" className="transition hover:text-[var(--cpm-primary-soft)]">
              {COMPANY.name}
            </Link>
          </div>

          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[var(--cpm-muted)] lg:justify-center">
            {NAVIGATION.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap transition hover:text-[var(--cpm-primary-soft)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="shrink-0">
            <Link
              href={PRIMARY_CTA.href}
              className="btn-primary"
            >
              Schedule Strategy Session
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}