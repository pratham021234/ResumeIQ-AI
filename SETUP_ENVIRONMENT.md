# ResumeIQ AI — Environment Variables & Cloud Infrastructure Guide

Welcome to the **ResumeIQ AI** comprehensive environment configuration manual. This guide provides step-by-step instructions for provisioning API keys, configuring local development environments, managing free-tier resources, and deploying production SaaS infrastructure across Vercel, Railway/Render, Supabase, Stripe, and Google AI Studio.

---

## Table of Contents

1. [Architecture Overview & Environment Strategy](#1-architecture-overview--environment-strategy)
2. [Quickstart: Local Development Setup](#2-quickstart-local-development-setup)
3. [Configuration Matrix & Obtaining Keys](#3-configuration-matrix--obtaining-keys)
   - [Google Gemini AI API Key](#31-google-gemini-ai-api-key)
   - [Stripe Payment Keys](#32-stripe-payment-keys)
   - [Razorpay Payment Keys](#33-razorpay-payment-keys)
   - [Supabase (Database, Auth & Storage)](#34-supabase-database-auth--storage)
   - [PostHog Analytics](#35-posthog-analytics)
   - [Google Analytics 4 (GA4)](#36-google-analytics-4-ga4)
   - [Sentry Error Monitoring & APM](#37-sentry-error-monitoring--apm)
   - [Transactional Email (SMTP / Resend / SendGrid)](#38-transactional-email-smtp--resend--sendgrid)
   - [Cryptographic Secrets (JWT & AES-256)](#39-cryptographic-secrets-jwt--aes-256)
4. [Free-Tier & Cost-Optimized Stacks](#4-free-tier--cost-optimized-stacks)
5. [Validation & Startup Guardrails](#5-validation--startup-guardrails)
6. [Production Deployment Guide](#6-production-deployment-guide)
   - [Frontend Deployment (Vercel)](#61-frontend-deployment-vercel)
   - [Backend Deployment (Railway / Render / Docker)](#62-backend-deployment-railway--render--docker)
   - [Database Provisioning (Supabase / Managed PostgreSQL)](#63-database-provisioning-supabase--managed-postgresql)
7. [Security Best Practices](#7-security-best-practices)

---

## 1. Architecture Overview & Environment Strategy

ResumeIQ AI follows strict twelve-factor app principles for configuration:

- **Type-Safe Validation**: Both frontend (`frontend/src/lib/env.ts`) and backend (`backend/app/core/config.py`) validate environment variables at boot.
- **Fail-Fast Startup**: If critical required variables (such as `GEMINI_API_KEY`, `DATABASE_URL`, or `SECRET_KEY`) are missing or unconfigured, the application immediately aborts startup with an actionable resolution guide.
- **Strict Separation of Secrets**: Variables prefixed with `NEXT_PUBLIC_` are safely compiled into client-side browser bundles. All private secrets (e.g. `STRIPE_SECRET_KEY`, `RAZORPAY_KEY_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`) are strictly confined to the backend server and never exposed to client browsers.

```
┌─────────────────────────────────────────────────────────────┐
│                      ResumeIQ AI Cloud                      │
├───────────────────────────────┬─────────────────────────────┤
│  Frontend (Next.js / Vercel)  │  Backend (FastAPI / Railway)│
│  - NEXT_PUBLIC_API_URL        │  - DATABASE_URL             │
│  - NEXT_PUBLIC_SITE_URL       │  - SECRET_KEY / JWT_SECRET  │
│  - NEXT_PUBLIC_STRIPE_KEY     │  - GEMINI_API_KEY           │
│  - NEXT_PUBLIC_RAZORPAY_ID    │  - STRIPE_SECRET_KEY        │
│  - NEXT_PUBLIC_GA_ID          │  - RAZORPAY_KEY_SECRET      │
│  - NEXT_PUBLIC_POSTHOG_KEY    │  - SUPABASE_SERVICE_KEY     │
└───────────────────────────────┴─────────────────────────────┘
```

---

## 2. Quickstart: Local Development Setup

To run the entire platform locally with zero friction:

### Step 1: Clone and Prepare Environment Files

```bash
# Clone the repository
git clone https://github.com/pratham021234/ResumeIQ-AI.git
cd "ResumeIQ AI"

# Copy root template or individual service files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

### Step 2: Configure Required Development Keys

Open `backend/.env` and ensure the following keys are set:
```dotenv
PROJECT_NAME="ResumeIQ AI — AI-Powered ATS Resume Analyzer"
ENVIRONMENT=development
DATABASE_URL=sqlite:///./resumeiq.db
SECRET_KEY=super-secret-development-key-resumeiq-ai-2026
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:3000
```

> **Note**: For local development, `GEMINI_API_KEY` can be set to your Google AI Studio key. If left unconfigured, the application startup validator will prompt you to set it. Local NLP fallbacks are active if network connectivity is disabled.

### Step 3: Run the Backend

```bash
cd backend
python -m venv ../.venv
# On Windows PowerShell:
..\.venv\Scripts\Activate.ps1
# On Linux/macOS:
source ../.venv/bin/activate

pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
Backend API will be live at `http://127.0.0.1:8000` (Swagger UI at `/docs`).

### Step 4: Run the Frontend

```bash
cd ../frontend
npm install
npm run dev
```
Frontend will be live at `http://localhost:3000`.

---

## 3. Configuration Matrix & Obtaining Keys

### 3.1 Google Gemini AI API Key
- **Variable**: `GEMINI_API_KEY`
- **Purpose**: Powers AI Resume Tailor, Bullet Optimization, and Interview Question generation.
- **Required**: Yes
- **Where to Obtain**:
  1. Navigate to [Google AI Studio](https://aistudio.google.com/app/apikey).
  2. Sign in with your Google account.
  3. Click **"Create API Key"** and select a Google Cloud project (or create one automatically).
  4. Copy the generated API key (format: `AIzaSy...`).
- **Free-Tier Limits**:
  - 15 requests per minute (RPM)
  - 1,000,000 tokens per minute (TPM)
  - 1,500 requests per day (RPD)
  - Completely free for testing and development.

---

### 3.2 Stripe Payment Keys
- **Variables**:
  - `STRIPE_SECRET_KEY`: Server-side secret key (`sk_test_...` / `sk_live_...`)
  - `STRIPE_PUBLISHABLE_KEY`: Client/server publishable key (`pk_test_...` / `pk_live_...`)
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Frontend publishable key (`pk_test_...` / `pk_live_...`)
  - `STRIPE_WEBHOOK_SECRET`: Webhook signing secret (`whsec_...`)
- **Required**: Yes (if Stripe subscription billing is active)
- **Where to Obtain**:
  1. Create a free account at [stripe.com](https://stripe.com).
  2. In the top navigation, ensure **"Test Mode"** is toggled ON.
  3. Go to **Developers -> API keys**.
  4. Copy **Publishable key** (`pk_test_...`) and **Secret key** (`sk_test_...`).
  5. Go to **Developers -> Webhooks**, click **"Add endpoint"**, configure URL:
     - Development: Use the Stripe CLI (`stripe listen --forward-to localhost:8000/api/billing/webhook/stripe`)
     - Production: `https://api.resumeiq.ai/api/billing/webhook/stripe`
  6. Copy the **Signing secret** (`whsec_...`).
- **Free-Tier**: Free test mode with simulated card testing (`4242 4242 4242 4242`).

---

### 3.3 Razorpay Payment Keys
- **Variables**:
  - `RAZORPAY_KEY_ID`: Merchant ID (`rzp_test_...` / `rzp_live_...`)
  - `NEXT_PUBLIC_RAZORPAY_KEY_ID`: Frontend Merchant ID (`rzp_test_...` / `rzp_live_...`)
  - `RAZORPAY_KEY_SECRET`: Private merchant secret key
  - `RAZORPAY_WEBHOOK_SECRET`: Webhook signature secret
- **Required**: Yes (if Razorpay billing for India / UPI / International cards is enabled)
- **Where to Obtain**:
  1. Sign up at [dashboard.razorpay.com](https://dashboard.razorpay.com).
  2. Switch to **Test Mode**.
  3. Navigate to **Settings -> API Keys -> Generate Key**.
  4. Download/copy your **Key ID** (`rzp_test_...`) and **Key Secret**.
  5. Under **Settings -> Webhooks**, add endpoint `https://api.resumeiq.ai/api/billing/webhook/razorpay` with secret.
- **Free-Tier**: Free sandbox environment with mock UPI, netbanking, and test cards.

---

### 3.4 Supabase (Database, Auth & Storage)
- **Variables**:
  - `DATABASE_URL`: PostgreSQL connection string
  - `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL`: Project instance URL
  - `SUPABASE_ANON_KEY` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Client public anonymous key
  - `SUPABASE_SERVICE_ROLE_KEY`: Server-side administrative key (bypasses RLS)
  - `SUPABASE_BUCKET_NAME`: Storage bucket identifier (`resumes`)
- **Required**: Recommended for production deployment
- **Where to Obtain**:
  1. Sign in to [Supabase](https://supabase.com/dashboard) and create a project.
  2. Under **Project Settings -> Database**:
     - Scroll to **Connection string -> URI** or **Transaction Pooler (Port 6543)**.
     - Copy the connection URI:
       `postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true`
  3. Under **Project Settings -> API**:
     - Copy **Project URL** (`https://xyzcompany.supabase.co`).
     - Copy **anon / public** key.
     - Copy **service_role** key (keep this strictly confidential!).
  4. Under **Storage**:
     - Create a bucket named `resumes` (Private bucket with signed URLs).
- **Free-Tier**:
  - 500 MB PostgreSQL database
  - 1 GB Storage for resumes and PDF reports
  - 50,000 monthly active users

---

### 3.5 PostHog Analytics
- **Variables**:
  - `POSTHOG_API_KEY`: Server-side project API key (`phc_...`)
  - `NEXT_PUBLIC_POSTHOG_KEY`: Client-side public key
  - `POSTHOG_HOST` / `NEXT_PUBLIC_POSTHOG_HOST`: Ingestion endpoint (`https://us.i.posthog.com`)
- **Required**: Optional
- **Where to Obtain**:
  1. Sign up at [posthog.com](https://posthog.com).
  2. Go to **Project Settings -> Project Variables**.
  3. Copy your Project API Key.
- **Free-Tier**: 1,000,000 events per month free forever.

---

### 3.6 Google Analytics 4 (GA4)
- **Variables**:
  - `NEXT_PUBLIC_GA_ID`: Client Measurement ID (`G-XXXXXXXXXX`)
  - `GA_MEASUREMENT_ID`: Backend Measurement ID
- **Required**: Optional
- **Where to Obtain**:
  1. Create a GA4 property at [analytics.google.com](https://analytics.google.com).
  2. Navigate to **Admin -> Data Streams -> Web**.
  3. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`).
- **Free-Tier**: 100% Free without tier limits.

---

### 3.7 Sentry Error Monitoring & APM
- **Variables**:
  - `SENTRY_DSN`: Backend DSN (`https://...@ingest.sentry.io/...`)
  - `NEXT_PUBLIC_SENTRY_DSN`: Frontend DSN
  - `SENTRY_ENVIRONMENT`: `development` | `staging` | `production`
- **Required**: Recommended in production
- **Where to Obtain**:
  1. Create a free account at [sentry.io](https://sentry.io).
  2. Create projects for **FastAPI (Python)** and **Next.js (JavaScript)**.
  3. Copy each project's DSN under **Settings -> Client Keys (DSN)**.
- **Free-Tier**: Developer Plan offers 5,000 errors/month and 10,000 performance transactions/month.

---

### 3.8 Transactional Email (SMTP / Resend / SendGrid)
- **Variables**:
  - `SMTP_HOST`: e.g. `smtp.resend.com` or `smtp.sendgrid.net`
  - `SMTP_PORT`: `587` (TLS) or `465` (SSL)
  - `SMTP_USER`: `resend` or `apikey`
  - `SMTP_PASSWORD`: Your Resend or SendGrid API token
  - `EMAIL_FROM`: `ResumeIQ AI <noreply@resumeiq.ai>`
- **Required**: Optional in dev, required in production for password resets and invoice receipts.
- **Where to Obtain (Recommended: Resend)**:
  1. Sign up at [resend.com](https://resend.com).
  2. Go to **API Keys -> Create API Key**.
  3. Verify your custom domain under **Domains**.
- **Free-Tier**: Resend provides 3,000 emails/month free (100 emails/day).

---

### 3.9 Cryptographic Secrets (JWT & AES-256)
- **Variables**:
  - `SECRET_KEY` / `JWT_SECRET`: Signs authentication session tokens.
  - `NEXTAUTH_SECRET`: Frontend session encryption key.
  - `ENCRYPTION_KEY`: 32-byte AES key for database-at-rest encryption.
- **Required**: Yes
- **How to Generate High-Entropy Cryptographic Keys**:
  ```bash
  # Generate 256-bit JWT Secret:
  openssl rand -hex 32
  # Output example: 4d2b9ef182a138c20188ea681284d72852230a27318ec851efb70742f1cf44e0

  # Generate 32-byte Base64 AES Encryption Key:
  openssl rand -base64 32
  # Output example: 7xK3v9QW8yZ4P1mN0L+rT6vB8xZ2wQ5aJ7uI3oK1mP0=
  ```

---

## 4. Free-Tier & Cost-Optimized Stacks

You can run the entire ResumeIQ AI stack in production for **$0 / month** on free tiers:

| Service | Provider | Free Tier Allocation |
| :--- | :--- | :--- |
| **Frontend Hosting** | Vercel | 100 GB bandwidth, unlimited deployments |
| **Backend API Hosting**| Railway / Render | Free tier or $5 credit |
| **PostgreSQL Database**| Supabase | 500 MB database, connection pooling |
| **Resume File Storage**| Supabase Storage | 1 GB storage, signed secure downloads |
| **AI LLM Inference** | Google AI Studio | 15 RPM, 1M TPM (Gemini 1.5 Flash) |
| **Payment Gateway** | Stripe / Razorpay | Free sandbox testing, 0 monthly recurring fees |
| **Error Monitoring** | Sentry | 5,000 errors/month |
| **Product Analytics** | PostHog | 1,000,000 events/month |
| **Transactional Email**| Resend | 3,000 emails/month |

---

## 5. Validation & Startup Guardrails

### Backend Startup Validation Engine
The backend validates environment variables upon boot in `backend/app/core/config.py`:
- If `GEMINI_API_KEY` is empty, startup halts immediately with:
  ```
  ======================================================================
  ENVIRONMENT CONFIGURATION ERROR: APPLICATION STARTUP HALTED
  ======================================================================
  Missing required environment variable:
  - GEMINI_API_KEY
  ...
  ```
- If `ENVIRONMENT=production` is detected:
  - Rejects default development `SECRET_KEY` values to prevent credential spoofing.
  - Warns if SQLite is used instead of managed PostgreSQL.

### Frontend Startup Validation Engine
The frontend validates environment variables in `frontend/src/lib/env.ts`:
- If `NEXT_PUBLIC_API_URL` is empty, build/runtime halts with:
  ```
  Missing required environment variable:
  NEXT_PUBLIC_API_URL
  ```

---

## 6. Production Deployment Guide

### 6.1 Frontend Deployment (Vercel)
1. Import repository into [Vercel](https://vercel.com).
2. Set Root Directory to `frontend`.
3. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL`: `https://api.resumeiq.ai/api`
   - `NEXT_PUBLIC_SITE_URL`: `https://resumeiq.ai`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: `pk_live_...`
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`: `rzp_live_...`
   - `NEXTAUTH_SECRET`: `[Generated 32-byte secret]`
   - `NEXTAUTH_URL`: `https://resumeiq.ai`

### 6.2 Backend Deployment (Railway / Render / Docker)
1. Deploy from the `backend` directory.
2. Build Command: `pip install -r requirements.txt`
3. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT --workers 4`
4. Set Environment Variables:
   - `ENVIRONMENT`: `production`
   - `PROJECT_NAME`: `ResumeIQ AI`
   - `FRONTEND_URL`: `https://resumeiq.ai`
   - `CORS_ORIGINS`: `https://resumeiq.ai,https://www.resumeiq.ai`
   - `DATABASE_URL`: `postgresql://postgres.xxx:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true`
   - `SECRET_KEY`: `[Generated 256-bit secret]`
   - `GEMINI_API_KEY`: `AIzaSy...`
   - `STRIPE_SECRET_KEY`: `sk_live_...`
   - `STRIPE_WEBHOOK_SECRET`: `whsec_...`
   - `RAZORPAY_KEY_ID`: `rzp_live_...`
   - `RAZORPAY_KEY_SECRET`: `[Razorpay Secret]`

### 6.3 Database Provisioning (Supabase / Managed PostgreSQL)
When switching from SQLite to PostgreSQL:
1. Provide the PostgreSQL connection string in `DATABASE_URL`.
2. The FastAPI backend automatically provisions schema tables via SQLAlchemy (`Base.metadata.create_all(bind=engine)`).
3. If seeding demo templates is desired, the startup seed task runs automatically.

---

## 7. Security Best Practices

1. **Never Commit Secrets**:
   `.env`, `.env.local`, and `*.db` files are strictly excluded in `.gitignore`.
2. **Rotate Exposed Keys**:
   If an API key is accidentally shared, immediately revoke and re-issue it in the provider dashboard (Google AI Studio, Stripe, etc.).
3. **Webhook Signature Verification**:
   Always verify inbound webhooks (`STRIPE_WEBHOOK_SECRET` and `RAZORPAY_WEBHOOK_SECRET`) to prevent unauthorized balance manipulation.
4. **Enforce HTTPS in Production**:
   Ensure all API endpoints and CORS origins enforce TLS (`https://`).

---
*ResumeIQ AI — Engineered for Scalability, Security, and Production Excellence.*
