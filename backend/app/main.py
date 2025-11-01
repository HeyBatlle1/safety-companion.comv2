from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.api.v1.jha import router as jha_router, analyze_checklist
from app.schemas.jha import JHAAnalysisRequest
from app.core.deps import get_jha_service
from app.services.jha_service import JHAService

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    description="Safety Companion API - Python Backend with Multi-Agent JHA Analysis",
    version="2.0.0-python"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(jha_router, prefix="/api/v1")

# Legacy compatibility routes for old frontend
app.include_router(jha_router, prefix="/api", tags=["legacy"])

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Safety Companion API",
        "status": "online",
        "version": "2.0.0-python",
        "features": [
            "4-agent JHA analysis pipeline",
            "OSHA-compliant risk assessment",
            "Swiss Cheese incident prediction",
            "Real-time safety alerts"
        ]
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "safety-companion-api",
        "version": "2.0.0-python",
        "agents": {
            "orchestration": "ready",
            "gemini_integration": "ready",
            "database": "ready"
        }
    }

@app.post("/api/jha-update")
async def legacy_jha_update(
    request: JHAAnalysisRequest,
    jha_service: JHAService = Depends(get_jha_service)
):
    """Legacy endpoint for old frontend - redirects to new analyze"""
    return await analyze_checklist(request, jha_service)