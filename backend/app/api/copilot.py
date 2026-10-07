from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user_optional
from app.models.models import (
    User, JobDescription, Analysis, Resume, CandidateEvaluation, SkillGap
)
from app.services.copilot_service import CopilotService

router = APIRouter(prefix="/copilot", tags=["AI Hiring Copilot"])

# Request / Response Schemas
class StageUpdateRequest(BaseModel):
    stage: str # 'Screening', 'Shortlisted', 'Interview', 'Offer', 'Rejected'
    hiring_decision: Optional[str] = None # 'Strong Yes', 'Yes', 'Leaning Yes', 'Leaning No', 'Strong No'
    recruiter_notes: Optional[str] = None
    rating: Optional[int] = None

class BatchEvaluateRequest(BaseModel):
    job_id: Optional[str] = None

@router.get("/jobs")
def get_copilot_jobs(db: Session = Depends(get_db)):
    """Fetch jobs with candidate evaluation counts for the copilot selector."""
    jobs = db.query(JobDescription).order_by(JobDescription.created_at.desc()).all()
    results = []
    for j in jobs:
        analyses = db.query(Analysis).filter(Analysis.job_id == j.id).all()
        cand_count = len(analyses)
        avg_score = round(sum(float(str(a.overall_ats_score)) for a in analyses) / cand_count, 1) if cand_count > 0 else 0.0

        shortlisted = db.query(CandidateEvaluation).filter(
            CandidateEvaluation.job_id == j.id,
            CandidateEvaluation.stage.in_(["Shortlisted", "Interview", "Offer"])
        ).count()

        results.append({
            "id": str(j.id),
            "title": str(j.title),
            "company": str(j.company),
            "skills": j.skills or [],
            "experience_level": str(getattr(j, "experience_level", "Mid-Level") or "Mid-Level"),
            "candidate_count": cand_count,
            "shortlisted_count": shortlisted,
            "average_ats_score": avg_score,
            "created_at": j.created_at.isoformat() if j.created_at else None
        })
    return results

@router.get("/candidates")
def get_copilot_candidates(
    job_id: Optional[str] = None,
    stage: Optional[str] = None,
    decision: Optional[str] = None,
    min_score: Optional[float] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Fetch ranked candidate evaluations with multi-filter pipeline controls."""
    query = db.query(Analysis)
    if job_id:
        query = query.filter(Analysis.job_id == job_id)
    if min_score is not None:
        query = query.filter(Analysis.overall_ats_score >= min_score)

    analyses = query.order_by(Analysis.overall_ats_score.desc()).all()
    results = []

    eval_records = {e.analysis_id: e for e in db.query(CandidateEvaluation).all()}

    for rank, a in enumerate(analyses, start=1):
        resume = db.query(Resume).filter(Resume.id == a.resume_id).first()
        job = db.query(JobDescription).filter(JobDescription.id == a.job_id).first()
        if not resume or not job:
            continue

        meta = getattr(resume, "formatting_meta", {}) or {}
        cand_name = str(meta.get("candidate_name") or str(resume.title).replace("Resume", "").strip() or "Candidate")

        # Search filter
        if search:
            s_low = search.lower()
            if s_low not in cand_name.lower() and s_low not in str(job.title).lower():
                continue

        eval_obj = eval_records.get(a.id)
        current_stage = str(eval_obj.stage) if eval_obj else "Screening"
        hiring_dec = str(eval_obj.hiring_decision) if eval_obj else ("Strong Yes" if float(str(a.overall_ats_score)) >= 84 else "Yes" if float(str(a.overall_ats_score)) >= 74 else "Leaning Yes")

        # Stage filter
        if stage and stage != "All" and current_stage.lower() != stage.lower():
            continue

        # Decision filter
        if decision and decision != "All" and hiring_dec.lower() != decision.lower():
            continue

        # Missing & verified skills
        skills = db.query(SkillGap).filter(SkillGap.analysis_id == a.id).all()
        v_skills = [str(s.skill_name) for s in skills if bool(s.in_resume)][:5]
        m_skills = [str(s.skill_name) for s in skills if not bool(s.in_resume)][:4]

        results.append({
            "rank": rank,
            "analysis_id": str(a.id),
            "resume_id": str(resume.id),
            "job_id": str(job.id),
            "candidate_name": cand_name,
            "email": str(meta.get("candidate_email") or f"{cand_name.lower().replace(' ', '.')}@example.com"),
            "role": str(job.title),
            "company": str(job.company),
            "ats_score": float(str(a.overall_ats_score)),
            "match_score": float(str(a.job_match_score)),
            "stage": current_stage,
            "hiring_decision": hiring_dec,
            "confidence_score": float(eval_obj.confidence_score) if eval_obj else 88.0,
            "rating": int(eval_obj.rating) if eval_obj else 4,
            "verified_skills": v_skills,
            "missing_skills": m_skills,
            "executive_summary": str(eval_obj.executive_summary) if eval_obj else f"Evaluated candidate for {job.title}",
            "created_at": a.created_at.isoformat() if a.created_at else None
        })

    return results

@router.get("/candidate/{analysis_id}")
def get_candidate_copilot_detail(analysis_id: str, db: Session = Depends(get_db)):
    """Get complete deep evaluation for candidate including interview questions and skill gap radar."""
    try:
        evaluation = CopilotService.evaluate_candidate(analysis_id, db)
        return evaluation
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/candidate/{analysis_id}/evaluate")
def force_reevaluate_candidate(analysis_id: str, db: Session = Depends(get_db)):
    """Re-run AI evaluation for candidate."""
    try:
        evaluation = CopilotService.evaluate_candidate(analysis_id, db, force_refresh=True)
        return evaluation
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.put("/candidate/{analysis_id}/stage")
def update_candidate_stage_and_decision(
    analysis_id: str,
    data: StageUpdateRequest,
    db: Session = Depends(get_db)
):
    """Update pipeline stage, hiring verdict, and recruiter notes."""
    try:
        result = CopilotService.update_candidate_stage(
            analysis_id=analysis_id,
            stage=data.stage,
            hiring_decision=data.hiring_decision,
            notes=data.recruiter_notes,
            rating=data.rating,
            db=db
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/analytics")
def get_copilot_analytics(job_id: Optional[str] = None, db: Session = Depends(get_db)):
    """Get enterprise talent metrics and funnel data."""
    return CopilotService.get_pipeline_analytics(job_id, db)

@router.post("/batch-evaluate")
def batch_evaluate_candidates(data: BatchEvaluateRequest, db: Session = Depends(get_db)):
    """1-click evaluate all candidates for a job and auto-shortlist top performers."""
    query = db.query(Analysis)
    if data.job_id:
        query = query.filter(Analysis.job_id == data.job_id)
    analyses = query.all()

    evaluated_count = 0
    shortlisted_count = 0

    for a in analyses:
        res = CopilotService.evaluate_candidate(str(a.id), db)
        evaluated_count += 1
        if res.get("stage") == "Shortlisted":
            shortlisted_count += 1

    return {
        "success": True,
        "total_evaluated": evaluated_count,
        "auto_shortlisted": shortlisted_count,
        "message": f"Successfully evaluated {evaluated_count} candidates. Auto-shortlisted {shortlisted_count} top candidates."
    }
