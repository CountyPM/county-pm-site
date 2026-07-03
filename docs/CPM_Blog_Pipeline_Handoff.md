# CPM Blog Pipeline — Architecture Handoff

**Purpose of this document:** Carry forward every decision made during the architecture phase of the CPM automated blog/FAQ/image pipeline, so the next phase (in Cowork, with direct access to the `county-pm-site` code) can build the posting mechanism and remaining functions without re-litigating settled choices or guessing at things that must be verified against the actual repo.

**Status (updated 2026-07-03):** This is the **architecture-phase** handoff, and the build it hands off to is now **done**. The posting-to-site mechanism (`scripts/post-blog.mjs`), the capture/handoff front (Track D), and subsidiary cross-linking (`scripts/crosslink-faq.mjs` + `lib/faq-entities.ts`) are all built and live — the "blocked on code access" framing is historical. §6 ("MUST-VERIFY before building") and §8 ("Open Threads") are resolved. **The strategy and decisions in §1–§3 (especially §3.5 FAQ/GEO strategy) remain authoritative and are still cited by other docs** — read this doc for the *why*, and `docs/CPM_GEO_Progress_Summary.md` / `docs/CPM_FAQ_Write_Pipeline.md` for current *state*. One later change to note: the publish model is now **auto-publish, no human review gate** (POLICY 2026-07-03), superseding any "human gate / review-first" language below.

---

## 1. Project Goal (unchanged)

Build a bulletproof, Claude-automated pipeline that:

1. Captures blog content as it's created in Claude on an iPad.
2. Converts it into website-ready, formatted final-draft content.
3. Re-renders blog images (Gemini-generated on the same iPad) into high-quality, web-ready assets.
4. Posts the content to the CPM blog.
5. Inspects published content after the fact to error-check (skill improves over time).
6. Handles FAQ — provided upfront with the blog, or derived from the blog if not provided. For objective/fact-based FAQ, finds reliable third-party sources and publishes them with links.
7. Regularly re-validates FAQ source links to confirm they're still live and current.

**Environments:** Claude app on iPad (mandatory origination point), Claude desktop on PC. Claude Chat, Cowork, and Claude Code available as needed.

---

## 2. Hard Constraints (non-negotiable)

- **The iPad is the origination point.** Blog content, Gemini images, and FAQ (when created) all originate on the iPad. This is a structural requirement, not a preference.
- **Blog creation happens in ANY chat** — inside a project or not, often emerging mid-conversation (a tenant dispute, an investment idea, a business venture discussion that turns bloggable). There is no fixed project container to pre-load.
- **The user is not comfortable in the Mac/iPad file environment.** Manual steps on the iPad must be minimal (ideally one action). All heavy file/code work happens on the PC side.

---

## 3. Settled Architecture

### 3.1 Capture & Trigger

- **No ambient auto-trigger is possible on the iPad.** The Claude app does not inject Skills or project instructions into an arbitrary new chat. This was investigated and ruled out — do not design around it.
- **Two-layer triggering instead:**
  - **Deterministic verbal trigger** — a fixed phrase the user types when a conversation turns bloggable (e.g. `>>PACKAGE BLOG` or `cpm-package`). Works identically in every environment because it depends only on the message text. This is the hard guarantee.
  - **Always-on user preferences backstop** — a line in the user's Claude preferences (which DO apply across all chats/platforms) instructing Claude to *offer* to package content when it detects CPM blog intent. This is the ambient catch.
- **One canonical output contract**, stored two ways: as a **Skill** (for Cowork/Code, where it executes) and as a **paste-able reference / preferences entry** (everywhere). These must never drift apart.

### 3.2 Handoff Bridge (iPad → PC)

- **Mechanism:** a dedicated **Google Drive folder pair** — `CPM-Blog-Inbox` (drop) and `CPM-Blog-Processed` (archive). Chosen because the CPM stack already runs on Google (Calendar, Gmail/Drive), and Cowork/Code can read Drive directly.
- **iPad action:** ONE save/share into `CPM-Blog-Inbox`. If Claude can write a file, it does; otherwise the user pastes the packaged text into a Drive file. Either path lands in the same folder, so downstream doesn't care how it arrived.
- **PC action:** Cowork/Code watches `CPM-Blog-Inbox`, processes, moves finished items to `CPM-Blog-Processed` so nothing is handled twice.
- **Honest limitation acknowledged:** fully hands-free (zero iPad action) is NOT possible — the iPad app can't write to the PC or push to a repo on its own. "One tap → Drive → PC picks up" is the realistic target.

