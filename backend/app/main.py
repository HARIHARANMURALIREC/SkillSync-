from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.database import engine, Base
from app.routers import auth, assessment, dashboard, learning_path, profile, chat
from app.ai.ollama_client import ollama_status, warm_model
import traceback
import threading

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SkillSync API",
    description="AI-Powered Personalized Learning Path Generator",
    version="1.0.0"
)

# CORS middleware - MUST be added before other middleware
# Allow all origins for development (mobile apps)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for mobile development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Exception handler for unhandled exceptions (not HTTPExceptions)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle all unhandled exceptions and ensure CORS headers are included."""
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
        )
    print(f"Unhandled error: {str(exc)}")
    print(traceback.format_exc())
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": f"Internal server error: {str(exc)}"},
    )

# Include routers
app.include_router(auth.router)
app.include_router(assessment.router)
app.include_router(dashboard.router)
app.include_router(learning_path.router)
app.include_router(profile.router)
app.include_router(chat.router)


@app.on_event("startup")
def _warm_ollama():
    threading.Thread(target=warm_model, daemon=True).start()

@app.get("/")
def root():
    return {"message": "SkillSync API", "version": "1.0.0"}

@app.get("/api/health")
def health_check():
    ollama = ollama_status()
    return {
        "status": "healthy" if ollama["reachable"] else "degraded",
        "ollama": ollama["reachable"],
        "model": ollama["model"],
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

