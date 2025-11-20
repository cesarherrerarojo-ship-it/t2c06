#!/bin/bash
set -e

echo "=== Starting TuCitaSegura FastAPI application ==="
echo "Current directory: $(pwd)"
echo "Python version: $(python --version)"
echo "Python path: $(which python)"

echo "=== Checking for main.py ==="
if [ -f "main.py" ]; then
    echo "✓ main.py found"
    echo "Contents of main.py:"
    head -10 main.py
else
    echo "✗ main.py NOT found"
    echo "Contents of current directory:"
    ls -la
fi

echo "=== Checking Python packages ==="
pip list | grep -E "(fastapi|uvicorn)" || echo "FastAPI/Uvicorn not found"

echo "=== Installing requirements ==="
pip install -r requirements.txt

echo "=== Starting uvicorn server ==="
exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 4