### 3.3 Content Contract (the packaged file)

**Format:** Markdown with a YAML-style frontmatter header (readable on iPad, parses cleanly downstream). Filename pattern: `cpm-blog_<slug>.md`.

**Division of labor — iPad stays "dumb," PC stays "smart":**

- **iPad sets:** the content (title, subtitle, body, FAQ Q&As), `decision_intent`, `tags`, `faq_included` flag, the Gemini image prompt, and `source_chat_context`. (These depend on what the content is about, which only the creating conversation knows.)
- **PC sets/decides:** `slug` (generated from title, collision-checked against the live site), `publish_date` (incl. campaign scheduling/spacing), FAQ objective-vs-subjective classification, FAQ sourcing, and all posting mechanics.

**Single-blog frontmatter:**

```
---
type: blog
campaign_id: null
slug: null                  # PC generates, collision-checks
title: "..."
subtitle: "..."
byline: "By Richard J. Miller · Founder, County Property Management · California Broker since 1995"
decision_intent: [ ]        # from: selling, renting, holding, still-deciding
tags: [ ]                   # from established GHL tag set
publish_date: null          # PC sets
status: ready
source_chat_context: "..."
gemini_prompt: "..."        # seed for API image regeneration (see Image section)
faq_included: true|false
---

[article body in Markdown]

---FAQ---

Q: <question>
A: <answer>
```

(No `intent:` line on FAQ entries — classification is a PC-stage job.)

**Established controlled vocabularies (do not invent new values):**
- `decision_intent`: `selling`, `renting`, `holding`, `still-deciding`
- GoHighLevel tags: `blog_lead`, `lead_magnet`, `contact_form`, `strategy_session`, `owner_lead`

### 3.4 Drip Campaigns (parent/child structure)

When Claude proposes a multi-blog campaign, output must keep narrative continuity AND let each post stand alone.

- **Campaign manifest file** — `cpm-campaign_<campaign_id>.md`: holds `campaign_id`, `campaign_title`, `narrative_arc`, and the ordered `sequence` of child filenames.
- **Each child** = a complete single-blog file (fully independently postable) PLUS these added header fields:
  ```
  campaign_id: <id>
  sequence_position: 2
  sequence_total: 4
  prev_in_series: <filename>
  next_in_series: <filename>
  ```
- **Core rule:** narrative connection lives as **metadata** (sequence, prev/next, shared campaign tag) and internal links — NEVER as content dependency. No child may be incomplete without its siblings. This lets the pipeline fan a campaign out into N standalone posts while the site renders them as a connected series.

### 3.5 FAQ / GEO Strategy

**Terminology correction:** The user's original framing was "moving away from SEO into SAI." Retire "SAI." The real disciplines are **GEO** (generative engine optimization) and **AEO** (answer engine optimization), and per Google's own guidance and current practitioner consensus (verified June 2026), these **layer on top of SEO, not replace it.** SEO remains the foundation.

**Architecture: hub-and-spoke.**
- **Central FAQ hub** = the canonical home of every master answer, with its provenance, annotations, and sources. This is the primary GEO asset and the single source of truth. Required for the annotation/reconciliation system to work coherently.
- **Per-blog FAQ sections** = 3–6 most-relevant questions per post, rendered as **references to the hub answers** (not independent copies that can drift). Catches query fan-out in context and makes each post independently citable.
- **One source of truth, two surfaces.** When the hub answer changes, the spoke reflects current state because it references rather than copies. Avoids duplicate-content penalties.

**Answer formatting for extractability (GEO-driven):**
- Lead each answer with the direct answer in the first sentence or two, then expand.
- Clean H2/H3 heading hierarchy; each passage must stand alone (AI engines evaluate passages, not whole pages — "query fan-out").
- Objective answers carry third-party sources inline.
- Emit **FAQPage structured data**, but only AFTER the visible answer exists on the page. Treat schema as supportive, not decisive — it does not guarantee citation.
- FAQ sizing: 3–6 strong questions per post; quality over quantity; no keyword stuffing.

