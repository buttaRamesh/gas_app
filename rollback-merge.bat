@echo off
REM ========================================
REM Rollback Last Merge on Main
REM DANGER: This will undo the last merge!
REM ========================================
echo.
echo ========================================
echo  WARNING: ROLLBACK OPERATION
echo ========================================
echo.
echo This will UNDO the last merge on main branch!
echo.
echo Current branch status:
git log --oneline -3
echo.

set /p CONFIRM="Are you ABSOLUTELY SURE you want to rollback? (type YES): "
if not "%CONFIRM%"=="YES" (
    echo Rollback cancelled.
    pause
    exit /b 0
)

echo.
echo Checking out main branch...
git checkout main
if errorlevel 1 (
    echo ERROR: Failed to checkout main
    pause
    exit /b 1
)

echo.
echo Rolling back last merge...
git reset --hard HEAD~1
if errorlevel 1 (
    echo ERROR: Failed to rollback
    pause
    exit /b 1
)

echo.
echo Rollback complete! Current status:
git log --oneline -3
echo.

set /p PUSH="Do you want to FORCE PUSH to remote? (type YES): "
if "%PUSH%"=="YES" (
    echo Force pushing to remote main...
    git push origin main --force
    if errorlevel 1 (
        echo ERROR: Failed to force push
        pause
        exit /b 1
    )
    echo Successfully force pushed to remote main
) else (
    echo Rollback done locally only. Remote not updated.
)

echo.
pause
