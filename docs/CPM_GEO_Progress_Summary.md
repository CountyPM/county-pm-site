# CPM GEO Initiative — Progress Summary (current state, rev. 3 — 2026-07-03)

Snapshot of the FAQ-hub / GEO work. **Rev. 3 rewrites this doc to reflect the actual shipped state.** Earlier revisions framed most of the initiative as pending or deferred; nearly all of it has since been built and is live. Where a claim below is verifiable in the repo, the file/script is named.

---

## 1. What this initiative is (unchanged)

Make County Property Management's site discoverable and citable by AI answer engines (GEO) and search. The centerpiece is a **hub-and-spoke FAQ system**: a canonical FAQ hub holding master answers (with provenance, sources, and a living-update log) that emits structured data, plus per-blog "spokes" that reference hub answers rather than copying them. Supporting work: crawler discoverability (robots/sitemap), confirming the edge doesn't block AI crawlers, an automated write/maintenance pipeline, capture from an iPhone, hero images, and structured data.

## 2. Core GEO — BUILT + LIVE (verified)

- **FAQ hub, read/render side.** `lib/faq.ts` data model, one file per entry at `content/faq/<slug>.md` with provenance frontmatter (`question, topic, type, derivedFrom, created, sources[], annotations[]`). Routes: `/faq` index + SSG `/faq/<topic>` topic-cluster pages, each Q&A a standalone passage with a stable `#anchor`. Answers in the initial HTML (crawler-visible); **FAQPage JSON-LD** emitted after the visible answer. **33 live entries across 8 topics.**
- **Per-blog spoke.** `faq: [slug]` frontmatter renders a "Related questions" block linking to the hub (references, not copies).
- **Discoverability.** `app/robots.ts` (retrieval-only policy) + `app/sitemap.ts` + `lib/site.ts` canonical `SITE_URL`. Sitemap is now **~61 URLs** (26 static routes + 27 blog posts + 8 FAQ topic pages), not the 39 quoted in rev. 2.
- **Deploy verified + indexing submitted.** Live deploy confirmed; sitemap submitted to Google Search Console (DNS-verified domain property) and Bing (imported from GSC).
- **`/rent-vs-sell` redirect.** Legacy path 308-redirects to canonical `/resources/rent-vs-sell` — live in `next.config.ts`.

## 3. Edge reality (settled)

Site is **not behind Cloudflare** — DNS at Network Solutions, hosting on **Vercel (Hobby)**, Vercel Firewall fully open. robots.txt is the only policy lever (honored, not enforced). Full detail: `docs/CPM_GEO_Edge_and_Indexing.md`.

## 4. Key decisions locked

- **Storage:** one Markdown file per FAQ entry.
- **URL shape:** topic-cluster pages with per-question anchors.
- **Spoke:** `faq: [slug]` frontmatter; blog template pulls from the hub.
- **Bot policy: RETRIEVAL-ONLY.** Allow answer/search crawlers (OAI-SearchBot, ChatGPT-User, PerplexityBot, ClaudeBot, Googlebot, Bingbot, Applebot); disallow training-only crawlers (GPTBot, Google-Extended, CCBot, Applebot-Extended, Meta-ExternalAgent, anthropic-ai). Implemented in `app/robots.ts`.
- **Publish policy: AUTO-PUBLISH, no human review gate (POLICY 2026-07-03).** Both the FAQ pipeline and the blog capture runner publish to the live site automatically. The only automated brake is the objective-source hold in `validate:faq` (an objective entry cannot ship without a verified citation). Drafts/packets are agent work queues, not approval queues. This supersedes the earlier "human gate / review-first" framing in the older handoff docs.

## 5. Track status — all built

