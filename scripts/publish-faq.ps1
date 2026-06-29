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

try {
  Log 'publish-faq: start'

  # 1. Clear a stale git lock (interrupted sandbox git ops leave this behind).
  $lock = Join-Path $repo '.git\index.lock'
  if (Test-Path $lock) { Remove-Item $lock -Force; Log 'Removed stale .git/index.lock' }

  # 2. Validate FAQ content — pure-JS gate; abort if any entry is invalid
  #    (e.g. an objective entry missing its citation).
  npm run validate:faq
  if ($LASTEXITCODE -ne 0) { Log 'Validation FAILED — nothing published.'; exit 1 }

  # 3. Optional full production build (SWC works on Windows). Off by default;
  #    Vercel runs the real build on push.
  if ($Build) {
    npm run build
    if ($LASTEXITCODE -ne 0) { Log 'Build FAILED — nothing published.'; exit 1 }
  }

  # 4. Stage ONLY FAQ content + the source registry.
  git add content/faq scripts/faq-source-registry.json
  $changes = git status --porcelain content/faq scripts/faq-source-registry.json
  if (-not $changes) { Log 'No FAQ changes to publish.'; exit 0 }

  # 5. Commit + push (Vercel deploys on push to main).
  git commit -m "FAQ hub: automated publish $(Get-Date -Format 'yyyy-MM-dd')"
  git push origin HEAD:main
  Log 'Published: pushed FAQ updates to origin/main (Vercel will deploy).'
  Log 'publish-faq: done'
}
catch {
  Log "ERROR: $_"
  exit 1
}
