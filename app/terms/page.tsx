import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Use | County Property Management',
  description:
    'Review the terms governing use of the County Property Management website.',
}

const companyName = 'RAWA, Inc'
const contactEmail = 'cpm@c-p-m.com'
const mailingAddress = '1100 Flynn Road Suite 205, Camarillo, CA 93012'

export default function TermsPage() {
  return (
    <main className="bg-[var(--cpm-page)] text-[var(--cpm-text)]">
      <section className="mx-auto max-w-4xl px-4 py-20">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] cpm-eyebrow">
          Legal
        </p>

        <h1 className="mt-4 text-4xl font-bold tracking-tight cpm-heading md:text-5xl">
          Terms of Use
        </h1>

        <p className="mt-6 text-base leading-7 cpm-copy">
          Effective date: January 1, 2020
        </p>

        <div className="prose prose-invert mt-10 max-w-none">
          <p>
            These Terms of Use govern your use of this website operated by{' '}
            {companyName}. By accessing or using this site, you agree to these
            terms. If you do not agree, do not use the site.
          </p>

          <h2>Website purpose</h2>
          <p>
            This website provides general information about property management,
            real estate advisory services, rentals, resources, and related
            business offerings. Content is provided for informational purposes
            only.
          </p>

          <h2>No legal, tax, or investment advice</h2>
          <p>
            Information on this site does not constitute legal, tax,
            accounting, appraisal, lending, or investment advice. You should
            consult appropriate professionals regarding your particular
            situation.
          </p>

          <h2>No guarantee of results</h2>
          <p>
            Real estate outcomes depend on market conditions, property-specific
            factors, financing, regulation, and individual circumstances. We do
            not guarantee any particular financial result, rental performance,
            property value, sale outcome, or investment return.
          </p>

          <h2>Communications</h2>
          <p>
            By submitting a form through this website, you consent to being
            contacted regarding your inquiry, requested resource, or requested
            service, subject to applicable law and our Privacy Policy.
          </p>

          <h2>Acceptable use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the site for unlawful, fraudulent, or harmful activity</li>
            <li>
              Attempt to disrupt, damage, or gain unauthorized access to the
              site or its systems
            </li>
            <li>
              Copy, scrape, or reuse content in a way that violates applicable
              law or our rights
            </li>
            <li>
              Submit false, misleading, or abusive information through forms
            </li>
          </ul>

          <h2>Third-party links and services</h2>
          <p>
            This site may link to or embed third-party services, websites, or
            tools. We are not responsible for the content, availability, or
            privacy practices of those third parties.
          </p>

          <h2>Intellectual property</h2>
          <p>
            Unless otherwise stated, website content, branding, text, graphics,
            layout, and other materials are owned by or used with permission by{' '}
            {companyName}. You may not reproduce or distribute them without
            permission, except as allowed by law.
          </p>

          <h2>Disclaimer of warranties</h2>
          <p>
            This site is provided on an “as is” and “as available” basis,
            without warranties of any kind, express or implied, to the fullest
            extent permitted by law.
          </p>

          <h2>Limitation of liability</h2>
          <p>
            To the fullest extent permitted by law, {companyName} shall not be
            liable for indirect, incidental, consequential, special, exemplary,
            or punitive damages arising out of or related to your use of this
            website.
          </p>

          <h2>Changes to these terms</h2>
          <p>
            We may update these Terms of Use from time to time. Continued use of
            the site after changes are posted constitutes acceptance of the
            revised terms.
          </p>

          <h2>Governing law</h2>
          <p>
            These terms are governed by the laws of the State of California,
            without regard to conflict of law principles.
          </p>

          <h2>Contact</h2>
          <p>
            {companyName}
            <br />
            {mailingAddress}
            <br />
            {contactEmail}
          </p>
        </div>
      </section>
    </main>
  )
}