import ContactForm from '@/components/forms/ContactForm'

export default function ContactPage() {
  return (
    <main className="bg-[var(--cpm-page)] text-[var(--cpm-text)]">
      {/* HERO */}
      <section className="bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] cpm-eyebrow">
            Contact County Property Management
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight cpm-heading md:text-6xl">
            Let’s start with the right conversation.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 cpm-copy">
            Whether you are an owner, tenant, agent, or prospective client,
            County Property Management is building the website experience around
            clear next steps and better communication.
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-page)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2">
          
          {/* LEFT COLUMN */}
          <div className="cpm-card rounded-2xl p-8">
            <h2 className="text-2xl font-semibold cpm-heading">
              Contact Information
            </h2>

            <div className="mt-6 space-y-4 text-[var(--cpm-muted)]">
              <p>
                <span className="font-semibold cpm-field-label">
                  Phone:
                </span>{' '}
                (805) 482-9800
              </p>

              <p>
                <span className="font-semibold cpm-field-label">
                  Email:
                </span>{' '}
                cpm@c-p-m.com
              </p>
            </div>

            {/* INNER CARD */}
            <div className="mt-8 rounded-2xl border border-[var(--cpm-border)] bg-[var(--cpm-page)] p-6">
              <h3 className="text-xl font-semibold cpm-heading">
                Best next step for owners
              </h3>

              <p className="mt-3 cpm-copy">
                If you are deciding whether to rent, sell, or hold a property,
                start with the Property Strategy Session.
              </p>

              <a
                href="/property-strategy-session"
                className="btn-primary mt-5 inline-flex"
              >
                Book Property Strategy Session
              </a>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="cpm-card rounded-2xl p-8">
            <h2 className="text-2xl font-semibold cpm-heading">
              Quick Contact Form
            </h2>

            <p className="mt-3 cpm-copy">
              Send us a message and our team will follow up.
            </p>

            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  )
}