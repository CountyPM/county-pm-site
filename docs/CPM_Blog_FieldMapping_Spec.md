# CPM Blog — Contract → MDX Field-Mapping Spec

**Purpose:** Define exactly how the iPad-originated content contract (Handoff §3.3) is transformed by the PC stage into a publishable file the live `county-pm-site` understands. This is §4 step 5 ("Format conversion — Markdown → the site's actual blog data format"), now that the format is confirmed.

**Confirmed target format:** MDX files with gray-matter YAML frontmatter, one per post at `content/blog/<slug>.mdx`. Read by `lib/blog.ts` (`getAllPosts` / `getPostBySlug`). Rendered SSG via `app/blog/[slug]/page.tsx` using `next-mdx-remote/rsc`. **Slug = filename** (no slug field inside the file).

**Companion to:** `CPM_Blog_Pipeline_Handoff.md`. Where this spec and the handoff disagree on field names, this spec wins, because it is derived from the actual code.

---

## 0. Critical constraint: the repo is PUBLIC

`origin` = `https://github.com/CountyPM/county-pm-site.git`. Every byte committed to `content/blog/*.mdx` is world-readable on GitHub and shipped in the build.

Therefore the contract's **pipeline-internal fields must never be written into the published frontmatter:**

- `source_chat_context` — may contain private client/tenant/deal details from the originating chat.
- `gemini_prompt` — internal image-generation IP; no reason to expose.
- Any future campaign editorial notes / `narrative_arc`.

These travel with the post for processing but live in a **sidecar**, not the committed file. See §5.

---

## 1. The two schemas, side by side

**Source — contract frontmatter (Handoff §3.3):**
`type, campaign_id, slug, title, subtitle, byline, decision_intent[], tags[], publish_date, status, source_chat_context, gemini_prompt, faq_included` (+ campaign-child: `sequence_position, sequence_total, prev_in_series, next_in_series`).

**Target — live `BlogPostMeta` (`lib/blog.ts`):**
`slug` (from filename), `title`, `excerpt`, `publishedAt`, `author`, `category`, `seoTitle?`, `seoDescription?`, `heroImage?`, `heroImageAlt?`, `readingTime` (computed — never set by hand).

**What the post page actually renders** (`app/blog/[slug]/page.tsx`): `heroImage`, `category`, `readingTime`, `title`, and the MDX body. Notably it does **not** render `author`, `subtitle`, or `excerpt`. The index card (`app/blog/page.tsx`) renders `heroImage`, `category`, `publishedAt`, `title`, `excerpt`. So `excerpt`, `category`, `publishedAt`, and `heroImage` are the fields that visibly matter; `title` matters everywhere.

---

## 2. Field-by-field mapping

| Target field | Source / derivation | Notes |
|---|---|---|
| *filename* `<slug>.mdx` | from `slug` (PC-generated, see §3) | The inbox file is named `cpm-blog_<slug>.md`; the **committed** file is `<slug>.mdx`. Rename on conversion. |
| `title` | `title` | Direct copy. |
| `excerpt` | derived: use `subtitle` if present, else first ~25–35 words of body | **Required for a good index card.** Plain text, ~1–2 sentences, no markdown. |
| `publishedAt` | `publish_date` | `YYYY-MM-DD`. PC sets per scheduling/campaign spacing. Must be non-empty before publish (drives sort order). |
| `author` | from `byline` → person name only: `"Richard J. Miller"` | Not rendered today, so low stakes, but keep clean. Do **not** dump the full byline string (`"By … · Founder … · Broker since 1995"`) here. |
| `category` | **PC classifies** into the site's controlled category set (§4) | Not present in the contract. Functional: `category === 'Investor Education'` triggers the Investor Lead Form on the post page. |
| `seoTitle` | default = `title`; PC may refine | Optional. ≤ ~60 chars recommended. |
| `seoDescription` | default = `excerpt`; PC may refine | Optional. ~150–160 chars recommended. |
| `heroImage` | image pipeline output path: `/images/blog/<slug>.webp` | **Locked to `.webp`** (decision 3). Slug-matched. |
| `heroImageAlt` | derived from `gemini_prompt` (cleaned) or fallback to `title` | Don't paste the raw prompt; write human alt text. |
| `showInvestorForm` | PC sets `true`/`false` (default `false`) | **New field** — controls the investor lead form independently of `category` (decision 4, see §4). Requires the one-line code change noted below. Public-safe. |
| `readingTime` | — | **Never set.** Computed at read time by `reading-time`. |

