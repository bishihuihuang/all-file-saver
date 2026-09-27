@echo off
cd /d "%~dp0"
title All-File-Saver - Auto Publish to GitHub

echo ============================================================
echo   All-File-Saver - One-click Auto Publish
echo   Steps: Pull - Obfuscate - Commit - Push to GitHub
echo ============================================================

where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js not found. Install from: https://nodejs.org
    pause
    exit /b 1
)
where git >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Git not found. Install from: https://git-scm.com
    pause
    exit /b 1
)

echo.
echo [1/5] Pulling latest from remote...
git pull --rebase --autostash origin main
if errorlevel 1 (
    echo.
    echo ============================================================
    echo [ERROR] Pull failed!
    echo Reasons: remote has new commits, or merge conflict.
    echo Fix:
    echo   1. Run: git status  to see conflicting files
    echo   2. Resolve conflicts, then: git add . ^&^& git rebase --continue
    echo   3. Run this bat again
    echo ============================================================
    pause
    exit /b 1
)

echo.
echo [2/5] Running obfuscator (source - release)...
node _obfuscate.js
if errorlevel 1 (
    echo.
    echo ============================================================
    echo [ERROR] Obfuscator failed! Check _obfuscate.js for errors.
    echo ============================================================
    pause
    exit /b 1
)

echo.
echo [3/5] Staging all changes...
git add .
echo --- Changed files ---
git status --short
echo ---------------------

git diff --cached --quiet
if not errorlevel 1 (
    echo.
    echo [INFO] No changes to commit.
    echo   If you edited source files, check:
    echo   - Did you edit files under _src folder?
    echo   - Did the obfuscator regenerate the release file?
    echo ============================================================
    echo   Nothing to upload. Done.
    pause
    exit /b 0
)

echo.
echo [4/5] Committing...
git commit -m "auto update: %date% %time%"
if errorlevel 1 (
    echo [ERROR] Commit failed!
    pause
    exit /b 1
)

echo.
echo [5/5] Pushing to GitHub...
git push origin main
if not errorlevel 1 (
    echo.
    echo ============================================================
    echo   PUBLISH SUCCESS!
    echo   Refresh the GitHub Pages site in 1-2 minutes.
    echo ============================================================
) else (
    echo.
    echo ============================================================
    echo [ERROR] Push failed! Possible reasons:
    echo   1. Rejected - run this bat again to pull and merge
    echo   2. Network issue - check connection and retry
    echo   3. Auth failed - check Git credentials
    echo   4. GitHub blocked content - check for sensitive data
    echo ============================================================
)

pause