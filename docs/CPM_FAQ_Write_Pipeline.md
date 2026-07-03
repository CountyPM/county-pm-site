# CPM FAQ Write/Maintenance Pipeline — Track A (GEO)

The pipeline that **fills and maintains** the FAQ hub. The hub's read/render side
(`lib/faq.ts`, `/faq` routes, FAQPage JSON-LD) is the *vessel*; track A is the
machinery that turns published-blog Q&A into reviewed hub entries and keeps those
entries current as the corpus grows.

**Governing principle (updated 2026-07-03 — AUTO-PUBLISH policy).** The pipeline now
publishes to the live site automatically; there is **no human review gate**. The only
automated brake is `validate:faq`, which holds any objective entry that lacks a verified
citation. Annotation history is still **append-only** (never overwritten or rewritten),
and publishing is still scoped: the Windows job stages only `content/faq` + the source
registry, never `git add .`. The prose-writing and reconciliation judgment is done by the
scheduled agent in-session; what changed from earlier revisions is that finishing an entry
and pushing it live are no longer gated behind a person. Drafts/packets remain agent work
queues, not approval queues.

---

## Subsystems

| # | Subsystem | Status |
|---|-----------|--------|
| 1 | Corpus index (foundation) | **built** |
| 2 | Write path — classify → source → write | **built** |
| 2b | Backfill seam (reconstruct feedstock from pre-pipeline posts) | **built** |
| 2c | Auto-source step + verified source registry | **built** |
| 2d | Auto-publish (scheduled, full-auto) | **built** |
| 3 | Gap-finding + reconciliation engine | **built** — `scripts/reconcile-faq.mjs` |
| 4 | Subsidiary registry + cross-linking | **built** — `scripts/crosslink-faq.mjs` + `lib/faq-entities.ts` (see note) |

---

## 1. Corpus index — `scripts/build-faq-corpus-index.mjs`

Builds one queryable JSON index of the whole content corpus, which every other
subsystem reads:

- **blog** — each `content/blog/<slug>.mdx`: slug, title, category, tags,
  `decision_intent`, excerpt, existing `faq[]` spoke links, plain-text body, word count.
- **faq** — each `content/faq/<slug>.md`: slug, question, topic, type, derivedFrom,
  created, `order`, source/annotation counts, annotation types, and a
  `needsRewrite` flag (escalation rule: ≥3 annotations **or** any contradiction-grade note).
- **feedstock** — the public `faq[]` Q&A harvested from blog sidecars (the
  `scripts/post-blog.mjs` Drive sidecar is the feedstock seam).

**Privacy guard.** Sidecars also carry private fields (`gemini_prompt`,
`source_chat_context`). The index reads a strict allow-list and asserts those
keys are absent from the serialized output before writing. The repo is public, so
the index is a derived artifact — **gitignored**, regenerable, never committed.

```bash
npm run index:faq-corpus
# or, harvesting the real feedstock from the Drive archive:
node scripts/build-faq-corpus-index.mjs --sidecar-dir "/path/to/CPM-Blog-Processed"
```

Options: `--sidecar-dir` (default `./.blog-sidecar`; missing dir → empty feedstock),
`--out` (default `scripts/faq-corpus-index.json`), `--quiet`.

## 2. Write path — `scripts/draft-faq-entries.mjs`

Turns feedstock into candidate hub entries. Reads the index, then per question:

1. **Collapse** near-duplicate feedstock questions, merging their `derivedFrom`.
2. **Dedupe** against the live hub. Already-answered questions (similarity ≥ `--dupe`,
   default 0.5) are routed to the **reconciliation engine** (subsystem 3, deferred) —
   not re-drafted.
3. **Classify topic.** Strongest signal first: a near-neighbour existing entry
   (sim ≥ 0.15) donates its topic cluster; else a topic-level token match; else a
   new-topic stub the human renames.
4. **Classify type** (objective | subjective) by keyword heuristic, with confidence.
5. **Source requirement.** Objective entries are flagged as requiring third-party
   `sources[]` before they can be published.
