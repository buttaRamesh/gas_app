@echo off

echo --- STEP 1: Cleaning local Django migration files ---
for /d /r . %%d in (migrations) do (
    if exist "%%d" (
        for %%f in ("%%d\*.py") do (
            if /i not "%%~nxf"=="__init__.py" (
                del "%%f"
            )
        )
        del /q "%%d\*.pyc" 2>nul
    )
)
echo Migration files cleaned.
echo.

echo --- STEP 2: Deleting SQLite database file ---
if exist db.sqlite3 del db.sqlite3
echo db.sqlite3 deleted.
echo.

echo --- STEP 3: Creating new migrations ---
python manage.py makemigrations
echo.

echo --- STEP 4: Applying new migrations ---
python manage.py migrate
echo.

echo --- Project Reset with SQLite Complete ---
pause