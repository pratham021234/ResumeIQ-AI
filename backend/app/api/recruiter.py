import os
import uuid
import csv
import io
import re
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from fastapi.responses import StreamingResponse, FileResponse
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user_optional, get_current_user
from app.models.models import (
    User, Resume, JobDescription, Analysis,
    AnalysisScore, SkillGap, KeywordMatch, Recommendation
)
from app.schemas.schemas import (
    UserLogin, Token, UserOut,
    RecruiterJobCreate, RecruiterJobOut,
    CandidateRankingItem, CandidateDetailOut
)
from app.core.security import create_access_token, verify_password, get_password_hash
from app.core.config import settings
from app.scoring.ats_scoring import ATSScoringEngine
from app.scoring.keyword_extractor import extract_keywords_from_jd
from app.parsers.resume_parser import ResumeParser
from app.services.pdf_report_service import PDFReportService

router = APIRouter(prefix="/recruiter", tags=["Recruiter Portal"])

# Helper: Extract AI screening summary
def generate_ai_screening_summary(
    analysis_res: Dict[str, Any],
    parsed_resume: Dict[str, Any],
    jd_skills: Optional[List[str]] = None
) -> Dict[str, Any]:
    strengths = []
    concerns = []

    ats_score = analysis_res.get("overall_ats_score", 0.0)
    job_match = analysis_res.get("job_match_score", 0.0)
    skills_matched = [s["skill_name"] for s in analysis_res.get("skills", []) if s.get("in_resume")]
    missing_critical = [s["skill_name"] for s in analysis_res.get("skills", []) if not s.get("in_resume") and s.get("priority") == "Must Have"]
    missing_general = [s["skill_name"] for s in analysis_res.get("skills", []) if not s.get("in_resume") and s.get("priority") != "Must Have"]

    # Strengths
    if ats_score >= 80:
        strengths.append(f"Excellent overall ATS score ({ats_score:.1f}/100) with clean parse density")
    if job_match >= 75:
        strengths.append(f"High role semantic alignment ({job_match:.1f}/100)")
    if skills_matched:
        strengths.append(f"Verified core skills: {', '.join(skills_matched[:4])}")
    
    sections = parsed_resume.get("parsed_sections", {})
    exp_text = sections.get("experience", "")
    if any(metric in exp_text for metric in ["%", "$", "M+", "K+", "ms"]):
        strengths.append("Measurable, quantified achievements and metrics demonstrated in work experience")
    if len(strengths) == 0:
        strengths.append("Demonstrated foundational technical competencies and parsable experience")

    # Concerns
    if missing_critical:
        concerns.append(f"Missing core must-have requirements: {', '.join(missing_critical[:3])}")
    elif missing_general:
        concerns.append(f"Skill gaps identified in: {', '.join(missing_general[:3])}")

    if job_match < 70:
        concerns.append("Limited direct responsibility overlap with role requirements")
    
    issues = analysis_res.get("issues", [])
    high_issues = [i["title"] for i in issues if i.get("severity") == "high"]
    if high_issues:
        concerns.append(f"Structural flags: {high_issues[0]}")
    
    if len(concerns) == 0:
        concerns.append("No critical screening flags detected")

    recommendation = "Strong Candidate" if ats_score >= 82 else ("Review Recommended" if ats_score >= 70 else "Potential Fit with Gaps")

    return {
        "strengths": strengths[:4],
        "concerns": concerns[:3],
        "recommendation": recommendation
    }

# Helper: Extract candidate metadata from resume
def extract_candidate_meta(parsed_resume: Dict[str, Any], filename: str) -> Dict[str, str]:
    contact = parsed_resume.get("contact_info", {})
    name = contact.get("name")
    if not name or name.lower() in ["none", ""]:
        # Heuristic from filename
        clean_name = os.path.splitext(filename)[0]
        clean_name = re.sub(r'[_.-]+', ' ', clean_name)
        clean_name = re.sub(r'(resume|cv|senior|engineer|developer|profile)', '', clean_name, flags=re.IGNORECASE).strip()
        name = clean_name.title() if clean_name else "Candidate"
    
    email = contact.get("email") or f"{name.lower().replace(' ', '.')}@candidate.org"
    phone = contact.get("phone") or "Available on request"
    
    # Education heuristic
    sections = parsed_resume.get("parsed_sections", {})
    edu_text = sections.get("education", "")
    education = "B.S. in Computer Science"
    if "master" in edu_text.lower() or "m.s." in edu_text.lower():
        education = "M.S. in Computer Science"
    elif "phd" in edu_text.lower() or "doctor" in edu_text.lower():
        education = "Ph.D. in Computer Science"
    elif "bachelor" in edu_text.lower() or "b.s." in edu_text.lower():
        education = "B.S. in Computer Science"
    elif edu_text:
        education = edu_text.split('\n')[0][:50]

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "education": education
    }

