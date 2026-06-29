@echo off
REM One-time: install Track D harvest deps, then dry-run the IMAP harvest.
REM Double-click this (or run it) BEFORE registering the scheduled task.
REM Dry-run connects to the mailbox but writes nothing and marks nothing seen.
cd /d C:\Users\cpm\county-pm-site
echo ===== 1/2  npm install (imapflow, mailparser) =====
call npm install
echo.
echo ===== 2/2  harvest dry-run (connects to mailbox, writes nothing) =====
node scripts\harvest-blog-inbox.mjs --dry-run
echo.
echo ===== setup-blog-deps-and-test finished. Review output above. =====
pause
