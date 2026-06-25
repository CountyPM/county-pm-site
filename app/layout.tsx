import './globals.css'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import { organizationLd, jsonLd } from '@/lib/structured-data'

export const metadata = {
  title: 'County Property Management',
  description: 'Ventura County property strategy, management, and owner guidance.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />

        {/* Sitewide Organization JSON-LD — present on every route so a stable
            business node exists for Article publisher references to resolve. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(organizationLd()) }}
        />
      </body>
    </html>
  )
}