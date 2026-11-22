@echo off
setlocal
cd /d "%~dp0"

if not exist ".venv\Scripts\python.exe" (
    echo Creating Python virtual environment...
    py -m venv .venv
    if errorlevel 1 goto failed
)

call ".venv\Scripts\activate.bat"
if errorlevel 1 goto failed

echo Installing or checking Python packages...
python -m pip install -r requirements.txt
if errorlevel 1 goto failed

echo.
echo NGOConnect matching API is starting...
echo Keep this window open while you use the website.
echo Health check: http://127.0.0.1:5000/api/health
python app.py
goto end

:failed
echo.
echo Setup failed. Check Python installation and requirements.txt.
pause
:end
endlocal
