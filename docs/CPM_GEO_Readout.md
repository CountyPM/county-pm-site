# CPM GEO Effectiveness Readout

The OUTCOME ledger for the GEO initiative (priority item #3). Each cycle appends a
dated section **at the top** (newest first) with two measurements:

1. **Indexation coverage** — are our pages actually in the search indexes that feed
   AI answer engines? Measured with public `site:` queries (no API creds) by
   `scripts/geo-indexation-check.mjs`. Approximate by design.
2. **AI-citation spot check** — do ChatGPT / Perplexity / Google's AI Overview name
   County Property Management or link c-p-m.com for the questions our owners ask?
   A fixed probe set (`scripts/geo-citation-probes.json`) run in a real signed-in
   browser via the Chrome MCP, recorded by `scripts/geo-citation-record.mjs`.

Assembled + emailed by `scripts/geo-readout.mjs` (`npm run geo:readout`). Runs
Windows-side (needs live network + commits this doc); see the two-host model in
`docs/CPM_GEO_Progress_Summary.md` §6. A "not run" half is itself signal.

**How each cycle runs**
- Automated (monthly): Windows Task Scheduler → `scripts\geo-readout.ps1` runs the
  indexation probe, folds in the latest recorded citation check, prepends a dated
  section here, emails the summary, commits this doc.
- Citation half (assisted): open the probe set, ask each question in a signed-in
  browser (Chrome MCP), and record what you saw with
  `node scripts/geo-citation-record.mjs --results <run.json>`. Because answer
  engines gate their source panels behind login, this half needs a signed-in
  session — the owner accepted that trade when choosing browser probes over paid
  APIs. The runner uses whatever citation report is ≤45 days old, else marks that
  half "not run".

**Reading the numbers.** *Bulk coverage* is an approximate ratio of the best
engine's `site:` count to the sitemap size — treat it as a trend line, not a
precise figure (search engines round and throttle). *Sampled presence* is the
cleaner signal: of a handful of high-value URLs (home, /faq, each FAQ topic page,
newest posts), how many the engine actually returns. *Citation rate* counts only
engine×probe cells that were actually checked, so a partial run doesn't distort it.

---

_No measured cycle recorded yet. The first dated section will appear directly below
this line after the first `scripts\geo-readout.ps1` run (or `npm run geo:readout`
on a networked machine). A seed citation data point (2026-07-03: the flagship
"best property management companies in Ventura County" query on Perplexity did not
surface County Property Management — competitors were named instead) is staged in
the runtime `geo-citation-report.json` and will be folded into that first section._
