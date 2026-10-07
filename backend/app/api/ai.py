import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user_optional
from app.models.models import CoverLetter, Resume, JobDescription, User
from app.schemas.schemas import (
    BulletImproveRequest, BulletImproveResponse,
    TextRewriteRequest, TextRewriteResponse,
    CoverLetterRequest, CoverLetterResponse
)
from app.ai.gemini_service import AIService

router = APIRouter(prefix="/ai", tags=["AI Engine"])

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
        if r:
            resume_text = r.raw_text or ""

    result = AIService.generate_cover_letter(
        resume_text=resume_text,
        job_title=data.job_title,
        company=data.company,
        job_description=data.job_description,
        tone=data.tone or "Professional",
        length=data.length or "Standard"
    )

    user_id = current_user.id if current_user else None
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
        id=cover_letter.id,
        title=cover_letter.title,
        content=cover_letter.content,
        tone=cover_letter.tone,
        length=cover_letter.length,
        created_at=cover_letter.created_at
    )

@router.get("/cover-letters", response_model=List[CoverLetterResponse])
def list_cover_letters(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    user_id = current_user.id if current_user else None
    if user_id:
        cls = db.query(CoverLetter).filter((CoverLetter.user_id == user_id) | (CoverLetter.user_id.is_(None))).order_by(CoverLetter.created_at.desc()).all()
    else:
        cls = db.query(CoverLetter).order_by(CoverLetter.created_at.desc()).all()
    return [
        CoverLetterResponse(
            id=c.id,
            title=c.title,
            content=c.content,
            tone=c.tone,
            length=c.length,
            created_at=c.created_at
        )
        for c in cls
    ]
