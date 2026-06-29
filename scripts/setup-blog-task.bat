@echo off
REM One-time setup: register the CPM blog capture runner in Windows Task Scheduler.
REM Runs post-blog-inbox.ps1 every 15 minutes. It no-ops when there's no new mail.
REM
REM REVIEW-FIRST: this registration does NOT pass -Publish, so harvested posts are
REM committed locally but NOT pushed live. Once the loop is proven, re-run this
REM file after adding -Publish to the /TR command to go fully automatic / live.
set LOG=C:\Users\cpm\county-pm-site\blog-task-setup.log
schtasks /Create /TN "CPM Blog Capture" /TR "powershell -ExecutionPolicy Bypass -File \"C:\Users\cpm\county-pm-site\scripts\post-blog-inbox.ps1\"" /SC MINUTE /MO 15 /F > "%LOG%" 2>&1
schtasks /Query /TN "CPM Blog Capture" /FO LIST >> "%LOG%" 2>&1
echo ===== setup-blog-task finished. See blog-task-setup.log. =====
type "%LOG%"
pause
