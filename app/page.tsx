export default function HomePage() {
  return (
    <main className="bg-[var(--cpm-page)] text-[var(--cpm-text)]">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-t border-[var(--cpm-border)]">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/hero-building-tuned.jpg')",
          }}
        />

        {/* Overlay (controls darkness) */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--cpm-page)]/65 via-[var(--cpm-page)]/45 to-[var(--cpm-page)]/10" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-24">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--cpm-primary-soft)]">
                Ventura County Real Estate Advisor
              </p>

              <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-tight text-[var(--cpm-text)] md:text-5xl lg:max-w-3xl lg:text-6xl">
                Could your property be the foundation of your long-term wealth?
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--cpm-muted)]">
                For many Ventura County owners, the biggest question is not just
                whether to rent or sell. It is whether this property could become
                a serious wealth-building asset — or even help you position
                yourself to acquire additional properties over time. County
                Property Management helps you evaluate the opportunity, the risks,
                and the right next move.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a href="/property-strategy-session" className="btn-primary">
                  Book Property Strategy Session
                </a>

                <a href="/resources/rent-vs-sell" className="btn-secondary">
                  Explore Rent vs Sell
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[var(--cpm-muted)]">
                <p>Owner-focused decision guidance</p>
                <p>Ventura County market perspective</p>
                <p>Strategy before commitment</p>
              </div>
            </div>

            <div>
              <div className="rounded-3xl border border-[var(--cpm-border)] bg-[var(--cpm-surface)] p-5 shadow-sm md:p-6">
                <div className="mb-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--cpm-primary-soft)]">
                    Featured Video
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-[var(--cpm-text)]">
                    Rent, sell, or hold?
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--cpm-muted)]">
                    Hear more from County Property Management about making
                    smarter real estate decisions in Ventura County.
                  </p>
                </div>

                <div className="overflow-hidden cpm-card rounded-2xl">
                  <div className="aspect-video w-full">
                    <iframe
                      className="h-full w-full"
                      src="https://www.youtube.com/embed/E6HCdfevbJ8"
                      title="County Property Management YouTube Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                </div>

                <div className="mt-4 cpm-card rounded-2xl px-4 py-3">
                  <p className="text-sm text-[var(--cpm-muted)]">
                    Start here if you are trying to decide whether this property
                    should generate income, be repositioned, or be sold.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DECISION FRAMEWORK */}
      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-surface)]">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h2 className="text-3xl font-semibold text-[var(--cpm-text)]">
            Property ownership should be a decision, not a guess
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[var(--cpm-muted)]">
            A home, condo, or investment property can create income,
            flexibility, and long-term upside, but only if you approach it with
            a real strategy. The question is not just what this property is
            worth today, but how it could support your future — including the
            possibility of building toward additional investments.
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {['Rent', 'Sell', 'Hold'].map((title, index) => {
              const descriptions = [
                'Generate income and position the property as a potential long-term wealth-building asset that may help support future acquisitions.',
                'Capture equity now and decide how to redeploy that capital — whether into a different property, a better opportunity, or a more strategic position.',
                'Preserve flexibility while evaluating appreciation, timing, and how the property may fit into a longer-term portfolio strategy.',
              ]

              return (
                <div
                  key={title}
                  className="cpm-card rounded-2xl p-8"
                >
                  <h3 className="text-xl font-semibold text-[var(--cpm-primary-soft)]">
                    {title}
                  </h3>
                  <p className="mt-3 text-[var(--cpm-muted)]">
                    {descriptions[index]}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FUNNEL ENTRY */}
      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-center text-3xl font-semibold text-[var(--cpm-text)]">
            How can we help you move forward?
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              [
                '/property-strategy-session',
                'Property Owners',
                'Evaluate whether your property should be rented, sold, or held as part of a larger wealth-building strategy.',
                '',
              ],
              [
                '/resources/rent-vs-sell',
                'Considering Selling',
                'Compare immediate liquidity against the long-term opportunity your property may still hold.',
                '',
              ],
              [
                '/resources/rent-vs-sell',
                'Rent vs Sell Guide',
                'Learn how to evaluate whether your property is better used for income, equity growth, or a sale.',
                '',
              ],
              [
                '/tenant-homebuyer',
                'Tenant Homebuyers',
                'Explore whether continuing to rent or starting to buy makes more sense based on your goals, timeline, and finances.',
                'Rent vs Buy Tools →',
              ],
              [
                '/agents',
                'Real Estate Agents',
                'Refer clients with confidence and support owners making bigger, strategy-driven property decisions.',
                '',
              ],
              [
                '/professional-partners',
                'Professional Partners',
                'CPAs, attorneys, wealth managers, and loan officers can refer clients for smarter real estate decision support.',
                'Refer a Client →',
              ],
              [
                '/blog',
                'Resource Center',
                'Explore owner strategy, property management insights, and real estate guidance focused on long-term decision-making.',
                '',
              ],
            ].map(([href, title, description, cta]) => (
              <a
                key={title}
                href={href}
                className="cpm-card rounded-2xl p-8 transition hover:border-[var(--cpm-primary-soft)] hover:shadow"
              >
                <h3 className="text-xl font-semibold text-[var(--cpm-text)]">
                  {title}
                </h3>
                <p className="mt-3 text-[var(--cpm-muted)]">{description}</p>
                {cta ? (
                  <p className="mt-4 text-sm font-medium text-[var(--cpm-primary-soft)]">
                    {cta}
                  </p>
                ) : null}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* QUICK ACCESS */}
      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-surface)]">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex flex-col gap-4 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--cpm-primary-soft)]">
              Quick Access
            </p>
            <h2 className="text-3xl font-semibold text-[var(--cpm-text)]">
              Direct access for tenants, owners, and rental prospects
            </h2>
            <p className="mx-auto max-w-3xl text-lg leading-8 text-[var(--cpm-muted)]">
              Whether you are looking for current listings or need to access
              your portal, these pages are here to make the next step easy.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              [
                '/available-rentals',
                'Available Rentals',
                'Browse current rental listings, view property details, and access the live AppFolio search experience.',
              ],
              [
                '/tenant-portal',
                'Tenant Portal',
                'Current residents can access account details, payment options, documents, and portal resources.',
              ],
              [
                '/owner-portal',
                'Owner Portal',
                'Property owners can access reporting, statements, and owner-related portal tools in one place.',
              ],
            ].map(([href, title, description]) => (
              <a
                key={title}
                href={href}
                className="rounded-3xl border border-[var(--cpm-border)] bg-[var(--cpm-page)] p-8 transition hover:border-[var(--cpm-primary-soft)] hover:shadow-sm"
              >
                <h3 className="text-xl font-semibold text-[var(--cpm-text)]">
                  {title}
                </h3>
                <p className="mt-3 leading-7 text-[var(--cpm-muted)]">
                  {description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* AUTHORITY SECTION */}
      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-page)]">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center">
          <h2 className="text-3xl font-semibold text-[var(--cpm-text)]">
            Trusted real estate guidance in Ventura County
          </h2>

          <p className="mt-6 text-lg text-[var(--cpm-muted)]">
            Richard Miller brings over 40 years of real estate experience,
            helping property owners make strategic decisions about income,
            equity, timing, and long-term opportunity — not just transactions.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-[var(--cpm-border)] bg-[var(--cpm-surface)]">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <h2 className="text-3xl font-semibold text-[var(--cpm-text)]">
            Find out whether your property has real wealth-building potential
          </h2>

          <p className="mt-4 text-[var(--cpm-muted)]">
            Before you make a costly decision, get clarity on what this property
            could do for you — and how it may fit into a larger long-term
            strategy.
          </p>

          <a href="/property-strategy-session" className="btn-primary mt-8">
            Book Strategy Session
          </a>
        </div>
      </section>
    </main>
  )
}
