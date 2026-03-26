export default function VendorsPage() {
  return (
    <main>
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Vendor Information
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
            Working with County Property Management as a vendor.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-600">
            County Property Management works with vendors and contractors who
            support a professional client experience, responsive communication,
            and dependable service standards.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="/contact"
              className="rounded bg-black px-6 py-3 text-white"
            >
              Contact CPM
            </a>

            <a
              href="/maintenance-requests"
              className="rounded border border-gray-300 px-6 py-3 text-gray-900"
            >
              Maintenance Information
            </a>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-center text-3xl font-semibold text-gray-900">
            What CPM values in vendor relationships
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <h3 className="text-xl font-semibold text-gray-900">
                Professional communication
              </h3>
              <p className="mt-3 text-gray-600">
                Clear updates, reliable responsiveness, and a professional
                approach to tenant and owner-facing work.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <h3 className="text-xl font-semibold text-gray-900">
                Quality and dependability
              </h3>
              <p className="mt-3 text-gray-600">
                Vendors are expected to provide consistent workmanship and
                dependable service.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8">
              <h3 className="text-xl font-semibold text-gray-900">
                Compliance and professionalism
              </h3>
              <p className="mt-3 text-gray-600">
                County Property Management values vendors who maintain
                appropriate licensing, insurance, and professional standards.
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
                Important note about onboarding
              </h2>

              <p className="mt-6 text-lg leading-8 text-gray-600">
                Vendor onboarding is handled directly through AppFolio and
                internal CPM processes. This website is not the primary vendor
                onboarding system.
              </p>

              <p className="mt-6 text-lg leading-8 text-gray-600">
                This page is intended to provide general vendor information and
                a contact path for appropriate inquiries.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8">
              <h3 className="text-2xl font-semibold text-gray-900">
                Vendor inquiries
              </h3>

              <p className="mt-4 text-gray-600">
                If you need to contact County Property Management regarding
                vendor-related questions, please use the contact page and
                include relevant details about your trade or service.
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
            Vendor relationships matter to the owner and tenant experience.
          </h2>

          <p className="mt-4 text-gray-300">
            County Property Management values vendors who support a responsive,
            professional, and well-managed property experience.
          </p>

          <a
            href="/contact"
            className="mt-8 inline-block rounded bg-white px-6 py-3 text-black"
          >
            Contact CPM
          </a>
        </div>
      </section>
    </main>
  )
}