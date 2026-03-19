import { COMPANY } from '@/lib/constants'

export default function SiteFooter() {
  return (
    <footer className="mt-20 border-t bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {COMPANY.name}
            </h3>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Ventura County property strategy, management, and owner guidance.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              Contact
            </h4>
            <p className="mt-3 text-sm text-gray-700">{COMPANY.phone}</p>
            <p className="mt-2 text-sm text-gray-700">{COMPANY.email}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              Core Path
            </h4>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Property owners are encouraged to begin with the Property Strategy
              Session to evaluate whether a property should be rented, sold, or
              held.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}