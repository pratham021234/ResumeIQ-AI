# ResumeIQ AI — Enterprise ATS Resume Analyzer & AI Hiring Platform

> **Production-grade SaaS platform engineered for job seekers, recruiters, and career coaches. Features deterministic ATS compatibility scoring, categorized missing keyword radars, truth-constrained bullet point optimization, and an automated B2B hiring copilot.**

---

## 🌟 Key Capabilities

### 1. Job Seeker Suite
* **Deterministic ATS Scoring**: Explainable mathematical engine scoring formatting (20%), keywords (25%), skills (25%), experience relevance (15%), quality (10%), and education (5%). Identical inputs produce identical scores.
* **Categorized Keyword Radar**: Detects Critical Missing, Recommended Additions, and Already Found keywords with automated synonym normalization (e.g., *Postgres* = *PostgreSQL*, *JS* = *JavaScript*, *K8s* = *Kubernetes*).
* **Truth-Constrained Bullet Optimizer**: Upgrades passive bullet points to Google XYZ achievement metrics. **Strict Zero-Hallucination Policy**: never fabricates numbers, percentages, or credentials.
* **Resume Tailor & Version Library**: Generates tailored resumes targeted to specific job descriptions; track and manage multiple versions.
* **Cover Letter Generator**: Synthesizes candidate experience with target job descriptions into tailored cover letters with custom tones and length controls.
* **Executive PDF Audit Reports**: Generates professional ReportLab PDF audit summaries.

### 2. Recruiter & Hiring Copilot Suite
* **Recruiter Portal (`/recruiter`)**: Multi-job dashboard, candidate pipeline, and batch resume screening.
* **Bulk Screening Engine**: Process 1 to 100+ resumes simultaneously in PDF and DOCX formats.
* **AI Hiring Copilot (`/copilot`)**: Automated candidate ranking, executive screening summaries, 4-tier candidate ratings, targeted behavioral interview question generation, and talent pool analytics.

### 3. Subscription & Billing Infrastructure
* **Tiered Subscription Plans**: Free (3 analyses/month), Pro (Unlimited analyses & AI tailoring), and Recruiter (Unlimited bulk screening & candidate ranking).
* **Payment Gateways**: Integrated Stripe (International cards) and Razorpay (India UPI, Netbanking, Cards) checkout flows.
* **Usage Enforcement**: Server-side monthly usage metering and feature gating.

---

## 🏗️ Repository Architecture

The project is structured as a clean decoupled monorepo:

```
ResumeIQ AI/
├── backend/                       # FastAPI Backend Service (Python 3.11+)
│   ├── app/
│   │   ├── api/                   # REST Routers (auth, resumes, jobs, analysis, ai, reports, recruiter, billing, copilot)
│   │   ├── core/                  # Centralized Config, SQLAlchemy DB, JWT/Bcrypt Security
│   │   ├── models/                # SQLAlchemy ORM Models (User, Resume, Job, Analysis, Subscription, etc.)
│   │   ├── schemas/               # Pydantic v2 Request/Response Validation Schemas
│   │   ├── parsers/               # PyMuPDF and python-docx Layout & Section Parsers
│   │   ├── scoring/               # Deterministic ATS Scoring & Keyword Extraction Engines
│   │   ├── ai/                    # Gemini LLM Client & Local Truth-Constrained Fallback Engine
│   │   └── services/              # Billing, Copilot, PDF Report Generation & Seeding Services
│   ├── main.py                    # FastAPI Entrypoint with CORS, Lifespan & Auto-Seeding
│   ├── migrate_db.py              # Database Schema Migration Utility
│   ├── requirements.txt           # Python Package Dependencies
│   └── .env.example               # Backend Environment Template
│
├── frontend/                      # Next.js 16 Web Application (App Router, React 19, TypeScript)
│   ├── src/
│   │   ├── app/                   # App Router Pages (dashboard, analyze, tailor, editor, recruiter, copilot, billing, etc.)
│   │   ├── components/            # Reusable UI, Recruiter Modals, Copilot Views, Layouts
│   │   ├── lib/                   # Centralized Type-Safe `env.ts`, API Client, Demo Presets
│   │   └── types/                 # Comprehensive TypeScript Interfaces
│   ├── public/                    # Static Assets, Robots.txt, SVGs
│   ├── package.json               # Node.js Package Dependencies
│   └── .env.example               # Frontend Environment Template
│
├── .env.example                   # Master Root Environment Template
├── .gitignore                     # Comprehensive Git Exclusions (Secrets, Builds, DBs, Uploads)
├── SETUP_ENVIRONMENT.md           # Exhaustive Environment Variable & Key Acquisition Manual
└── README.md                      # Project Documentation
```

