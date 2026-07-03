# CPM GEO — Edge Reality, Deploy & Indexing

> **STATUS (2026-07-03): the deploy/indexing to-dos in §3–§5 are DONE.** The `robots.ts`/`sitemap.ts` changes are deployed and serving; the sitemap was submitted to Google Search Console (DNS-verified domain property) and Bing (imported from GSC); and the `/rent-vs-sell` redirect is live in `next.config.ts`. The sitemap is now **~61 URLs** (26 static + 27 blog + 8 FAQ topic pages), not the ~39 quoted below. The **edge-reality facts in §1–§2 remain accurate** and match `app/robots.ts`. Read §3–§5 as the historical checklist that has since been completed.

**Purpose:** Replace the earlier `CPM_Cloudflare_GEO_Handoff.md`, which was written on a false premise (it assumed Cloudflare sat in front of the site — it does not). This doc records the verified edge reality and the steps that actually drive AI/search visibility from here. Focus has shifted from "unblock the edge" to "deploy + get indexed."

**Companions:** `CPM_FAQ_Hub_Framing.md`, `CPM_Blog_Pipeline_Handoff.md` §3.5 (GEO strategy).

---

## 1. The edge reality (verified 2026-06-25)

- **No Cloudflare.** DNS/nameservers are at **Network Solutions** (`ns1/ns2.worldnic.com`). `www.c-p-m.com` resolves to `76.76.21.21` (Vercel). There is no Cloudflare account and no Cloudflare proxy in the path.
- **The real edge is Vercel, on the Hobby (free) plan.** The Vercel Firewall was checked directly: Bot Protection **inactive**, **0** custom rules, Attack Mode **off**, and a sampled hour showed **320 allowed / 0 denied / 0 challenged**. Nothing is blocking any bot.
- **Consequence:** the old worry — an edge silently blocking AI crawlers — never existed. The edge is wide open.

## 2. The policy we ship (and its one limitation)

`app/robots.ts` expresses a **retrieval-only** policy: allow the bots GEO depends on (`OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `ClaudeBot`, `Googlebot`, `Bingbot`, `Applebot`) and `Disallow: /` the training-only crawlers (`GPTBot`, `Google-Extended`, `CCBot`, `Applebot-Extended`, `Meta-ExternalAgent`, `anthropic-ai`).

Two things to keep in mind:

- **robots.txt is honored, not enforced.** It works only for well-behaved crawlers. On the Vercel Hobby plan there are **no WAF custom rules**, so there is no way to *enforce* a block at the edge — robots.txt is the only available lever. A bot that ignores robots.txt cannot be stopped at this tier.
- **Some training tokens are robots.txt-only.** `Google-Extended`, `Applebot-Extended`, and `anthropic-ai` are not distinct HTTP user-agents — they're directives a firewall can't match without also blocking the shared retrieval crawler (`Googlebot` / `Applebot` / `ClaudeBot`). So even with a WAF, you could not firewall-block these without collateral damage. robots.txt is the correct and only home for that distinction.

If hard edge-enforcement ever becomes a requirement, the upgrade paths are Vercel **Pro** (firewall custom rules) or putting an actual reverse proxy / Cloudflare in front — but for a lead-gen site chasing visibility, that's not warranted today.

## 3. Deploy & verify

1. **Deploy.** The `robots.ts` and `sitemap.ts` changes ride the next Vercel deploy from `main`. Until pushed, production still serves no robots.txt/sitemap.
2. **Verify served files** (post-deploy):
   - `https://www.c-p-m.com/robots.txt` — should show the retrieval-only policy (allowed `*`, training UAs disallowed) and the `Sitemap:` line.
   - `https://www.c-p-m.com/sitemap.xml` — ~39 URLs including the `/faq/...` pages.
3. **Bot-UA spot check:** `curl -A "PerplexityBot" -I https://www.c-p-m.com/faq` (and `OAI-SearchBot`, `ClaudeBot`) should return `200`. Optionally confirm a training UA like `GPTBot` is the one you've disallowed in robots.txt (the file says so; nothing enforces it).

## 4. Get indexed — the step that actually drives AI visibility

With the edge open, visibility now depends on being **crawled and indexed**, not on unblocking anything:

- **Google Search Console** — add/verify the property, submit `https://www.c-p-m.com/sitemap.xml`. Google's index feeds AI Overviews.
- **Bing Webmaster Tools** — add/verify, submit the same sitemap. Bing's index feeds Copilot and is used by several other answer engines.
- After a few weeks, sanity-check by asking ChatGPT/Perplexity/Claude a Ventura-County property question and seeing whether CPM content surfaces.

## 5. Loose end (carried from the build session)

A legacy top-level `/rent-vs-sell` page duplicates the canonical `/resources/rent-vs-sell` (the path the nav links). Add a redirect from the former to the latter so you aren't running two pages on the same topic. Not edge-related, but it's the remaining cleanup item.

---

*Prepared 2026-06-25. Supersedes `CPM_Cloudflare_GEO_Handoff.md` (removed). Edge facts verified via DNS lookup and the Vercel Firewall dashboard.*
