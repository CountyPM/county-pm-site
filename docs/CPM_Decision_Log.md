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

## 2026-07-03 (later) — Item #2 BUILT: post-publish inspection + heartbeat

**Design decisions settled first (per the open question above).**
1. **Signal channel = email to the blog inbox.** Reuse the Track-D Gmail path
   (`cpmblog93012@gmail.com`) the owner already watches — no new surface to remember to open.
2. **Inspection host = the Windows runners.** Live-fetch + git already work there; appending
   to the existing scheduled tasks avoids a second moving part. (Matches the sandbox-can't-fetch
   constraint above.)

**What shipped.**
- `scripts/inspect-live-posts.mjs` — OUTPUT-end check. Derives targets from the git range the
  run pushed (`--since <preSha>..HEAD`, or explicit `--slug` / `--faq-slug`), fetches the LIVE
  `www.c-p-m.com` url(s), and asserts they actually rendered: blog → HTTP 200, correct page
  (slug in canonical/og, not a soft-404), title rendered, hero asset resolves + is referenced,
  and the "Related questions" spoke when the post declares `faq:`; FAQ → topic page 200, the
  `#<slug>` anchor rendered, question rendered, and (objective entries) the Sources block. Every
  request is cache-busted and the target set is retried over a propagation window (default 8×20s)
  so a slow-but-good Vercel deploy is never false-alarmed. Writes `inspect-report.json`
  (gitignored); exits nonzero on any hard failure. Does NOT re-fetch external FAQ sources — that
  stays Track B's (`check:faq-sources`) job.
- `scripts/lib-mail.mjs` + `scripts/send-heartbeat.mjs` — the SIGNAL. nodemailer over the same
  Gmail App Password (SMTP 465). The heartbeat gathers three things: OUTPUT (the inspect report),
  INPUT (FAQ draft-queue depth: `content/faq-drafts` vs live `content/faq` — the 07/02 stall
  shape), and RUN outcome (counts the runner passes in). Subject is scannable: `[CPM blog ✓]`
  clean vs `[CPM blog ⚠]` when a live check failed, a run failed, or the draft backlog crossed a
  stall threshold (default 25 — the queue is ~84 today, so it will flag until drained).
- Wiring: `post-blog-inbox.ps1` inspects + heartbeats only when it actually published a post
  (avoids noise on every 30-min tick); `publish-faq.ps1` inspects + heartbeats on a real publish,
  and on a no-op day sends `--only-problems` so a stalled draft queue still surfaces while healthy
  quiet days stay silent. Both capture the pre-run SHA to scope the inspection. Failure paths emit
  a best-effort heartbeat so a crashing runner isn't silent. A heartbeat send failure never fails
  the publish run.

**Verification.** Target derivation confirmed against a real range (`f380c1d~1..HEAD` → the 07/02
blog post + its 4 FAQ entries). Assertion core (`evalHtml` + `hasPhrase`, incl. HTML-entity
tolerance, 404 short-circuit, missing-spoke / 404-hero / missing-source / missing-anchor failure
detection) unit-tested 10/10. Live-fetch against `www.c-p-m.com` and the SMTP send could not be
exercised from the Linux sandbox (no route to the domain; SMTP not reachable) — both run on the
Windows host and will be exercised on the first real publish.

**Sandbox caveat (for the next session).** During this build the read-only county-pm-site mount
desynced after repeated rewrites of the same filename and served a stale/corrupted cached copy of
`inspect-live-posts.mjs` to `node` (the file API showed the correct file throughout). If a future
sandbox `node --check` of that file reports a phantom syntax error at EOF, suspect the mount cache,
not the file — verify with the file API / on Windows before "fixing" it.

**Optional config.** `send-heartbeat` recipient defaults to `cpmblog93012@gmail.com`; override with
`CPM_HEARTBEAT_TO` in `.env.blog-inbox`. Stall threshold via `--stall-threshold N`.

**Next (item #3, unchanged):** GEO effectiveness readout (indexation coverage + periodic
AI-citation spot checks) — the OUTCOME end.
