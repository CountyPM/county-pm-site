# Handoff — California Landlord Compliance Quiz

Carry this into the `C:\Users\cpm\county-pm-site` project. It came out of a
chat in a different project, so that chat is not searchable from there.

Two files were produced and are attached / in outputs:

- `landlord-compliance-quiz.jsx` — the quiz component, 20 questions, all hrefs live
- `page.tsx` — a route wrapper with metadata + JSON-LD

**Read the "What needs to change" section before using them as-is.** The
component was written before the repo was inspected and it does not match
house style.

---

## What this is

An evergreen, permanent-URL self-assessment: *"Are You Legally Compliant as a
California Landlord?"* Twenty questions, each one a rule with statutory damages
attached. Honestly scored — the design principle is that it tells the owner
what they got right, because a tool where every answer is a liability warning
reads as a scare campaign and a sophisticated owner bounces.

Every question, right or wrong, links to the CPM post that explains that rule.
Wrong answers get the cost stated plainly; right answers get a softer "worth
reading anyway, the timing is what trips people." That link layer is the whole
point — it turns the back catalog into a destination someone lands on because
they just got something wrong.

It is deliberately **not** the rotating quiz. That is a separate product, noted
at the bottom.

Question distribution: 7 before move-in, 10 during the tenancy, 3 at the end.

---

## Repo findings (verified by read-only clone, 2026-09-28)

**All eleven referenced posts are live.** This was the gating item and it is
clear. 167 posts in `content/blog/`. Confirmed slugs:

| Series | Part | Slug |
|---|---|---|
| The Tenancy Clock | 1 | `your-rental-ad-is-the-first-legal-document-of-the-tenancy` |
| The Tenancy Clock | 2 | `charge-what-it-costs-you` |
| The Tenancy Clock | 3 | `the-sentence-that-decides-whether-you-have-an-exemption` |
| The Tenancy Clock | 4 | `you-can-probably-charge-two-months-heres-why-i-wouldnt` |
| The Tenancy Clock | 5 | `your-late-fee-is-probably-void` |
| The Tenancy Clock | 6 | `thirty-feet-away-is-still-someone-elses-home` |
| The Tenancy Clock | 7 | `the-increase-you-didnt-take-is-gone` |
| The Evidence Standard | 1 | `sort-your-book-before-you-panic` |
| The Evidence Standard | 2 | `what-you-can-still-build-and-whats-gone` |
| The Assistance Animal Reset | 2 | `the-california-assistance-animal-checklist` |

All twenty `href` values in the component are filled with these. Blog URLs are
`/blog/<slug>`.

Two posts exist that the quiz does not yet use and probably should:
`the-inspection-nobody-schedules` (Evidence Standard 3 — annual inspection and
§1954 boundaries) and `the-complaint-you-answered-and-cant-prove` (Evidence
Standard 4 — habitability documentation). The entry question currently points at
Tenancy Clock 6; Evidence Standard 3 may be the better target.

---

## Placement

**`app/resources/california-landlord-quiz/`**

Not under `/blog/`. It is not an article, it has no category, and putting it on
the blog path drags it into the category tiles and the Reading Guide where it
does not belong.

Not top-level either. The site already has a tool convention: `/resources/` holds
`rent-vs-sell-calculator`, `rent-vs-sell`, and `investor-insights`, and
`app/sitemap.ts` carries a comment stating the `/resources/*` paths are the
canonical ones the site's own navigation links to. The quiz is the same kind of
object as the calculator.

Slug reasoning: people search the word "quiz," not "compliance check."
`california-landlord-quiz` matches intent and is short enough to say out loud.
The earlier draft used `landlord-compliance-check`, which is hardcoded in three
places in `page.tsx` and needs updating if the slug changes.

---

## What needs to change before this ships

### 1. Restyle to house tokens — this is the real work

The component was written with inline styles and its own light palette
(`#EDF0F2` paper, dark ink, Georgia serif). **The site is dark navy.** From
`app/globals.css`:

```
--cpm-page:         #0e3a5a
--cpm-surface:      #174865
--cpm-primary:      #5fa8e0
--cpm-primary-soft: #8fc1e8
--cpm-accent:       #d6a94a
--cpm-accent-dark:  #a67c1f
--cpm-text:         #f8fafc
--cpm-muted:        #b8cad6
--cpm-border:       #2a5c78
```

Dropped in as written, the quiz would read as a foreign page. It needs a rewrite
against these tokens and Tailwind v4 (the project uses `tailwind.config.ts`,
`"tailwindcss": "^4"`), using the existing utility classes: `btn-primary`,
`cpm-section`, `cpm-section-alt`, `cpm-card`, `cpm-card-dark`.

The correct-answer green and wrong-answer clay in the current file need
equivalents that survive on navy. Gold (`--cpm-accent`) is the obvious
wrong-answer marker since it already carries emphasis on this site; the right
answer wants something quieter, not a second accent.

### 2. Split it the way the calculator is split

