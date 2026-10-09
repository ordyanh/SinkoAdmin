@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion

REM ============================================================
REM Git Commit & Push Script for SinkoAdmin
REM Target: https://github.com/ordyanh/SinkoAdmin.git
REM ============================================================

REM Always execute from the repository root where this BAT file is located
cd /d "%~dp0"

REM Target remote repository
set "TARGET_REPO=https://github.com/ordyanh/SinkoAdmin.git"

echo ======================================================
echo   Git Auto Commit and Push [SinkoAdmin]
echo ======================================================
echo Target repository: %TARGET_REPO%
echo.

REM 1. Verify Git availability
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git is not installed or not found in PATH!
    goto :END
)

REM 2. Check if local git repo is initialized
if not exist ".git" (
    echo [INFO] Git repository not initialized. Initializing now...
    git init
    if errorlevel 1 (
        echo [ERROR] git init failed!
        goto :END
    )
    git branch -M main
)

REM 3. Ensure remote 'origin' is configured to target repository
git remote get-url origin >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Setting remote 'origin' to: %TARGET_REPO%
    git remote add origin %TARGET_REPO%
) else (
    for /f "delims=" %%U in ('git remote get-url origin 2^>nul') do set "EXISTING_REMOTE=%%U"
    if /i not "!EXISTING_REMOTE!"=="%TARGET_REPO%" (
        echo Updating remote 'origin' to: %TARGET_REPO%
        git remote set-url origin %TARGET_REPO%
    )
)

REM 4. Detect current active branch
for /f "delims=" %%B in ('git branch --show-current 2^>nul') do set "CURRENT_BRANCH=%%B"
if not defined CURRENT_BRANCH (
    for /f "delims=" %%B in ('git rev-parse --abbrev-ref HEAD 2^>nul') do set "CURRENT_BRANCH=%%B"
)

if not defined CURRENT_BRANCH (
    set "CURRENT_BRANCH=main"
    git checkout -B main >nul 2>&1
)

if /i "%CURRENT_BRANCH%"=="HEAD" (
    echo [ERROR] You are in detached HEAD state. Please switch to a branch before pushing.
    goto :END
)

echo Active branch:      %CURRENT_BRANCH%
echo.

REM 5. Show current git status
echo --- Current Status ---
git status --short
echo ----------------------
echo.

REM 6. Check if there are uncommitted changes
git status --porcelain | findstr /R "." >nul 2>&1
set "HAS_CHANGES=%ERRORLEVEL%"

REM 7. Determine commit message
set "COMMIT_MSG=%*"
if defined COMMIT_MSG (
    for /f "tokens=* delims=" %%M in ("!COMMIT_MSG!") do set "COMMIT_MSG=%%~M"
)

if not defined COMMIT_MSG (
    if %HAS_CHANGES% EQU 0 (
        set /p "COMMIT_MSG=Enter commit message [press Enter for default]: "
    )
)

if not defined COMMIT_MSG (
    set "COMMIT_MSG=Update SinkoAdmin [%DATE% %TIME%]"
)

REM 8. Stage and commit if there are changes
if %HAS_CHANGES% EQU 0 (
    echo.
    echo Staging all changes...
    git add -A

    echo Committing changes: "%COMMIT_MSG%"
    git commit -m "%COMMIT_MSG%"
    if errorlevel 1 (
        echo [ERROR] git commit failed!
        goto :END
    )
    echo Commit created successfully!
) else (
    echo No uncommitted local changes found.
    echo Checking for unpushed commits...
)

echo.
REM 9. Push to current branch on target repository
echo Pushing to %TARGET_REPO% [branch: %CURRENT_BRANCH%]...
git push -u origin "%CURRENT_BRANCH%"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ======================================================
    echo   [SUCCESS] Successfully pushed to '%CURRENT_BRANCH%'!
    echo ======================================================
) else (
    echo.
    echo ======================================================
    echo   [NOTE] If remote repository doesn't exist yet on GitHub,
    echo   please create https://github.com/ordyanh/SinkoAdmin first,
    echo   then run this script again.
    echo ======================================================
)

:END
echo.
REM Pause if executed from Windows Explorer (double-click)
echo %cmdcmdline% | findstr /i /c:"%~nx0" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    pause
)

endlocal
exit /b %ERRORLEVEL%
