import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// Permissive by design: a default `*: allow /` rule lets every crawler in,
// including AI answer engines (GPTBot, ClaudeBot, PerplexityBot, Google-Extended,
// etc.) — which is the point of the GEO work. NOTE: robots.txt only governs
// well-behaved crawlers; if AI bots still can't reach the site, the block is at
// the Cloudflare edge, not here. Only non-content paths are disallowed.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/thank-you'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
