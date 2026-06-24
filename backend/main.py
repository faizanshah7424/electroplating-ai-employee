from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.utils.logging import setup_logging, get_logger
from backend.api.process import router as process_router
from backend.api.vision import router as vision_router
from backend.api.chat import router as chat_router
from backend.api.bath_analysis import router as bath_analysis_router

# 1. Initialize System Logging
setup_logging()
logger = get_logger("electroplating.main")

# 2. Create FastAPI Instance
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production-grade AI Employee for Motorcycle Electroplating Operations"
)

# 3. Setup CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Include Routers
# Mounting directly to ensure 100% backward compatibility with path endpoints
app.include_router(process_router)
app.include_router(vision_router)
app.include_router(chat_router)
app.include_router(bath_analysis_router)

# 5. Root Operational Endpoint
@app.get("/")
def home():
    logger.info("Health check endpoint pinged.")
    return {
        "message": "AI Electroplating Expert API is operational 🚀",
        "version": settings.VERSION,
        "engine_mode": settings.AI_ENGINE_MODE
    }