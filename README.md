# ResumeIQ AI — AI-Powered ATS Resume Analyzer

> **A production-quality SaaS web application engineered to help job seekers, career coaches, and recruiters defeat applicant tracking systems (ATS) with deterministic scoring, keyword radar, and truth-constrained AI bullet optimization.**

---

## 🌟 Key Features

1. **Deterministic ATS Compatibility Scoring**
   - Explainable mathematical scoring formula:
     - ATS Formatting: 20%
     - Keyword Match: 25%
     - Skills Match: 25%
     - Experience Relevance: 15%
     - Resume Quality: 10%
     - Education/Certifications: 5%
   - Circular radial score visualizations for ATS Score, Job Match, Keyword Match, and Resume Quality.
   - Consistent, deterministic results: identical inputs yield identical, verifiable scores.

2. **Categorized Keyword Radar**
   - **Critical Missing**: High-relevance requirements absent from the resume.
   - **Recommended Additions**: Secondary frameworks and tooling that elevate match rank.
   - **Already Found**: Matched terms with automatic synonym/alias normalization (e.g. *Postgres* = *PostgreSQL*, *JS* = *JavaScript*, *K8s* = *Kubernetes*).
   - Suggested resume sections (e.g. Experience, Skills, Projects) for each missing keyword.

3. **Horizontal Skill Gap Analysis**
   - Visual comparison bars comparing required skill coverage.
   - Recruiter Priority benchmarking (*Must Have*, *Good to Have*, *Bonus*).

4. **ATS Layout & Formatting Audit**
   - PyMuPDF vector and block extraction detecting:
     - Multi-column layouts
     - Embedded tables & grid structures
     - Raster graphics and unreadable images
     - Contact details placed inside unreadable headers
     - Resume word count calibration (250–1,400 words)
   - Severity tags: *Passed*, *Warning*, *Critical*.

5. **AI Bullet Point Improver (Truth-Constrained)**
   - Elevates passive duties into high-impact accomplishments using the Google XYZ formula.
   - **Strict Zero-Hallucination Policy**: Never fabricates or invents fake numbers, percentages, or budgets.
   - 4 Rewrite Styles:
     - *Achievement-Focused*
     - *More Technical*
     - *Executive Brevity (Shorter)*
     - *ATS-Friendly*
   - Live "Apply to Document" update in the split-screen editor.

6. **Tailored Cover Letter Generator**
   - Synthesizes candidate experience with target company mission and job description requirements.
   - Customizable Tone (*Professional*, *Confident*, *Conversational*) and Length (*Short*, *Standard*, *Detailed*).
   - 1-Click Copy and `.txt` export.

7. **Resume Version Library**
   - Save multiple tailored versions (e.g. *Senior Backend Resume*, *Platform Architect Resume*).
   - Duplicate, rename, edit in the split-screen improver, and track historical scan counts.

8. **Executive PDF Audit Reports**
   - Downloadable, beautifully formatted ReportLab PDF reports ready for clients and career coaching sessions.

9. **Interactive Demo Mode**
   - Instant 1-click preview with pre-loaded Senior Software Engineer audit against Stripe.

10. **Recruiter Portal Architecture**
    - Feature-flagged employer portal (`/recruiter`) with candidate batch screening and applicant ranking.

---

## 🏗️ Architecture & Technology Stack

```
ResumeIQ AI
├── backend/                  # FastAPI Python backend (Port 8000)
│   ├── app/
│   │   ├── api/              # REST Routers (auth, resumes, jobs, analysis, ai, reports, dashboard, recruiter)
│   │   ├── core/             # Database, Security (Bcrypt, JWT), Configuration
│   │   ├── models/           # SQLAlchemy models (User, Resume, Analysis, Scores, Keywords, etc.)
│   │   ├── schemas/          # Pydantic request/response validation schemas
│   │   ├── parsers/          # PyMuPDF and python-docx layout and text extraction
│   │   ├── scoring/          # Deterministic ATS scoring engine & keyword extractors
│   │   ├── ai/               # Gemini API client & intelligent rule-based fallback improver
│   │   └── services/         # ReportLab PDF generator & database seeding
│   ├── uploads/              # Uploaded documents and generated PDF reports
│   ├── main.py               # Application entrypoint with auto-seeding
│   └── requirements.txt
│
└── frontend/                 # Next.js 16 App Router (Port 3000)
    ├── src/
    │   ├── app/              # App Router Pages
    │   │   ├── page.tsx                      # 1. Landing Page
    │   │   ├── signup/page.tsx               # 2. Sign Up
    │   │   ├── login/page.tsx                # 3. Login
    │   │   ├── dashboard/page.tsx            # 4. User Dashboard
    │   │   ├── analyze/page.tsx              # 5. New Analysis Workflow
    │   │   ├── analysis/[id]/page.tsx        # 6. Analysis Results & Audit
    │   │   ├── resumes/page.tsx              # 7. Resume Library
    │   │   ├── editor/page.tsx               # 8. AI Bullet Improver & Editor
    │   │   ├── cover-letter/page.tsx         # 9. Cover Letter Generator
    │   │   ├── reports/page.tsx              # 10. Audit Reports
    │   │   ├── pricing/page.tsx              # 11. Pricing Matrix
    │   │   ├── settings/page.tsx             # 12. Settings & AI Configuration
    │   │   └── recruiter/page.tsx            # Recruiter Portal (Feature Flagged)
    │   ├── components/       # Circular gauges, score badges, audit cards, layouts
    │   ├── lib/              # Typed API client, demo presets, date helpers
    │   └── types/            # TypeScript interfaces
    └── package.json
```

---

## 🚀 Quickstart Local Setup

### 1. Prerequisites
- **Python 3.11+**
- **Node.js 18+** (Node 24 LTS verified)
- **npm**

---

### 2. Backend Setup

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. (Optional) Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create your `.env` configuration (defaults work out of the box with SQLite):
   ```bash
   cp .env.example .env
   ```
   *(Optional: set `GEMINI_API_KEY="your-gemini-key"` for direct Google Gemini cloud generation)*

5. Start the FastAPI development server:
   ```bash
   uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```
   *The backend will automatically create tables and seed realistic sample data on first run.*
   - API Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
   - Health Check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

### 3. Frontend Setup

1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Account Credentials

- **Email**: `demo@resumeiq.ai`
- **Password**: `password123`
- *Or click "Instant 1-Click Demo Login" on the Sign In / Sign Up pages for instant access.*

---

## 🛡️ Security & Privacy
- **JWT & Password Security**: Native Bcrypt password hashing and session tokens.
- **Upload Validation**: File extension checks (.pdf, .docx), MIME validation, and 10MB file size ceiling.
- **Data Isolation**: User-specific database scopes with separate records.
- **API Key Protection**: Server-side Gemini API invocation with optional user overrides.

---

## 📄 License
MIT License. © 2026 ResumeIQ AI Inc. All rights reserved.