---

## 3. Slug generation + collision rule

- Generate from `title`: lowercase, strip accents, non-alphanumerics → `-`, collapse repeats, trim. (Mirror `blog_draft_kit/scripts/slugify_util.py` behavior, but it is otherwise a dead kit — see §8 of handoff notes.)
- **Collision check against two sources:**
  1. existing files in `content/blog/` (`fs.readdirSync`), and
  2. the live site (the handoff requires live collision-checking; at minimum confirm `https://www.c-p-m.com/blog/<slug>` 404s before claiming the slug).
- On collision, append `-2`, `-3`, … Never silently overwrite an existing post.
- The slug, once published, is the canonical URL — treat as immutable after first publish.

---

## 4. Category — the one real classification decision

`category` has no source in the contract but is **required** and **functionally significant**. The actual closed vocabulary in the live corpus (verified against `content/blog/*.mdx`) is six values: `Investor Education`, `Owner Services`, `Property Manager Services`, `Prospect Services`, `Rentals`, `Tenant Services`.

**LOCKED (decision 2): deterministic lookup.** The posting script (`scripts/post-blog.mjs`) maps from `decision_intent` + `tags`: `selling`/`holding` or the `owner_lead` tag → `Investor Education`; `renting` → `Tenant Services`; `still-deciding` → `Prospect Services`; otherwise → `Owner Services`. `--category "<Name>"` overrides, validated against the six. Treat the set as a **closed vocabulary**; the script refuses unknown values. Adding a category is a code-aware change (index/post render key off this string). *Note: the rule routing owner/holding content to `Investor Education` is a reasonable first pass — review the lookup table against real posts and adjust.*

**LOCKED (decision 4): decouple the investor form from `category`.** Today `app/blog/[slug]/page.tsx` shows the investor lead form via `post.category === 'Investor Education'` — so category does double duty (labeling *and* CTA control). Replace that condition with a dedicated flag:

- Add `showInvestorForm: true|false` to frontmatter (PC sets it; default `false`).
- Change the render condition from `post.category === 'Investor Education'` to `post.showInvestorForm` (and add `showInvestorForm?: boolean` to `BlogPostMeta`/`getPostBySlug` in `lib/blog.ts`).

Now category purely categorizes, and the form can appear on any post in any category — or be omitted from an Investor Education post. The PC category lookup and the form flag become two independent decisions. (This is a small, contained code change to ship alongside the first pipeline post.)

---

## 5. Contract fields with no live home — preserve, sidecar, or drop

| Contract field | Disposition |
|---|---|
| `type` | Drop (always `blog`; implied by location). |
| `status` | Drop from file; use as a **gate** (`status: ready` required before the PC processes it). |
| `decision_intent`, `tags` | **Safe to keep** as extra frontmatter keys — gray-matter parses and the render ignores unknown keys. Keep them: they're the basis for category mapping and future tag-driven features. Low risk, public-safe (they're controlled vocab, not private). |
| `faq_included` | Keep as frontmatter (public-safe) — the FAQ stage reads it. |
| `campaign_id`, `sequence_position`, `sequence_total`, `prev_in_series`, `next_in_series` | **Safe to keep** as frontmatter; public-safe and needed when campaign rendering is built. Today nothing reads them, so they're inert until then. |
| `source_chat_context` | **Sidecar only — never commit.** Private. |
| `gemini_prompt` | **Sidecar only — never commit.** Internal IP / needed for image regen, not for the public page. |
| `byline` (full string) | Reduce to `author` name; drop the rest. |
| `subtitle` | Fold into `excerpt` and/or the body lede (existing posts put the subtitle as the first lines of the MDX body under the H1). Optionally also keep a `subtitle` frontmatter key for future render use. |

