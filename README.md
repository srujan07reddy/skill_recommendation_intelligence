# Student Skill Intelligence Platform (SSIP)

A web-based institutional decision-support system designed to collect, normalize, evaluate, and interpret student skill competencies across academic departments at Jeppiaar University.

## Core Architectural Characteristics

- **Stateless & Ephemeral Processing:** Student skill submissions, raw uploaded datasets, and cohort analytical records are strictly processed in ephemeral memory with an active Time-To-Live (TTL). No student skill assessment records are permanently stored.
- **Institutional & Cohort Scope:** Focuses on departmental competency distributions, curriculum gap detection, and institutional skill development initiatives (workshops, bootcamps, certification prep, practical training).
- **Three-Level Proficiency Model:** Classifies competencies strictly into **Beginner**, **Intermediate**, and **Expert**.
- **Jeppiaar Academic Structure Baseline:** Pre-configured for Jeppiaar University's five academic schools (`SCH-SET`, `SCH-SSAHS`, `SCH-SAHM`, `SCH-AVI`, `SCH-SPESS`) and their constituent programmes.

## Project Structure

```
.
├── backend/                  # FastAPI Python backend modular monolith
│   ├── app/
│   │   ├── api/              # REST API v1 routers and endpoints
│   │   ├── core/             # Configuration, security, exceptions, logging
│   │   ├── modules/          # Business domain modules (auth, session, ingest, analytics, recs)
│   │   ├── storage/          # Storage abstractions (persistent DB, ephemeral Redis)
│   │   └── schemas/          # Pydantic request/response models
│   ├── tests/                # Unit and integration test suites
│   ├── requirements.txt      # Python dependencies
│   └── Dockerfile
├── frontend/                 # React 18 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── api/              # Axios API client & typed endpoint services
│   │   ├── components/       # UI components & Recharts visualization
│   │   ├── features/         # Feature modules (auth, upload, dashboards, exports)
│   │   └── pages/            # Page layouts per Page Specifications
│   ├── package.json
│   └── Dockerfile
├── docs/                     # Additional guides and runbooks
├── ARCHITECTURAL_DECISIONS_REGISTER.md  # Active decisions and provisional assumptions
├── docker-compose.yml        # Local PostgreSQL 16 & Redis 7 services
└── README.md
```

## Quick Start (Development)

### Prerequisites
- Python 3.12+ (or 3.14+)
- Node.js v20+ / pnpm
- Docker & Docker Compose (optional for local containerized Postgres & Redis)

### 1. Backend Setup
```powershell
cd backend
python -m venv .venv
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
Open API documentation at: `http://localhost:8000/docs`

### 2. Frontend Setup
```bash
cd frontend
pnpm install
pnpm run dev
```
Open web application at: `http://localhost:5173`

## Documentation Baseline
All architectural specifications, data dictionaries, page specifications, and API documentation are maintained in the root directory markdown files.