# --- RECRUITER AUTHENTICATION ---
@router.post("/auth/login", response_model=Token)
def recruiter_login(data: UserLogin, db: Session = Depends(get_db)):
    # Check if recruiter exists
    user = db.query(User).filter(User.email == data.email).first()
    
    # Demo recruiter account fallback
    if not user and data.email == "recruiter@resumeiq.ai" and data.password == "password123":
        user = User(
            id=str(uuid.uuid4()),
            email="recruiter@resumeiq.ai",
            hashed_password=get_password_hash("password123"),
            full_name="Elena Rostova (Recruiter)",
            plan="enterprise",
            is_recruiter=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    if not user or not verify_password(data.password, str(user.hashed_password)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect recruiter email or password"
        )
    
    if not bool(user.is_recruiter):
        setattr(user, "is_recruiter", True)
        db.commit()

    access_token = create_access_token(subject=str(user.id))
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserOut.model_validate(user)
    )

@router.post("/auth/signup", response_model=Token)
def recruiter_signup(data: UserLogin, full_name: Optional[str] = None, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists"
        )
    
    new_user = User(
        id=str(uuid.uuid4()),
        email=data.email,
        hashed_password=get_password_hash(data.password),
        full_name=full_name or "Talent Acquisition Partner",
        plan="enterprise",
        is_recruiter=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(subject=str(new_user.id))
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserOut.model_validate(new_user)
    )

@router.get("/status")
def check_recruiter_status():
    return {
        "enabled": settings.ENABLE_RECRUITER_DASHBOARD,
        "message": "Recruiter Portal is active with multi-candidate ranking and batch screening."
    }

# --- JOB OPENINGS MANAGEMENT ---
@router.get("/jobs", response_model=List[RecruiterJobOut])
def list_recruiter_jobs(db: Session = Depends(get_db)):
    jobs = db.query(JobDescription).order_by(JobDescription.created_at.desc()).all()
    results = []
    for j in jobs:
        analyses = db.query(Analysis).filter(Analysis.job_id == j.id).all()
        cand_count = len(analyses)
        avg_score = round(sum(float(str(a.overall_ats_score)) for a in analyses) / cand_count, 1) if cand_count > 0 else 0.0
        
        skills_val = list(getattr(j, 'skills', []) or [])
        exp_lvl = str(getattr(j, 'experience_level', 'Mid-Level') or 'Mid-Level')
        status_val = str(getattr(j, 'status', 'Active') or 'Active')
        
        results.append(RecruiterJobOut(
            id=str(j.id),
            title=str(j.title),
            company=str(j.company),
            description=str(j.raw_text),
            skills=skills_val,
            experience_level=exp_lvl,
            status=status_val,
            candidate_count=cand_count,
            average_ats_score=avg_score,
            created_at=getattr(j, 'created_at', datetime.now(timezone.utc))
        ))
    return results

