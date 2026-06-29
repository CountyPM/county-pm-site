@echo off
REM One-time setup: register the CPM blog capture runner in Windows Task Scheduler.
REM Runs post-blog-inbox.ps1 every 15 minutes. It no-ops when there's no new mail.
REM
REM AUTO-PUBLISH: this registration passes -Publish, so harvested posts convert AND
REM push to the live site automatically (~15 min). The sender allowlist in
REM .env.blog-inbox is the safety gate — only trusted addresses may trigger a post.
set LOG=C:\Users\cpm\county-pm-site\blog-task-setup.log
schtasks /Create /TN "CPM Blog Capture" /TR "powershell -ExecutionPolicy Bypass -File \"C:\Users\cpm\county-pm-site\scripts\post-blog-inbox.ps1\" -Publish" /SC MINUTE /MO 15 /F > "%LOG%" 2>&1
schtasks /Query /TN "CPM Blog Capture" /FO LIST >> "%LOG%" 2>&1
echo ===== setup-blog-task finished. See blog-task-setup.log. =====
type "%LOG%"
pause
