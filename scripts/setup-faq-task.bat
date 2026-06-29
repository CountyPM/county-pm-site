@echo off
REM One-time setup: register the FAQ publish job in Windows Task Scheduler.
REM Runs publish-faq.ps1 daily at 12:00 PM (it no-ops when nothing changed),
REM which reliably publishes whatever the weekly agent run prepared.
set LOG=C:\Users\cpm\county-pm-site\faq-task-setup.log
schtasks /Create /TN "CPM FAQ Publish" /TR "powershell -ExecutionPolicy Bypass -File \"C:\Users\cpm\county-pm-site\scripts\publish-faq.ps1\"" /SC DAILY /ST 12:00 /F > "%LOG%" 2>&1
schtasks /Query /TN "CPM FAQ Publish" /FO LIST >> "%LOG%" 2>&1
echo ===== setup-faq-task finished. See faq-task-setup.log. =====
type "%LOG%"
pause
