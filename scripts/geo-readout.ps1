# geo-readout.ps1 — Windows-side monthly GEO EFFECTIVENESS READOUT (item #3).
#
# This is the OUTCOME end of the initiative: it measures whether the GEO work is
# actually landing — are our pages indexed, and do AI answer engines cite us? It
# runs the (unattended) indexation `site:` probe, folds in the latest browser
# citation spot check if one was recorded, appends a dated section to the
# committed trend doc, emails a summary, and commits the doc.
#
# WHY WINDOWS: the indexation probe needs live network (search engines throttle
# datacenter IPs) and this commits + pushes — neither works in the Linux sandbox.
# See docs/CPM_GEO_Progress_Summary.md §6 (two-host model).
#
# The AI-citation half is browser-driven and NOT run here (it needs signed-in
# sessions via the Chrome MCP). Record it separately with the geo-citation probe
# set + `npm run geo:citation-record`; this runner will pick up a fresh
# geo-citation-report.json if it exists, or report that half as "not run".
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts\geo-readout.ps1
#
# Register in Windows Task Scheduler MONTHLY (e.g. the 1st at 9:00 AM). Coverage
# and citation trends move slowly; monthly keeps the trend readable and stays
# well under search-engine rate limits.

$ErrorActionPreference = 'Stop'
$repo = 'C:\Users\cpm\county-pm-site'
Set-Location $repo
$log = Join-Path $repo 'geo-readout.log'
function Log($m) { "$(Get-Date -Format o)  $m" | Tee-Object -FilePath $log -Append }

try {
  Log 'geo-readout: start'

  # Clear a stale git lock (interrupted sandbox git ops leave this behind).
  $lock = Join-Path $repo '.git\index.lock'
  if (Test-Path $lock) { Remove-Item $lock -Force; Log 'Removed stale .git/index.lock' }

  # 1. Indexation probe (unattended; writes geo-index-report.json). Non-fatal:
  #    if every engine is blocked, geo-readout still emits a "not run"-shaped
  #    indexation half, which is itself signal.
  Log 'Running indexation site: probe...'
  try {
    node scripts/geo-indexation-check.mjs
    if ($LASTEXITCODE -ne 0) { Log 'Indexation probe returned non-zero (continuing).' }
  } catch { Log "Indexation probe error: $_ (continuing)" }

  # 2. Assemble the dated section + email the summary. Folds in whatever
  #    geo-citation-report.json is present (browser step is recorded separately).
  Log 'Assembling readout + emailing summary...'
  node scripts/geo-readout.mjs
  if ($LASTEXITCODE -ne 0) { Log 'Readout assembly returned non-zero.' }

  # 3. Commit ONLY the committed trend doc (report JSONs are gitignored). No-op
  #    when nothing changed (e.g. a same-day rerun that produced no diff).
  git add docs/CPM_GEO_Readout.md
  $changes = git status --porcelain docs/CPM_GEO_Readout.md
  if (-not $changes) {
    Log 'No readout changes to commit (no-op).'
    Log 'geo-readout: done'
    exit 0
  }
  git commit -m "GEO readout: monthly effectiveness measurement $(Get-Date -Format 'yyyy-MM-dd')"
  git push origin HEAD:main
  Log 'Committed + pushed updated GEO readout doc.'
  Log 'geo-readout: done'
}
catch {
  Log "ERROR: $_"
  try { node scripts/geo-readout.mjs --no-email | Out-Null } catch {}
  exit 1
}
