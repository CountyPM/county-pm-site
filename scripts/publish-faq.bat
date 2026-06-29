@echo off
REM Launcher so the publish script can be started by double-click (Explorer),
REM since terminal windows can't be typed into via screen control.
powershell -ExecutionPolicy Bypass -File "C:\Users\cpm\county-pm-site\scripts\publish-faq.ps1"
echo.
echo ===== publish-faq finished. See faq-publish.log. You can close this window. =====
pause
