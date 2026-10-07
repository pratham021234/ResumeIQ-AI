from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user_optional
from app.models.models import Analysis, Resume, JobDescription, User
from app.core.config import settings

router = APIRouter(prefix="/recruiter", tags=["Recruiter Portal (Feature Flagged)"])

@router.get("/status")
def check_recruiter_status():
    return {
        "enabled": settings.ENABLE_RECRUITER_DASHBOARD,
        "message": "Recruiter Portal is active" if settings.ENABLE_RECRUITER_DASHBOARD else "Recruiter Portal is currently behind a feature flag."
    }

@router.get("/candidates")
def list_screened_candidates(
    job_id: Optional[str] = None,
    min_ats_score: Optional[float] = 0.0,
    db: Session = Depends(get_db)
):
    if not settings.ENABLE_RECRUITER_DASHBOARD:
        # Return architectural mock data with warning
        return {
            "flag_enabled": False,
            "architecture": "Recruiter Batch Screening & Applicant Ranking Pipeline",
            "sample_candidates": [
                {
                    "candidate_name": "Alex Rivera",
                    "email": "alex.rivera.dev@gmail.com",
                    "ats_score": 86.5,
                    "job_match": 84.0,
                    "target_role": "Senior Backend Engineer",
                    "status": "Strong Fit",
                    "verified_skills": ["Python", "FastAPI", "PostgreSQL", "AWS", "Kubernetes"]
                },
                {
                    "candidate_name": "Jordan Taylor",
                    "email": "jordan.taylor@example.com",
                    "ats_score": 79.0,
                    "job_match": 76.5,
                    "target_role": "Backend Developer",
                    "status": "Review Recommended",
                    "verified_skills": ["Node.js", "TypeScript", "PostgreSQL", "Docker"]
                }
            ]
        }
    
    query = db.query(Analysis)
    if job_id:
        query = query.filter(Analysis.job_id == job_id)
    if min_ats_score:
        query = query.filter(Analysis.overall_ats_score >= min_ats_score)
    
    analyses = query.order_by(Analysis.overall_ats_score.desc()).all()
    results = []
    for a in analyses:
        r = db.query(Resume).filter(Resume.id == a.resume_id).first()
        j = db.query(JobDescription).filter(JobDescription.id == a.job_id).first()
        results.append({
            "analysis_id": a.id,
            "resume_id": a.resume_id,
            "resume_title": r.title if r else "Candidate Resume",
            "job_title": j.title if j else "Position",
            "company": j.company if j else "Company",
            "ats_score": a.overall_ats_score,
            "match_score": a.job_match_score,
            "created_at": a.created_at
        })
    return {"flag_enabled": True, "candidates": results}
