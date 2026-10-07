import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user_optional
from app.models.models import JobDescription, User
from app.schemas.schemas import JobDescriptionCreate, JobDescriptionOut
from app.scoring.keyword_extractor import extract_keywords_from_jd

router = APIRouter(prefix="/jobs", tags=["Job Descriptions"])

@router.post("", response_model=JobDescriptionOut)
def create_job_description(
    data: JobDescriptionCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    user_id = current_user.id if current_user else None
    extracted = extract_keywords_from_jd(data.raw_text)

    jd = JobDescription(
        id=str(uuid.uuid4()),
        user_id=user_id,
        title=data.title.strip(),
        company=data.company.strip(),
        raw_text=data.raw_text.strip(),
        parsed_keywords={"keywords": extracted}
    )
    db.add(jd)
    db.commit()
    db.refresh(jd)

    return JobDescriptionOut.model_validate(jd)

@router.get("", response_model=List[JobDescriptionOut])
def list_job_descriptions(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    user_id = current_user.id if current_user else None
    if user_id:
        jds = db.query(JobDescription).filter((JobDescription.user_id == user_id) | (JobDescription.user_id.is_(None))).order_by(JobDescription.created_at.desc()).all()
    else:
        jds = db.query(JobDescription).order_by(JobDescription.created_at.desc()).all()
    return [JobDescriptionOut.model_validate(j) for j in jds]

@router.get("/{job_id}", response_model=JobDescriptionOut)
def get_job_description(
    job_id: str,
    db: Session = Depends(get_db)
):
    jd = db.query(JobDescription).filter(JobDescription.id == job_id).first()
    if not jd:
        raise HTTPException(status_code=404, detail="Job description not found")
    return JobDescriptionOut.model_validate(jd)

@router.delete("/{job_id}")
def delete_job_description(
    job_id: str,
    db: Session = Depends(get_db)
):
    jd = db.query(JobDescription).filter(JobDescription.id == job_id).first()
    if not jd:
        raise HTTPException(status_code=404, detail="Job description not found")
    db.delete(jd)
    db.commit()
    return {"status": "success", "message": "Job description deleted"}
