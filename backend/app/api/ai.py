import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user_optional
from app.models.models import CoverLetter, Resume, ResumeVersion, JobDescription, User
from app.schemas.schemas import (
    BulletImproveRequest, BulletImproveResponse,
    TextRewriteRequest, TextRewriteResponse,
    CoverLetterRequest, CoverLetterResponse,
    ResumeTailorRequest, ResumeTailorResponse
)
from app.ai.gemini_service import AIService
from app.ai.tailor_service import ResumeTailorService

router = APIRouter(prefix="/ai", tags=["AI Engine"])

@router.post("/tailor", response_model=ResumeTailorResponse)
def tailor_resume_endpoint(
    data: ResumeTailorRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    resume_text = data.resume_text or ""
    if not resume_text and data.resume_id:
        r = db.query(Resume).filter(Resume.id == data.resume_id).first()
        if r is not None and r.raw_text is not None:
            resume_text = str(r.raw_text)
    
    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="Must provide either resume_text or a valid resume_id.")
    if not data.job_description.strip() or not data.job_title.strip():
        raise HTTPException(status_code=400, detail="Must provide target job title and job description.")

    result = ResumeTailorService.tailor_resume(
        original_resume_text=resume_text,
        job_title=data.job_title,
        company=data.company,
        job_description=data.job_description
    )

    # Save tailored resume into database library
    user_id = str(current_user.id) if current_user and current_user.id is not None else None
    new_resume = Resume(
        id=str(uuid.uuid4()),
        user_id=user_id,
        title=f"{data.job_title} Tailored Resume — {data.company}",
        file_name=f"Tailored_{data.company}_{data.job_title.replace(' ', '_')}.pdf",
        file_size=len(result["tailored_resume"]),
        file_type="application/pdf",
        raw_text=result["tailored_resume"],
        parsed_sections=result["tailored_sections"],
        formatting_meta={"is_tailored": True, "target_job": data.job_title, "target_company": data.company}
    )
    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)

    # Add initial version
    db.add(ResumeVersion(
        id=str(uuid.uuid4()),
        resume_id=str(new_resume.id),
        version_num=1,
        title=f"AI Tailored for {data.job_title} at {data.company}",
        content_json={"raw_text": new_resume.raw_text, "sections": new_resume.parsed_sections},
        notes=f"Auto-generated via AI Resume Tailor against {data.company} job requirements."
    ))
    db.commit()

    return ResumeTailorResponse(
        original_resume=result["original_resume"],
        tailored_resume=result["tailored_resume"],
        job_title=result["job_title"],
        company=result["company"],
        tailored_sections=result["tailored_sections"],
        change_log=result["change_log"],
        ats_forecast=result["ats_forecast"],
        new_resume_id=str(new_resume.id)
    )

@router.post("/improve-bullet", response_model=BulletImproveResponse)
def improve_bullet(data: BulletImproveRequest):
    if not data.bullet or not data.bullet.strip():
        raise HTTPException(status_code=400, detail="Bullet point text cannot be empty.")
    result = AIService.improve_bullet(
        bullet=data.bullet,
        job_context=data.job_context,
        style=data.style or "achievement"
    )
    return BulletImproveResponse(**result)

@router.post("/rewrite", response_model=TextRewriteResponse)
def rewrite_text(data: TextRewriteRequest):
    if not data.text or not data.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")
    result = AIService.rewrite_section(
        text=data.text,
        instruction=data.instruction,
        context=data.context
    )
    return TextRewriteResponse(**result)

@router.post("/cover-letter", response_model=CoverLetterResponse)
def create_cover_letter(
    data: CoverLetterRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    resume_text = data.resume_text or ""
    if not resume_text and data.resume_id:
        r = db.query(Resume).filter(Resume.id == data.resume_id).first()
        if r is not None and r.raw_text is not None:
            resume_text = str(r.raw_text)

    result = AIService.generate_cover_letter(
        resume_text=resume_text,
        job_title=data.job_title,
        company=data.company,
        job_description=data.job_description,
        tone=data.tone or "Professional",
        length=data.length or "Standard"
    )

    user_id = str(current_user.id) if current_user and current_user.id is not None else None
    cover_letter = CoverLetter(
        id=str(uuid.uuid4()),
        user_id=user_id,
        resume_id=data.resume_id,
        title=result["title"],
        content=result["content"],
        tone=result["tone"],
        length=result["length"]
    )
    db.add(cover_letter)
    db.commit()
    db.refresh(cover_letter)

    return CoverLetterResponse(
        id=str(cover_letter.id),
        title=str(cover_letter.title),
        content=str(cover_letter.content),
        tone=str(cover_letter.tone),
        length=str(cover_letter.length),
        created_at=getattr(cover_letter, 'created_at', None)
    )

@router.get("/cover-letters", response_model=List[CoverLetterResponse])
def list_cover_letters(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    user_id = str(current_user.id) if current_user and current_user.id is not None else None
    if user_id is not None:
        cls = db.query(CoverLetter).filter((CoverLetter.user_id == user_id) | (CoverLetter.user_id.is_(None))).order_by(CoverLetter.created_at.desc()).all()
    else:
        cls = db.query(CoverLetter).order_by(CoverLetter.created_at.desc()).all()
    return [
        CoverLetterResponse(
            id=str(c.id),
            title=str(c.title),
            content=str(c.content),
            tone=str(c.tone),
            length=str(c.length),
            created_at=getattr(c, 'created_at', None)
        )
        for c in cls
    ]

