@echo off
REM ========================================
REM Check Git Status and Branch Differences
REM ========================================

set CLAUDE_BRANCH=claude/swf-011CUXJPdZbEdDyjL5FcyUBX
set MAIN_BRANCH=main

echo.
echo ========================================
echo  Git Repository Status
echo ========================================
echo.

echo [1] Current Branch:
echo -------------------
git branch --show-current
echo.

echo [2] Local Changes:
echo ------------------
git status --short
if errorlevel 1 (
    echo No changes
)
echo.

echo [3] Latest Commits on Current Branch:
echo -------------------------------------
git log --oneline -5
echo.

echo [4] Fetching from remote...
echo ---------------------------
git fetch origin --prune
echo Done.
echo.

echo [5] Branch Comparison:
echo ----------------------
echo Commits in %CLAUDE_BRANCH% but NOT in %MAIN_BRANCH%:
git log %MAIN_BRANCH%..%CLAUDE_BRANCH% --oneline
echo.

echo Commits in %MAIN_BRANCH% but NOT in %CLAUDE_BRANCH%:
git log %CLAUDE_BRANCH%..%MAIN_BRANCH% --oneline
echo.

echo [6] Files Changed:
echo -----------------
echo Files different between %CLAUDE_BRANCH% and %MAIN_BRANCH%:
git diff --name-status %MAIN_BRANCH%..%CLAUDE_BRANCH%
echo.

echo [7] Remote Branch Status:
echo -------------------------
echo Local vs Remote for current branch:
git status -sb
echo.

echo [8] All Local Branches:
echo ----------------------
git branch -vv
echo.

echo [9] Recent Remote Branches:
echo --------------------------
git branch -r | findstr "claude/"
echo.

pause
