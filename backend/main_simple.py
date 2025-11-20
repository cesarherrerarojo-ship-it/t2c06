# Ultra-simple FastAPI app for Railway debugging
from fastapi import FastAPI
from fastapi.responses import JSONResponse
import os

app = FastAPI(title="TuCitaSegura Debug")

@app.get("/")
async def root():
    return JSONResponse({
        "message": "TuCitaSegura Backend - Debug Mode",
        "status": "running",
        "port": os.getenv("PORT", "8000"),
        "env": os.getenv("ENVIRONMENT", "unknown")
    })

@app.get("/health")
async def health():
    return JSONResponse({"status": "healthy", "timestamp": "2025-11-20"})

@app.get("/debug")
async def debug():
    return JSONResponse({
        "env_vars": dict(os.environ),
        "cwd": os.getcwd(),
        "files": os.listdir(".") if os.path.exists(".") else "no files"
    })

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)