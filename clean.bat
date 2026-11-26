@echo off
setlocal EnableDelayedExpansion
title WhatsApp Contact Exporter - Session Cleanup

echo ================================================================================
echo  WhatsApp Contact Exporter - Session Cleanup
echo ================================================================================
echo.

cd /d "%~dp0"

echo [1/2] Removing local session credentials (.wwebjs_auth)...
if exist ".wwebjs_auth" (
    rmdir /s /q ".wwebjs_auth"
    echo   [OK] Local session directory deleted successfully.
) else (
    echo   [INFO] No local session directory found.
)

if exist ".wwebjs_cache" (
    rmdir /s /q ".wwebjs_cache"
    echo   [OK] Browser cache directory deleted.
)

echo.
echo ================================================================================
echo  IMPORTANT: DO NOT FORGET TO UNLINK ON YOUR PHONE!
echo ================================================================================
echo  1. Open WhatsApp on your smartphone.
echo  2. Go to: Settings / Menu -^> Linked Devices.
echo  3. Tap on the active browser session (e.g., Google Chrome).
echo  4. Tap "Log Out".
echo ================================================================================
echo.
pause
