# CPM Cloudflare / AI-Crawler Access — Session Handoff

**Purpose:** Open a focused working session to make sure AI crawlers can actually reach `c-p-m.com`, so the GEO work (FAQ hub, structured data, permissive robots) isn't silently undone at the Cloudflare edge. This doc gives the next Claude session the full context, the exact settings to walk you through, the decisions you need to make, and how to verify the result. The Cloudflare dashboard is yours to operate — Claude can't log into it — so this is a guided checklist, not something Claude can do for you.

**Companion docs:** `CPM_FAQ_Hub_Framing.md`, `CPM_Blog_Pipeline_Handoff.md` §3.5 (GEO strategy).

---

## 1. Why this matters (the one-paragraph version)

The site is built for GEO — answers live in the initial HTML, the FAQ hub emits FAQPage structured data, and `app/robots.ts` explicitly allows every crawler. None of that helps if Cloudflare blocks AI bots at the edge first. A `robots.txt` is a *request* that polite crawlers honor; a Cloudflare bot rule is an *enforcement* that returns a block/challenge before the crawler ever sees your content or your robots.txt. If the "Block AI bots" feature is on (or a managed robots.txt or Bot Fight Mode is catching them), the GEO investment is wasted. This session is about confirming the edge is open to the crawlers you want.

---

## 2. What's already done (so the session doesn't re-derive it)

- **FAQ hub** built (read/render side): `/faq` index + `/faq/<topic>` cluster pages, content in HTML, FAQPage JSON-LD after the visible answer.
- **`app/robots.ts`** — permissive: `User-agent: * / Allow: /`, disallowing only `/api/` and `/thank-you`; points to the sitemap. This is GEO-correct and needs no change.
- **`app/sitemap.ts`** — 39 URLs (static pages + all blog posts + both FAQ topics). Canonical host in `lib/site.ts` = `https://www.c-p-m.com` (override via `NEXT_PUBLIC_SITE_URL`).
- **Deploy dependency:** these are code; they only go live after a deploy to `main` → Vercel. Until then, `https://www.c-p-m.com/robots.txt` and `/sitemap.xml` won't reflect the new files. Confirm the deploy before testing crawler access against production.

## 3. What's verified vs. unknown

**Verified externally (June 2026):** the site is live, fully server-rendered (homepage content is in raw HTML), and a generic fetch was *not* challenged. So Cloudflare isn't hard-blocking all automated traffic.

**Unknown (dashboard-only):** whether Cloudflare is blocking *named AI crawler user-agents* (GPTBot, ClaudeBot, PerplexityBot, etc.). Those rules match on user-agent, so a generic fetch can't reveal them. This is the whole reason for the session.

---

## 4. Decisions to make before/at the start of the session

These are business calls, not technical ones. Claude can explain trade-offs but you decide.

1. **Retrieval vs. training.** AI crawlers fall into two buckets:
   - **Live retrieval / answer engines** — fetch a page in real time to answer a user's question and often cite/link it (`OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `ClaudeBot` for Claude's web access, plus `Googlebot`/`Bingbot` which feed Google AI Overviews and Copilot). **These are the ones GEO depends on — you almost certainly want them allowed.**
   - **Training crawlers** — collect content to train models, usually with no citation back (`GPTBot`, `Google-Extended`, `CCBot`, `Applebot-Extended`, `Meta-ExternalAgent`, `anthropic-ai`). Allowing these helps a model "know" CPM over time but sends no direct traffic. Some owners allow them, some block them on principle. **Your call.**

   *Recommended default for a small business chasing visibility:* allow retrieval bots (required for GEO), and decide training bots separately — blocking training while allowing retrieval is a legitimate, common stance.

2. **Monetized-content option is irrelevant here.** Cloudflare's "block AI bots only on pages with ads" option doesn't apply — `c-p-m.com` runs no ads. The choice is effectively allow vs. block site-wide.

