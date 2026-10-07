import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.services.seed_data import seed_database

# Routers
from app.api.auth import router as auth_router
from app.api.resumes import router as resumes_router
from app.api.jobs import router as jobs_router
from app.api.analysis import router as analysis_router
from app.api.ai import router as ai_router
from app.api.reports import router as reports_router
from app.api.dashboard import router as dashboard_router
from app.api.recruiter import router as recruiter_router

# Initialize tables
Base.metadata.create_all(bind=engine)

# Auto seed database on startup
try:
    with SessionLocal() as db:
        seed_database(db)
except Exception as e:
    print(f"Warning: Initial database seeding encountered an issue: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Enterprise-grade AI-powered ATS Resume Analyzer and Optimization SaaS",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory if present
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth_router, prefix="/api")
app.include_router(resumes_router, prefix="/api")
app.include_router(jobs_router, prefix="/api")
app.include_router(analysis_router, prefix="/api")
app.include_router(ai_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(recruiter_router, prefix="/api")

@app.get("/")
def root():
    return {
        "app": "ResumeIQ AI — AI-Powered ATS Resume Analyzer",
        "status": "online",
        "docs_url": "/docs",
        "version": "1.0.0"
    }

@app.get("/health")
def health():
    return {"status": "healthy", "service": "ResumeIQ Backend"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