**Living-FAQ annotation system (append-only — never delete):**
- Reconciliation **never overwrites** an existing answer. It **appends dated annotations**. This both de-risks the operation and serves GEO (each annotation is a freshness signal; preserves the answer's accumulated citation history).
- **Annotation types, calibrated phrasing (escalating strength):**
  - Additive: "[New post] adds important context to this answer." → may **auto-post**.
  - Soft revision: "[New post] revisits this topic and may refine the guidance below."
  - Strong revision / contradiction: "Note: [new post] reflects updated thinking that may change the conclusion below." → **queues for user approval** before posting. (Avoid auto-publishing the blunt word "contradicted," especially on sourced objective answers.)
- **Escalation to base rewrite:** any contradiction-grade note **OR** an accumulation of **3 annotations** flags the whole entry to the user for a possible base rewrite. On rewrite, the prompting annotations clear and provenance updates. (Rationale: a heavily-annotated answer degrades as a clean extractable passage — annotations are a holding pattern, not a permanent substitute for editing.)
- **Provenance requirement:** every FAQ entry stores which blog(s) it was derived from + creation date; every annotation records its type, triggering post (with link), and date. Cheap to build in now, expensive to retrofit. Required for reconciliation to function.

### 3.6 Image Pipeline

**Current (old) workflow being replaced:** Gemini app → email to self → ChatGPT "make a similar higher-quality image." **The ChatGPT step is removed.** It was a non-deterministic *regeneration* mislabeled as "upscaling," causing drift and a second creative gamble.

**User's Gemini tier:** Free app → output is **1024×1024 with an embedded SynthID watermark** (the free-tier signature).

**Settled decisions:**
- **Primary path (Cowork phase): regenerate the final asset via the Gemini API from the saved `gemini_prompt`.** User explicitly chose this over fidelity-upscaling. Gives native high resolution, watermark-free (generated clean under API terms — NOT stripping), at ~$0.02–0.05/image. Accepts that the result is a *new* image from the same prompt, not the exact app image.
- **The picked app image travels as a visual REFERENCE** (for QC comparison); the **prompt is the regeneration seed.** Both go in the handoff bundle.
- **Regeneration is non-deterministic → treat output as a proposal** the user can eyeball against the reference before it goes live. Same human-gate principle used elsewhere.
- **Fallback:** for the occasional image where exact composition matters, upscale the original instead. Use **free, open-source Upscayl / Real-ESRGAN** (local, $0; comparable to Topaz at 2x). 
- **Topaz: shelved.** Subscription-only now (~$149/yr for Gigapixel), and unnecessary given the API-regeneration primary path and the strong free fallback. Only revisit if a free trial proves a visible quality gap on real CPM images.
- **SynthID watermark: left intact, never stripped.** It's imperceptible (no visual cost) and stripping a provenance marker is an integrity issue for a credibility-based advisory business. (The API path sidesteps this entirely by generating without a watermark in the first place.)
- **Always-on formatting (deterministic):** resize to blog display dimensions, convert to **WebP** (Next.js-appropriate), compress, name to match the blog slug.
- **Hero vs in-body:** in-body images at 1K are already adequate; only hero/full-width images need the high-res path. Pipeline can branch on usage.

---

## 4. Pipeline Function Backbone (PC side)

The moment a file lands in `CPM-Blog-Inbox`:

1. **Ingest & validate** — read file, confirm contract complete, flag/reject if malformed.
2. **Slug + schedule** — generate slug (collision-checked against live site), assign publish_date (campaign-aware spacing).
3. **Image pairing** — match image(s) + prompt to the blog.
4. **Image produce** — regenerate via Gemini API from prompt (primary) or upscale original (fallback); QC against reference.
5. **Format conversion** — Markdown → the site's actual blog data format (FORMAT UNKNOWN — see §6).
6. **Post to blog** — commit/push/deploy path (UNKNOWN — see §6).
7. **FAQ classify → source → write** — classify each Q objective/subjective; source objective ones; write hub entry first, then generate the referencing spoke on the blog post.
8. **Post-publish inspection** — error-check the live result (improving skill).
9. **FAQ source-link maintenance** — recurring, separate from per-blog flow; shared with subsidiary-link validation (see §5).

---

## 5. Persistent State Assets (the pipeline must maintain)

Several functions depend on a small body of pipeline "state" that lives in Drive or the repo, read at the start of relevant functions and updated at the end:

- **Subsidiary registry** — each subsidiary product/service entity: name, live URL, plain-language description, trigger concepts ("when a blog discusses X, this is relevant"). Used by the cross-linking function. URLs change as those sites get built → it's a maintained asset.
- **Content corpus index** — every published blog + its metadata + its derived FAQ entries with provenance. Used by corpus-wide FAQ regeneration and reconciliation.
- **Shared link-validation routine** — one recurring function that checks live-ness/currency of URLs, pointed at BOTH FAQ sources AND subsidiary URLs. (Same problem, two sources — build once.)

**Two designed-but-not-built functions that depend on the above:**
- **Subsidiary cross-linking** — reviews blog content against the subsidiary registry and proposes contextual links. MUST be a **propose-and-approve** step (at least initially), erring toward FEWER links — aggressive linking turns the advisory blog into an ad and undercuts trust. Cross-domain (subsidiaries have their own sites).
- **Corpus-wide FAQ regeneration** — two operations kept distinct: **gap-finding** (propose NEW FAQ additions — low risk, more automatable) and **reconciliation** (append annotations to existing answers via the §3.5 system — human-gated for contradiction-grade).

---

## 6. MUST-VERIFY Against the Actual Code (before building anything)

These were explicitly NOT established in the available record and MUST be confirmed against the `county-pm-site` repo in Cowork before writing the posting mechanism. Do not assume — check:

- Exact current **production branch name**.
- Exact current **Vercel project name** / deployment config.
- Exact **environment variable names**.
- **GoHighLevel** location ID, pipeline ID, stage IDs.
- **Blog data format** — Markdown? TypeScript objects? JSON? Generated page files? (Determines the §4 step-5 conversion entirely.)
- Exact **file path(s)** for blog articles and the **blog post metadata schema**.
- Whether the blog uses **static generation, server rendering, or hybrid**.
- How the **blog index** and **dynamic blog routes** stay in sync with article data.
- Whether/where a **FAQ hub route** already exists or needs to be created.

### Two infrastructure checks flagged during architecture (GEO-critical):

- **Crawlability / rendering:** Most major AI crawlers (GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, etc.) do NOT execute JavaScript — they read raw HTML and stop. Blog AND FAQ pages **must be SSR or SSG**, with content present in the initial HTML. A client-rendered FAQ hub is invisible to the engines this whole strategy targets.
- **Cloudflare AI-bot blocking:** Cloudflare changed its default config to block AI bots. CPM's DNS runs through Cloudflare. **Verify AI crawlers are not currently being blocked at the edge** — if they are, it silently undercuts the entire GEO/FAQ effort.

---

## 7. Cross-cutting Principles (apply throughout)

- **Keep the iPad dumb, keep the PC smart** — defer every decision that can wait to the more capable, deterministic, web-connected, code-aware environment.
- **Human gate on anything editorial or irreversible** — auto-edits to a credibility-based advisory site are high-cost; a one-tap approval is low-cost. Propose, don't silently publish, for: subsidiary links, contradiction-grade FAQ annotations, base FAQ rewrites, and (initially) regenerated images.
- **Preserve existing site architecture** — the lead-capture API routes (`/api/blog-lead`, `/api/lead-magnet`, `/api/contact`, `/api/reviews`, `/api/strategy-session`) and the plain-text blog content workflow must be preserved unless intentionally redesigned.
- **GEO is young and unstable** (40–60% of AI-cited sources rotate month-to-month). Hold the hub-and-spoke design as a well-reasoned bet, not a guarantee. It degrades gracefully — even if GEO tactics shift, clean central FAQ + relevant per-post Q&A is just good content architecture.

---

## 8. Open Threads (not yet designed in detail)

- The **posting-to-site mechanism** (git → Vercel commit/push/deploy path) — the first piece genuinely blocked on code access; the reason for this handoff.
- **Post-publish inspection** function — error-checking live content; intended to improve over time.
- **Subsidiary cross-linking** function — designed in principle (§5), not specced.
- Whether to migrate image *generation* to the Gemini API entirely vs. keeping interactive app composition + API regeneration (currently: keep app composition, regenerate via API).
