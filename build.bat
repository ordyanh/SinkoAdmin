@echo off
setlocal EnableExtensions EnableDelayedExpansion
title Sinko Admin Panel [BUILD]
cd /d "%~dp0"

echo ======================================================
echo           S I N K O   A D M I N   P A N E L
echo                Building Production Bundle
echo ======================================================
echo.

if not exist "node_modules\" (
    echo [INFO] Installing npm dependencies...
    call npm install
)

echo [INFO] Building production bundle...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed!
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Build completed successfully! Output in /dist
pause
