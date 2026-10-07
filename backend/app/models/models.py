import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, Integer, Float, Boolean, ForeignKey, DateTime, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    plan = Column(String(50), default="free")  # free, pro, enterprise
    is_recruiter = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    job_descriptions = relationship("JobDescription", back_populates="user", cascade="all, delete-orphan")
    analyses = relationship("Analysis", back_populates="user", cascade="all, delete-orphan")
    cover_letters = relationship("CoverLetter", back_populates="user", cascade="all, delete-orphan")
    subscriptions = relationship("Subscription", back_populates="user", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="user", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="user", cascade="all, delete-orphan")
    usage_trackers = relationship("UsageTracker", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="user", cascade="all, delete-orphan")
    analytics_events = relationship("AnalyticsEvent", back_populates="user", cascade="all, delete-orphan")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=True)
    file_size = Column(Integer, default=0)
    file_type = Column(String(50), default="application/pdf")
    raw_text = Column(Text, nullable=True)
    parsed_sections = Column(JSON, nullable=True)  # summary, experience, skills, etc.
    formatting_meta = Column(JSON, nullable=True)  # layout details, column count, font info
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="resumes")
    versions = relationship("ResumeVersion", back_populates="resume", cascade="all, delete-orphan")
    analyses = relationship("Analysis", back_populates="resume", cascade="all, delete-orphan")

class ResumeVersion(Base):
    __tablename__ = "resume_versions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    resume_id = Column(String(36), ForeignKey("resumes.id"), nullable=False, index=True)
    version_num = Column(Integer, default=1)
    title = Column(String(255), nullable=False)
    content_json = Column(JSON, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    resume = relationship("Resume", back_populates="versions")

class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    raw_text = Column(Text, nullable=False)
    skills = Column(JSON, nullable=True)
    experience_level = Column(String(50), default="Mid-Level", nullable=True)
    status = Column(String(50), default="Active", nullable=True)
    parsed_keywords = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="job_descriptions")
    analyses = relationship("Analysis", back_populates="job_description", cascade="all, delete-orphan")

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    resume_id = Column(String(36), ForeignKey("resumes.id"), nullable=False, index=True)
    job_id = Column(String(36), ForeignKey("job_descriptions.id"), nullable=False, index=True)
    
    # 4 major scores
    overall_ats_score = Column(Float, nullable=False)   # 0 to 100
    job_match_score = Column(Float, nullable=False)     # 0 to 100
    keyword_match_score = Column(Float, nullable=False) # 0 to 100
    quality_score = Column(Float, nullable=False)       # 0 to 100
    
    summary = Column(Text, nullable=True)
    screening_summary = Column(JSON, nullable=True) # strengths, concerns, recommendation
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="analyses")
    resume = relationship("Resume", back_populates="analyses")
    job_description = relationship("JobDescription", back_populates="analyses")
    scores = relationship("AnalysisScore", back_populates="analysis", cascade="all, delete-orphan")
    keywords = relationship("KeywordMatch", back_populates="analysis", cascade="all, delete-orphan")
    skills = relationship("SkillGap", back_populates="analysis", cascade="all, delete-orphan")
    issues = relationship("ResumeIssue", back_populates="analysis", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="analysis", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="analysis", cascade="all, delete-orphan")

class AnalysisScore(Base):
    __tablename__ = "analysis_scores"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    analysis_id = Column(String(36), ForeignKey("analyses.id"), nullable=False, index=True)
    category = Column(String(100), nullable=False)  # ATS Compatibility, Keyword Match, Skills Match, Experience Match, etc.
    score = Column(Float, nullable=False)
    max_score = Column(Float, default=100.0)
    status = Column(String(50), nullable=False)     # Excellent, Strong, Good, Needs Improvement, Poor
    explanation = Column(Text, nullable=True)

    analysis = relationship("Analysis", back_populates="scores")

class KeywordMatch(Base):
    __tablename__ = "keyword_matches"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    analysis_id = Column(String(36), ForeignKey("analyses.id"), nullable=False, index=True)
    keyword = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)   # Critical Missing, Recommended, Already Found
    status = Column(String(50), nullable=False)     # found, missing
    relevance = Column(String(50), default="high")  # high, medium, low
    section_suggestion = Column(String(100), nullable=True) # e.g. "Experience", "Skills"

    analysis = relationship("Analysis", back_populates="keywords")

class SkillGap(Base):
    __tablename__ = "skill_gaps"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    analysis_id = Column(String(36), ForeignKey("analyses.id"), nullable=False, index=True)
    skill_name = Column(String(100), nullable=False)
    match_percentage = Column(Float, default=0.0)
    priority = Column(String(50), default="Must Have") # Must Have, Good to Have, Bonus
    in_resume = Column(Boolean, default=False)
    in_job = Column(Boolean, default=True)

    analysis = relationship("Analysis", back_populates="skills")

