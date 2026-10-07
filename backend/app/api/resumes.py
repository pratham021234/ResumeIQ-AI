import os
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user_optional
from app.models.models import Resume, ResumeVersion, User
from app.schemas.schemas import ResumeOut, ResumeUpdate
from app.parsers.resume_parser import ResumeParser
from app.core.config import settings

router = APIRouter(prefix="/resumes", tags=["Resumes"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".txt"}

@router.post("/upload", response_model=ResumeOut)
async def upload_resume(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    # Validate extension
    filename = file.filename or "resume.pdf"
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Please upload a PDF or DOCX file."
        )

    # Read content
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum limit of 10MB."
        )

    # Save to disk
    safe_filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)
    with open(file_path, "wb") as f:
        f.write(content)

    # Parse resume
    try:
        parsed_data = ResumeParser.parse_file(file_path, file_type=file.content_type)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to parse resume: {str(e)}"
        )

    resume_title = title or os.path.splitext(filename)[0].replace("_", " ").title()
    user_id = current_user.id if current_user else None

    # Save to database
    resume = Resume(
        id=str(uuid.uuid4()),
        user_id=user_id,
        title=resume_title,
        file_name=filename,
        file_path=file_path,
        file_size=len(content),
        file_type=file.content_type or ("application/pdf" if ext == ".pdf" else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
        raw_text=parsed_data.get("raw_text", ""),
        parsed_sections=parsed_data.get("parsed_sections", {}),
        formatting_meta=parsed_data.get("formatting_meta", {})
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    # Create initial version
    version = ResumeVersion(
        id=str(uuid.uuid4()),
        resume_id=resume.id,
        version_num=1,
        title="Initial Upload",
        content_json={"raw_text": resume.raw_text, "parsed_sections": resume.parsed_sections},
        notes="Uploaded original resume file"
    )
    db.add(version)
    db.commit()

    if user_id:
        from app.services.billing_service import BillingService
        from app.services.analytics_service import AnalyticsService
        BillingService.increment_resume_upload(user_id, db)
        try:
            AnalyticsService.track_resume_upload(user_id, str(resume.id), str(resume.file_type), int(resume.file_size or 0), db)
        except Exception as e:
            print(f"Warning: Analytics resume upload tracking failed: {e}")

    return ResumeOut.model_validate(resume)


@router.get("", response_model=List[ResumeOut])
def get_all_resumes(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    user_id = str(current_user.id) if current_user and current_user.id is not None else None
    if user_id is not None:
        resumes = db.query(Resume).filter((Resume.user_id == user_id) | (Resume.user_id.is_(None))).order_by(Resume.created_at.desc()).all()
    else:
        resumes = db.query(Resume).order_by(Resume.created_at.desc()).all()
    return [ResumeOut.model_validate(r) for r in resumes]

@router.get("/{resume_id}", response_model=ResumeOut)
def get_resume(
    resume_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return ResumeOut.model_validate(resume)

@router.put("/{resume_id}", response_model=ResumeOut)
def update_resume(
    resume_id: str,
    data: ResumeUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    if data.title:
        setattr(resume, "title", data.title)
    if data.raw_text:
        setattr(resume, "raw_text", data.raw_text)
    if data.parsed_sections is not None:
        setattr(resume, "parsed_sections", data.parsed_sections)

    # Count existing versions to create next version
    ver_count = db.query(ResumeVersion).filter(ResumeVersion.resume_id == resume.id).count()
    new_version = ResumeVersion(
        id=str(uuid.uuid4()),
        resume_id=resume.id,
        version_num=ver_count + 1,
        title=f"Version {ver_count + 1} — Updated in Editor",
        content_json={"raw_text": resume.raw_text, "parsed_sections": resume.parsed_sections},
        notes="Saved revisions from Resume Improvement Editor"
    )
    db.add(new_version)
    db.commit()
    db.refresh(resume)

    return ResumeOut.model_validate(resume)

@router.post("/{resume_id}/duplicate", response_model=ResumeOut)
def duplicate_resume(
    resume_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    source = db.query(Resume).filter(Resume.id == resume_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source resume not found")

    user_id = current_user.id if current_user else None
    new_resume = Resume(
        id=str(uuid.uuid4()),
        user_id=user_id,
        title=f"{source.title} (Copy)",
        file_name=source.file_name,
        file_path=source.file_path,
        file_size=source.file_size,
        file_type=source.file_type,
        raw_text=source.raw_text,
        parsed_sections=source.parsed_sections,
        formatting_meta=source.formatting_meta
    )
    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)

    # Initial version
    db.add(ResumeVersion(
        id=str(uuid.uuid4()),
        resume_id=new_resume.id,
        version_num=1,
        title="Duplicated Version",
        content_json={"raw_text": new_resume.raw_text, "parsed_sections": new_resume.parsed_sections},
        notes=f"Cloned from {source.title}"
    ))
    db.commit()

    return ResumeOut.model_validate(new_resume)

@router.delete("/{resume_id}")
def delete_resume(
    resume_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    db.delete(resume)
    db.commit()
    return {"status": "success", "message": "Resume deleted successfully"}
