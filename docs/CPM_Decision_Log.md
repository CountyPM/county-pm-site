# CPM Project Decision Log

Append-only record of decisions for the CPM blog / FAQ / GEO pipeline.
**Durable files are the record, not AI memory.** Anything that must survive belongs
here (or in the relevant spec/handoff doc), not in an assistant's session memory.

Convention: newest entries appended at the bottom, each dated `YYYY-MM-DD`. State what
was decided, why, and what's next. Never rewrite prior entries — supersede them with a
new dated entry.

---

## 2026-07-03 — Binding constraint reassessed: it's the open feedback loop, not origination

**Decided.** The pipeline's binding constraint right now is the **open (unmeasured,
unverified) feedback loop**, not content origination. The system auto-publishes but cannot
see its own output at either end: no verification that a published post is correct, and no
measurement of whether it earns the AI citations the GEO initiative exists for.

**Correction on the record.** An earlier read in this session claimed the last successful
post was 2026-06-29 and the pipeline was "input-starved for four days." That was wrong — a
log-filter error missed the run. The **last successful post was 2026-07-02** ("They Walked
Into My Office With an $800 Offer. I Said No.", commit `1d2d621`, files timestamped
2026-07-02 16:24). Corrected cadence is a field note every few days — a healthy, sustainable
rate for a solo broker. Origination is therefore the design working, not a bottleneck to
relieve.

**Why this is the constraint.** With auto-publish and no human gate, blindness caps
everything downstream: correctness, trust, and the judgment of whether writing more is worth
it. The 07/02 post is the proof — its FAQ silently failed to reach the hub (the
`build-faq-corpus-index.mjs` feedstock-directory bug). The newest, healthiest content lost
half its intended GEO value, and **nothing in the pipeline caught it** — it was found by
hand, and the fix is still uncommitted. That is the signature of the constraint: defects
ship live and stay invisible until a human happens to look.

**Next (priority order, constraint-driven):**
1. Commit the FAQ-feedstock fix (`scripts/build-faq-corpus-index.mjs` multi-dir indexing) —
   a live value leak on current content, already diagnosed, just unshipped.
2. Post-publish inspection + a heartbeat/failure signal — close the **output** end of the
   loop so the next 07/02-style defect is caught by the machine, not by luck.
3. GEO effectiveness readout (indexation coverage + periodic AI-citation spot checks) —
   close the **outcome** end, so investment decisions have data behind them.

Below the line (real, but not the constraint — do after the above): wire `crosslink:faq`
into `publish-faq.ps1`; repo hygiene via `.gitattributes` EOL normalization.

**Principle reaffirmed.** Durable files are the record, not AI memory.

---

## 2026-07-03 (later) — Correction: the feedstock fix was already shipped; the real gap was unpublished 07/02 drafts

**Correcting the entry above.** On starting priority item #1 ("commit the FAQ-feedstock
fix"), verification against the repo showed that framing was stale on two counts:

1. **The fix was already committed** as `88d58ab` (multi-dir `--sidecar-dir`, indexing
   `.blog-processed` as new-post feedstock). Nothing to ship.
2. **The uncommitted working-tree change to `scripts/build-faq-corpus-index.mjs` was
   corruption, not a fix** — the file was truncated at line 214, missing
   `fs.writeFileSync(...)` and the privacy-guard tail; it would not parse. Committing it
   (as the entry above implied) would have broken the corpus-index build. It has been
   discarded (`git restore`).

**What the real residual was.** The shipped fix worked — it fed the 07/02 post into the
pipeline and `draft-faq-entries.mjs` scaffolded 5 FAQ drafts. But those sat in the
gitignored review queue (`content/faq-drafts/`), never authored into master answers or
promoted, so the hub had received nothing from 07/02. That — not a code fix — was the open
value leak.

**Action taken (this session).** Authored 4 of the 5 drafts into live hub entries under the
existing `property-management-basics` cluster (rather than spawning 4 new singleton topics,
which fragments the hub and makes thin GEO pages), in CPM voice, GEO format (answer-first,
standalone passages). Objective entries carry official citations (Cal. Civ. Code §2316,
§2079.16, §1714; DRE agency/fiduciary references). Wired the blog spoke via `faq:[…]` in the
post frontmatter. `validate:faq` passes 37/37.

- `content/faq/can-a-property-manager-let-a-government-agency-use-my-rental.md` (objective)
- `content/faq/is-a-property-manager-required-to-present-every-offer.md` (objective)
- `content/faq/what-should-an-owner-ask-before-allowing-any-non-standard-use.md` (subjective)
- `content/faq/whats-the-liability-risk-if-a-law-enforcement-operation-goes-wrong.md` (objective)

