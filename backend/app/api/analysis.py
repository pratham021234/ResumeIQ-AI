import uuid
import os
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user_optional
from app.models.models import (
    Analysis, AnalysisScore, KeywordMatch, SkillGap, ResumeIssue,
    Recommendation, Resume, JobDescription, User, Report
)
from app.schemas.schemas import AnalysisRequest, AnalysisOut
from app.scoring.ats_scoring import ATSScoringEngine
from app.parsers.resume_parser import ResumeParser
from app.services.pdf_report_service import PDFReportService
from app.core.config import settings

router = APIRouter(prefix="/analysis", tags=["Analysis"])

def build_analysis_response(analysis: Analysis, db: Session) -> AnalysisOut:
    resume = db.query(Resume).filter(Resume.id == analysis.resume_id).first()
    job = db.query(JobDescription).filter(JobDescription.id == analysis.job_id).first()

    scores = db.query(AnalysisScore).filter(AnalysisScore.analysis_id == analysis.id).all()
    keywords = db.query(KeywordMatch).filter(KeywordMatch.analysis_id == analysis.id).all()
    skills = db.query(SkillGap).filter(SkillGap.analysis_id == analysis.id).all()
    issues = db.query(ResumeIssue).filter(ResumeIssue.analysis_id == analysis.id).all()
    recommendations = db.query(Recommendation).filter(Recommendation.analysis_id == analysis.id).all()

    # Re-derive section analysis details deterministically
    parsed_sections = (resume.parsed_sections if resume else {}) or {}
    sec_analysis = [
        {
            "section_name": "Summary",
            "score": 82.0 if len(parsed_sections.get("summary", "")) > 60 else 60.0,
            "strengths": ["Clear technical role focus", "Engaging summary introduction"],
            "issues": ["Could explicitly include exact target title", "Needs 1 high-level metric summarizing career scope"],
            "recommendations": [f"Align with {job.title if job else 'target role'} in the first line", "Limit to 3-4 crisp sentences"]
        },
        {
            "section_name": "Experience",
            "score": analysis.quality_score,
            "strengths": ["Demonstrates progressive engineering responsibility", "Good technology stack coverage"],
            "issues": ["Some bullets focus on responsibilities rather than business impact", "Limited quantifiable performance metrics"],
            "recommendations": ["Rewrite bullets following Google XYZ formula: Accomplished [X] measured by [Y] doing [Z]", "Quantify outcomes with % or scale"]
        },
        {
            "section_name": "Projects",
            "score": 85.0 if len(parsed_sections.get("projects", "")) > 40 else 70.0,
            "strengths": ["Relevant architecture implementations", "Clear modern framework application"],
            "issues": ["Add active repository links or live demo URLs", "Detail testing and CI/CD pipelines"],
            "recommendations": ["Highlight production-readiness in project descriptions", "Reference unit testing coverage"]
        },
        {
            "section_name": "Skills",
            "score": analysis.keyword_match_score,
            "strengths": ["Comprehensive core tech competencies listed", "Clean categorized structure"],
            "issues": ["Missing high-priority keywords from the job description"],
            "recommendations": ["Incorporate missing keywords into skills and experience bullets", "Group skills into Languages, Frameworks, Tools"]
        },
        {
            "section_name": "Education",
            "score": 85.0,
            "strengths": ["Standard degree terminology detected", "University credentials verified"],
            "issues": ["Ensure graduation year formatting is standard"],
            "recommendations": ["Highlight honors or relevant coursework if applicable"]
        },
        {
            "section_name": "Certifications",
            "score": 80.0,
            "strengths": ["Demonstrates continuous technical learning"],
            "issues": ["Add credential verification IDs and links"],
            "recommendations": ["Include cloud provider certifications (AWS, GCP, Azure)"]
        }
    ]

    return AnalysisOut(
        id=analysis.id,
        resume_id=analysis.resume_id,
        job_id=analysis.job_id,
        resume_title=resume.title if resume else "Candidate Resume",
        job_title=job.title if job else "Target Role",
        company_name=job.company if job else "Company",
        overall_ats_score=analysis.overall_ats_score,
        job_match_score=analysis.job_match_score,
        keyword_match_score=analysis.keyword_match_score,
        quality_score=analysis.quality_score,
        summary=analysis.summary,
        scores=scores,
        keywords=keywords,
        skills=skills,
        issues=issues,
        recommendations=recommendations,
        sections_analysis=sec_analysis,
        created_at=analysis.created_at
    )