**Sidecar mechanism — LOCKED (decision 1): the `CPM-Blog-Processed` Drive archive.** Alongside each processed post, write `gemini_prompt`, `source_chat_context`, and the original inbox metadata to a JSON sidecar in the Drive archive (keyed by slug). Keeping secrets in Drive — not in the repo — means there is zero risk of them reaching the public GitHub mirror. The repo never holds these fields.

---

## 6. Hero image note

**LOCKED (decision 3): `.webp`.** The image pipeline writes `public/images/blog/<slug>.webp` and the conversion stage sets `heroImage` to `/images/blog/<slug>.webp`. (Existing `.png` posts can stay as-is or be re-exported later; new pipeline posts are WebP.) Next.js serves WebP from `public/` fine; no `next/image` change needed since the blog uses a plain `<img>`.

---

## 7. Validation rules (reject before commit)

A converted file is publishable only if:

1. `title` non-empty.
2. `excerpt` non-empty (derive if the contract didn't supply one).
3. `publishedAt` is a valid `YYYY-MM-DD`.
4. `category` ∈ the closed set in §4.
5. `slug` passed the §3 collision check.
6. `heroImage` path exists in `public/images/blog/` (or hero is intentionally omitted).
7. No `source_chat_context` / `gemini_prompt` present in the committed frontmatter (privacy guard — fail loudly if found).

Malformed → reject and leave in inbox (Handoff §4 step 1), do not commit a half-valid post.

---

## 8. Worked example

**Inbound (`CPM-Blog-Inbox/cpm-blog_decade-dividend.md`):**

```
---
type: blog
campaign_id: null
slug: null
title: "The Decade Dividend"
subtitle: "What a modest first purchase in 2026 looks like in 2036 — and the two-property position most people stumble into."
byline: "By Richard J. Miller · Founder, County Property Management · California Broker since 1995"
decision_intent: [holding]
tags: [owner_lead]
publish_date: null
status: ready
source_chat_context: "Tenant asked about buying their first place; turned into a hold-vs-sell discussion."
gemini_prompt: "Editorial photo, sunlit Ventura County bungalow, warm tones, ..."
faq_included: false
---
[body...]
```

**Committed (`content/blog/the-decade-dividend.mdx`):**

```
---
title: "The Decade Dividend"
subtitle: "What a modest first purchase in 2026 looks like in 2036 — and the two-property position most people stumble into."
excerpt: "What a modest first purchase in 2026 looks like in 2036 — and the two-property position most people stumble into."
publishedAt: "2026-05-04"
author: "Richard J. Miller"
category: "Investor Education"
seoTitle: "The Decade Dividend"
seoDescription: "Why the accidental landlord becomes a position investors can envy."
heroImage: "/images/blog/the-decade-dividend.webp"
heroImageAlt: "Sunlit Ventura County bungalow at golden hour"
showInvestorForm: true
decision_intent: [holding]
tags: [owner_lead]
faq_included: false
---
[body...]
```

**Sidecar (NOT committed — `CPM-Blog-Processed` Drive archive, `the-decade-dividend.json`):**

```
{ "slug": "the-decade-dividend",
  "gemini_prompt": "Editorial photo, sunlit Ventura County bungalow, warm tones, ...",
  "source_chat_context": "Tenant asked about buying their first place; turned into a hold-vs-sell discussion.",
  "campaign_id": null }
```

(`category: "Investor Education"` was derived from `decision_intent: holding` + `owner_lead`. The form now shows because `showInvestorForm: true` — set independently of category, per decision 4.)

---

## 9. Decisions — SETTLED

1. ✅ **Sidecar location:** `CPM-Blog-Processed` Drive archive (JSON per slug). Secrets never enter the repo. (§5)
2. ✅ **Category mapping:** deterministic `decision_intent`+`tags` → category lookup, closed vocabulary. (§4)
3. ✅ **Hero image format:** `.webp`. (§6)
4. ✅ **Investor form:** decoupled from `category` via a new `showInvestorForm` frontmatter flag + one-line change in `app/blog/[slug]/page.tsx` and `lib/blog.ts`. (§4)

This spec is now build-ready and feeds directly into the posting mechanism (commit `<slug>.mdx` + `.webp` hero to `main` → Vercel deploy). The only net-new code it implies is the `showInvestorForm` flag wiring — now done (§10).

---

## 10. Posting mechanism — `scripts/post-blog.mjs`

Built and verified. Node ESM script (reuses the repo's `gray-matter`), runs from repo root. It is the §4 step 5 + step 6 path: convert a packaged contract file → published MDX + hero, write the private sidecar, git-commit, and (gated) push to `main`.

```
node scripts/post-blog.mjs <packaged-file.md> [options]
```

| Option | Effect |
|---|---|
| `--hero <path>` | Place a hero as `public/images/blog/<slug>.webp` (must already be `.webp`; conversion is the image stage's job). |
| `--sidecar-dir <path>` | Where the private `<slug>.json` sidecar is written. **Point this at the `CPM-Blog-Processed` Drive folder.** Default `./.blog-sidecar` (gitignored). |
| `--category "<Name>"` | Override the derived category (validated against the six). |
| `--date YYYY-MM-DD` | Override publish date (else contract `publish_date`, else today). |
| `--investor-form` / `--no-investor-form` | Force the form on/off (else defaults to `true` when category is Investor Education). |
| `--force` | Allow overwriting an existing slug. |
| `--dry-run` | Report the resolved fields and write nothing. |
| `--publish` | Push to `origin/main` (LIVE → Vercel). **Without this flag, the script commits locally but does not push.** |

**What it does, in order:** validates the inbound contract (`title` present, `status: ready`, body present) → generates a collision-checked slug → derives `excerpt`/`author`/`category`/`seo*`/`publishedAt` per §2 → builds **public-safe-only** frontmatter and runs a privacy guard that hard-fails if `source_chat_context`/`gemini_prompt` ever appear in it → strips the `---FAQ---` block out of the body and stashes the parsed Q&A in the sidecar (feedstock for the FAQ hub — now built; the corpus index reads `.blog-processed` and `.faq-backfill` as feedstock) → writes the MDX + hero → writes the private sidecar **outside** the repo → `git add` (specific paths only, never `git add .`) + commit → push only if `--publish`.

**Publish flag:** `post-blog.mjs` itself still only pushes when called with `--publish` (without it, commit-only). **Note (2026-07-03):** the scheduled Track D runner (`post-blog-inbox.ps1` via the registered task) now calls it **with** `-Publish`, so the end-to-end pipeline is auto-publish; the sender allowlist is the operative gate, not a human review step. The commit-only behavior is still available for manual runs.

**Two operational notes for the live PC environment:**

1. **Git auth** — pushing to `https://github.com/CountyPM/county-pm-site.git` needs a credential (PAT in the git credential helper, or `gh auth login`). The script reports a clear error and keeps the local commit if the push fails.
2. **Image conversion is out of scope for this script** — it places an already-prepared `.webp`. The Gemini-API regeneration + WebP/resize stage (Handoff §3.6, §4 step 4) feeds it the file.

**Verification done:** end-to-end dry-run and real-run conversion confirmed (correct slug, derivation, FAQ parse, public-safe frontmatter, private sidecar, privacy guard clean); the `showInvestorForm` code change passes independent TS syntax checks. The commit/push step itself must be exercised on the real PC (the sandbox has no git identity).