class ResumeIssue(Base):
    __tablename__ = "resume_issues"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    analysis_id = Column(String(36), ForeignKey("analyses.id"), nullable=False, index=True)
    severity = Column(String(50), nullable=False)   # Passed, Warning, Critical
    category = Column(String(100), nullable=False)  # Multi-column layout, Tables, Graphics, etc.
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    recommendation = Column(Text, nullable=True)

    analysis = relationship("Analysis", back_populates="issues")

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    analysis_id = Column(String(36), ForeignKey("analyses.id"), nullable=False, index=True)
    section = Column(String(100), nullable=False)   # Summary, Experience, Projects, Skills, etc.
    priority = Column(String(50), default="High")   # High, Medium, Low
    title = Column(String(255), nullable=False)
    action_item = Column(Text, nullable=False)

    analysis = relationship("Analysis", back_populates="recommendations")

class CoverLetter(Base):
    __tablename__ = "cover_letters"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    resume_id = Column(String(36), ForeignKey("resumes.id"), nullable=True)
    job_id = Column(String(36), ForeignKey("job_descriptions.id"), nullable=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    tone = Column(String(50), default="Professional")   # Professional, Confident, Conversational
    length = Column(String(50), default="Standard")     # Short, Standard, Detailed
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="cover_letters")

class Plan(Base):
    __tablename__ = "plans"

    id = Column(String(50), primary_key=True)  # "free", "pro", "recruiter"
    name = Column(String(100), nullable=False)  # "Free", "Pro", "Recruiter"
    price_inr = Column(Integer, default=0)      # 0, 299, 1999
    billing_interval = Column(String(20), default="month")
    features = Column(JSON, nullable=True)
    max_analyses = Column(Integer, default=3)   # 3 for free, -1 for unlimited
    allows_tailor = Column(Boolean, default=False)
    allows_cover_letter = Column(Boolean, default=False)
    allows_recruiter = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    plan = Column(String(50), default="free")  # free, pro, recruiter
    provider = Column(String(50), default="stripe")  # stripe, razorpay, system
    provider_subscription_id = Column(String(100), nullable=True)
    provider_customer_id = Column(String(100), nullable=True)
    status = Column(String(50), default="active")  # active, past_due, canceled, trialing, expired
    current_period_start = Column(DateTime, default=utc_now)
    current_period_end = Column(DateTime, nullable=True)
    cancel_at_period_end = Column(Boolean, default=False)
    canceled_at = Column(DateTime, nullable=True)
    trial_end = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="subscriptions")
    invoices = relationship("Invoice", back_populates="subscription", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="subscription", cascade="all, delete-orphan")

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    subscription_id = Column(String(36), ForeignKey("subscriptions.id"), nullable=True)
    invoice_number = Column(String(100), unique=True, nullable=False)
    provider = Column(String(50), default="stripe")  # stripe, razorpay
    provider_invoice_id = Column(String(100), nullable=True)
    amount = Column(Float, default=0.0)
    currency = Column(String(10), default="INR")
    status = Column(String(50), default="paid")  # paid, open, void, failed
    plan_name = Column(String(50), default="pro")
    invoice_pdf_url = Column(String(500), nullable=True)
    paid_at = Column(DateTime, default=utc_now)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="invoices")
    subscription = relationship("Subscription", back_populates="invoices")

class Payment(Base):
    __tablename__ = "payments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    subscription_id = Column(String(36), ForeignKey("subscriptions.id"), nullable=True)
    invoice_id = Column(String(36), ForeignKey("invoices.id"), nullable=True)
    provider = Column(String(50), default="stripe")  # stripe, razorpay
    provider_payment_id = Column(String(100), nullable=True)
    amount = Column(Float, default=0.0)
    currency = Column(String(10), default="INR")
    status = Column(String(50), default="succeeded")  # succeeded, failed, refunded, pending
    payment_method = Column(String(50), default="card")  # card, upi, netbanking
    failure_reason = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="payments")
    subscription = relationship("Subscription", back_populates="payments")

class UsageTracker(Base):
    __tablename__ = "usage_trackers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    month = Column(String(20), default=lambda: datetime.now(timezone.utc).strftime("%Y-%m"))
    analyses_used = Column(Integer, default=0)
    resumes_uploaded = Column(Integer, default=0)
    ai_generations_used = Column(Integer, default=0)
    last_reset_at = Column(DateTime, default=utc_now)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="usage_trackers")

class Report(Base):
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    analysis_id = Column(String(36), ForeignKey("analyses.id"), nullable=False, index=True)
    file_path = Column(String(500), nullable=False)
    format = Column(String(50), default="pdf")
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="reports")
    analysis = relationship("Analysis", back_populates="reports")

class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    event_name = Column(String(100), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)  # acquisition, activation, engagement, revenue
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    anonymous_id = Column(String(100), nullable=True, index=True)
    session_id = Column(String(100), nullable=True)
    properties = Column(JSON, nullable=True)
    url = Column(String(500), nullable=True)
    referrer = Column(String(500), nullable=True)
    source = Column(String(100), default="direct", index=True)  # direct, google, linkedin, twitter, etc.
    ip_hash = Column(String(64), nullable=True)  # SHA-256 pseudonymized hash for GDPR compliance
    user_agent = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=utc_now, index=True)

    user = relationship("User", back_populates="analytics_events")

