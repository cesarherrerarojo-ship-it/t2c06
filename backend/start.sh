#!/bin/bash
# Start script for Railway

echo "Starting TuCitaSegura Backend..."
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 4