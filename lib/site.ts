// lib/site.ts
// Canonical, absolute site origin used by robots.ts, sitemap.ts, and (later)
// structured data. Override per-environment with NEXT_PUBLIC_SITE_URL; defaults
// to the production host. Trailing slash stripped so callers can append paths.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.c-p-m.com'
).replace(/\/+$/, '')
