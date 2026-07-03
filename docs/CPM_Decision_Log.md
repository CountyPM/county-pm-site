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