---

## 🚀 Quickstart Local Setup

### 1. Prerequisites
* **Python 3.11+**
* **Node.js 18+** (Node 20+ recommended)
* **npm** or **yarn**

---

### 2. Backend Setup (FastAPI)

1. Open a terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # On Windows (PowerShell):
   python -m venv ../.venv
   ..\.venv\Scripts\Activate.ps1

   # On Linux / macOS (Bash):
   python3 -m venv ../.venv
   source ../.venv/bin/activate
   ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   ```bash
   # Copy the backend template:
   cp .env.example .env
   ```
   *Edit `backend/.env` to provide your `GEMINI_API_KEY` (obtain free key from [Google AI Studio](https://aistudio.google.com/app/apikey)) and your `SECRET_KEY`.*

5. Run the FastAPI development server:
   ```bash
   python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```
   * The API server will boot on `http://127.0.0.1:8000`
   * Interactive Swagger Documentation: `http://127.0.0.1:8000/docs`
   * Health Check: `http://127.0.0.1:8000/health`

---

### 3. Frontend Setup (Next.js)

1. Open a second terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   # Copy the frontend template:
   cp .env.example .env.local
   ```
   *The default `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api` connects seamlessly to the local backend.*

4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   * Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Database Management & Migrations

The platform utilizes **SQLAlchemy ORM** with native support for both **SQLite** (local development) and **PostgreSQL** (production on Supabase, Neon, AWS RDS).

### Automatic Table Creation & Seeding
* On startup, `main.py` automatically initializes all database schema tables via `Base.metadata.create_all(bind=engine)`.
* Initial seed data (default test users, baseline candidate resumes, sample job descriptions) is safely provisioned if the database is unseeded.

### Manual Schema Migration Utility
If schema modifications or new columns are added to `models.py`:
```bash
cd backend
python migrate_db.py
```
This utility:
1. Inspects active database tables.
2. Checks for missing columns across users, subscriptions, candidate evaluations, and analyses.
3. Automatically applies non-destructive `ALTER TABLE` statements.

---

## 🧪 Testing & Quality Assurance

The codebase includes comprehensive automated test suites covering scoring determinism, authentication, cascade safety, and live APIs.

### 1. Comprehensive Backend Test Suite (40 Tests)
```bash
cd backend
python audit_backend_comprehensive.py
```
* **Coverage**: Database CRUD, Model integrity, Bcrypt password bounds, JWT token expiry, Resume parser extraction, ATS scoring determinism (5 repeated runs with 0.00 variance), Keyword synonym matcher, Billing quotas, Cascade deletions, ReportLab PDF generation, AI Hiring Copilot candidate evaluation engine.

### 2. Environment Management Verification Suite (5 Tests)
```bash
cd backend
python test_env_management.py
```
* **Coverage**: Configuration loading, missing `GEMINI_API_KEY` interception, missing `DATABASE_URL` interception, production security checks (rejection of default development keys), and CORS origin parsing.

### 3. Live API Endpoint Verification (16 Tests)
*Ensure the backend server is running on `127.0.0.1:8000` before executing:*
```bash
cd backend
python audit_api_live.py
```
* **Coverage**: Health check, Demo login, JWT verification, RBAC 401 unauthenticated enforcement, Resume listing, Job listing, AI bullet rewriting, Billing overview, Recruiter endpoints, Copilot candidate analytics.

### 4. Frontend Route & Rendering Audit (15 Routes)
*Ensure the frontend server is running on `localhost:3000` before executing:*
```bash
cd frontend
node audit_frontend_pages.js
```
* **Coverage**: Verifies all 15 App Router pages (`/`, `/login`, `/signup`, `/dashboard`, `/analyze`, `/resumes`, `/tailor`, `/editor`, `/cover-letter`, `/reports`, `/billing`, `/pricing`, `/settings`, `/recruiter`, `/copilot`) respond with HTTP 200 and valid rendered HTML.

---

## 📦 Production Build

### Frontend Production Build
```bash
cd frontend
npm run build
npm run start
```
* Generates optimized production bundles via Next.js Turbopack, validates TypeScript types, pre-renders static pages, and produces dynamic `sitemap.xml` and `robots.txt`.

### Backend Production Server
Run uvicorn with multi-worker concurrency:
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## ☁️ Cloud Deployment Guide

### 1. Frontend Deployment (Vercel)
1. Push your repository to GitHub.
2. Connect your repository on [Vercel](https://vercel.com).
3. Set **Root Directory** to `frontend`.
4. Configure Environment Variables:
   * `NEXT_PUBLIC_API_URL`: `https://api.yourdomain.com/api`
   * `NEXT_PUBLIC_SITE_URL`: `https://yourdomain.com`
   * `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: `pk_live_...`
   * `NEXT_PUBLIC_RAZORPAY_KEY_ID`: `rzp_live_...`
   * `NEXTAUTH_SECRET`: `[Generated 32-byte secret]`

### 2. Backend Deployment (Railway / Render / Docker)
1. Deploy from the `backend/` directory.
2. Set Build Command: `pip install -r requirements.txt`
3. Set Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT --workers 4`
4. Configure Environment Variables:
   * `ENVIRONMENT`: `production`
   * `DATABASE_URL`: `postgresql://postgres:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true`
   * `SECRET_KEY`: `[Generated 256-bit secret]`
   * `GEMINI_API_KEY`: `[Your Google AI Studio API Key]`
   * `FRONTEND_URL`: `https://yourdomain.com`
   * `CORS_ORIGINS`: `https://yourdomain.com,https://www.yourdomain.com`
   * `STRIPE_SECRET_KEY`: `sk_live_...`
   * `STRIPE_WEBHOOK_SECRET`: `whsec_...`
   * `RAZORPAY_KEY_ID`: `rzp_live_...`
   * `RAZORPAY_KEY_SECRET`: `[Your Razorpay Secret]`

### 3. Managed Database (Supabase PostgreSQL)
1. Create a PostgreSQL project on [Supabase](https://supabase.com).
2. Copy the connection string URI under **Project Settings -> Database -> Connection String (Pooler: Port 6543)**.
3. Assign this string to `DATABASE_URL` in your backend environment.
4. Schema tables will auto-generate upon first server boot.

---

## 🔒 Security & Environment Guardrails

* **Zero Hardcoded Secrets**: All credentials and tokens are read dynamically through environment variables.
* **Fail-Fast Startup Validation**: The backend halts boot immediately if required variables (`GEMINI_API_KEY`, `DATABASE_URL`, `SECRET_KEY`) are unconfigured.
* **Production Guardrails**: In `production` mode, the backend automatically rejects default development secrets and warns if SQLite is used instead of PostgreSQL.
* **Git Safety**: All `.env`, `.env.local`, `.db`, `.pyc`, and uploaded files are excluded via `.gitignore`.
* **Full Setup Manual**: Refer to [`SETUP_ENVIRONMENT.md`](file:///d:/ResumeIQ%20AI/SETUP_ENVIRONMENT.md) for detailed key acquisition and free-tier options.

---

## 📄 License
MIT License. © 2026 ResumeIQ AI. All rights reserved.
