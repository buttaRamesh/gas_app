@echo off
REM Push changes to Claude branch with custom commit message
REM Usage: push-to-claude.bat "Your commit message here"

echo ================================================
echo Push to Claude Branch Script
echo ================================================
echo.

REM Check if commit message argument is provided
if "%~1"=="" (
    echo ERROR: Commit message is required!
    echo Usage: push-to-claude.bat "Your commit message here"
    echo Example: push-to-claude.bat "Fixed toolbar styling"
    exit /b 1
)

set COMMIT_MSG=%~1
@REM set BRANCH=claude/swf-011CUXJPdZbEdDyjL5FcyUBX
set BRANCH=claude/work-011CUdAtpTaq85ynaSYtS6Rm

echo [1/4] Checking out Claude branch...
git checkout %BRANCH%
if errorlevel 1 (
    echo ERROR: Failed to checkout branch %BRANCH%
    exit /b 1
)
echo.

echo [2/4] Adding all changes...
git add .
if errorlevel 1 (
    echo ERROR: Failed to add changes
    exit /b 1
)
echo.

echo [3/4] Committing with message: "%COMMIT_MSG%"
git commit -m "%COMMIT_MSG%"
if errorlevel 1 (
    echo WARNING: Nothing to commit or commit failed
    echo Checking if there are changes...
    git status
    pause
)
echo.

echo [4/4] Pushing to remote branch...
git push origin %BRANCH%
if errorlevel 1 (
    echo ERROR: Failed to push to remote
    exit /b 1
)
echo.

echo ================================================
echo SUCCESS! Changes pushed to %BRANCH%
echo ================================================
echo.
echo Claude can now pull your changes with:
echo git pull origin %BRANCH%
echo.

pause
