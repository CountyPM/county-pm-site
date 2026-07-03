# CPM FAQ Hub — Build Framing (for the next session)

> **SUPERSEDED (2026-07-03): the hub described here is BUILT and LIVE.** This was a "build-this-next-session" brief written when no FAQ route, component, or content existed (see §1). It has been fully consumed: `lib/faq.ts`, the `/faq` + `/faq/<topic>` routes, FAQPage JSON-LD, per-blog spokes, and **33 live entries across 8 topics** all exist, and the write/maintenance pipeline (Track A, slices 1–3) is built on top. All four "decisions to make" in §4 were resolved as the recommended defaults. Kept for historical context only — for current state see `docs/CPM_GEO_Progress_Summary.md` and `docs/CPM_FAQ_Write_Pipeline.md`.

**Purpose:** Open the next session straight into building the FAQ hub. This frames *what to build, what's already decided, what to decide first, and where to stop* — so we don't re-derive the strategy or re-verify the repo. It synthesizes Handoff §3.5 (settled FAQ/GEO strategy) against the verified repo reality.

**Companions:** `CPM_Blog_Pipeline_Handoff.md` §3.5 (strategy — still authoritative), `CPM_Blog_FieldMapping_Spec.md` (the blog conversion path, now built).

---

## 1. Where things stand (verified)

- **No FAQ route, component, or content exists.** The hub is net-new — built from scratch.
- **Blog pattern to mirror:** MDX + gray-matter frontmatter, one file per post in `content/blog/`, read by `lib/blog.ts`, rendered **SSG** via `generateStaticParams` + `next-mdx-remote/rsc`. Content is in the initial HTML → crawler-visible. The FAQ hub must follow this SSG-with-content-in-HTML pattern (non-negotiable for GEO; AI crawlers don't run JS).
- **No JSON-LD / structured data anywhere yet** (confirm first thing next session). No sitemap/robots either.
- **The posting script already captures FAQ.** `scripts/post-blog.mjs` strips each blog's `---FAQ---` block and stashes the parsed Q&A in the private Drive sidecar. That stash is the **feedstock** for the hub's write stage — the seam is already in place.

---

## 2. Settled by the handoff (do not re-litigate — §3.5)

- **Hub-and-spoke.** Central hub = canonical home of every master answer + provenance + annotations + sources (the single source of truth and primary GEO asset). Per-blog FAQ = 3–6 questions rendered as **references to hub answers, never copies** (avoids drift + duplicate-content penalties).
- **GEO answer formatting:** direct answer in the first sentence or two, then expand; clean H2/H3 hierarchy; every passage must stand alone (engines evaluate passages, not pages); objective answers carry third-party sources inline; emit **FAQPage structured data only after** the visible answer exists.
- **Living-FAQ annotations: append-only, never overwrite.** Dated annotations with escalating types (additive → soft revision → strong revision/contradiction). Escalation to base rewrite at 3 annotations or any contradiction-grade note.
- **Provenance required:** each entry stores derived-from blog(s) + creation date; each annotation records type, triggering post (with link), and date.

---

## 3. Scope for the next session — BUILD THE READ/RENDER SIDE ONLY

Build the hub as a thing that **stores and displays** answers, provenance, sources, and annotations — and wires spokes onto blog posts. **Defer** the write/maintenance pipeline.

**In scope:**
1. FAQ data model + `lib/faq.ts` reader (mirror `lib/blog.ts`).
2. Hub route(s) — index + answer pages, SSG, content in HTML.
3. Per-blog **spoke** rendering — blog posts reference hub answers by slug.
4. **FAQPage JSON-LD** emitted after the visible answer.
5. Seed 2–3 real example entries (incl. one objective-with-sources and one with an annotation) to prove the model end-to-end.

**Explicitly deferred (these are §5 pipeline functions that depend on the hub existing):**
- FAQ classify → source → write automation (§4 step 7).
- Corpus-wide gap-finding + reconciliation engine (the logic that *appends* annotations and triggers escalation).
- Content corpus index, subsidiary cross-linking, link-validation.

Build the vessel first; the pipeline that fills and maintains it comes after.

---

## 4. Decisions to make at the top of the session (with recommended defaults)

1. **Hub storage model.** *Recommend:* one file per entry, `content/faq/<entry-slug>.md`, with rich frontmatter (`question, type: objective|subjective, derived_from[], created, sources[], annotations[]`) + the answer in the body. Mirrors the blog, gives clean git diffs, scales. (Alternative: a single `faq.json` — easier corpus-wide queries, worse per-entry diffs. Decide based on whether reconciliation will prefer one big read.)

2. **URL shape.** *Recommend:* topic-clustered hub pages, each rendering several Q&As as standalone H2 passages, plus a master `/faq` index — and give each question a stable `#anchor` (or its own `/faq/<slug>` page) so individual passages are addressable/citable. Tension: one concentrated page builds authority; per-question URLs isolate passages better for GEO. Pick one before building routes.

3. **Spoke mechanism.** *Recommend:* add a `faq: [entry-slug, ...]` field to blog frontmatter; the blog post template pulls those answers from `lib/faq.ts` and renders them at the bottom as references (with a link back to the hub entry). This realizes "reference, not copy." (Note: the posting script would later set this field; for now it's authored/manual.)

4. **Annotation rendering shape.** How a base answer + its dated annotations display on the page (e.g. answer, then a visually distinct "Updates" list with date + linked triggering post). Storage is decided in #1; this is the render.

---

## 5. First three steps next session

1. **Verify infra assumptions** (5 min): confirm no existing JSON-LD util, confirm the Next 16 route/metadata API for injecting `<script type="application/ld+json">` (read `node_modules/next/dist/docs/` per AGENTS.md — this Next is newer than training).
2. **Lock decisions 1–4** above (use AskUserQuestion).
3. **Build `lib/faq.ts` + the data model + one seed entry**, then the hub route, then JSON-LD, then the spoke on one blog post. Verify content appears in the served HTML (the GEO requirement) — and remember the sandbox-mount gotcha: host-edited files read truncated in the sandbox and show as phantom git-modified (CRLF); the Read tool is authoritative, and stage specific paths, never `git add .`.

---

## 6. Open question to resolve with the user

**Seed content.** The hub starts empty. Do we have real master Q&As to seed it (e.g. pulled from the existing posts' FAQ blocks via the sidecars), or do we build with placeholders and backfill? Worth settling early so the seed entries are real, not throwaway.
