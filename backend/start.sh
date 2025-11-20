#!/bin/bash
# Railway startup script - ultra simple version

echo "=== Railway Ultra-Simple Startup ==="
echo "Directory: $(pwd)"
echo "Files: $(ls -la)"
echo "PORT: ${PORT:-8000}"
echo "ENVIRONMENT: ${ENVIRONMENT:-unknown}"

# Instalar solo lo mínimo necesario
pip install fastapi uvicorn

echo "=== Testing simple startup ==="

# Primero intentar con main_simple.py (nuestra versión ultra-simple)
if [ -f "main_simple.py" ]; then
    echo "✓ Using main_simple.py (ultra-simple version)"
    exec python -m uvicorn main_simple:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1 --log-level info
elif [ -f "main.py" ]; then
    echo "✓ Using main.py (original)"
    exec python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1 --log-level info
else
    echo "✗ No main files found, using backup app"
    exec python -m uvicorn app:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1 --log-level info
fi