#!/bin/bash
set -e

echo "Starting TuCitaSegura FastAPI application..."
echo "Current directory: $(pwd)"
echo "Contents of current directory:"
ls -la

echo "Starting uvicorn server..."
exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 4