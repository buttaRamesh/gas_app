@echo off
echo --- Cleaning Django migration files ---

REM Find all "migrations" folders and delete their contents, except for __init__.py
for /d /r . %%d in (migrations) do (
    if exist "%%d" (
        echo Cleaning migration files in %%d
        for %%f in ("%%d\*.py") do (
            if /i not "%%~nxf"=="__init__.py" (
                del "%%f"
            )
        )
        del /q "%%d\*.pyc" 2>nul
    )
)

echo.
echo --- Cleaning temporary Python files ---

REM Find and delete all __pycache__ directories
for /d /r . %%d in (__pycache__) do (
    if exist "%%d" (
        echo Deleting directory %%d
        rmdir /s /q "%%d"
    )
)

echo.
echo --- Cleanup complete ---
echo.
echo NOTE: You must now manually reset your MySQL database.