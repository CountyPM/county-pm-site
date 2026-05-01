import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Equal Housing | County Property Management',
  description:
    'County Property Management is committed to equal housing opportunity and fair housing compliance.',
}

export default function EqualHousingPage() {
  return (
    <main className="bg-[var(--cpm-page)]">
      <section className="mx-auto max-w-4xl px-4 py-20">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
          Compliance
        </p>

        <h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--cpm-text)] md:text-5xl">
          Equal Housing Opportunity
        </h1>

        <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-start">
          <div className="shrink-0">
            <Image
              src="/images/equal-housing-logo.png"
              alt="Equal Housing Opportunity"
              width={160}
              height={80}
              className="h-auto w-[160px]"
            />
          </div>

          <div className="max-w-2xl text-base leading-7 text-[var(--cpm-muted)]">
            <p>
              County Property Management supports the principles of the federal
              Fair Housing Act and applicable California housing laws.
            </p>

            <p className="mt-4">
              We are committed to providing equal housing opportunities and do
              not discriminate in the sale, rental, advertising, financing, or
              provision of real estate services on the basis of race, color,
              religion, sex, disability, familial status, national origin, or
              any other class protected by applicable law.
            </p>

            <p className="mt-4">
              We expect our advertising, communications, and property-related
              practices to reflect these principles.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}