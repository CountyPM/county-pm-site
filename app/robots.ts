import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// Retrieval-only policy. The default `*: allow /` rule lets retrieval/answer
// engines and search crawlers in (OAI-SearchBot, ChatGPT-User, PerplexityBot,
// ClaudeBot, Googlebot, Bingbot, Applebot) — the bots GEO depends on. Training-
// only crawlers are explicitly disallowed below. NOTE: robots.txt is honored,
// not enforced — it only governs well-behaved crawlers, and here it is the ONLY
// lever: the site runs on Vercel (Hobby plan) with no Cloudflare/WAF edge, so
// there is no way to hard-block bots before they hit the app. The training-only
// tokens below (Google-Extended, Applebot-Extended, anthropic-ai, etc.) are
// robots.txt-only anyway — they have no distinct user-agent a firewall could
// match without also blocking the shared retrieval crawler. Only non-content
// paths are disallowed for allowed bots.
const TRAINING_BOTS = [
  'GPTBot',
  'Google-Extended',
  'CCBot',
  'Applebot-Extended',
  'Meta-ExternalAgent',
  'anthropic-ai',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/thank-you'],
      },
      {
        userAgent: TRAINING_BOTS,
        disallow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