**Held for a decision — draft #5, "Why compare a contractor sting to a HUD fair-housing
test?"** Not promoted. It is a rhetorical artifact of the source post's argument, not a
question anyone searches; as a standalone hub master answer it reads oddly out of context
and adds little GEO value. Left in the draft queue pending the owner's call to add or drop.

**Process note (feeds priority item #2).** This leak was invisible until inspected by hand —
exactly the open-feedback-loop constraint recorded above. The pipeline drafted the entries
but never surfaced that they stalled unpublished. A heartbeat/"N drafted, N still in queue"
signal would have flagged it without a manual dig.

**Next.** Owner to run `scripts/publish-faq.ps1` (or the daily job) to push the 4 entries
live; decide add/drop on draft #5; then priority item #2 (post-publish inspection +
heartbeat).

**Update (same day).** The 4 entries were committed (`f380c1d`) and pushed; the deploy was
verified live on the topic page (answers + citations rendering) and the blog spoke ("Related
questions" block on the 07/02 post). The 07/02 leak is fully closed. Draft #5 remains held.

---

## 2026-07-03 — Kickoff scope for priority item #2 (post-publish inspection + heartbeat)

**Why this is next.** It is the fix for the binding constraint recorded above: the pipeline
auto-publishes but cannot see its own output. The 07/02 FAQ leak was caught by a manual dig,
not by the system. Item #2 gives the pipeline eyes at both ends so the next silent defect is
surfaced automatically. To be built in a fresh session, scoped from this entry (durable files
are the record, not session memory).

**Two pieces:**

1. **Post-publish inspection (output-end check).** After a post/FAQ ships and Vercel
   deploys, fetch the live URL(s) and assert the content actually rendered — not just that
   git succeeded. Minimum viable checks per new blog post: HTTP 200; `<title>` present and
   matches; hero image resolves (not 404); and, when the post declares `faq:`, the "Related
   questions" spoke block is present. For FAQ: the new entry renders on its topic page and
   (if objective) its Sources block is present. Note the CDN caching lesson from today —
   plain URLs served stale edge-cached HTML for a few minutes post-deploy; the check must
   cache-bust (query string) or tolerate/retry the propagation window so it doesn't
   false-alarm on a good deploy.

2. **Heartbeat / failure signal (input-end check).** The weekly authoring task and daily
   publish job currently no-op silently. Emit a dated signal every run: e.g. "authoring ran:
   N drafted, N still in `content/faq-drafts/` unpublished, N errors" and "publish ran:
   committed / no-op / failed." A stalled or empty week, or drafts stuck in the queue (the
   exact 07/02 failure mode), should be visible without a manual dig.

**Open design question (decide first in the new session):** where the signal surfaces so the
owner actually sees it. Options: a status line the runner writes to a known file + a
lightweight Cowork artifact that reads it; an email to the allowlisted address (reusing the
blog-inbox Gmail path); or a scheduled Cowork task that reads the log and messages a summary.
Pick the channel before building, because a heartbeat nobody looks at is no heartbeat.

**Constraints to respect (from earlier entries):** the scheduled Linux sandbox can't
`next build`, reach the network for source checks, or `git push` — so the live-fetch
inspection likely belongs to the Windows side (or a Cowork task), not the sandbox authoring
task. Keep host-git actions in the gitignored `scripts/_*.bat` pattern already in use.

---

## 2026-07-03 — Priority item #3 BUILT (GEO effectiveness readout — the OUTCOME end)