@router.post("/jobs", response_model=RecruiterJobOut)
def create_recruiter_job(
    data: RecruiterJobCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    if not data.title.strip() or not data.company.strip() or not data.description.strip():
        raise HTTPException(status_code=400, detail="Title, company, and description are required.")

    user_id = str(current_user.id) if current_user and current_user.id is not None else None
    
    # Extract keywords
    extracted = extract_keywords_from_jd(data.description)
    parsed_kw = {"keywords": extracted}

    job = JobDescription(
        id=str(uuid.uuid4()),
        user_id=user_id,
        title=data.title.strip(),
        company=data.company.strip(),
        raw_text=data.description.strip(),
        skills=data.skills or [],
        experience_level=data.experience_level or "Mid-Level",
        status="Active",
        parsed_keywords=parsed_kw
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    return RecruiterJobOut(
        id=str(job.id),
        title=str(job.title),
        company=str(job.company),
        description=str(job.raw_text),
        skills=list(data.skills or []),
        experience_level=str(getattr(job, 'experience_level', 'Mid-Level') or 'Mid-Level'),
        status="Active",
        candidate_count=0,
        average_ats_score=0.0,
        created_at=getattr(job, 'created_at', datetime.now(timezone.utc))
    )

@router.get("/jobs/{job_id}", response_model=RecruiterJobOut)
def get_recruiter_job(job_id: str, db: Session = Depends(get_db)):
    j = db.query(JobDescription).filter(JobDescription.id == job_id).first()
    if not j:
        raise HTTPException(status_code=404, detail="Job opening not found")
    
    analyses = db.query(Analysis).filter(Analysis.job_id == j.id).all()
    cand_count = len(analyses)
    avg_score = round(sum(float(str(a.overall_ats_score)) for a in analyses) / cand_count, 1) if cand_count > 0 else 0.0

    return RecruiterJobOut(
        id=str(j.id),
        title=str(j.title),
        company=str(j.company),
        description=str(j.raw_text),
        skills=list(getattr(j, 'skills', []) or []),
        experience_level=str(getattr(j, 'experience_level', 'Mid-Level') or 'Mid-Level'),
        status=str(getattr(j, 'status', 'Active') or 'Active'),
        candidate_count=cand_count,
        average_ats_score=avg_score,
        created_at=getattr(j, 'created_at', datetime.now(timezone.utc))
    )

@router.delete("/jobs/{job_id}")
def delete_recruiter_job(job_id: str, db: Session = Depends(get_db)):
    j = db.query(JobDescription).filter(JobDescription.id == job_id).first()
    if not j:
        raise HTTPException(status_code=404, detail="Job opening not found")
    db.delete(j)
    db.commit()
    return {"message": "Job opening deleted successfully"}

# --- BULK RESUME UPLOAD & SCREENING ENGINE ---
@router.post("/screen-batch")
async def screen_batch_resumes(
    job_id: str = Form(...),
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    if not files or len(files) == 0:
        raise HTTPException(status_code=400, detail="Please upload at least 1 resume.")
    if len(files) > 100:
        raise HTTPException(status_code=400, detail="Maximum 100 resumes per screening batch allowed.")

    job = db.query(JobDescription).filter(JobDescription.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Target job description not found")

    user_id = str(current_user.id) if current_user and current_user.id is not None else None
    screened_candidates = []

    for file in files:
        filename = file.filename or "Candidate_Resume.pdf"
        content = await file.read()
        if len(content) == 0:
            continue

        # Save to disk
        safe_name = f"{uuid.uuid4().hex}_{filename}"
        file_path = os.path.join(settings.UPLOAD_DIR, safe_name)
        with open(file_path, "wb") as f:
            f.write(content)

        # Parse Resume
        try:
            parsed_data = ResumeParser.parse_file(file_path, file_type=file.content_type)
        except Exception:
            # Fallback text parsing
            try:
                text_content = content.decode("utf-8", errors="ignore")
                parsed_data = ResumeParser.process_raw_text(text_content, filename)
            except Exception:
                continue

        cand_meta = extract_candidate_meta(parsed_data, filename)

        # Save candidate Resume
        resume = Resume(
            id=str(uuid.uuid4()),
            user_id=user_id,
            title=f"{cand_meta['name']} Resume",
            file_name=filename,
            file_path=file_path,
            file_size=len(content),
            file_type=file.content_type or "application/pdf",
            raw_text=parsed_data.get("raw_text", ""),
            parsed_sections=parsed_data.get("parsed_sections", {}),
            formatting_meta={
                "candidate_name": cand_meta["name"],
                "candidate_email": cand_meta["email"],
                "candidate_phone": cand_meta["phone"],
                "education": cand_meta["education"],
                **parsed_data.get("formatting_meta", {})
            }
        )
        db.add(resume)
        db.commit()
        db.refresh(resume)

        # Calculate Full ATS Analysis
        analysis_res = ATSScoringEngine.calculate_full_analysis(
            resume_data=parsed_data,
            jd_title=str(job.title),
            jd_company=str(job.company),
            jd_text=str(job.raw_text)
        )

        ai_summary = generate_ai_screening_summary(
            analysis_res=analysis_res,
            parsed_resume=parsed_data,
            jd_skills=list(getattr(job, 'skills', []) or [])
        )

        analysis = Analysis(
            id=str(uuid.uuid4()),
            user_id=user_id,
            resume_id=str(resume.id),
            job_id=str(job.id),
            overall_ats_score=float(analysis_res["overall_ats_score"]),
            job_match_score=float(analysis_res["job_match_score"]),
            keyword_match_score=float(analysis_res["keyword_match_score"]),
            quality_score=float(analysis_res["quality_score"]),
            summary=analysis_res["summary"],
            screening_summary=ai_summary
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)

        # Add score breakdown
        for sc in analysis_res.get("scores", []):
            db.add(AnalysisScore(
                id=str(uuid.uuid4()),
                analysis_id=str(analysis.id),
                category=sc["category"],
                score=float(sc["score"]),
                max_score=float(sc["max_score"]),
                status=sc["status"],
                explanation=sc.get("explanation")
            ))

        # Add skills
        for sk in analysis_res.get("skills", []):
            db.add(SkillGap(
                id=str(uuid.uuid4()),
                analysis_id=str(analysis.id),
                skill_name=sk["skill_name"],
                match_percentage=float(sk["match_percentage"]),
                priority=sk["priority"],
                in_resume=bool(sk["in_resume"]),
                in_job=bool(sk["in_job"])
            ))

        db.commit()

        # Skill match and experience match
        skill_score_entry = next((float(s["score"]) for s in analysis_res.get("scores", []) if s["category"] == "Skills Match"), 75.0)
        exp_score_entry = next((float(s["score"]) for s in analysis_res.get("scores", []) if s["category"] == "Experience Match"), 75.0)

        screened_candidates.append({
            "analysis_id": str(analysis.id),
            "resume_id": str(resume.id),
            "candidate_name": cand_meta["name"],
            "email": cand_meta["email"],
            "phone": cand_meta["phone"],
            "education": cand_meta["education"],
            "role": str(job.title),
            "job_title": str(job.title),
            "company": str(job.company),
            "ats_score": float(analysis_res["overall_ats_score"]),
            "match_score": float(analysis_res["job_match_score"]),
            "skill_match": skill_score_entry,
            "experience_match": exp_score_entry,
            "verified_skills": [str(s["skill_name"]) for s in analysis_res.get("skills", []) if s["in_resume"]],
            "missing_skills": [str(s["skill_name"]) for s in analysis_res.get("skills", []) if not s["in_resume"]],
            "strengths": ai_summary["strengths"],
            "concerns": ai_summary["concerns"],
            "created_at": analysis.created_at
        })

    # Sort descending by ATS Score
    screened_candidates.sort(key=lambda x: x["ats_score"], reverse=True)
    for idx, c in enumerate(screened_candidates, start=1):
        c["rank"] = idx

    return {
        "job_id": job_id,
        "job_title": str(job.title),
        "company": str(job.company),
        "total_screened": len(screened_candidates),
        "candidates": screened_candidates
    }

# --- CANDIDATE RANKING ENGINE & SEARCH ---
def fetch_ranked_candidates(
    db: Session,
    job_id: Optional[str] = None,
    min_score: Optional[float] = None,
    max_score: Optional[float] = None,
    skills: Optional[str] = None,
    experience_level: Optional[str] = None,
    education: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = "ats_score"
) -> List[CandidateRankingItem]:
    query = db.query(Analysis)
    if job_id:
        query = query.filter(Analysis.job_id == job_id)
    if min_score is not None and min_score > 0:
        query = query.filter(Analysis.overall_ats_score >= min_score)
    if max_score is not None and max_score < 100:
        query = query.filter(Analysis.overall_ats_score <= max_score)

    analyses = query.all()
    candidates_list: List[Dict[str, Any]] = []

    for a in analyses:
        r = db.query(Resume).filter(Resume.id == a.resume_id).first()
        j = db.query(JobDescription).filter(JobDescription.id == a.job_id).first()
        if not r or not j:
            continue

        meta = getattr(r, "formatting_meta", {}) or {}
        cand_name = str(meta.get("candidate_name") or str(r.title).replace("Resume", "").strip() or "Candidate")
        cand_email = str(meta.get("candidate_email") or f"{cand_name.lower().replace(' ', '.')}@example.com")
        cand_phone = str(meta.get("candidate_phone") or "N/A")
        cand_edu = str(meta.get("education") or "B.S. in Computer Science")

        scores = db.query(AnalysisScore).filter(AnalysisScore.analysis_id == a.id).all()
        skill_score = next((float(str(s.score)) for s in scores if str(s.category) == "Skills Match"), float(str(a.job_match_score)))
        exp_score = next((float(str(s.score)) for s in scores if str(s.category) == "Experience Match"), float(str(a.overall_ats_score)))

        skills_records = db.query(SkillGap).filter(SkillGap.analysis_id == a.id).all()
        v_skills = [str(sk.skill_name) for sk in skills_records if bool(sk.in_resume)]
        m_skills = [str(sk.skill_name) for sk in skills_records if not bool(sk.in_resume)]

        ai_summary = getattr(a, "screening_summary", None) or {
            "strengths": ["Strong foundational background", "Parsable single-column layout"],
            "concerns": ["Review recommended for specialized technologies"],
            "recommendation": "Review Recommended"
        }

        # Filtering logic
        if search:
            s_low = search.lower()
            if s_low not in cand_name.lower() and s_low not in cand_email.lower() and s_low not in str(j.title).lower():
                continue

        if skills:
            req_skills = [s.strip().lower() for s in skills.split(",") if s.strip()]
            cand_skills_low = [sk.lower() for sk in v_skills]
            if not any(req in cand_skills_low for req in req_skills):
                continue

        if education and education.lower() != "all":
            if education.lower() not in cand_edu.lower():
                continue

        candidates_list.append({
            "analysis_id": str(a.id),
            "resume_id": str(r.id),
            "candidate_name": cand_name,
            "email": cand_email,
            "phone": cand_phone,
            "education": cand_edu,
            "role": str(j.title),
            "job_title": str(j.title),
            "company": str(j.company),
            "ats_score": round(float(str(a.overall_ats_score)), 1),
            "match_score": round(float(str(a.job_match_score)), 1),
            "skill_match": round(float(str(skill_score)), 1),
            "experience_match": round(float(str(exp_score)), 1),
            "verified_skills": v_skills,
            "missing_skills": m_skills,
            "strengths": list(ai_summary.get("strengths", [])),
            "concerns": list(ai_summary.get("concerns", [])),
            "created_at": a.created_at
        })

    # Sort descending by requested key
    sort_key = "ats_score"
    if sort_by in ["match_score", "skill_match", "experience_match"]:
        sort_key = sort_by
    candidates_list.sort(key=lambda x: x[sort_key], reverse=True)

    # Assign rank
    ranking_items: List[CandidateRankingItem] = []
    for idx, c in enumerate(candidates_list, start=1):
        c["rank"] = idx
        ranking_items.append(CandidateRankingItem(**c))

    return ranking_items

@router.get("/candidates", response_model=List[CandidateRankingItem])
def get_ranked_candidates(
    job_id: Optional[str] = None,
    min_score: Optional[float] = Query(0.0),
    max_score: Optional[float] = Query(100.0),
    skills: Optional[str] = Query(None),
    experience_level: Optional[str] = Query(None),
    education: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("ats_score"), # ats_score, match_score, skill_match, experience_match
    db: Session = Depends(get_db)
):
    return fetch_ranked_candidates(
        db=db,
        job_id=job_id,
        min_score=min_score,
        max_score=max_score,
        skills=skills,
        experience_level=experience_level,
        education=education,
        search=search,
        sort_by=sort_by
    )

# --- CANDIDATE DETAIL VIEW ---
@router.get("/candidates/{analysis_id}", response_model=CandidateDetailOut)
def get_candidate_detail(analysis_id: str, db: Session = Depends(get_db)):
    a = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Candidate analysis not found")

    r = db.query(Resume).filter(Resume.id == a.resume_id).first()
    j = db.query(JobDescription).filter(JobDescription.id == a.job_id).first()
    if not r or not j:
        raise HTTPException(status_code=404, detail="Resume or job description missing")

    meta = r.formatting_meta or {}
    cand_name = str(meta.get("candidate_name") or r.title.replace("Resume", "").strip() or "Candidate")
    cand_email = str(meta.get("candidate_email") or f"{cand_name.lower().replace(' ', '.')}@example.com")
    cand_phone = str(meta.get("candidate_phone") or "Available on request")
    cand_edu = str(meta.get("education") or "B.S. in Computer Science")

    scores = db.query(AnalysisScore).filter(AnalysisScore.analysis_id == a.id).all()
    skill_score = next((float(str(s.score)) for s in scores if str(s.category) == "Skills Match"), float(str(a.job_match_score)))
    exp_score = next((float(str(s.score)) for s in scores if str(s.category) == "Experience Match"), float(str(a.overall_ats_score)))

    skills_records = db.query(SkillGap).filter(SkillGap.analysis_id == a.id).all()
    missing_skills_data = [
        {"skill_name": str(sk.skill_name), "priority": str(sk.priority), "match_percentage": float(str(sk.match_percentage))}
        for sk in skills_records if not bool(sk.in_resume)
    ]
    verified_skills_data = [
        {"skill_name": str(sk.skill_name), "priority": str(sk.priority), "match_percentage": float(str(sk.match_percentage))}
        for sk in skills_records if bool(sk.in_resume)
    ]

    ai_summary = a.screening_summary or {
        "strengths": ["Demonstrates strong software engineering skills", "Standard clear section organization"],
        "concerns": ["Review recommended for target cloud infrastructure"],
        "recommendation": "Review Recommended"
    }

    return CandidateDetailOut(
        analysis_id=str(a.id),
        resume_id=str(r.id),
        candidate_name=cand_name,
        email=cand_email,
        phone=cand_phone,
        education=cand_edu,
        job_title=str(j.title),
        company=str(j.company),
        ats_score=round(float(str(a.overall_ats_score)), 1),
        match_score=round(float(str(a.job_match_score)), 1),
        skill_match=round(float(str(skill_score)), 1),
        experience_match=round(float(str(exp_score)), 1),
        raw_resume=str(r.raw_text or ""),
        parsed_sections=dict(getattr(r, 'parsed_sections', {}) or {}),
        match_explanation=str(a.summary or f"Candidate scored {a.overall_ats_score} ATS compatibility for {j.title} at {j.company}."),
        missing_skills=missing_skills_data,
        verified_skills=verified_skills_data,
        strengths=list(ai_summary.get("strengths", [])),
        concerns=list(ai_summary.get("concerns", [])),
        scores=[{"category": str(s.category), "score": float(str(s.score)), "status": str(s.status), "explanation": str(s.explanation)} for s in scores],
        created_at=getattr(a, 'created_at', datetime.now(timezone.utc))
    )


# --- EXPORT LEADERBOARD CSV ---
@router.get("/export/csv")
def export_candidates_csv(
    job_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    candidates = fetch_ranked_candidates(db=db, job_id=job_id)
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Rank", "Candidate Name", "Email", "Phone", "Education",
        "Target Role", "Company", "ATS Score", "Job Match Score",
        "Skill Match", "Experience Match", "Key Strengths", "Key Concerns", "Missing Skills"
    ])

    for c in candidates:
        writer.writerow([
            c.rank,
            c.candidate_name,
            c.email,
            c.phone or "N/A",
            c.education or "N/A",
            c.job_title,
            c.company,
            f"{c.ats_score:.1f}",
            f"{c.match_score:.1f}",
            f"{c.skill_match:.1f}",
            f"{c.experience_match:.1f}",
            " | ".join(c.strengths),
            " | ".join(c.concerns),
            ", ".join(c.missing_skills[:5])
        ])

    output.seek(0)
    filename = f"ResumeIQ_Candidate_Leaderboard_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

# --- EXPORT LEADERBOARD PDF ---
@router.get("/export/pdf")
def export_candidates_pdf(
    job_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    candidates = fetch_ranked_candidates(db=db, job_id=job_id)
    
    job_title = "All Active Openings"
    company = "ResumeIQ Recruiter Portal"
    if job_id:
        j = db.query(JobDescription).filter(JobDescription.id == job_id).first()
        if j:
            job_title = str(j.title)
            company = str(j.company)

    cand_dicts = [c.model_dump() for c in candidates]
    output_path = os.path.join(settings.UPLOAD_DIR, f"recruiter_leaderboard_{uuid.uuid4().hex}.pdf")
    
    PDFReportService.generate_recruiter_leaderboard_pdf(
        job_title=job_title,
        company=company,
        candidates=cand_dicts,
        output_path=output_path
    )

    if not os.path.exists(output_path):
        raise HTTPException(status_code=500, detail="Failed to render recruiter PDF report")

    filename = f"ResumeIQ_Candidate_Screening_Report_{datetime.now().strftime('%Y%m%d')}.pdf"
    return FileResponse(
        output_path,
        media_type="application/pdf",
        filename=filename
    )
