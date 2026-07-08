@echo off
REM ============================================================================
REM  CPM one-time legacy blog migration — double-click me (or run from cmd).
REM
REM  What this does, in order:
REM    1. git pull (gets the latest migration files)
REM    2. downloads all 25 legacy hero images from the old site's CDN -> webp
REM    3. generates 3 fresh heroes via the Gemini image pipeline (gen-hero.mjs,
REM       needs GEMINI_API_KEY in .env.images -- already set up for new posts)
REM    4. moves the 25 staged posts from content\blog-staging -> content\blog
REM       (posts + images go live together, no broken heroes)
REM    5. commits and pushes to main -> Vercel deploys
REM
REM  Set NOPUSH=1 before running to stop after step 4 and review manually.
REM ============================================================================
setlocal
cd /d "%~dp0.."
echo === [1/5] git pull ===
git pull origin main || goto :fail

echo === [2/5 + 3/5] legacy image download + hero generation ===
call node scripts\migrate-legacy-images.mjs %* || goto :fail

echo === [4/5] moving staged posts live ===
if exist content\blog-staging (
  move /Y content\blog-staging\*.mdx content\blog\ >nul
  rmdir content\blog-staging 2>nul
)

echo === git status ===
git status --short
echo.
if "%NOPUSH%"=="1" (
  echo NOPUSH=1 set -- review the changes above, then commit and push yourself.
  goto :eof
)
echo === [5/5] commit + push ===
git add -A
git commit -m "Legacy blog migration: 25 posts + hero images from old AppFolio site" || goto :fail
git push origin main || goto :fail
echo.
echo DONE. Vercel is deploying -- the migrated posts will appear on /blog shortly.
goto :eof
:fail
echo.
echo Something failed above. Nothing further was done -- safe to re-run after fixing.
exit /b 1
