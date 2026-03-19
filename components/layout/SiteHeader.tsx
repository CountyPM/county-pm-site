import Link from 'next/link'
import { NAVIGATION } from '@/lib/navigation'
import { COMPANY, PRIMARY_CTA } from '@/lib/constants'

export default function SiteHeader() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="text-lg font-semibold text-gray-900">
          {COMPANY.name}
        </div>

        <nav className="flex flex-wrap gap-4 text-sm text-gray-700">
          {NAVIGATION.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-black">
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href={PRIMARY_CTA.href}
          className="inline-flex w-full items-center justify-center rounded bg-black px-4 py-2 text-sm text-white md:w-auto"
        >
          {PRIMARY_CTA.label}
        </Link>
      </div>
    </header>
  )
}