3. **Pay-per-crawl / AI Audit** (Cloudflare's newer monetization feature) is out of scope — that's for publishers charging AI companies for access. Note it exists; don't enable it for a lead-gen site.

---

## 5. Cloudflare dashboard walkthrough (the core of the session)

Log into Cloudflare and select the `c-p-m.com` zone. Cloudflare moves things around, so if a path below doesn't match, use the dashboard search for the **bolded feature name**. Check these in order:

1. **Block AI bots** — *Security → Settings* (the new application-security dashboard), filter by **Bot traffic**, open **Block AI bots**. Options are "Only block on hostnames with ads," "Block on all pages," and "Do not block (off)." **For GEO, set this to "Do not block (off)."** If it's currently "Block on all pages," this is very likely the culprit.

2. **Managed robots.txt** — *Security → Settings* (same area) / the AI bot controls. If Cloudflare is set to **create and manage a robots.txt**, it can inject `Disallow` rules for AI bots that override the permissive `app/robots.ts` you ship. Either turn the managed robots.txt **off** (so your app's robots.txt serves) or confirm it isn't disallowing the bots you want. After the session, re-check what `https://www.c-p-m.com/robots.txt` actually returns — Cloudflare's version wins if both exist.

3. **Bot Fight Mode / Super Bot Fight Mode** — *Security → Bots*. Plain **Bot Fight Mode** (free plan) challenges traffic it deems automated and can catch crawlers. **Super Bot Fight Mode** (Pro/Business) has explicit toggles for "Definitely automated," "Likely automated," and a separate **"Verified bots"** allowance. Make sure verified/known good bots are allowed and that you're not challenging the AI crawlers you want. If on the free plan with Bot Fight Mode, weigh whether it's worth the GEO risk.

4. **WAF custom rules** — *Security → WAF → Custom rules* (and *Managed rules*). Look for any rule that blocks or challenges based on user-agent containing `bot`, `GPTBot`, `crawler`, etc., or that references an AI-bot list. Pre-existing rules here can quietly block crawlers regardless of the settings above.

5. **(Optional) AI Audit / bot analytics** — *Security → Bots* analytics shows which bots have been hitting the site and what was allowed/blocked. Useful for confirming the problem and, later, the fix.

---

## 6. How to verify after changes

Do this **after** the new `robots.ts`/`sitemap.ts` are deployed to production and the Cloudflare changes are saved:

- **robots.txt served:** visit `https://www.c-p-m.com/robots.txt` in a browser. It should match `app/robots.ts` (permissive, sitemap line present) — *not* a Cloudflare-managed file full of AI `Disallow`s.
- **sitemap served:** visit `https://www.c-p-m.com/sitemap.xml` — should list ~39 URLs including the `/faq/...` pages.
- **Bot-UA fetch test:** from a terminal, request the site with an AI-crawler user-agent and confirm you get the page, not a 403/challenge. Example: `curl -A "GPTBot" -I https://www.c-p-m.com/faq` (and repeat with `PerplexityBot`, `OAI-SearchBot`, `ClaudeBot`). A `200` = open; `403`/`503`/challenge HTML = still blocked. *(Claude can't run this for you — its tools can't spoof crawler user-agents — but it can interpret whatever output you paste back.)*
- **Cloudflare bot analytics:** over the following days, confirm AI bots show as allowed.
- **Search/AI indexing:** submit the sitemap in **Google Search Console** and **Bing Webmaster Tools**; Bing also feeds Copilot. Optionally test a question in ChatGPT/Perplexity/Claude after a few weeks to see if CPM content surfaces.

---

## 7. Reference — key AI crawler user-agents

| User-agent | Operator | Bucket | GEO value |
|---|---|---|---|
| `OAI-SearchBot` | OpenAI | Retrieval (ChatGPT search) | High — cites/links |
| `ChatGPT-User` | OpenAI | Retrieval (user-triggered) | High |
| `GPTBot` | OpenAI | Training | Indirect |
| `PerplexityBot` | Perplexity | Retrieval | High — cites/links |
| `ClaudeBot` | Anthropic | Retrieval/training | Medium–High |
| `Google-Extended` | Google | Training (Gemini) | Indirect |
| `Googlebot` | Google | Index → AI Overviews | High |
| `Bingbot` | Microsoft | Index → Copilot | High |
| `Applebot` / `Applebot-Extended` | Apple | Retrieval / training | Medium |
| `CCBot` | Common Crawl | Training (many models) | Indirect |
| `Meta-ExternalAgent` | Meta | Training | Indirect |

---

## 8. What to bring to the session / what Claude can do there

**Bring:** access to the Cloudflare dashboard for `c-p-m.com`, and confirmation of whether the new `robots.ts`/`sitemap.ts` have been deployed to production yet.

**Claude can:** walk you screen-by-screen through Sections 5–6, interpret the settings/analytics/curl output you paste or screenshot, draft any WAF allow-rule wording you need, and help submit the sitemap to Search Console/Bing. If you want a finer-grained policy than the Cloudflare toggle allows (e.g., allow retrieval bots but block training bots), Claude can extend `app/robots.ts` with per-user-agent rules to match — though remember robots.txt is honored, not enforced, so the Cloudflare edge settings are what actually gate access.

**Open item carried in from the build session:** a legacy top-level `/rent-vs-sell` page duplicates the canonical `/resources/rent-vs-sell`; consider a redirect. Not Cloudflare-related, but it's the other loose end.

---

*Prepared 2026-06-25. Cloudflare feature names/locations verified against Cloudflare docs as of June 2026; the dashboard layout changes periodically, so use search if a path doesn't match.*
