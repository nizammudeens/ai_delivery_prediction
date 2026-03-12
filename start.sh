#!/bin/bash

# Start script for AI Delivery Delay Prediction System (macOS/Linux)

echo ""
echo "===================================================="
echo "  AI Delivery Delay Prediction System"
echo "  Startup Script"
echo "===================================================="
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "[*] Creating virtual environment..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "[!] Failed to create virtual environment"
        echo "[!] Make sure Python 3.8+ is installed"
        exit 1
    fi
fi

# Activate virtual environment
echo "[*] Activating virtual environment..."
source venv/bin/activate
if [ $? -ne 0 ]; then
    echo "[!] Failed to activate virtual environment"
    exit 1
fi

# Install/Update dependencies
echo "[*] Installing dependencies..."
pip install -r requirements.txt -q
if [ $? -ne 0 ]; then
    echo "[!] Failed to install dependencies"
    exit 1
fi

# Check if models exist
if [ ! -d "backend/models" ]; then
    echo "[*] Models directory not found. Creating models..."
    mkdir -p backend/models
fi

if [ ! -f "backend/models/delay_model.pkl" ]; then
    echo "[*] Training ML model (this may take a moment)..."
    cd backend
    python model.py
    if [ $? -ne 0 ]; then
        echo "[!] Failed to train model"
        cd ..
        exit 1
    fi
    cd ..
fi

echo ""
echo "[+] Starting Flask backend server..."
echo "[+] API will be available at: http://localhost:5000"
echo ""
echo "Press CTRL+C to stop the server"
echo ""

# Start backend server in background
cd backend
python app.py &
BACKEND_PID=$!
cd ..

# Wait a moment for server to start
sleep 2

# Open frontend in browser
echo "[+] Opening frontend in browser..."
echo "[+] Frontend available at: http://localhost:8000"
echo ""

# Try to open browser (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "http://localhost:8000" 2>/dev/null
fi

echo ""
echo "===================================================="
echo "   Starting local frontend server..."
echo "   Press CTRL+C in the frontend terminal to stop"
echo "===================================================="
echo ""

cd frontend
python3 -m http.server 8000

# Cleanup on exit
trap "kill $BACKEND_PID" EXIT
