# post-blog-inbox.ps1 - Windows-side runner for the CPM blog capture pipeline (Track D).
#
# The iPhone half emails a packaged contract to the blog inbox mailbox.
# This script (run on Windows, where git + network + SWC all work):
#   1. harvests new mail over IMAP into .\incoming  (scripts\harvest-blog-inbox.mjs)
#   2. runs each contract through scripts\post-blog.mjs (convert -> MDX + sidecar -> commit)
#   3. moves handled contracts to .\.blog-processed so nothing is processed twice
#
# REVIEW-FIRST BY DEFAULT: post-blog.mjs runs WITHOUT --publish, so posts are
# committed locally but NOT pushed. Review them, then push, or re-run with
# -Publish once the loop is proven to flip it to fully automatic / live.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts\post-blog-inbox.ps1            # harvest + convert + commit (no push)
#   powershell -ExecutionPolicy Bypass -File scripts\post-blog-inbox.ps1 -Publish   # also push to main (LIVE -> Vercel)
#   powershell -ExecutionPolicy Bypass -File scripts\post-blog-inbox.ps1 -DryRun    # report only; harvest nothing, write nothing
#
# Register in Windows Task Scheduler (see scripts\setup-blog-task.bat) to run
# on a cadence (e.g. every 30 min, or hourly). It no-ops when there's no new mail.

param(
  [switch]$Publish,
  [switch]$DryRun
)
$ErrorActionPreference = 'Stop'
$repo = 'C:\Users\cpm\county-pm-site'
Set-Location $repo
$log = Join-Path $repo 'blog-publish.log'
function Log($m) { "$(Get-Date -Format o)  $m" | Tee-Object -FilePath $log -Append }

# Item #2: capture the pre-run commit so the post-publish inspection only checks
# what THIS run pushed (range $startSha..HEAD). post-blog.mjs commits per post.
$startSha = (git rev-parse HEAD 2>$null)
if ($startSha) { $startSha = $startSha.Trim() }

$inbox     = Join-Path $repo 'incoming'
$processed = Join-Path $repo '.blog-processed'
$sidecar   = $processed   # private fields archive lives with the processed contracts

try {
  Log "post-blog-inbox: start (Publish=$Publish DryRun=$DryRun)"

  # 1. Clear a stale git lock (interrupted git ops leave this behind).
  $lock = Join-Path $repo '.git\index.lock'
  if (Test-Path $lock) { Remove-Item $lock -Force; Log 'Removed stale .git/index.lock' }

  # 2. Ensure harvest deps are present (one-time on a fresh checkout; needs network).
  if (-not (Test-Path (Join-Path $repo 'node_modules\imapflow')) -or
      -not (Test-Path (Join-Path $repo 'node_modules\mailparser'))) {
    Log 'Installing harvest deps (imapflow, mailparser)...'
    npm install
    if ($LASTEXITCODE -ne 0) { Log 'npm install FAILED - cannot harvest.'; exit 1 }
  }

  New-Item -ItemType Directory -Force -Path $inbox, $processed | Out-Null

  # 3. Harvest new mail into .\incoming.
  if ($DryRun) {
    node scripts/harvest-blog-inbox.mjs --dry-run
    Log 'Dry run - harvest reported only; nothing converted.'
    Log 'post-blog-inbox: done'
    exit 0
  }
  node scripts/harvest-blog-inbox.mjs
  if ($LASTEXITCODE -ne 0) { Log 'Harvest FAILED - aborting.'; exit 1 }

  # 4. Convert each harvested contract.
  $files = Get-ChildItem -Path $inbox -Filter 'cpm-blog_*.md' -File -ErrorAction SilentlyContinue
  if (-not $files) { Log 'No contracts in inbox to convert.'; Log 'post-blog-inbox: done'; exit 0 }

  $ok = 0; $bad = 0
  $state = if ($Publish) { 'published' } else { 'committed (not pushed)' }

  # Track C: scratch dir for generated hero images (gitignored via .hero-tmp/).
  $heroTmpDir = Join-Path $repo '.hero-tmp'
  New-Item -ItemType Directory -Force -Path $heroTmpDir | Out-Null

  foreach ($f in $files) {
    Log "Converting $($f.Name)"
    $nodeArgs = @('scripts/post-blog.mjs', $f.FullName, '--sidecar-dir', $sidecar)

    # Track C: generate a hero image from the contract's gemini_prompt (still in the
    # contract at this point - post-blog.mjs strips it). Best-effort: if generation
    # fails (no gemini_prompt, no API key, network, etc.) the post still publishes
    # text-only. The hero must never block a post.
    $heroTmp = Join-Path $heroTmpDir ($f.BaseName + '.webp')
    if (Test-Path $heroTmp) { Remove-Item $heroTmp -Force -ErrorAction SilentlyContinue }
    try {
      node scripts/gen-hero.mjs --contract $f.FullName --out $heroTmp --brightness 1.3
      if ($LASTEXITCODE -eq 0 -and (Test-Path $heroTmp)) {
        $nodeArgs += @('--hero', $heroTmp)
        Log "Hero generated: $($f.BaseName).webp"
      } else {
        Log "Hero gen skipped/failed for $($f.Name) (exit $LASTEXITCODE) - publishing text-only."
      }
    } catch {
      Log "Hero gen error for $($f.Name): $_ - publishing text-only."
    }

    if ($Publish) { $nodeArgs += '--publish' }
    node @nodeArgs
    if ($LASTEXITCODE -eq 0) {
      # Move the handled contract out of the inbox so it isn't processed twice.
      Move-Item -LiteralPath $f.FullName -Destination (Join-Path $processed $f.Name) -Force
      Log "OK: $($f.Name) -> .blog-processed ($state)"
      $ok++
    } else {
      Log "FAILED: $($f.Name) left in inbox for review."
      $bad++
    }

    # post-blog.mjs already copied the hero into public/images/blog/<slug>.webp,
    # so the scratch copy is no longer needed.
    if (Test-Path $heroTmp) { Remove-Item $heroTmp -Force -ErrorAction SilentlyContinue }
  }

  Log "post-blog-inbox: done - $ok converted, $bad failed."

  # ---- Item #2: OUTPUT-END inspection + heartbeat -------------------------
  # Only meaningful when we actually pushed (Publish) AND shipped something this
  # run. Nothing to inspect on a commit-only or empty run. A heartbeat here would
  # be pure noise every 30-min tick, so it fires only when a post went live.
  if ($Publish -and $ok -gt 0 -and $startSha) {
    Log "Inspecting $ok freshly-published post(s) live (range $startSha..HEAD)..."
    try {
      node scripts/inspect-live-posts.mjs --since $startSha
      $inspectExit = $LASTEXITCODE
      if ($inspectExit -ne 0) { Log "INSPECTION found problems (exit $inspectExit) - see inspect-report.json / heartbeat email." }
      else { Log "Inspection: all published posts verified live." }
    } catch {
      Log "Inspection error: $_"
    }
    try {
      node scripts/send-heartbeat.mjs --context blog --published $ok --failed $bad --state published
    } catch {
      Log "Heartbeat send error: $_ (non-fatal)"
    }
  }
  # -------------------------------------------------------------------------

  if ($bad -gt 0) { exit 1 }
}
catch {
  Log "ERROR: $_"
  # Best-effort failure heartbeat so a crashing runner isn't silent.
  try { node scripts/send-heartbeat.mjs --context blog --failed 1 --state error } catch {}
  exit 1
}
