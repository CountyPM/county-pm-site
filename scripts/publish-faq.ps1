# publish-faq.ps1 — Windows-side auto-publish for the CPM FAQ hub (GEO track A).
#
# The weekly Cowork agent task prepares + validates finished FAQ entries into
# content/faq/ but cannot push from the Linux sandbox (no git creds/network there).
# This script runs on Windows — where git, the network, and SWC all work — to
# commit and push whatever the agent left, which triggers the Vercel deploy.
#
# It is safe to run on a schedule: it validates first, no-ops when there is
# nothing new, and stages ONLY the FAQ content + source registry (never `git add .`).
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts\publish-faq.ps1          # validate + publish
#   powershell -ExecutionPolicy Bypass -File scripts\publish-faq.ps1 -Build   # also run full next build first
#
# Register in Windows Task Scheduler to run shortly after the weekly agent run
# (e.g. Mondays 10:00 AM, or daily — it only publishes when something changed).

param([switch]$Build)
$ErrorActionPreference = 'Stop'
$repo = 'C:\Users\cpm\county-pm-site'
Set-Location $repo
$log = Join-Path $repo 'faq-publish.log'
function Log($m) { "$(Get-Date -Format o)  $m" | Tee-Object -FilePath $log -Append }

# Item #2: pre-run commit, so the post-publish inspection scopes to what THIS
# run pushed (range $startSha..HEAD).
$startSha = (git rev-parse HEAD 2>$null)
if ($startSha) { $startSha = $startSha.Trim() }

try {
  Log 'publish-faq: start'

  # 1. Clear a stale git lock (interrupted sandbox git ops leave this behind).
  $lock = Join-Path $repo '.git\index.lock'
  if (Test-Path $lock) { Remove-Item $lock -Force; Log 'Removed stale .git/index.lock' }

  # 2. Validate FAQ content — pure-JS gate; abort if any entry is invalid
  #    (e.g. an objective entry missing its citation).
  npm run validate:faq
  if ($LASTEXITCODE -ne 0) {
    Log 'Validation FAILED — nothing published.'
    try { node scripts/send-heartbeat.mjs --context faq --failed 1 --state 'validation-failed' } catch {}
    exit 1
  }

  # 3. Optional full production build (SWC works on Windows). Off by default;
  #    Vercel runs the real build on push.
  if ($Build) {
    npm run build
    if ($LASTEXITCODE -ne 0) { Log 'Build FAILED — nothing published.'; exit 1 }
  }

  # 3b. Wire reciprocal blog spokes from FAQ `derivedFrom` (append-only merge:
  #     never removes hand-curated faq entries, only adds missing derived ones),
  #     and stamp the FAQ cache key so Vercel's build cache can't serve stale
  #     blog prerenders after a FAQ-only change (the 2026-07-09 stale-cache bug).
  #     Both are idempotent — no-op when everything is already wired/current.
  $spokeChanged = & node scripts/wire-blog-spokes.mjs --apply --print-changed
  if ($LASTEXITCODE -ne 0) { Log 'Spoke wiring FAILED (invalid YAML produced) — nothing published.'; try { node scripts/send-heartbeat.mjs --context faq --failed 1 --state 'spoke-wiring-failed' } catch {}; exit 1 }
  $cacheKeyChanged = & node scripts/stamp-faq-cache-key.mjs --print-changed
  if ($LASTEXITCODE -ne 0) { Log 'Cache-key stamp FAILED — nothing published.'; exit 1 }

  # 4. Stage ONLY FAQ content, the source registry, any blog posts whose spokes
  #    changed, and the generated cache-key module (never `git add .`).
  git add content/faq scripts/faq-source-registry.json
  foreach ($f in @($spokeChanged) + @($cacheKeyChanged)) {
    if ($f -and $f.Trim()) { git add -- $f.Trim() }
  }
  $changes = git status --porcelain content/faq scripts/faq-source-registry.json content/blog lib/faq-cache-key.ts
  if (-not $changes) {
    Log 'No FAQ changes to publish.'
    # Queue hygiene: clear any drafts whose slug is already live so the heartbeat
    # counts a truthful queue (fixes the 2026-07-09 inflation: 57/106 drafts were
    # already-published dupes that kept re-firing the ⚠ stall alert).
    try { node scripts/prune-published-drafts.mjs --apply --quiet } catch {}
    # Item #2 INPUT-END signal: quiet days stay silent, but if the draft queue
    # has stalled (the 07/02 shape: entries drafted but never promoted to the
    # hub), --only-problems still fires so it doesn't hide behind a no-op.
    try { node scripts/send-heartbeat.mjs --context faq --state 'no-op' --only-problems } catch {}
    exit 0
  }

  # 5. Commit + push (Vercel deploys on push to main).
  git commit -m "FAQ hub: automated publish $(Get-Date -Format 'yyyy-MM-dd')"
  git push origin HEAD:main
  Log 'Published: pushed FAQ updates to origin/main (Vercel will deploy).'

  # ---- Item #2: OUTPUT-END inspection + heartbeat -------------------------
  if ($startSha) {
    Log "Inspecting freshly-published FAQ page(s) live (range $startSha..HEAD)..."
    try {
      node scripts/inspect-live-posts.mjs --since $startSha
      if ($LASTEXITCODE -ne 0) { Log 'INSPECTION found problems - see inspect-report.json / heartbeat email.' }
      else { Log 'Inspection: all published FAQ entries verified live.' }
    } catch { Log "Inspection error: $_" }
  }
  # Queue hygiene: the entries just published are now live — clear their drafts
  # (and any older already-published stragglers) so the queue stops re-inflating.
  try { node scripts/prune-published-drafts.mjs --apply --quiet } catch { Log "Prune error: $_ (non-fatal)" }
  try { node scripts/send-heartbeat.mjs --context faq --state 'published' } catch { Log "Heartbeat send error: $_ (non-fatal)" }
  # -------------------------------------------------------------------------

  Log 'publish-faq: done'
}
catch {
  Log "ERROR: $_"
  try { node scripts/send-heartbeat.mjs --context faq --failed 1 --state error } catch {}
  exit 1
}
