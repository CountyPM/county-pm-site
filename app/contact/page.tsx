import ContactForm from '@/components/forms/ContactForm'

export default function ContactPage() {
  return (
    <main>
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Contact County Property Management
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
            Let’s start with the right conversation.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-600">
            Whether you are an owner, tenant, agent, or prospective client,
            County Property Management is building the website experience around
            clear next steps and better communication.
          </p>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-8">
            <h2 className="text-2xl font-semibold text-gray-900">
              Contact Information
            </h2>

            <div className="mt-6 space-y-4 text-gray-700">
              <p>
                <strong>Phone:</strong> (805) 482-9800
              </p>
              <p>
                <strong>Email:</strong> cpm@c-p-m.com
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Best next step for owners
              </h3>
              <p className="mt-3 text-gray-600">
                If you are deciding whether to rent, sell, or hold a property,
                start with the Property Strategy Session.
              </p>

              <a
                href="/property-strategy-session"
                className="mt-5 inline-flex rounded bg-black px-5 py-3 text-white"
              >
                Book Property Strategy Session
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-8">
            <h2 className="text-2xl font-semibold text-gray-900">
              Quick Contact Form
            </h2>
            <p className="mt-3 text-gray-600">
              Send us a message and our team will follow up.
            </p>

            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  )
}