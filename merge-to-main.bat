@echo off
REM ========================================
REM Merge Claude Branch to Main - Simple Version
REM ========================================
echo.
echo ========================================
echo  Merging Claude Branch to Main
echo ========================================
echo.

REM Set the Claude branch name
@REM set CLAUDE_BRANCH=claude/swf-011CUXJPdZbEdDyjL5FcyUBX
set CLAUDE_BRANCH=claude/work-011CUdAtpTaq85ynaSYtS6Rm

echo [1/7] Fetching latest changes from remote...
git fetch origin
if errorlevel 1 (
    echo ERROR: Failed to fetch from remote
    pause
    exit /b 1
)

echo [2/7] Checking out Claude branch locally...
git checkout %CLAUDE_BRANCH%
if errorlevel 1 (
    echo Branch doesn't exist locally, creating it...
    git checkout -b %CLAUDE_BRANCH% origin/%CLAUDE_BRANCH%
    if errorlevel 1 (
        echo ERROR: Failed to checkout %CLAUDE_BRANCH%
        pause
        exit /b 1
    )
)

echo [3/7] Pulling latest changes from Claude branch...
git pull origin %CLAUDE_BRANCH%
if errorlevel 1 (
    echo ERROR: Failed to pull from %CLAUDE_BRANCH%
    pause
    exit /b 1
)

echo [4/7] Switching to main branch...
git checkout main
if errorlevel 1 (
    echo ERROR: Failed to checkout main branch
    pause
    exit /b 1
)

echo [5/7] Pulling latest changes from main...
git pull origin main
if errorlevel 1 (
    echo ERROR: Failed to pull from main
    pause
    exit /b 1
)

echo [6/7] Merging %CLAUDE_BRANCH% into main...
git merge %CLAUDE_BRANCH% --no-ff -m "Merge %CLAUDE_BRANCH% into main"
if errorlevel 1 (
    echo ERROR: Merge conflict detected!
    echo Please resolve conflicts manually, then run:
    echo   git commit
    echo   git push origin main
    pause
    exit /b 1
)

echo [7/7] Pushing merged changes to remote main...
git push origin main
if errorlevel 1 (
    echo ERROR: Failed to push to remote main
    pause
    exit /b 1
)

echo.
echo ========================================
echo  SUCCESS! Changes merged to main
echo ========================================
echo.
echo Current branch:
git branch --show-current
echo.
echo Latest commits:
git log --oneline -5
echo.
pause
