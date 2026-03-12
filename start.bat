@echo off
REM Start script for AI Delivery Delay Prediction System (Windows)

echo.
echo ====================================================
echo   AI Delivery Delay Prediction System
echo   Startup Script
echo ====================================================
echo.

REM Check if virtual environment exists
if not exist "venv" (
    echo [*] Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo [!] Failed to create virtual environment
        echo [!] Make sure Python 3.8+ is installed
        pause
        exit /b 1
    )
)

REM Activate virtual environment
echo [*] Activating virtual environment...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo [!] Failed to activate virtual environment
    pause
    exit /b 1
)

REM Install/Update dependencies
echo [*] Installing dependencies...
pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo [!] Failed to install dependencies
    pause
    exit /b 1
)

REM Check if models exist
if not exist "backend\models" (
    echo [*] Models directory not found. Creating models...
    mkdir backend\models
)

if not exist "backend\models\delay_model.pkl" (
    echo [*] Training ML model (this may take a moment)...
    cd backend
    python model.py
    if errorlevel 1 (
        echo [!] Failed to train model
        cd ..
        pause
        exit /b 1
    )
    cd ..
)

REM Start backend server
echo.
echo [+] Starting Flask backend server...
echo [+] API will be available at: http://localhost:5000
echo.
echo Press CTRL+C to stop the server
echo.

start cmd /k "cd backend && python app.py"

REM Wait a moment for server to start
timeout /t 2 /nobreak

REM Open frontend in browser
echo [+] Opening frontend in browser...
echo [+] Frontend available at: http://localhost:8000
echo.

REM Try to open browser
start "http://localhost:8000"

echo.
echo ====================================================
echo   Starting local frontend server...
echo   Press CTRL+C in the frontend terminal to stop
echo ====================================================
echo.

cd frontend
python -m http.server 8000

pause