**Why this is the item.** The pipeline authors, publishes, inspects (item #2), and
heartbeats — but nothing measured whether any of it moved the needle the whole
initiative exists for: *are our pages indexed, and do AI answer engines cite us?*
Item #3 closes that loop with a measurement + reporting layer. It is the "only
genuinely new build worth adding" flagged in `CPM_GEO_Progress_Summary.md` §8.

**Decisions locked with the owner (before building):**
- **Indexation source = public `site:` queries, no setup** (over the GSC API or
  manual CSV export). Owner chose zero-setup + unattended over exact-but-credentialed.
  Approximate by design; the sampled key-URL presence is the cleaner sub-signal.
- **AI-citation method = browser automation** (over paid Perplexity/OpenAI APIs or a
  manual checklist). Reflects the real consumer answer; accepted trade is that it
  needs a signed-in browser session and occasional babysitting.
- **Output = committed markdown trend + emailed summary** (over a transient Cowork
  artifact or email-only). Durable, versioned trend in the repo; reuses the item-#2
  SMTP path.

**Shipped:**
- `scripts/geo-indexation-check.mjs` — fetches the live sitemap (denominator), runs
  `site:c-p-m.com` against Bing + DuckDuckGo (Google best-effort; CAPTCHA/consent
  degrades to "unavailable", never throws), spot-checks a sample of high-value URLs
  with exact `site:<url>` queries, writes `geo-index-report.json` (gitignored).
  `--self-test` proves the parsers with fixtures (7/7 pass, no network).
- `scripts/geo-citation-probes.json` — 12 fixed Ventura-County owner/investor
  questions (local, informational, decision intent), each mapped to the CPM URL it
  should surface. Stable across cycles so the trend is comparable.
- `scripts/geo-citation-record.mjs` — turns a browser run's results array into the
  same-shaped `geo-citation-report.json`; per-engine + per-intent rollups; counts
  only *checked* cells so partial runs don't distort the rate. `--template` emits a
  blank scaffold; unknown probe ids warn, don't crash.
- `scripts/geo-readout.mjs` (`npm run geo:readout`) — folds both reports into a
  dated section **prepended** to `docs/CPM_GEO_Readout.md` (newest first) and emails
  a `[CPM GEO ✓/⚠]` summary. Each half degrades independently; a missing/stale
  (>45d) report is reported as "not run", which is itself signal. Thresholds:
  bulk coverage <70%, sampled presence <80%, or citation <25% trip ⚠.
- `scripts/geo-readout.ps1` — Windows monthly runner: indexation probe → assemble +
  email → commit only the trend doc (report JSONs are gitignored). No-ops on no diff.
- Docs: new `docs/CPM_GEO_Readout.md` (ledger + how-to); `CPM_GEO_Progress_Summary.md`
  §8 item 4 marked BUILT; `.gitignore` + `package.json` (`geo:index`,
  `geo:citation-record`, `geo:readout`) updated.

**Verified:** indexation parser self-test 7/7; recorder rollups (per-engine,
per-intent, unknown-id guard) checked against fixtures; readout composition + ⚠/✓
logic + newest-first prepend (header stays singular) + both-halves-missing
degradation all confirmed. First real Perplexity data point seeded live: the
flagship "best property management companies in Ventura County" query named six
competitors and **did not surface County Property Management** — a sobering but
accurate baseline, staged in `geo-citation-report.json`.

**Known limits / next:** (1) the citation half needs a signed-in browser — answer
engines gate their source panels behind login (hit on the seed run), so full runs
require the owner signed in; (2) the first live *indexation* numbers must come from
a Windows-side run (`site:` queries + commit can't run in the Linux sandbox); (3)
consider registering `geo-readout.ps1` in Task Scheduler (monthly) alongside the
existing FAQ/blog jobs.
ipped, live, and in version control

**What was decided.** Build item #2 as two halves and settle its open channel question first:
the pipeline's signal surfaces as an **email to the blog inbox** (`cpmblog93012@gmail.com`,
reusing the Track-D Gmail path), and the live-URL inspection runs on the **Windows runners**, not
the sandbox. Heartbeat cadence: the blog runner signals only when a post actually publishes; the
daily FAQ publish job signals on a real publish and, on no-op days, only when there's a problem
(`--only-problems`) — so healthy quiet stays silent while a stalled draft queue still surfaces.

**Why.** The binding constraint was that the pipeline auto-publishes but couldn't see its own
output — the 07/02 FAQ leak shipped live and stayed invisible until a manual dig. Email is the
surface the owner already watches, so a signal there can't be missed; the Windows host is the only
place with network + git, matching the standing sandbox limits. The `--only-problems` no-op rule
keeps the channel from becoming noise the owner learns to ignore.

**Outcome (durable facts).** Committed + pushed as **f63cef2** (7 files; `inspect-live-posts.mjs`
at 323 lines — the full file is in git, confirming the sandbox mount-cache truncation seen during
the build was only the shell's view, not the real file). SMTP send **proven live**: a manual
heartbeat landed the `[CPM blog ⚠]` email in the inbox, the ⚠ correctly raised by the 84-drafts-vs-
37-live stall crossing the threshold. Still un-exercised by nature: the live-URL inspection fetch,
which runs on the first real publish.

**What is next.** Item #3 — the GEO effectiveness readout (indexation coverage + periodic
AI-citation spot checks), the OUTCOME end of the loop. Also still open below the line: drain/triage
the 84-draft FAQ queue (the ⚠ will fire daily until it's under threshold); wire `crosslink:faq`
into `publish-faq.ps1`.

**Principle reaffirmed.** Durable files are the record, not AI memory. This entry — not session
recall — is what the next session should trust for where item #2 landed.
