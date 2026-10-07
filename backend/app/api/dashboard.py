from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.api.deps import get_db, get_current_user_optional
from app.models.models import (
    Analysis, Resume, JobDescription, User, KeywordMatch, SkillGap, Recommendation
)
from app.schemas.schemas import DashboardStatsOut

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStatsOut)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    user_id = current_user.id if current_user else None
    query = db.query(Analysis)
    if user_id:
        query = query.filter((Analysis.user_id == user_id) | (Analysis.user_id.is_(None)))
    
    analyses = query.order_by(Analysis.created_at.asc()).all()

    if not analyses:
        # Seed if totally empty
        from app.services.seed_data import seed_database
        seed_database(db)
        analyses = db.query(Analysis).order_by(Analysis.created_at.asc()).all()

    total_analyses = len(analyses)
    avg_ats = round(sum(a.overall_ats_score for a in analyses) / total_analyses, 1) if total_analyses else 0.0
    best_match = round(max((a.job_match_score for a in analyses), default=0.0), 1)
    
    # Resumes count
    resumes_count = db.query(Resume).count()

    # Score history for charts
    score_history = []
    for a in analyses[-10:]:
        score_history.append({
            "id": a.id,
            "date": a.created_at.strftime("%b %d"),
            "ats_score": a.overall_ats_score,
            "match_score": a.job_match_score,
            "keyword_score": a.keyword_match_score
        })

    # Recent analyses with details
    recent_analyses = []
    for a in sorted(analyses, key=lambda x: x.created_at, reverse=True)[:6]:
        r = db.query(Resume).filter(Resume.id == a.resume_id).first()
        j = db.query(JobDescription).filter(JobDescription.id == a.job_id).first()
        recent_analyses.append({
            "id": a.id,
            "resume_id": a.resume_id,
            "resume_name": r.title if r else "Resume.pdf",
            "job_title": j.title if j else "Target Role",
            "company": j.company if j else "Company",
            "ats_score": a.overall_ats_score,
            "match_score": a.job_match_score,
            "date": a.created_at.strftime("%b %d, %Y")
        })

    # Top missing skills across analyses
    missing_skills = (
        db.query(SkillGap.skill_name, func.count(SkillGap.id).label("count"))
        .filter(SkillGap.in_resume == False)
        .group_by(SkillGap.skill_name)
        .order_by(func.count(SkillGap.id).desc())
        .limit(6)
        .all()
    )
    top_missing_skills = [{"skill": s[0], "occurrences": s[1]} for s in missing_skills] or [
        {"skill": "Docker", "occurrences": 3},
        {"skill": "CI/CD", "occurrences": 2},
        {"skill": "GraphQL", "occurrences": 2},
        {"skill": "AWS Lambda", "occurrences": 1}
    ]

    # Most frequent missing keywords
    missing_kw = (
        db.query(KeywordMatch.keyword, func.count(KeywordMatch.id).label("count"))
        .filter(KeywordMatch.category == "Critical Missing")
        .group_by(KeywordMatch.keyword)
        .order_by(func.count(KeywordMatch.id).desc())
        .limit(6)
        .all()
    )
    most_frequent_missing_keywords = [{"keyword": k[0], "count": k[1]} for k in missing_kw] or [
        {"keyword": "FastAPI", "count": 2},
        {"keyword": "Kubernetes", "count": 2},
        {"keyword": "Terraform", "count": 1}
    ]

    # Suggested improvements
    recs = db.query(Recommendation).order_by(Recommendation.id.desc()).limit(4).all()
    suggested_improvements = [
        {"section": r.section, "priority": r.priority, "title": r.title, "action": r.action_item}
        for r in recs
    ] or [
        {"section": "Experience", "priority": "High", "title": "Quantify outcomes with metrics", "action": "Add measurable statistics to highlight scale and latency improvements."},
        {"section": "Skills", "priority": "High", "title": "Add Critical Cloud Tools", "action": "Explicitly mention Docker containerization and AWS infrastructure."}
    ]

    return DashboardStatsOut(
        total_analyses=total_analyses,
        average_ats_score=avg_ats,
        best_match_score=best_match,
        resumes_improved=max(resumes_count, 1),
        score_history=score_history,
        top_missing_skills=top_missing_skills,
        most_frequent_missing_keywords=most_frequent_missing_keywords,
        suggested_improvements=suggested_improvements,
        recent_analyses=recent_analyses
    )