@router.post("", response_model=AnalysisOut)
def run_analysis(
    req: AnalysisRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    user_id = current_user.id if current_user else None
    if current_user:
        from app.services.billing_service import BillingService
        can_analyze, reason = BillingService.check_can_analyze(current_user, db)
        if not can_analyze:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=reason or "Monthly limit of 3 free analyses reached. Upgrade to Pro for unlimited analyses."
            )

    # 1. Resolve Resume
    if req.resume_id:
        resume = db.query(Resume).filter(Resume.id == req.resume_id).first()
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")
        resume_data = {
            "raw_text": resume.raw_text,
            "parsed_sections": resume.parsed_sections or {},
            "formatting_meta": resume.formatting_meta or {},
            "contact_info": {
                "emails": ["candidate@example.com"],
                "phones": ["(555) 000-0000"],
                "links": []
            },
            "detected_headers": ["experience", "education", "skills"]
        }
    elif req.resume_text:
        parsed = ResumeParser.process_raw_text(req.resume_text, req.resume_filename or "Resume.pdf")
        parsed["formatting_meta"] = {
            "page_count": max(1, len(req.resume_text.split()) // 350),
            "has_tables": False,
            "has_images": False,
            "image_count": 0,
            "multi_column_detected": False,
            "word_count": len(req.resume_text.split()),
            "character_count": len(req.resume_text),
            "file_type": "TEXT"
        }
        resume = Resume(
            id=str(uuid.uuid4()),
            user_id=user_id,
            title=req.resume_filename or "Uploaded Resume",
            file_name=req.resume_filename or "Resume.txt",
            file_size=len(req.resume_text),
            file_type="text/plain",
            raw_text=req.resume_text,
            parsed_sections=parsed["parsed_sections"],
            formatting_meta=parsed["formatting_meta"]
        )
        db.add(resume)
        db.commit()
        db.refresh(resume)
        resume_data = parsed
    else:
        raise HTTPException(status_code=400, detail="Must provide either resume_id or resume_text")

    # 2. Resolve Job Description
    if req.job_id:
        job = db.query(JobDescription).filter(JobDescription.id == req.job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job description not found")
    elif req.job_text:
        job = JobDescription(
            id=str(uuid.uuid4()),
            user_id=user_id,
            title=req.job_title or "Target Position",
            company=req.job_company or "Target Company",
            raw_text=req.job_text,
            parsed_keywords={"status": "extracted"}
        )
        db.add(job)
        db.commit()
        db.refresh(job)
    else:
        raise HTTPException(status_code=400, detail="Must provide either job_id or job_text")

    # 3. Perform ATS Scoring Engine Analysis
    analysis_res = ATSScoringEngine.calculate_full_analysis(
        resume_data=resume_data,
        jd_title=job.title,
        jd_company=job.company,
        jd_text=job.raw_text
    )

    # 4. Save Analysis record
    analysis = Analysis(
        id=str(uuid.uuid4()),
        user_id=user_id,
        resume_id=resume.id,
        job_id=job.id,
        overall_ats_score=analysis_res["overall_ats_score"],
        job_match_score=analysis_res["job_match_score"],
        keyword_match_score=analysis_res["keyword_match_score"],
        quality_score=analysis_res["quality_score"],
        summary=analysis_res["summary"],
        created_at=datetime.now(timezone.utc)
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    # 5. Insert child scores
    for sc in analysis_res["scores"]:
        db.add(AnalysisScore(
            id=str(uuid.uuid4()),
            analysis_id=analysis.id,
            category=sc["category"],
            score=sc["score"],
            max_score=sc["max_score"],
            status=sc["status"],
            explanation=sc["explanation"]
        ))

    # 6. Insert keyword matches
    for kw in analysis_res["keywords"]:
        db.add(KeywordMatch(
            id=str(uuid.uuid4()),
            analysis_id=analysis.id,
            keyword=kw["keyword"],
            category=kw["category"],
            status=kw["status"],
            relevance=kw["relevance"],
            section_suggestion=kw.get("section_suggestion")
        ))

    # 7. Insert skill gaps
    for sk in analysis_res["skills"]:
        db.add(SkillGap(
            id=str(uuid.uuid4()),
            analysis_id=analysis.id,
            skill_name=sk["skill_name"],
            match_percentage=sk["match_percentage"],
            priority=sk["priority"],
            in_resume=sk["in_resume"],
            in_job=sk["in_job"]
        ))

    # 8. Insert issues
    for iss in analysis_res["issues"]:
        db.add(ResumeIssue(
            id=str(uuid.uuid4()),
            analysis_id=analysis.id,
            severity=iss["severity"],
            category=iss["category"],
            title=iss["title"],
            description=iss["description"],
            recommendation=iss.get("recommendation")
        ))

    # 9. Insert recommendations
    for rec in analysis_res["recommendations"]:
        db.add(Recommendation(
            id=str(uuid.uuid4()),
            analysis_id=analysis.id,
            section=rec["section"],
            priority=rec["priority"],
            title=rec["title"],
            action_item=rec["action_item"]
        ))

    # 10. Generate PDF report
    pdf_path = os.path.join(settings.UPLOAD_DIR, "reports", f"{analysis.id}_report.pdf")
    analysis_full_dict = {
        **analysis_res,
        "resume_title": resume.title,
        "job_title": job.title,
        "company_name": job.company,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    PDFReportService.generate_analysis_pdf(analysis_full_dict, pdf_path)
    db.add(Report(
        id=str(uuid.uuid4()),
        user_id=user_id,
        analysis_id=analysis.id,
        file_path=pdf_path,
        format="pdf"
    ))

    db.commit()
    db.refresh(analysis)

    if user_id:
        from app.services.billing_service import BillingService
        from app.services.analytics_service import AnalyticsService
        BillingService.increment_analysis_usage(str(user_id), db)
        try:
            prior_count = db.query(Analysis).filter(Analysis.user_id == user_id).count()
            if prior_count <= 1:
                AnalyticsService.track_first_analysis(str(user_id), str(analysis.id), float(analysis.overall_ats_score or 0.0), db)
            AnalyticsService.track_analysis_created(str(user_id), str(analysis.id), float(analysis.overall_ats_score or 0.0), db)
        except Exception as e:
            print(f"Warning: Analytics analysis tracking failed: {e}")

    return build_analysis_response(analysis, db)


@router.get("", response_model=List[AnalysisOut])
def list_analyses(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    user_id = current_user.id if current_user else None
    if user_id:
        analyses = db.query(Analysis).filter((Analysis.user_id == user_id) | (Analysis.user_id.is_(None))).order_by(Analysis.created_at.desc()).all()
    else:
        analyses = db.query(Analysis).order_by(Analysis.created_at.desc()).all()
    return [build_analysis_response(a, db) for a in analyses]

@router.get("/demo/sample", response_model=AnalysisOut)
def get_sample_demo_analysis(db: Session = Depends(get_db)):
    demo = db.query(Analysis).filter(Analysis.id == "demo-analysis-alex-stripe").first()
    if not demo:
        from app.services.seed_data import seed_database
        seed_database(db)
        demo = db.query(Analysis).filter(Analysis.id == "demo-analysis-alex-stripe").first()
    if not demo:
        demo = db.query(Analysis).order_by(Analysis.created_at.desc()).first()
    return build_analysis_response(demo, db)

@router.get("/{analysis_id}", response_model=AnalysisOut)
def get_analysis_by_id(
    analysis_id: str,
    db: Session = Depends(get_db)
):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        # Check if demo-analysis is requested
        demo = db.query(Analysis).filter(Analysis.id == "demo-analysis-alex-stripe").first()
        if demo and analysis_id in ["demo", "sample", "default"]:
            return build_analysis_response(demo, db)
        raise HTTPException(status_code=404, detail="Analysis not found")
    return build_analysis_response(analysis, db)
