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
