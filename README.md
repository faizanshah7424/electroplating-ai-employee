# ELECTROPLATE.AI — Industrial Electroplating Console

ELECTROPLATE.AI is a production-grade, enterprise SaaS AI Employee system designed for motorcycle electroplating factories. It integrates electrochemistry calculations, automated visual defect scanning, and an interactive conversational Senior Electroplating Engineer.

---

## 🏗️ Architecture Design

The project has been fully audited and refactored into a Clean Service-Oriented Architecture (SoA) for maximum performance, type safety, and maintainability.

### ⚙️ Backend (FastAPI)
The backend enforces Pydantic input/output schemas and separates business domains into distinct layers:
*   `backend/main.py`: Application startup and CORS orchestration.
*   `backend/config.py`: Environment configuration and engine toggles (Supports Gemini API or simulated offline expert-system).
*   `backend/api/`: REST routing split into `/chat`, `/analyze` (Faraday calculation/diagnostics), and `/detect` (image defect classification).
*   `backend/schemas/`: Data validation boundaries via Pydantic.
*   `backend/services/`: Pure business logic containing:
    *   `calculator.py`: Faraday's Law math for Bright Nickel, Semi-Bright Nickel, and Chrome Plating.
    *   `diagnosis.py`: Industrial diagnostic rules and mitigation steps.
    *   `vision.py`: Image pixel scanning analysis.
*   `backend/agent/`: Conversational AI agent simulating a 30-year veteran plating engineer.

### 🖥️ Frontend (Next.js)
Reorganized as a high-fidelity control-room console:
*   `app/page.tsx`: Unified tabbed cockpit dashboard with navigation.
*   `components/dashboard/`: Telemetry views, active line status trackers, and preset managers.
*   `components/calculator/`: Electroplating planner with custom sliders and safety warnings.
*   `components/scanner/`: Image dropzone featuring animated laser-sweep sweepers, status telemetry, and mitigation playbooks.
*   `components/chat/`: Expert engineer dialogue drawer parsing custom markdown and chemical formulas.
*   `services/`: Frontend API wrappers.
*   `hooks/`: Custom state managers (like `useChat`).

---

## ⚡ Getting Started

### 1. Start the FastAPI Backend
Ensure Python 3 is installed. Set up your environment and launch the Uvicorn server:

```bash
# Navigate to project root, then run:
pip install fastapi uvicorn pillow pydantic

# Option: Set your Gemini API key (defaults to simulation mode if omitted)
# Windows PowerShell:
$env:GEMINI_API_KEY="your-api-key"
$env:AI_ENGINE_MODE="gemini"

# Run Uvicorn
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

Verify the backend is running by opening `http://127.0.0.1:8000/` in your browser.

### 2. Start the Next.js Frontend
In a separate terminal, install node dependencies and launch the Turbopack development server:

```bash
# Install node dependencies
npm install

# Run the Next dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the console.

---

## 🧪 Faraday Plating Physics Formula

The plating planner calculates required plating time ($t$) and deposited weight ($m$) according to Faraday's Law of Electrolysis:

$$m = \frac{I \times t \times M}{z \times F} \times \eta$$

Where:
*   $I$ = Rectifier current (Amps) = Area ($dm^2$) $\times$ Current Density ($A/dm^2$).
*   $M$ = Metal molecular weight (e.g., Nickel = $58.69$ g/mol).
*   $z$ = Metal valency (e.g., Chrome = $6$, Nickel = $2$).
*   $F$ = Faraday's Constant ($96485$ C/mol).
*   $\eta$ = Cathode current efficiency (Bright Nickel $\approx 95\%$, Hexavalent Chrome $\approx 15\%$).
"# electroplating-ai-employee" 