| Track | Scope | Status |
|---|---|---|
| **A** | FAQ write/maintenance pipeline | **BUILT + LIVE** — slices 1–3 (below) |
| **B** | Source-link validation | **BUILT** — `scripts/check-faq-sources.mjs`, baseline + weekly task `faq-source-link-check` |
| **C** | Hero-image pipeline | **BUILT** — `scripts/gen-hero.mjs` + diversity checker; 16 live heroes; wired into blog runner |
| **D** | Capture / handoff (iPhone → live) | **BUILT + CLOSED** — email bridge, `/blog` trigger, multi-post fan-out, backlog migration |
| **E** | Structured data | **BUILT** — `lib/structured-data.ts`: Article(BlogPosting) + sitewide Organization(RealEstateAgent) + FAQPage JSON-LD |

### Track A detail (three slices, all built)

- **Slice 1 — write path.** Corpus index (`build-faq-corpus-index.mjs`, now multi-dir: indexes `content/blog`, `content/faq`, `.blog-processed`, `.faq-backfill`), classify→source→write (`draft-faq-entries.mjs`), backfill seam (`backfill-faq-feedstock.mjs`), auto-source registry (`faq-source-registry.json`), validator (`validate-faq.mjs`), two-stage auto-publish.
- **Slice 2 — reconciliation engine.** `scripts/reconcile-faq.mjs` (`npm run reconcile:faq`): backlink/similarity touch, contradiction sniff, append-only dated annotations, escalation to base-rewrite proposals, full-auto publish behind the `validate:faq` gate.
- **Slice 3 — subsidiary registry + cross-linking.** `scripts/crosslink-faq.mjs` (`npm run crosslink:faq`) + `lib/faq-entities.ts`; `faqPageLd` JSON-LD + "Related questions" render; reciprocity validation. **Note:** cross-linking is NOT yet wired into `publish-faq.ps1`, so cross-links are only applied on a manual run — the one remaining integration gap in Track A.

Full design + usage: `docs/CPM_FAQ_Write_Pipeline.md`.

## 6. Two-host execution model (how the automation actually runs)

The scheduled agent runs in a **Linux sandbox** that cannot `next build` (no platform SWC), reach the network (source checks), or `git push`. So the pipeline is deliberately split:

- **Stage 1 — sandbox agent tasks (author + validate):** `faq-write-publish-pipeline` (weekly Mon) drafts/reconciles/writes GEO answers → moves finished entries into `content/faq/` → gates with `validate:faq` (pure-JS, runs anywhere).
- **Stage 2 — Windows publish job (`scripts/publish-faq.ps1`, daily via Task Scheduler):** clears any stale `.git/index.lock`, re-runs `validate:faq`, stages only `content/faq` + the registry, commits, pushes → Vercel deploys. No-ops when nothing changed.

This split is the design, not a defect. The residual reliability gap is that the handoff is **timing-coupled** and there's **no failure/heartbeat signal** if the weekly authoring task silently produces nothing or errors.

## 7. Also live but outside the original A–E scope

- **`cpm-social-drafts`** — twice-weekly (Tue/Fri) task assembling CPM LinkedIn + Google Business Profile post drafts for manual approval. Distribution arm added after the original roadmap. See `docs/CPM_Social_Drafts_Task.md`.

## 8. Remaining / open items

1. **Wire `crosslink:faq` into `publish-faq.ps1`** — completes Track A slice 3 (currently manual-only).
2. **Add a failure/heartbeat signal** to the weekly FAQ authoring task so a stalled or empty week is noticed.
3. **Image-diversity backlog decision** — pre-rule hero repeats (for-sale sign ×3, keys ×3, desk/docs ×2) remain live; decide re-spin vs enforce-forward. See `track-c-image-diversity-rule`.
4. **GEO effectiveness readout** — nothing yet measures the outcome the initiative exists for: indexation coverage (GSC/Bing) + periodic AI-citation spot checks. The only genuinely new build worth adding.
5. **Repo hygiene** — a `.gitattributes` normalization pass would end the phantom CRLF/EOL diffs that make working-tree state noisy.

---

*Rev. 3 prepared 2026-07-03 at repo HEAD `88d58ab`. Verified against the repo (scripts, `lib/`, `app/robots.ts`, `app/sitemap.ts`, `next.config.ts`), the live scheduled-task list, and git history.*