6. **Write a draft work packet** per new question into the review queue
   (`content/faq-drafts/`, gitignored) with frontmatter pre-filled as far as is
   deterministic, an embedded checklist, the classification, and the raw harvested
   answer as *raw material to rewrite, not paste*.

All classifications are labelled **suggested — confirm**. The script never writes
to `content/faq/`.

```bash
npm run draft:faq-entries
# inspect first without writing:
node scripts/draft-faq-entries.mjs --dry-run
```

Options: `--index`, `--out-dir` (default `content/faq-drafts`), `--json <report>`,
`--dupe <0..1>`, `--force` (overwrite existing drafts), `--dry-run`, `--quiet`.

### The judgment step (human / Claude in-session)

For each draft in `content/faq-drafts/`:

1. Write the master answer in **GEO format** — direct answer in the first sentence
   or two, then expand; every passage stands alone; CPM's voice, not pasted source text.
2. If `type: objective`, add real third-party `sources[]` (statutes, official pages).
3. Confirm/adjust the suggested `topic`, `topicTitle`/`topicDescription`, `type`, `order`.
4. Delete the comment block + raw-material section, then **move** the file into
   `content/faq/<slug>.md` and review the git diff. Going live stays a manual push.

## 2b. Backfill seam — `scripts/backfill-faq-feedstock.mjs`

The write path harvests feedstock from blog sidecars, but the 12 posts published
before the pipeline existed never produced sidecars (post-blog.mjs strips the
`---FAQ---` block at posting time, and these predate it). This script reconstructs
feedstock from those posts so the hub can be seeded now.

It does **not** invent answers. `scaffold` mode deterministically extracts each
post's H2/H3 sections (heading + lead paragraph) into a per-post **curation packet**
(`content/faq-backfill/<slug>.md`, gitignored), with every candidate marked
`TODO rephrase…` so nothing is harvestable until a human confirms it. A human/Claude
turns that raw material into real Q&A (most headings are statements, not questions).
`--harvest` then parses the curated packets into sidecar-shaped feedstock JSON
(`.faq-backfill/`, gitignored) that the corpus index reads via `--sidecar-dir`.

```bash
npm run backfill:scaffold                                  # 1. write packets
#   2. edit content/faq-backfill/*.md — write real Q:/A: pairs
npm run backfill:harvest                                   # 3. -> .faq-backfill/*.json
npm run index:faq-corpus -- --sidecar-dir .faq-backfill    # 4. index from backfill feedstock
npm run draft:faq-entries                                  # 5. draft work packets
```

Options: `--post <slug[,slug]>`, `--limit <n>`, `--packet-dir`, `--out-dir`,
`--force`, `--quiet`, `--harvest`.

**Status (2026-06-25):** 5 posts curated into `content/faq-backfill/` (rent-control,
getting-money-out, why-good-tenants-rejected, cheap-rent-trap, cash-for-keys). A
verified run produced 14 new draft entries plus 1 reconciliation candidate (the
existing "statewide rent control" question, routed correctly). The other 7 posts
have scaffolded packets ready to curate.

### PowerShell (Windows)

```powershell
cd C:\Users\cpm\county-pm-site
npm run backfill:scaffold
# edit content\faq-backfill\*.md, then:
npm run backfill:harvest
npm run index:faq-corpus -- --sidecar-dir .faq-backfill
npm run draft:faq-entries
```

## 2c. Auto-source — `scripts/faq-source-registry.json`

Sourcing objective entries is the system's job, not the owner's. Two layers:

1. **Verified source registry** (`scripts/faq-source-registry.json`) — a deterministic
   map of recurring objective topics → verified primary-source citations (CA rent cap,
   eviction/unlawful detainer, ESA/Fair Housing, screening-fee cap, capital-gains
   exclusion, 1031). Each entry carries the verified facts and a `currencyNote`.
   `draft-faq-entries.mjs` reads it and auto-attaches matching citations to objective
   drafts' `sources[]`. Track B (`check:faq-sources`) keeps the URLs alive.
