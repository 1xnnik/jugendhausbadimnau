@echo off
cd /d "%~dp0"
echo Website wird unter http://localhost:8000 gestartet.
echo Dieses Fenster offen lassen, solange die Website verwendet wird.
start "" "http://localhost:8000/index.html"
where py >nul 2>nul
if %errorlevel%==0 (
  py -m http.server 8000
) else (
  python -m http.server 8000
)
pause
