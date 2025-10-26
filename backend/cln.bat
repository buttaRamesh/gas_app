 

:: Remove __pycache__ directories (use with caution)
for /d /r . %%d in (__pycache__) do @if exist "%%d" rd /s /q "%%d"

:: Remove .pyc files
del /s /q *.pyc

:: Remove db.sqlite3
if exist "db.sqlite3" del db.sqlite3

echo ✅ Cleanup complete!