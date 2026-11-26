@echo off
setlocal EnableDelayedExpansion
title WhatsApp Contact Exporter

echo ================================================================================
echo  WhatsApp Contact Exporter for Windows
echo ================================================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please download and install Node.js (LTS version) from:
    echo https://nodejs.org/
    echo.
    echo After installing Node.js, run this file again.
    echo.
    pause
    exit /b 1
)

cd /d "%~dp0"

if not exist "node_modules" (
    echo [Setup] Installing required libraries (one-time setup)...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to install dependencies.
        pause
        exit /b 1
    )
)

if not exist "output" (
    mkdir "output"
)

echo [Start] Launching WhatsApp Contact Exporter...
echo.
node src\index.js %*

echo.
echo Press any key to exit...
pause >nul
