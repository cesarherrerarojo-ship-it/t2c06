#!/bin/bash
# Railway startup script with fallback

echo "=== Railway Startup Debug ==="
echo "Directory: $(pwd)"
echo "Files: $(ls -la)"
echo "PORT: ${PORT:-8000}"

# Instalar dependencias básicas
pip install fastapi uvicorn python-multipart pydantic

echo "=== Testing main.py import ==="
if python -c "import main" 2>/dev/null; then
    echo "✓ main.py can be imported"
    START_CMD="uvicorn main:app"
else
    echo "✗ main.py import failed, using backup app"
    START_CMD="uvicorn app:app"
fi

echo "=== Starting server with: $START_CMD ==="
exec $START_CMD --host 0.0.0.0 --port ${PORT:-8000} --workers 1 --log-level debug