import ProfessionalPartnerForm from '@/components/forms/ProfessionalPartnerForm'

export default function ProfessionalPartnersPage() {
  return (
    <main>
      {/* HERO SECTION */}
      <section className="bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-6xl px-4 py-24">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              Professional Partnerships
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--cpm-text)] md:text-6xl">
              Partner With Us to Deliver Better Outcomes for Your Clients
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--cpm-muted)]">
              We collaborate with CPAs, attorneys, loan officers, and wealth
              advisors to guide clients through real estate decisions that
              impact long-term wealth.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#partner-form"
                className="rounded btn-primary px-6 py-3 text-white transition hover:opacity-90"
              >
                Become a Referral Partner
              </a>

              <a
                href="/property-strategy-session"
                className="rounded border border-gray-300 px-6 py-3 text-[var(--cpm-text)] transition hover:bg-[var(--cpm-page)]"
              >
                Book a Strategy Call
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* WHO THIS IS FOR */}
      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-[var(--cpm-text)]">
              Who this is for
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-[var(--cpm-muted)]">
              We work with professionals whose clients are facing meaningful
              real estate decisions that benefit from practical strategy,
              coordination, and clear next steps.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            <div className="cpm-card rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-[var(--cpm-text)]">CPAs</h3>
              <p className="mt-3 text-[var(--cpm-muted)]">
                Support clients making property decisions that affect taxes,
                timing, cash flow, and broader financial planning.
              </p>
            </div>

            <div className="cpm-card rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-[var(--cpm-text)]">Attorneys</h3>
              <p className="mt-3 text-[var(--cpm-muted)]">
                Help clients navigate ownership transitions, inherited
                properties, disputes, or restructuring with a strategy-minded
                real estate partner.
              </p>
            </div>

            <div className="cpm-card rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-[var(--cpm-text)]">
                Loan Officers
              </h3>
              <p className="mt-3 text-[var(--cpm-muted)]">
                Work together when financing questions intersect with whether a
                client should hold, sell, rent, or reposition a property.
              </p>
            </div>

            <div className="cpm-card rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-[var(--cpm-text)]">
                Wealth Managers
              </h3>
              <p className="mt-3 text-[var(--cpm-muted)]">
                Align real estate decisions with broader portfolio goals,
                liquidity needs, and long-term wealth strategy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-surface)]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-[var(--cpm-text)]">
              How it works
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            <div className="cpm-card rounded-2xl p-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-full btn-primary text-sm font-semibold text-white">
                1
              </div>
              <h3 className="mt-5 text-xl font-semibold text-[var(--cpm-text)]">
                You refer a client
              </h3>
              <p className="mt-3 text-[var(--cpm-muted)]">
                Introduce a client who would benefit from clearer real estate
                guidance or a strategy conversation.
              </p>
            </div>

            <div className="cpm-card rounded-2xl p-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-full btn-primary text-sm font-semibold text-white">
                2
              </div>
              <h3 className="mt-5 text-xl font-semibold text-[var(--cpm-text)]">
                We evaluate the situation
              </h3>
              <p className="mt-3 text-[var(--cpm-muted)]">
                We assess the property, timing, goals, and practical decision
                points affecting the client.
              </p>
            </div>

            <div className="cpm-card rounded-2xl p-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-full btn-primary text-sm font-semibold text-white">
                3
              </div>
              <h3 className="mt-5 text-xl font-semibold text-[var(--cpm-text)]">
                We recommend a path
              </h3>
              <p className="mt-3 text-[var(--cpm-muted)]">
                We help clarify whether the best move is to hold, rent, sell, or
                reposition based on the client’s situation.
              </p>
            </div>

            <div className="cpm-card rounded-2xl p-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-full btn-primary text-sm font-semibold text-white">
                4
              </div>
              <h3 className="mt-5 text-xl font-semibold text-[var(--cpm-text)]">
                We help execute
              </h3>
              <p className="mt-3 text-[var(--cpm-muted)]">
                When appropriate, we support the next step while keeping the
                client relationship aligned and professionally coordinated.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY PARTNER WITH US */}
      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <div className="rounded-3xl border border-[var(--cpm-border)] bg-[var(--cpm-surface)] p-10">
            <h2 className="text-3xl font-semibold text-[var(--cpm-text)]">
              Why partner with us
            </h2>

            <ul className="mt-8 space-y-4 text-lg leading-8 text-[var(--cpm-muted)]">
              <li>• Simplify complex decisions</li>
              <li>• Align real estate with financial strategy</li>
              <li>• Support, not replace, client relationships</li>
              <li>• Strategy-first, not sales-first</li>
            </ul>
          </div>
        </div>
      </section>

      {/* REFERRAL / INCENTIVE */}
      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-surface)]">
        <div className="mx-auto max-w-5xl px-4 py-20">
          <div className="rounded-3xl border border-[var(--cpm-border)] bg-[var(--cpm-page)] p-10">
            <h2 className="text-3xl font-semibold text-[var(--cpm-text)]">
              Flexible, professional partnership structure
            </h2>

            <p className="mt-6 text-lg leading-8 text-[var(--cpm-muted)]">
              We offer referral participation structures where appropriate and
              compliant, while keeping the focus on client fit, professional
              coordination, and long-term relationship value.
            </p>

            <p className="mt-4 text-[var(--cpm-muted)]">
              The goal is not to create an open directory or transactional
              handoff. It is to build a thoughtful referral channel that helps
              clients make better real estate decisions with the right guidance.
            </p>
          </div>
        </div>
      </section>

      {/* FORM SECTION */}
      <section id="partner-form" className="border-t border-[var(--cpm-border)] bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-4xl px-4 py-20">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-semibold text-[var(--cpm-text)]">
              Become a referral partner
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-[var(--cpm-muted)]">
              Tell us a little about your practice and how you would like to
              collaborate.
            </p>
          </div>

          <div className="rounded-3xl border border-[var(--cpm-border)] bg-[var(--cpm-surface)] p-8 md:p-10">
            <ProfessionalPartnerForm />

            <div className="mt-6 text-sm text-[var(--cpm-muted)]">
              Prefer to talk first?{' '}
              <a
                href="/property-strategy-session"
                className="font-medium text-[var(--cpm-text)] underline underline-offset-2"
              >
                Schedule a call
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}