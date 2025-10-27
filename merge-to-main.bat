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
set CLAUDE_BRANCH=claude/swf-011CUXJPdZbEdDyjL5FcyUBX

echo [1/6] Fetching latest changes from remote...
git fetch origin
if errorlevel 1 (
    echo ERROR: Failed to fetch from remote
    pause
    exit /b 1
)

echo [2/6] Pulling latest changes from Claude branch...
git pull origin %CLAUDE_BRANCH%
if errorlevel 1 (
    echo ERROR: Failed to pull from %CLAUDE_BRANCH%
    pause
    exit /b 1
)

echo [3/6] Switching to main branch...
git checkout main
if errorlevel 1 (
    echo ERROR: Failed to checkout main branch
    pause
    exit /b 1
)

echo [4/6] Pulling latest changes from main...
git pull origin main
if errorlevel 1 (
    echo ERROR: Failed to pull from main
    pause
    exit /b 1
)

echo [5/6] Merging %CLAUDE_BRANCH% into main...
git merge %CLAUDE_BRANCH% --no-ff -m "Merge %CLAUDE_BRANCH% into main"
if errorlevel 1 (
    echo ERROR: Merge conflict detected!
    echo Please resolve conflicts manually, then run:
    echo   git commit
    echo   git push origin main
    pause
    exit /b 1
)

echo [6/6] Pushing merged changes to remote main...
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
