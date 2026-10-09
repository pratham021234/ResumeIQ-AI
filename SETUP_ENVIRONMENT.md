# ResumeIQ AI — Environment Variables & Cloud Infrastructure Guide

Welcome to the **ResumeIQ AI** comprehensive environment configuration and DevOps manual. This guide documents the environment architecture, templates created, variable loading mechanics, local setup, and production deployment across Vercel, Railway, Render, Supabase, Stripe, Razorpay, and Google AI Studio.

---

## Table of Contents

1. [Environment Architecture & Templates Created](#1-environment-architecture--templates-created)
2. [Which Application Loads Each File](#2-which-application-loads-each-file)
3. [Required vs. Optional Variables](#3-required-vs-optional-variables)
4. [Integrations Not Yet Implemented](#4-integrations-not-yet-implemented)
5. [Quickstart: How to Copy and Setup Local Environment](#5-quickstart-how-to-copy-and-setup-local-environment)
6. [Obtaining API Keys and Credentials](#6-obtaining-api-keys-and-credentials)
7. [Production Deployment Setup](#7-production-deployment-setup)
   - [Vercel (Frontend)](#71-frontend-deployment-vercel)
   - [Railway / Render / Docker (Backend)](#72-backend-deployment-railway--render--docker)
   - [Supabase (Database & Storage)](#73-database-provisioning-supabase--managed-postgresql)
8. [Verifying Configuration Without Exposing Secrets](#8-verifying-configuration-without-exposing-secrets)
9. [Security and Git Safety Best Practices](#9-security-and-git-safety-best-practices)

---

## 1. Environment Architecture & Templates Created

The repository uses three designated environment template files matching the actual application architecture:

| Template File | Exact Relative Path | Purpose & Target Service |
| :--- | :--- | :--- |
| **Backend Template** | [`backend/.env.example`](file:///d:/ResumeIQ%20AI/backend/.env.example) | FastAPI backend service (Python). Contains database URIs, JWT secrets, Gemini AI keys, Stripe/Razorpay private keys, SMTP, and storage configs. |
| **Frontend Template**| [`frontend/.env.example`](file:///d:/ResumeIQ%20AI/frontend/.env.example) | Next.js web application (TypeScript/React). Contains `NEXT_PUBLIC_` client variables, public payment IDs, and client analytics tokens. |
| **Master Root Template**| [`.env.example`](file:///d:/ResumeIQ%20AI/.env.example) | Monorepo unified template covering both frontend and backend for root development or Docker orchestration. |

> [!IMPORTANT]
> All templates use safe placeholders (e.g. `replace_with_your_api_key`) and NEVER contain real credentials, usable tokens, or passwords.

---

## 2. Which Application Loads Each File

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ResumeIQ AI Architecture                        │
├───────────────────────────────────┬────────────────────────────────────┤
│  Frontend Application (Next.js)   │  Backend Application (FastAPI)     │
│  Directory: frontend/             │  Directory: backend/               │
│                                   │                                    │
│  Loads:                           │  Loads:                            │
│  1. frontend/.env.local (Highest) │  1. backend/.env                   │
│  2. frontend/.env                 │  2. .env (Repository root)         │
│                                   │  3. System Environment Variables   │
│  Validated by:                    │                                    │
│  frontend/src/lib/env.ts          │  Validated by:                     │
│  (@/lib/env)                      │  backend/app/core/config.py        │
└───────────────────────────────────┴────────────────────────────────────┘
```

1. **FastAPI Backend (`backend/app/core/config.py`)**:
   Uses `python-dotenv` to automatically load from:
   - `backend/.env` (primary backend file)
   - `.env` (repository root fallback)
   - `.env.local`
   Variables are parsed into a type-safe Pydantic v2 `Settings` model.
2. **Next.js Frontend (`frontend/src/lib/env.ts`)**:
   Next.js natively loads:
   - `frontend/.env.local` (local overrides)
   - `frontend/.env`
   Client components can only access variables prefixed with `NEXT_PUBLIC_`. The centralized module `@/lib/env` validates variables and prevents leakage of server secrets.

---

## 3. Required vs. Optional Variables

### 3.1 Backend Variables (`backend/.env.example`)

| Variable Name | Status | Default / Local Value | Production Example / Notes |
| :--- | :--- | :--- | :--- |
| `PROJECT_NAME` | **OPTIONAL** | `ResumeIQ AI — AI-Powered ATS Resume Analyzer` | SaaS platform title |
| `ENVIRONMENT` | **REQUIRED** | `development` | `production` |
| `HOST` | **OPTIONAL** | `127.0.0.1` | `0.0.0.0` (Container / cloud binding) |
| `PORT` | **OPTIONAL** | `8000` | Injected by platform ($PORT) |
| `FRONTEND_URL` | **REQUIRED** | `http://localhost:3000` | `https://yourdomain.com` (CORS origin) |
| `CORS_ORIGINS` | **OPTIONAL** | `http://localhost:3000,http://127.0.0.1:3000` | Comma-separated production domains |
| `DATABASE_URL` | **REQUIRED** | `sqlite:///./resumeiq.db` | PostgreSQL URI (Supabase/Neon) |
| `DB_POOL_SIZE` | **OPTIONAL** | `5` | `10`–`20` connections |
| `DB_MAX_OVERFLOW`| **OPTIONAL** | `10` | `20` overflow connections |
| `DB_ECHO` | **OPTIONAL** | `false` | `false` |
| `SECRET_KEY` | **REQUIRED** | Random dev string | 256-bit cryptographically secure key |
| `JWT_SECRET` | **OPTIONAL** | Defaults to `SECRET_KEY` | 256-bit key |
| `ALGORITHM` | **OPTIONAL** | `HS256` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | **OPTIONAL** | `1440` (24 hours) | `1440` |
| `GEMINI_API_KEY` | **REQUIRED** | Required key | Google AI Studio key (`AIzaSy...`) |
| `GEMINI_MODEL` | **OPTIONAL** | `gemini-1.5-flash` | `gemini-1.5-flash` / `gemini-2.0-flash`|
| `ENABLE_RECRUITER_DASHBOARD` | **OPTIONAL** | `true` | `true` |
| `LOG_LEVEL` | **OPTIONAL** | `INFO` | `INFO` or `WARNING` |
| `UPLOAD_DIR` | **OPTIONAL** | `./uploads` | Persistent volume mount |
| `STORAGE_TYPE` | **OPTIONAL** | `local` | `local` or `supabase` |
| `MAX_FILE_SIZE_MB`| **OPTIONAL**| `10` | `10` (strict validation) |
| `STRIPE_SECRET_KEY`| **OPTIONAL in dev** | Mock key | Required if Stripe payments enabled |
| `STRIPE_PUBLISHABLE_KEY`| **OPTIONAL in dev** | Mock key | Required if Stripe payments enabled |
| `STRIPE_WEBHOOK_SECRET` | **OPTIONAL in dev** | Mock secret | Required for Stripe webhooks |
| `RAZORPAY_KEY_ID` | **OPTIONAL in dev** | Mock key | Required if Razorpay enabled |
| `RAZORPAY_KEY_SECRET` | **OPTIONAL in dev** | Mock secret | Required if Razorpay enabled |
| `RAZORPAY_WEBHOOK_SECRET`| **OPTIONAL in dev** | Mock secret | Required for Razorpay webhooks |
| `SUPABASE_URL` | **OPTIONAL** | Unset | Project URL (`https://xyz.supabase.co`)|
| `SUPABASE_ANON_KEY` | **OPTIONAL** | Unset | Client anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | **OPTIONAL** | Unset | Server admin key (bypasses RLS) |
| `SUPABASE_BUCKET_NAME` | **OPTIONAL** | `resumes` | Storage bucket name |
| `POSTHOG_API_KEY` | **OPTIONAL** | Unset | PostHog project API key |
| `POSTHOG_HOST` | **OPTIONAL** | `https://us.i.posthog.com` | PostHog ingestion endpoint |
| `GA_MEASUREMENT_ID` | **OPTIONAL** | Unset | Google Analytics ID (`G-XXXXXXXXXX`) |
| `SENTRY_DSN` | **OPTIONAL** | Unset | Backend Sentry DSN |
| `SENTRY_ENVIRONMENT` | **OPTIONAL** | `development` | `production` |
| `SENTRY_TRACES_SAMPLE_RATE`| **OPTIONAL**| `0.1` | `0.1` (10% sampling) |
| `SMTP_HOST` | **OPTIONAL** | Unset | `smtp.resend.com` or `smtp.sendgrid.net`|
| `SMTP_PORT` | **OPTIONAL** | `587` | `587` (TLS) or `465` (SSL) |
| `SMTP_USER` | **OPTIONAL** | Unset | SMTP username / `resend` |
| `SMTP_PASSWORD` | **OPTIONAL** | Unset | SMTP API token |
| `RESEND_API_KEY`| **OPTIONAL** | Unset | Direct Resend token |
| `EMAIL_FROM` | **OPTIONAL** | `ResumeIQ AI <noreply@resumeiq.ai>` | Verified sender address |
| `ENCRYPTION_KEY`| **OPTIONAL** | Unset | 32-byte Base64 AES-256 key |
| `GOOGLE_CLIENT_ID`| **OPTIONAL** | Unset | Google OAuth client ID (Planned) |
| `GOOGLE_CLIENT_SECRET`| **OPTIONAL** | Unset | Google OAuth client secret (Planned) |

### 3.2 Frontend Variables (`frontend/.env.example`)

| Variable Name | Status | Default / Local Value | Production Example |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | **REQUIRED** | `http://127.0.0.1:8000/api` | `https://api.yourdomain.com/api` |
| `NEXT_PUBLIC_SITE_URL`| **REQUIRED in Prod** | `http://localhost:3000` | `https://yourdomain.com` |
| `NEXTAUTH_SECRET` | **OPTIONAL** | Random dev secret | 32-byte Base64 session secret |
| `NEXTAUTH_URL` | **OPTIONAL** | `http://localhost:3000` | `https://yourdomain.com` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | **OPTIONAL in dev** | Mock publishable key | Live publishable key (`pk_live_...`) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | **OPTIONAL in dev** | Mock key ID | Live key ID (`rzp_live_...`) |
| `NEXT_PUBLIC_SUPABASE_URL` | **OPTIONAL** | Unset | `https://your_project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **OPTIONAL** | Unset | Supabase anon key |
| `NEXT_PUBLIC_GA_ID` | **OPTIONAL** | Unset | Google Analytics ID (`G-XXXXXXXXXX`) |
| `NEXT_PUBLIC_POSTHOG_KEY` | **OPTIONAL** | Unset | PostHog public project token |
| `NEXT_PUBLIC_POSTHOG_HOST`| **OPTIONAL** | `https://us.i.posthog.com` | Ingestion endpoint |
| `NEXT_PUBLIC_SENTRY_DSN` | **OPTIONAL** | Unset | Frontend Sentry DSN |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | **OPTIONAL** | Unset | Google OAuth client ID (Planned) |

---

## 4. Integrations Not Yet Implemented

During the audit, the following integrations were checked against the current codebase:

1. **Google OAuth (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)**:
   - **Status**: *Planned / Architectural preparation only.*
   - **Current Implementation**: The application currently uses custom email/password authentication with Bcrypt hashing and JWT bearer tokens (`/api/auth/login`, `/api/auth/signup`, `/api/auth/me`). Google OAuth is supported in configuration settings but does not have active OAuth2 callback routes yet.
2. **Redis In-Memory Cache**:
   - **Status**: *Not implemented in application runtime.*
   - **Current Implementation**: Database queries use SQLAlchemy ORM with SQLite (dev) or PostgreSQL (prod). "Redis" appears only in sample resume text and keyword lists. No `REDIS_URL` is required or utilized.
3. **Direct Resend SDK**:
   - **Status**: *Supported via SMTP.*
   - **Current Implementation**: Email dispatch uses standard SMTP configuration (`SMTP_HOST=smtp.resend.com`, `SMTP_PORT=587`, `SMTP_USER=resend`, `SMTP_PASSWORD=<api_key>`).

---

## 5. Quickstart: How to Copy and Setup Local Environment

### On Windows (PowerShell):
```powershell
# In repository root:
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env.local
```

### On Linux / macOS (Bash):
```bash
# In repository root:
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

### Starting the Services:
```bash
# 1. Start Backend:
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload

# 2. Start Frontend:
cd ../frontend
npm run dev
```

---

## 6. Obtaining API Keys and Credentials

### 1. Google Gemini AI API Key
- **Where to obtain**: [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Free Tier**: 15 requests/min, 1M tokens/min (Gemini 1.5 Flash).
- **Assigned to**: `GEMINI_API_KEY`

### 2. Stripe Payment Keys
- **Where to obtain**: [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
- **Free Tier**: Unlimited test mode.
- **Assigned to**: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`

### 3. Razorpay Payment Keys
- **Where to obtain**: [Razorpay Dashboard](https://dashboard.razorpay.com/app/keys)
- **Free Tier**: Unlimited test sandbox.
- **Assigned to**: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`

### 4. Supabase Database & Storage
- **Where to obtain**: [Supabase Dashboard](https://supabase.com/dashboard)
- **Free Tier**: 500 MB database, 1 GB file storage, 50k MAU.
- **Assigned to**: `DATABASE_URL` (under Database -> Connection String), `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

### 5. Generating Cryptographic Secrets
Run in your terminal to generate high-entropy random keys:
```bash
# Generate 256-bit hex secret for SECRET_KEY / JWT_SECRET:
openssl rand -hex 32

# Generate 32-byte Base64 key for NEXTAUTH_SECRET or ENCRYPTION_KEY:
openssl rand -base64 32
```

---

## 7. Production Deployment Setup

### 7.1 Frontend Deployment (Vercel)
1. Import repository on [Vercel](https://vercel.com).
2. Set Root Directory to `frontend`.
3. Configure Environment Variables in Project Settings:
   - `NEXT_PUBLIC_API_URL` = `https://api.yourdomain.com/api`
   - `NEXT_PUBLIC_SITE_URL` = `https://yourdomain.com`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_live_...`
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID` = `rzp_live_...`
   - `NEXTAUTH_SECRET` = `[Generated 32-byte secret]`

### 7.2 Backend Deployment (Railway / Render / Docker)
1. Deploy from the `backend` directory.
2. Build Command: `pip install -r requirements.txt`
3. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT --workers 4`
4. Set Environment Variables:
   - `ENVIRONMENT` = `production`
   - `FRONTEND_URL` = `https://yourdomain.com`
   - `CORS_ORIGINS` = `https://yourdomain.com,https://www.yourdomain.com`
   - `DATABASE_URL` = `postgresql://postgres.xxx:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true`
   - `SECRET_KEY` = `[Generated 256-bit secret]`
   - `GEMINI_API_KEY` = `AIzaSy...`
   - `STRIPE_SECRET_KEY` = `sk_live_...`
   - `STRIPE_WEBHOOK_SECRET` = `whsec_...`
   - `RAZORPAY_KEY_ID` = `rzp_live_...`
   - `RAZORPAY_KEY_SECRET` = `[Razorpay Secret]`

### 7.3 Database Provisioning (Supabase / Managed PostgreSQL)
1. Pass the PostgreSQL connection string in `DATABASE_URL`.
2. SQLAlchemy automatically provisions all schema tables on startup (`Base.metadata.create_all(bind=engine)`).

---

## 8. Verifying Configuration Without Exposing Secrets

Never print or log the raw values of secrets. You can safely verify that your environment is correctly configured using these methods:

### Method 1: Run the Automated Verification Suite
```bash
cd backend
python test_env_management.py
```
This script tests configuration loading, startup validation, CORS parsing, and security guardrails without outputting secret values.

### Method 2: Query the Health Endpoint
Start the backend and visit:
```
http://127.0.0.1:8000/health
```
A response of `{"status": "healthy", "service": "ResumeIQ Backend"}` confirms that the backend started and successfully validated all required variables.

### Method 3: Safe Masked Variable Inspection Script
To verify which variables are set without displaying secrets:
```bash
python -c "from app.core.config import settings; print('Environment:', settings.ENVIRONMENT); print('Database Type:', settings.DATABASE_URL.split(':')[0]); print('Gemini Key Configured:', bool(settings.GEMINI_API_KEY)); print('Secret Key Configured:', bool(settings.SECRET_KEY)); print('Stripe Secret Configured:', bool(settings.STRIPE_SECRET_KEY)); print('CORS Origins:', settings.parsed_cors_origins)"
```

---

## 9. Security and Git Safety Best Practices

1. **Exclusions in `.gitignore`**:
   The root `.gitignore` explicitly excludes:
   - `.env`
   - `.env.local`
   - `.env.*.local`
   - `backend/.env`
   - `frontend/.env.local`
   - `*.db` (SQLite database files)
   - `*.log`
2. **Never Commit Secrets**:
   Only `.env.example` template files with placeholders are tracked in git.
3. **Secret Rotation**:
   If a key is accidentally exposed, revoke and regenerate it immediately from its respective provider dashboard.
4. **Separation of Concerns**:
   Private backend secrets (`STRIPE_SECRET_KEY`, `GEMINI_API_KEY`, `DATABASE_URL`) must NEVER be prefixed with `NEXT_PUBLIC_` or imported into frontend client components.
