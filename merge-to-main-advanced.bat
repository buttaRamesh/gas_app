@echo off
REM ========================================
REM Merge Claude Branch to Main - Advanced Version
REM With safety checks and conflict resolution
REM ========================================

setlocal enabledelayedexpansion

REM Configuration
set CLAUDE_BRANCH=claude/swf-011CUXJPdZbEdDyjL5FcyUBX
set MAIN_BRANCH=main
set REMOTE=origin

echo.
echo ========================================
echo  Git Merge Workflow
echo  Claude Branch -^> Main
echo ========================================
echo.

REM Check if we're in a git repository
git rev-parse --git-dir >nul 2>&1
if errorlevel 1 (
    echo ERROR: Not a git repository!
    echo Please run this script from the gas_app directory.
    pause
    exit /b 1
)

REM Show current status
echo Current repository status:
echo ------------------------
git status --short
echo.

REM Check for uncommitted changes
git diff-index --quiet HEAD --
if errorlevel 1 (
    echo WARNING: You have uncommitted changes!
    echo.
    set /p CONTINUE="Continue anyway? (y/n): "
    if /i not "!CONTINUE!"=="y" (
        echo Aborted by user.
        pause
        exit /b 0
    )
)

echo.
echo [Step 1/7] Fetching latest changes from remote...
echo ------------------------------------------------
git fetch %REMOTE% --prune
if errorlevel 1 (
    echo ERROR: Failed to fetch from remote
    pause
    exit /b 1
)
echo ✓ Fetch complete

echo.
echo [Step 2/7] Checking if Claude branch exists...
echo ----------------------------------------------
git rev-parse --verify %REMOTE%/%CLAUDE_BRANCH% >nul 2>&1
if errorlevel 1 (
    echo ERROR: Branch %CLAUDE_BRANCH% does not exist on remote!
    echo Available branches:
    git branch -r
    pause
    exit /b 1
)
echo ✓ Claude branch found

echo.
echo [Step 3/7] Switching to Claude branch...
echo ----------------------------------------
git checkout %CLAUDE_BRANCH%
if errorlevel 1 (
    echo ERROR: Failed to checkout %CLAUDE_BRANCH%
    pause
    exit /b 1
)
echo ✓ Switched to %CLAUDE_BRANCH%

echo.
echo [Step 4/7] Pulling latest from Claude branch...
echo -----------------------------------------------
git pull %REMOTE% %CLAUDE_BRANCH%
if errorlevel 1 (
    echo ERROR: Failed to pull from %CLAUDE_BRANCH%
    pause
    exit /b 1
)
echo ✓ Claude branch updated

echo.
echo [Step 5/7] Switching to main branch...
echo --------------------------------------
git checkout %MAIN_BRANCH%
if errorlevel 1 (
    echo ERROR: Failed to checkout %MAIN_BRANCH%
    pause
    exit /b 1
)
echo ✓ Switched to %MAIN_BRANCH%

echo.
echo [Step 6/7] Pulling latest from main...
echo --------------------------------------
git pull %REMOTE% %MAIN_BRANCH%
if errorlevel 1 (
    echo ERROR: Failed to pull from %MAIN_BRANCH%
    pause
    exit /b 1
)
echo ✓ Main branch updated

echo.
echo [Step 7/7] Merging Claude branch into main...
echo ---------------------------------------------
echo Merging: %CLAUDE_BRANCH% -^> %MAIN_BRANCH%
echo.

REM Perform the merge with --no-ff to create a merge commit
git merge %CLAUDE_BRANCH% --no-ff -m "Merge branch '%CLAUDE_BRANCH%' into main"
if errorlevel 1 (
    echo.
    echo ======================================
    echo  MERGE CONFLICT DETECTED!
    echo ======================================
    echo.
    echo Conflicts need to be resolved manually.
    echo.
    echo Steps to resolve:
    echo   1. Open the conflicted files in your editor
    echo   2. Look for conflict markers ^(^<^<^<^<^<^<^<, =======, ^>^>^>^>^>^>^>^)
    echo   3. Edit the files to resolve conflicts
    echo   4. Stage the resolved files: git add ^<file^>
    echo   5. Complete the merge: git commit
    echo   6. Push to remote: git push origin main
    echo.
    echo Conflicted files:
    git diff --name-only --diff-filter=U
    echo.
    set /p ABORT="Do you want to abort the merge? (y/n): "
    if /i "!ABORT!"=="y" (
        git merge --abort
        echo Merge aborted. Repository restored to previous state.
    ) else (
        echo Please resolve conflicts and complete the merge manually.
    )
    pause
    exit /b 1
)
echo ✓ Merge successful

echo.
echo [Step 8/7] Pushing to remote main...
echo ------------------------------------
git push %REMOTE% %MAIN_BRANCH%
if errorlevel 1 (
    echo.
    echo ERROR: Failed to push to remote main
    echo.
    echo This might be due to:
    echo   - Network issues
    echo   - Permission issues
    echo   - Remote has changes you don't have locally
    echo.
    echo Try:
    echo   git pull origin main
    echo   git push origin main
    echo.
    pause
    exit /b 1
)
echo ✓ Pushed to remote main

echo.
echo ========================================
echo  SUCCESS! 🎉
echo ========================================
echo.
echo Summary:
echo --------
echo • Branch merged: %CLAUDE_BRANCH% -^> %MAIN_BRANCH%
echo • Changes pushed to: %REMOTE%/%MAIN_BRANCH%
echo.

echo Current branch:
for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
echo   %CURRENT_BRANCH%
echo.

echo Latest commits on main:
git log --oneline -5
echo.

echo Repository status:
git status --short
echo.

set /p SWITCH="Do you want to switch back to Claude branch? (y/n): "
if /i "!SWITCH!"=="y" (
    git checkout %CLAUDE_BRANCH%
    echo Switched back to %CLAUDE_BRANCH%
)

echo.
echo All done!
pause
