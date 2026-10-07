import os
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.models import Report, Analysis, Resume, JobDescription
from app.schemas.schemas import ReportOut
from app.services.pdf_report_service import PDFReportService
from app.core.config import settings

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/{analysis_id}/pdf")
def download_report_pdf(analysis_id: str, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.analysis_id == analysis_id).order_by(Report.created_at.desc()).first()
    
    if not report or not os.path.exists(report.file_path):
        # Generate on-the-fly if missing
        analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis report not found")
        
        resume = db.query(Resume).filter(Resume.id == analysis.resume_id).first()
        job = db.query(JobDescription).filter(JobDescription.id == analysis.job_id).first()
        
        pdf_path = os.path.join(settings.UPLOAD_DIR, "reports", f"{analysis_id}_report.pdf")
        analysis_data = {
            "overall_ats_score": analysis.overall_ats_score,
            "job_match_score": analysis.job_match_score,
            "keyword_match_score": analysis.keyword_match_score,
            "quality_score": analysis.quality_score,
            "summary": analysis.summary,
            "resume_title": resume.title if resume else "Resume.pdf",
            "job_title": job.title if job else "Role",
            "company_name": job.company if job else "Company",
            "keywords": [{"keyword": k.keyword, "category": k.category} for k in analysis.keywords],
            "issues": [{"severity": i.severity, "category": i.category, "title": i.title, "description": i.description, "recommendation": i.recommendation} for i in analysis.issues],
            "recommendations": [{"section": r.section, "title": r.title, "action_item": r.action_item} for r in analysis.recommendations],
            "created_at": analysis.created_at.isoformat()
        }
        PDFReportService.generate_analysis_pdf(analysis_data, pdf_path)
        return FileResponse(
            pdf_path,
            media_type="application/pdf",
            filename=f"ResumeIQ_Analysis_{job.company if job else 'Report'}.pdf"
        )

    return FileResponse(
        report.file_path,
        media_type="application/pdf",
        filename=os.path.basename(report.file_path)
    )

@router.get("/{analysis_id}", response_model=ReportOut)
def get_report_meta(analysis_id: str, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.analysis_id == analysis_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report metadata not found")
    return ReportOut.model_validate(report)
