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

# Resume Tailor Schemas
class TailorChangeItem(BaseModel):
    category: str # "Added", "Improved", "Removed", "Recommended"
    item: str
    description: Optional[str] = None

class ATSForecast(BaseModel):
    current_score: float
    expected_score: float
    increase: float
    reasoning: List[str]

class ResumeTailorRequest(BaseModel):
    resume_id: Optional[str] = None
    resume_text: Optional[str] = None
    job_id: Optional[str] = None
    job_title: str
    company: str
    job_description: str

class ResumeTailorResponse(BaseModel):
    original_resume: str
    tailored_resume: str
    job_title: str
    company: str
    tailored_sections: Dict[str, str]
    change_log: List[TailorChangeItem]
    ats_forecast: ATSForecast
    new_resume_id: Optional[str] = None

# Recruiter Schemas
class RecruiterJobCreate(BaseModel):
    title: str
    company: str
    description: str
    skills: Optional[List[str]] = None
    experience_level: Optional[str] = "Mid-Level" # Entry, Mid-Level, Senior, Lead, Executive

class RecruiterJobOut(BaseModel):
    id: str
    title: str
    company: str
    description: str
    skills: Optional[List[str]] = None
    experience_level: Optional[str] = "Mid-Level"
    status: Optional[str] = "Active"
    candidate_count: Optional[int] = 0
    average_ats_score: Optional[float] = 0.0
    created_at: datetime

    class Config:
        from_attributes = True

class CandidateRankingItem(BaseModel):
    rank: int
    analysis_id: str
    resume_id: str
    candidate_name: str
    email: str
    phone: Optional[str] = None
    education: Optional[str] = None
    role: str
    job_title: str
    company: str
    ats_score: float
    match_score: float
    skill_match: float
    experience_match: float
    verified_skills: List[str]
    missing_skills: List[str]
    strengths: List[str]
    concerns: List[str]
    created_at: datetime

class CandidateDetailOut(BaseModel):
    analysis_id: str
    resume_id: str
    candidate_name: str
    email: str
    phone: Optional[str] = None
    education: Optional[str] = None
    job_title: str
    company: str
    ats_score: float
    match_score: float
    skill_match: float
    experience_match: float
    raw_resume: str
    parsed_sections: Dict[str, Any]
    match_explanation: str
    missing_skills: List[Dict[str, Any]]
    verified_skills: List[Dict[str, Any]]
    strengths: List[str]
    concerns: List[str]
    scores: List[Dict[str, Any]]
    created_at: datetime

# Billing & Subscription Schemas
class PlanOut(BaseModel):
    id: str
    name: str
    price_inr: int
    billing_interval: str
    features: List[str]
    max_analyses: int
    allows_tailor: bool
    allows_cover_letter: bool
    allows_recruiter: bool

    class Config:
        from_attributes = True

class SubscriptionOut(BaseModel):
    id: str
    user_id: str
    plan: str
    provider: str
    provider_subscription_id: Optional[str] = None
    status: str
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None
    cancel_at_period_end: bool
    trial_end: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class InvoiceOut(BaseModel):
    id: str
    invoice_number: str
    provider: str
    amount: float
    currency: str
    status: str
    plan_name: str
    paid_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class PaymentOut(BaseModel):
    id: str
    provider: str
    provider_payment_id: Optional[str] = None
    amount: float
    currency: str
    status: str
    payment_method: str
    failure_reason: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class UsageTrackerOut(BaseModel):
    month: str
    analyses_used: int
    max_analyses: int # 3 for free, -1 for unlimited
    resumes_uploaded: int
    ai_generations_used: int
    can_analyze: bool

class BillingOverviewOut(BaseModel):
    current_plan: str
    subscription: Optional[SubscriptionOut] = None
    usage: UsageTrackerOut
    plans: List[PlanOut]
    invoices: List[InvoiceOut]
    payments: List[PaymentOut]

class CheckoutSessionCreate(BaseModel):
    plan_id: str # 'pro' or 'recruiter'
    provider: str = "stripe" # 'stripe' or 'razorpay'

class CheckoutSessionOut(BaseModel):
    provider: str
    session_id: Optional[str] = None
    order_id: Optional[str] = None
    client_secret: Optional[str] = None
    public_key: Optional[str] = None
    key_id: Optional[str] = None
    amount: int
    currency: str
    plan_id: str
    plan_name: str

class PaymentVerifyRequest(BaseModel):
    plan_id: str
    provider: str # 'stripe' or 'razorpay'
    payment_id: Optional[str] = None
    payment_method: Optional[str] = "card"

class SubscriptionCancelRequest(BaseModel):
    immediate: bool = False

class SimulationActionRequest(BaseModel):
    provider: str = "stripe"
    reason: Optional[str] = "Card declined: Insufficient funds"

# Analytics Schemas
class AnalyticsEventCreate(BaseModel):
    event_name: str
    category: Optional[str] = "engagement" # acquisition, activation, engagement, revenue
    anonymous_id: Optional[str] = None
    session_id: Optional[str] = None
    properties: Optional[Dict[str, Any]] = None
    url: Optional[str] = None
    referrer: Optional[str] = None

class AnalyticsEventOut(BaseModel):
    id: str
    event_name: str
    category: str
    source: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True




