@echo off
setlocal EnableExtensions EnableDelayedExpansion
title Sinko Admin Panel [LOCAL BACKEND]
cd /d "%~dp0"

echo ======================================================
echo           S I N K O   A D M I N   P A N E L
echo         Running with LOCAL BACKEND (localhost:5206)
echo ======================================================
echo.

where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    pause
    exit /b 1
)

if not exist "node_modules\" (
    echo [INFO] First time setup: Installing npm packages...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] npm install failed!
        pause
        exit /b 1
    )
)

echo [INFO] Setting backend target to LOCAL...
call node scripts\switch-backend.js local

echo.
echo [INFO] Starting Sinko Admin Development Server on port 5180...
echo [INFO] URL: http://localhost:5180
echo.
call npm run dev
pause
