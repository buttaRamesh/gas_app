@echo off
REM Pull latest changes from Claude branch
REM Usage: pull-from-claude.bat

echo ================================================
echo Pull from Claude Branch Script
echo ================================================
echo.

set BRANCH=claude/swf-011CUXJPdZbEdDyjL5FcyUBX

echo [1/4] Checking current branch and status...
git status
echo.

echo [2/4] Checking out Claude branch...
git checkout %BRANCH%
if errorlevel 1 (
    echo ERROR: Failed to checkout branch %BRANCH%
    exit /b 1
)
echo.

echo [3/4] Fetching latest changes from remote...
git fetch origin %BRANCH%
if errorlevel 1 (
    echo ERROR: Failed to fetch from remote
    exit /b 1
)
echo.

echo [4/4] Pulling changes from remote...
git pull origin %BRANCH%
if errorlevel 1 (
    echo ERROR: Failed to pull changes
    echo.
    echo This might be due to:
    echo - Merge conflicts
    echo - Uncommitted local changes
    echo.
    echo Try running: git status
    exit /b 1
)
echo.

echo ================================================
echo SUCCESS! Latest changes pulled from Claude branch
echo ================================================
echo.

echo Recent commits:
git log --oneline -5
echo.

echo Current branch status:
git status
echo.

pause
