# 🚀 Production Deployment Guide

This guide outlines the production deployment instructions for the **ELECTROPLATE.AI** system, deploying the **Next.js Frontend** to Vercel and the **FastAPI Backend** to Railway.

---

## 🖥️ Frontend Deployment (Vercel)

The Next.js frontend is configured to build as an optimized static and SSR application ready for deployment on Vercel.

### 📦 Vercel Deployment Steps

1.  **Install Vercel CLI** (optional):
    ```bash
    npm install -g vercel
    ```
2.  **Deploy via CLI** or import directly into your Vercel Dashboard via GitHub.
3.  **Environment Variables Configuration**:
    Configure the following variable in the Vercel project settings:
    *   `NEXT_PUBLIC_API_URL`: The production URL of your FastAPI backend (e.g. `https://electroplating-api.up.railway.app`).
4.  **Build Settings**:
    *   **Framework Preset:** Next.js
    *   **Build Command:** `npm run build`
    *   **Output Directory:** `.next`

---

## ⚙️ Backend Deployment (Railway)

The backend is built as a modular FastAPI python application. It is fully production-configured and container-ready.

### 📦 Railway Deployment Steps

1.  **Initialize Project**:
    Login to [Railway.app](https://railway.app) and create a new project.
2.  **Connect GitHub Repository**:
    Link your GitHub repository containing the codebase.
3.  **Environment Variables Configuration**:
    Configure the following environment variables in the Railway dashboard:
    *   `AI_ENGINE_MODE`: `gemini` (Enables the production-grade Gemini LLM integration).
    *   `GEMINI_API_KEY`: Your Google AI Studio API key.
    *   `CORS_ORIGINS`: The domain of your frontend deployment (e.g. `https://electroplating-ai.vercel.app,http://localhost:3000`).
4.  **Build Settings**:
    Railway will automatically detect Python and start the container.
    *   **Build Command:** `uv pip install -r requirements.txt` (or Railway will auto-install from the `requirements.txt` or `pyproject.toml` configuration).
    *   **Start Command:** `python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

---

## 🧬 Production Configurations

### 1. Requirements file (`requirements.txt`)
We have compiled the python environment dependencies to a production-safe format:
```text
fastapi>=0.115.0
uvicorn>=0.30.0
pillow>=10.4.0
pydantic>=2.8.0
httpx>=0.27.0
python-multipart>=0.0.9
google-generativeai>=0.8.0
python-dotenv>=1.0.1
```

### 2. Next.js configurations (`next.config.ts`)
The webpack bundler configurations are set to ignore source-map overhead in production environments to minimize script chunks.
