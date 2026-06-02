@echo off
setlocal
cd /d "%~dp0"
set "PORT=49322"

where python >nul 2>nul
if %errorlevel%==0 (
  start "" "http://127.0.0.1:%PORT%/"
  python -m http.server %PORT% --bind 127.0.0.1
  exit /b
)

where py >nul 2>nul
if %errorlevel%==0 (
  start "" "http://127.0.0.1:%PORT%/"
  py -m http.server %PORT% --bind 127.0.0.1
  exit /b
)

echo Nie znaleziono Pythona.
echo Zainstaluj Python albo wrzuc folder gry na Netlify, GitHub Pages lub itch.io.
pause
