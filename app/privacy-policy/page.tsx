import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | County Property Management',
  description:
    'Learn how County Property Management collects, uses, and protects personal information submitted through this website.',
}

const companyName = 'RAWA, Inc'
const contactEmail = 'cpm@c-p-m.com'
const contactPhone = '(805) 482-9800'
const mailingAddress = '1100 Flynn Road Suite 205, Camarillo, CA 93012'

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-[var(--cpm-page)] text-[var(--cpm-text)]">
      <section className="mx-auto max-w-4xl px-4 py-20">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] cpm-eyebrow">
          Legal
        </p>

        <h1 className="mt-4 text-4xl font-bold tracking-tight cpm-heading md:text-5xl">
          Privacy Policy
        </h1>

        <p className="mt-6 text-base leading-7 cpm-copy">
          Effective date: January 1, 2020
        </p>

        <div className="prose prose-invert mt-10 max-w-none">
          <p>
            {companyName} respects your privacy. This Privacy Policy explains
            how we collect, use, disclose, and protect information you submit
            through this website, including through contact forms, lead forms,
            strategy session forms, review forms, and related communications.
          </p>

          <h2>Information we collect</h2>
          <p>Depending on how you interact with the site, we may collect:</p>
          <ul>
            <li>Name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Property address</li>
            <li>Form responses, comments, and messages</li>
            <li>Review feedback and ratings</li>
            <li>
              Technical information such as IP address, browser type, device
              information, and site usage data
            </li>
          </ul>

          <h2>How we use information</h2>
          <p>We may use personal information to:</p>
          <ul>
            <li>Respond to inquiries and provide requested information</li>
            <li>Send requested guides, resources, and follow-up communications</li>
            <li>Schedule or support strategy session requests</li>
            <li>Route reviews and internal notifications</li>
            <li>Operate, improve, and secure the website</li>
            <li>Maintain records of submissions and communications</li>
            <li>Comply with legal, regulatory, and business obligations</li>
          </ul>

          <h2>How information is shared</h2>
          <p>
            We do not sell personal information in exchange for money. We may
            share information with service providers and business partners that
            help us operate the site and communicate with you, such as website
            hosting, analytics providers, CRM platforms, scheduling tools, and
            email service providers. We may also disclose information when
            required by law, to protect rights or safety, or in connection with
            a business transfer.
          </p>

          <h2>Third-party tools and platforms</h2>
          <p>
            This website may use third-party services and integrations, which
            may include CRM, email, booking, analytics, video, and property
            listing platforms. Those providers may process information according
            to their own terms and privacy practices.
          </p>

          <h2>Cookies and analytics</h2>
          <p>
            We and our service providers may use cookies or similar
            technologies to understand website traffic, improve performance, and
            support site functionality. You can control cookies through your
            browser settings, though some features may not function properly if
            cookies are disabled.
          </p>

          <h2>Data retention</h2>
          <p>
            We retain personal information for as long as reasonably necessary
            for the purposes described in this policy, including business,
            legal, operational, and compliance needs.
          </p>

          <h2>Your choices</h2>
          <p>
            You may contact us to request access to, correction of, or deletion
            of certain personal information, subject to applicable law and
            recordkeeping obligations. You may also opt out of marketing emails
            by using the unsubscribe link in those emails, when available.
          </p>

          <h2>California privacy rights</h2>
          <p>
            If California privacy law applies to your information and to our
            business, California residents may have rights that can include the
            right to know, delete, correct, opt out of sale or sharing, limit
            certain uses of sensitive personal information, and receive
            non-discriminatory treatment for exercising privacy rights.
          </p>

          <p>
            To make a privacy request, contact us at{' '}
            <strong>{contactEmail}</strong> or <strong>{contactPhone}</strong>.
            We may need to verify your identity before responding.
          </p>

          <h2>Children’s privacy</h2>
          <p>
            This website is not directed to children under 13, and we do not
            knowingly collect personal information from children under 13.
          </p>

          <h2>Security</h2>
          <p>
            We use reasonable administrative, technical, and physical safeguards
            designed to protect personal information. No method of transmission
            or storage is completely secure, and we cannot guarantee absolute
            security.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be
            posted on this page with an updated effective date.
          </p>

          <h2>Contact us</h2>
          <p>
            {companyName}
            <br />
            {mailingAddress}
            <br />
            {contactEmail}
            <br />
            {contactPhone}
          </p>
        </div>
      </section>
    </main>
  )
}