2. **Agent web research** — for any objective claim the registry doesn't cover, the
   agent searches primary/government sources (leginfo, irs.gov, hud.gov,
   calcivilrights.ca.gov, courts.ca.gov), verifies currency, writes the citation, and
   adds durable new sources back into the registry.

The registry is **currency-checked** — e.g. it records that SB 436 (14-day pay-or-quit)
failed in committee so 3 days is still law, and that the "actual-cost-only" screening-fee
rule (SB 381) is proposed, not enacted. An objective entry is never published without a
verified citation; unverifiable claims stay drafts.

## 2d. Auto-publish (two-stage: Linux agent prepares, Windows job publishes)

Publishing is split across two environments because the scheduled agent runs in a **Linux
sandbox** where `next build` (needs platform SWC), outbound `curl`, and `git push` do not
work, while the repo is a **Windows checkout** where they do.

**Stage 1 — weekly agent task** (`faq-write-publish-pipeline`, Mondays ~9am, Linux):
harvest feedstock → draft → auto-source (registry + agent web research) → write GEO answers
→ move finished entries into `content/faq/` → gate with `npm run validate:faq` (pure-JS,
runs in the sandbox). It does **not** build, commit, or push. An objective entry is only
finalized if every claim carries a verified citation; anything unverifiable stays a draft.

**Stage 2 — Windows publish job** (`scripts/publish-faq.ps1`, Windows Task Scheduler):
clears any stale `.git/index.lock`, re-runs `validate:faq` as a gate, stages only
`content/faq` + the registry, commits, and pushes — Vercel deploys. It no-ops when nothing
changed, so it's safe to run daily or shortly after the agent run.

**Validation gate — `scripts/validate-faq.mjs`** (`npm run validate:faq`): replaces a full
build as the content gate. Checks every `content/faq/*.md` for parseable frontmatter,
required fields, valid sources/annotations, non-empty body, no duplicate slugs, and — the
core promise — that **no objective entry ships without a citation**. Pure gray-matter, so it
runs anywhere; Vercel still does the real build on push.

### One-time setup (Windows Task Scheduler)

Register the publish job to run after the weekly agent task (e.g. Mondays 10:00 AM, or
daily). Action / "Program or script":

```
powershell.exe
```

Arguments:

```
-ExecutionPolicy Bypass -File "C:\Users\cpm\county-pm-site\scripts\publish-faq.ps1"
```

Add `-Build` to the arguments if you also want a full local `next build` before each push.
Output is logged to `faq-publish.log` in the repo root.

---

## Later slices — BUILT

- **Subsystem 3 — gap-finding + reconciliation** (`scripts/reconcile-faq.mjs`,
  `npm run reconcile:faq`). When a new post touches an existing entry it proposes a
  dated, **append-only** annotation (additive → soft → strong/contradiction), sniffs
  for contradictions, does backlink/similarity touch-ups, and flags entries hitting the
  escalation threshold (≥3 annotations or any contradiction-grade note — the index's
  `needsRewrite` flag) for a base-rewrite proposal. Publishes full-auto behind the
  `validate:faq` gate.
- **Subsystem 4 — subsidiary registry + cross-linking** (`scripts/crosslink-faq.mjs`,
  `npm run crosslink:faq`; entity layer in `lib/faq-entities.ts`). A registry of CPM
  affiliated entities plus a detect/apply function that cross-links FAQ topics to them
  and to spokes; renders a "Related questions" block + `faqPageLd` JSON-LD and validates
  link reciprocity.
  **Open integration gap:** `crosslink:faq` is NOT yet wired into `publish-faq.ps1`, so
  cross-links are only applied when the script is run manually. Wiring it into the publish
  job (after reconcile, before `validate:faq`) is the remaining step to close Track A.

## Notes

- Node ESM, single dependency `gray-matter` (already installed); mirrors
  `post-blog.mjs` / `check-faq-sources.mjs`.
- Drafts validate against the `lib/faq.ts` `FaqEntry` frontmatter contract.
- Verified via a Node harness against fixture sidecars (dedupe → reconciliation,
  topic inheritance, objective→sources flag, privacy guard). A full local run is
  the user's to do where the Drive feedstock is mounted.