House pattern, from `app/resources/rent-vs-sell-calculator/page.tsx`:

- **Server** component at `app/resources/<tool>/page.tsx` — hero section with
  eyebrow, `h1`, lede, CTA row, then framing sections below the tool
- **Client** component at `components/calculators/RentVsSellCalculator.tsx`,
  first line `'use client'`, imported via the `@/components/...` alias

So: `components/quiz/LandlordComplianceQuiz.tsx` (or under `calculators/` if you
would rather not add a directory), and the route file renders it. The attached
`page.tsx` already does the server half — merge its metadata and JSON-LD into a
page written in the house hero pattern rather than replacing that pattern.

### 3. Register it in the sitemap

`app/sitemap.ts` uses a **curated** `STATIC_ROUTES` array, not a filesystem
walk. A new route does not appear automatically. Add:

```ts
{ path: '/resources/california-landlord-quiz', changeFrequency: 'monthly', priority: 0.7 },
```

Priority 0.7 puts it level with `/blog/guide` and above the other resources
pages, which is right for an acquisition page.

### 4. Point the CTA somewhere real

The results-page button is `href="#"`. The target is almost certainly
`/property-strategy-session` (already in the sitemap at priority 0.8). Use a
GoHighLevel form URL instead only if you want quiz leads tagged separately from
strategy-session leads — worth deciding, since attribution on this page is the
thing that tells you whether it works.

### 5. Internal entry points

Four, all internal: the `/blog` index, the FAQ hub, the owners page, and the
footer. The quiz is meant to be linked from outside, but it will get most of its
early traffic from inside.

---

## JSON-LD — a decision, not an oversight

The wrapper ships `WebPage` + `BreadcrumbList` and **deliberately no
`FAQPage`.** The answers are not in the initial HTML — they appear only after a
tap — so marking them up as visible Q&A content would be schema that does not
match the rendered page. That is the exact mismatch the FAQ hub already guards
against, and CPM's whole AIO citability position rests on the markup being
honest.

If an Education/Q&A rich result is wanted later, the fix is to render all twenty
questions and answers in a static section below the quiz and mark *that* up.
Worth doing. It is a second pass, and it also makes the page useful to someone
who will not take the quiz.

---

## Open content questions

Four answers worth confirming against the statute rather than taking on trust:

1. **AB 2493** — the full-refund rule when no screening was actually run.
2. **AB 2801** photo duty as phrased: move-in, move-out before any repair, and
   the relevant images delivered with the itemized statement.
3. **§1950.5 receipt threshold** on the 21-day statement. The dollar figure is
   deliberately written around rather than stated.
4. **Relocation assistance** (Q18) — currently "one month's rent unless a local
   ordinance requires more, and nothing on a genuinely exempt property where the
   notice was served." Oxnard's owner-move-in provisions are cited as the
   more-restrictive example; confirm that is still accurate.

The screening fee cap is intentionally omitted throughout, since the CPI
adjustment moves and a stated number goes stale.

Two edits already made on instruction: repair-and-deduct is **out** (tenant
remedy, not an owner duty, and no post supports it), and relocation assistance
is in as its own question.

House convention applies — abbreviations spelled out on first use. The current
copy does this (Assembly Bill 1482, Consumer Price Index, Civil Code §1954), but
check it again after any rewrite.

---

## Deploy notes

Standard for this repo: commit, push, let Vercel build. Then **redeploy from the
dashboard with "Use existing Build Cache" unchecked** — stale build cache is a
recurring issue on this project and has served outdated prerendered content
after successful pushes. Verify in an incognito window; fetch tools have proven
unreliable against live Vercel output here.

---

## What comes after (discussed, not built)

**The rotating quiz.** Ten questions per issue from the 71 objective FAQ
entries, each issue archived at its own permanent URL — `data/quizzes/<date>.json`
plus `app/landlord-quiz/[issue]/page.tsx` with `generateStaticParams`, and an
index page listing past issues. Rotation that overwrites destroys the asset;
rotation that archives compounds it. Refactor the quiz component to take
questions as a prop so both products share it. Not started — the 71 FAQs are
answers, not scored questions, and writing three plausible distractors per
question is authorship, not a script.

**LinkedIn polls** are probably the better vehicle for the rotating content, and
they change the format: one question per poll, 140-char question, 30-char
options, 2–4 options, 7-day duration. Post the poll, then post the answer with
the statute and blog link when it closes. Audience there is agents and other
property managers, not owners. Vote splits become blog material.

**"So You Want to Be a Landlord? 20 questions to help you decide."** A separate
product for the for-rent-by-owner audience — pre-decision rather than
compliance, so it cannot be scored and cannot run on the objective FAQ bank. Two
possible framings: the reality check (can you carry a vacancy, a $6,000 repair,
an eviction) or the it's-already-yours version (inherited, moved in with a
partner, built an ADU — rent it, sell it, or let it sit). The second maps to the
existing `decision_intent` tags.
