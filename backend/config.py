import os
from dotenv import load_dotenv

# Load environment variables
if os.path.exists(".env.local"):
    load_dotenv(".env.local")
else:
    load_dotenv()

class Settings:
    PROJECT_NAME: str = "AI Electroplating Expert API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # CORS Configurations
    # Allow local development ports, or production domains from environment variables
    CORS_ORIGINS: list = [
        origin.strip().replace('"', '').replace("'", '') for origin in os.getenv(
            "CORS_ORIGINS",
            "https://electroplating-ai-employee.vercel.app,http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001,http://localhost:5173,http://127.0.0.1:5173"
        ).split(",")
    ]
    
    # AI Engine Settings
    # Supports "gemini" or "simulation"
    AI_ENGINE_MODE: str = os.getenv("AI_ENGINE_MODE", "simulation")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

settings = Settings()
