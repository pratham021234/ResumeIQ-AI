from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr
from datetime import datetime

# Auth Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    plan: str
    is_recruiter: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenData(BaseModel):
    sub: Optional[str] = None

# Resume Schemas
class ResumeVersionOut(BaseModel):
    id: str
    resume_id: str
    version_num: int
    title: str
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ResumeOut(BaseModel):
    id: str
    user_id: Optional[str] = None
    title: str
    file_name: str
    file_size: int
    file_type: str
    raw_text: Optional[str] = None
    parsed_sections: Optional[Dict[str, Any]] = None
    formatting_meta: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ResumeUpdate(BaseModel):
    title: Optional[str] = None
    raw_text: Optional[str] = None
    parsed_sections: Optional[Dict[str, Any]] = None

# Job Description Schemas
class JobDescriptionCreate(BaseModel):
    title: str
    company: str
    raw_text: str

class JobDescriptionOut(BaseModel):
    id: str
    title: str
    company: str
    raw_text: str
    parsed_keywords: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Analysis Child Schemas
class AnalysisScoreOut(BaseModel):
    category: str
    score: float
    max_score: float = 100.0
    status: str
    explanation: Optional[str] = None

    class Config:
        from_attributes = True

class KeywordMatchOut(BaseModel):
    keyword: str
    category: str # Critical Missing, Recommended, Already Found
    status: str   # found, missing
    relevance: str # high, medium, low
    section_suggestion: Optional[str] = None

    class Config:
        from_attributes = True

class SkillGapOut(BaseModel):
    skill_name: str
    match_percentage: float
    priority: str # Must Have, Good to Have, Bonus
    in_resume: bool
    in_job: bool

    class Config:
        from_attributes = True

class ResumeIssueOut(BaseModel):
    severity: str # Passed, Warning, Critical
    category: str
    title: str
    description: str
    recommendation: Optional[str] = None

    class Config:
        from_attributes = True

class RecommendationOut(BaseModel):
    section: str
    priority: str
    title: str
    action_item: str

    class Config:
        from_attributes = True

# Main Analysis Schemas
class AnalysisRequest(BaseModel):
    resume_id: Optional[str] = None
    resume_text: Optional[str] = None
    resume_filename: Optional[str] = None
    job_id: Optional[str] = None
    job_title: Optional[str] = None
    job_company: Optional[str] = None
    job_text: Optional[str] = None

class SectionAnalysisDetail(BaseModel):
    section_name: str
    score: float
    strengths: List[str]
    issues: List[str]
    recommendations: List[str]

class AnalysisOut(BaseModel):
    id: str
    resume_id: str
    job_id: str
    resume_title: Optional[str] = None
    job_title: Optional[str] = None
    company_name: Optional[str] = None
    overall_ats_score: float
    job_match_score: float
    keyword_match_score: float
    quality_score: float
    summary: Optional[str] = None
    scores: List[AnalysisScoreOut] = []
    keywords: List[KeywordMatchOut] = []
    skills: List[SkillGapOut] = []
    issues: List[ResumeIssueOut] = []
    recommendations: List[RecommendationOut] = []
    sections_analysis: Optional[List[SectionAnalysisDetail]] = None
    created_at: datetime

    class Config:
        from_attributes = True

# AI Service Schemas
class BulletImproveRequest(BaseModel):
    bullet: str
    job_context: Optional[str] = None
    style: Optional[str] = "achievement" # "achievement", "technical", "shorter", "ats_friendly"

class BulletImproveResponse(BaseModel):
    original: str
    improved: str
    style: str
    changes_made: List[str]
    detected_weaknesses: List[str]

class TextRewriteRequest(BaseModel):
    text: str
    instruction: str
    context: Optional[str] = None

class TextRewriteResponse(BaseModel):
    original: str
    rewritten: str
    summary_of_changes: str

class CoverLetterRequest(BaseModel):
    resume_id: Optional[str] = None
    resume_text: Optional[str] = None
    job_title: str
    company: str
    job_description: str
    tone: Optional[str] = "Professional" # "Professional", "Confident", "Conversational"
    length: Optional[str] = "Standard"    # "Short", "Standard", "Detailed"

class CoverLetterResponse(BaseModel):
    id: Optional[str] = None
    title: str
    content: str
    tone: str
    length: str
    created_at: Optional[datetime] = None

# Dashboard Stats Schema
class DashboardStatsOut(BaseModel):
    total_analyses: int
    average_ats_score: float
    best_match_score: float
    resumes_improved: int
    score_history: List[Dict[str, Any]]
    top_missing_skills: List[Dict[str, Any]]
    most_frequent_missing_keywords: List[Dict[str, Any]]
    suggested_improvements: List[Dict[str, Any]]
    recent_analyses: List[Dict[str, Any]]

# Report Schema
class ReportOut(BaseModel):
    id: str
    analysis_id: str
    file_path: str
    format: str
    created_at: datetime

    class Config:
        from_attributes = True
