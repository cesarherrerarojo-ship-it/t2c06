# Backup app for Railway deployment
from fastapi import FastAPI
import os

app = FastAPI(title="TuCitaSegura Backup")

@app.get("/")
async def root():
    return {
        "message": "TuCitaSegura Backend - Backup Mode",
        "status": "running",
        "environment": os.getenv("ENVIRONMENT", "unknown"),
        "firebase_project": os.getenv("FIREBASE_PROJECT_ID", "not_set")
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}