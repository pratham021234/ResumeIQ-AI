"""
ResumeIQ AI — Automated Comprehensive Backend Audit & Verification Suite
Tests all models, APIs, auth, parsing, scoring determinism, synonyms, billing, cascade deletes, and security.
"""

import sys
import os
import uuid
import time
from datetime import datetime, timezone, timedelta

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.core.database import SessionLocal, Base, engine
from app.models.models import (
    User, Resume, ResumeVersion, JobDescription, Analysis, AnalysisScore,
    KeywordMatch, SkillGap, ResumeIssue, Recommendation, CoverLetter,
    Plan, Subscription, Invoice, Payment, UsageTracker, Report, CandidateEvaluation
)
from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token
from app.parsers.resume_parser import ResumeParser
from app.scoring.ats_scoring import ATSScoringEngine
from app.scoring.keyword_extractor import match_keyword_in_text, normalize_token, KEYWORD_SYNONYMS
from app.services.billing_service import BillingService
from app.services.copilot_service import CopilotService
from app.services.pdf_report_service import PDFReportService

audit_results = {
    "passed": 0,
    "failed": 0,
    "warnings": 0,
    "tests": []
}

def log_test(name: str, passed: bool, message: str = "", is_warning: bool = False):
    if passed:
        audit_results["passed"] += 1
        status_str = "PASS"
    elif is_warning:
        audit_results["warnings"] += 1
        status_str = "WARN"
    else:
        audit_results["failed"] += 1
        status_str = "FAIL"
    
    audit_results["tests"].append({
        "name": name,
        "status": status_str,
        "message": message
    })
    icon = "[OK]" if passed else ("[WARN]" if is_warning else "[X]")
    print(f"  {icon} {name}: {message or 'Passed'}")

print("==================================================")
print("STARTING COMPREHENSIVE BACKEND AUDIT")
print("==================================================")

db = SessionLocal()

# ------------------------------------------------------------------
# SECTION 1: DATABASE SCHEMA & MODEL INTEGRITY
# ------------------------------------------------------------------
print("\n[SECTION 1: Database Models & Query Integrity]")
models_to_test = [
    ("User", User),
    ("Resume", Resume),
    ("ResumeVersion", ResumeVersion),
    ("JobDescription", JobDescription),
    ("Analysis", Analysis),
    ("AnalysisScore", AnalysisScore),
    ("KeywordMatch", KeywordMatch),
    ("SkillGap", SkillGap),
    ("ResumeIssue", ResumeIssue),
    ("Recommendation", Recommendation),
    ("CoverLetter", CoverLetter),
    ("Plan", Plan),
    ("Subscription", Subscription),
    ("Invoice", Invoice),
    ("Payment", Payment),
    ("UsageTracker", UsageTracker),
    ("Report", Report),
    ("CandidateEvaluation", CandidateEvaluation),
]

for name, model_cls in models_to_test:
    try:
        cnt = db.query(model_cls).count()
        log_test(f"Model Query: {name}", True, f"Accessible, {cnt} records found")
    except Exception as e:
        log_test(f"Model Query: {name}", False, f"Failed with error: {str(e)}")

# ------------------------------------------------------------------
# SECTION 2: AUTHENTICATION & SECURITY AUDIT
# ------------------------------------------------------------------
print("\n[SECTION 2: Authentication & Password Security]")
try:
    test_password = "SuperSecurePassword123!"
    hashed = get_password_hash(test_password)
    verify_ok = verify_password(test_password, hashed)
    verify_bad = verify_password("WrongPassword!", hashed)
    
    log_test("Bcrypt Hash & Verification", verify_ok and not verify_bad, "Verified correct and incorrect password checks")
    
    # Test bcrypt 72 byte truncation safety
    long_pwd = "A" * 100
    long_hashed = get_password_hash(long_pwd)
    long_ok = verify_password(long_pwd, long_hashed)
    log_test("Bcrypt Long Password (72+ bytes)", long_ok, "Handled gracefully with no crash")

    # JWT Token encoding & decoding
    user_uuid = str(uuid.uuid4())
    token = create_access_token(user_uuid, expires_delta=timedelta(hours=1))
    decoded = decode_access_token(token)
    log_test("JWT Token Encoding/Decoding", decoded == user_uuid, f"Decoded subject correctly: {decoded}")

    # Expired token
    expired_token = create_access_token(user_uuid, expires_delta=timedelta(seconds=-10))
    decoded_expired = decode_access_token(expired_token)
    log_test("JWT Expired Token Rejection", decoded_expired is None, "Correctly rejected expired token")
except Exception as e:
    log_test("Auth Security Test", False, str(e))

# ------------------------------------------------------------------
# SECTION 3: RESUME PARSING INTEGRITY
# ------------------------------------------------------------------
print("\n[SECTION 3: Resume Parsing & Section Extraction]")
try:
    sample_raw_text = """
    ALEX RIVERA
    San Francisco, CA • alex.rivera@example.com • (555) 234-5678 • linkedin.com/in/alexrivera-dev • github.com/alexrivera-dev

    PROFESSIONAL SUMMARY
    Senior Backend Engineer with 6+ years of experience engineering high-throughput distributed systems in Python, FastAPI, and PostgreSQL.

    TECHNICAL SKILLS
    Languages: Python, Go, TypeScript, SQL
    Frameworks: FastAPI, Django, Flask, Express
    Databases: PostgreSQL, Redis, MongoDB
    Tools: Docker, Kubernetes, AWS, Terraform, CI/CD

    WORK EXPERIENCE
    Senior Backend Engineer | CloudScale Technologies (2022 - Present)
    - Architected and deployed asynchronous REST APIs using FastAPI and PostgreSQL, serving 5M+ daily requests with sub-45ms latency.
    - Engineered Redis distributed cache cluster, cutting database query latency by 42%.

    EDUCATION
    B.S. in Computer Science | University of California, Berkeley (2018)

    CERTIFICATIONS
    AWS Certified Solutions Architect – Associate
    """
    
    parsed = ResumeParser.process_raw_text(sample_raw_text, filename="alex_sample.pdf")
    contact = parsed.get("contact_info", {})
    sections = parsed.get("parsed_sections", {})
    
    has_email = contact.get("email") == "alex.rivera@example.com"
    has_phone = "555" in (contact.get("phone") or "")
    has_linkedin = "alexrivera-dev" in (contact.get("linkedin") or "")
    has_github = "alexrivera-dev" in (contact.get("github") or "")
    
    log_test("Contact Extraction (Email, Phone, LinkedIn, GitHub)",
             has_email and has_phone and has_linkedin and has_github,
             f"Email: {contact.get('email')}, Phone: {contact.get('phone')}, LinkedIn: {contact.get('linkedin')}, GitHub: {contact.get('github')}")
    
    has_summary = bool(sections.get("summary"))
    has_exp = bool(sections.get("experience"))
    has_skills = bool(sections.get("skills"))
    has_edu = bool(sections.get("education"))
    has_certs = bool(sections.get("certifications"))
    
    log_test("Section Segmentation",
             has_summary and has_exp and has_skills and has_edu and has_certs,
             f"Summary: {has_summary}, Experience: {has_exp}, Skills: {has_skills}, Education: {has_edu}, Certs: {has_certs}")
except Exception as e:
    log_test("Resume Parser", False, str(e))

# ------------------------------------------------------------------
# SECTION 4: ATS SCORING DETERMINISM & VARIANCE
# ------------------------------------------------------------------
print("\n[SECTION 4: ATS Scoring Engine Determinism]")
try:
    sample_jd_text = """
    We are looking for a Senior Backend Engineer to join Stripe.
    Requirements:
    - 4+ years of backend engineering experience with Python, FastAPI, or Go.
    - Expertise with PostgreSQL, database indexing, and query optimization.
    - Experience with Redis caching, Kafka message streaming, and Docker.
    - Strong understanding of REST APIs, sub-50ms latency, and AWS.
    """
    
    scores_runs = []
    for run_i in range(5):
        res = ATSScoringEngine.calculate_full_analysis(
            resume_data=parsed,
            jd_title="Senior Backend Engineer",
            jd_company="Stripe",
            jd_text=sample_jd_text
        )
        scores_runs.append((
            res["overall_ats_score"],
            res["job_match_score"],
            res["keyword_match_score"],
            res["quality_score"]
        ))
    
    # Check if all runs are 100% identical
    identical = all(s == scores_runs[0] for s in scores_runs)
    variance_0 = len(set(scores_runs)) == 1
    log_test("Deterministic ATS Scoring (5 Runs)",
             variance_0,
             f"Run 1: {scores_runs[0]} -> Run 5: {scores_runs[4]} (Variance: 0.00)")
except Exception as e:
    log_test("ATS Determinism", False, str(e))

# ------------------------------------------------------------------
# SECTION 5: KEYWORD MATCHING & SYNONYM RECOGNITION
# ------------------------------------------------------------------
print("\n[SECTION 5: Keyword & Synonym Matcher]")
try:
    test_cases = [
        ("javascript", "Proficient in JS and modern web frameworks", True),
        ("postgresql", "Experienced with Postgres and MySQL databases", True),
        ("rest apis", "Designed resilient RESTful APIs for mobile clients", True),
        ("kubernetes", "Managed production clusters with K8s and Helm", True),
        ("amazon web services", "Deployed high-availability services to AWS", True),
        ("docker", "Containerized microservices using docker engine", True),
        ("python", "Built backend applications in Golang and Rust", False),  # should be false
    ]
    
    synonym_passed = True
    for kw, resume_snippet, expected in test_cases:
        norm_text = normalize_token(resume_snippet)
        matched = match_keyword_in_text(kw, norm_text)
        if matched != expected:
            synonym_passed = False
            log_test(f"Synonym Match: '{kw}' in '{resume_snippet}'", False, f"Expected {expected}, got {matched}")
        else:
            log_test(f"Synonym Match: '{kw}' -> '{resume_snippet[:35]}...'", True, f"Correctly {'matched' if expected else 'not matched'}")
            
except Exception as e:
    log_test("Synonym Matching", False, str(e))

# ------------------------------------------------------------------
# SECTION 6: BILLING & USAGE LIMIT ENFORCEMENT
# ------------------------------------------------------------------
print("\n[SECTION 6: Billing & Usage Limits]")
try:
    # Test user
    test_uid = f"audit_user_{uuid.uuid4().hex[:8]}"
    test_user = User(
        id=test_uid,
        email=f"{test_uid}@example.com",
        hashed_password=get_password_hash("Test1234!"),
        full_name="Audit Tester",
        plan="free"
    )
    db.add(test_user)
    db.commit()

    # Seed plans if not present
    BillingService.seed_plans(db)

    # Initial check: free user can analyze (0 used)
    can_analyze, reason = BillingService.check_can_analyze(test_user, db)
    log_test("Free Plan: 0/3 Usage check", can_analyze, "Allowed to analyze on free plan initial usage")

    # Increment to 3 analyses
    for _ in range(3):
        BillingService.increment_analysis_usage(test_uid, db)
    
    can_analyze_3, reason_3 = BillingService.check_can_analyze(test_user, db)
    clean_reason = str(reason_3 or "").encode("ascii", "ignore").decode("ascii")
    log_test("Free Plan: 3/3 Limit Reached", not can_analyze_3, f"Blocked as expected: '{clean_reason}'")

    # Upgrade user to pro
    test_user.plan = "pro"
    db.commit()
    can_analyze_pro, _ = BillingService.check_can_analyze(test_user, db)
    log_test("Pro Plan: Unlimited Usage", can_analyze_pro, "Allowed unlimited analyses after upgrade to Pro")

    # Clean up test user
    db.delete(test_user)
    db.commit()
except Exception as e:
    db.rollback()
    log_test("Billing & Limits", False, str(e))

# ------------------------------------------------------------------
# SECTION 7: CASCADE DELETION INTEGRITY
# ------------------------------------------------------------------
print("\n[SECTION 7: Cascade Deletion & Foreign Key Safety]")
try:
    cascade_uid = f"cascade_test_{uuid.uuid4().hex[:8]}"
    u = User(
        id=cascade_uid,
        email=f"{cascade_uid}@example.com",
        hashed_password="hash",
        plan="pro"
    )
    db.add(u)
    db.commit()

    r = Resume(
        id=str(uuid.uuid4()),
        user_id=cascade_uid,
        title="Cascade Test Resume",
        file_name="test.pdf",
        raw_text="Sample resume text",
        parsed_sections={"summary": "Sample"},
        formatting_meta={}
    )
    db.add(r)
    db.commit()

    j = JobDescription(
        id=str(uuid.uuid4()),
        user_id=cascade_uid,
        title="Test Job",
        company="Test Co",
        raw_text="Test JD text"
    )
    db.add(j)
    db.commit()

    a = Analysis(
        id=str(uuid.uuid4()),
        user_id=cascade_uid,
        resume_id=r.id,
        job_id=j.id,
        overall_ats_score=85.0,
        job_match_score=80.0,
        keyword_match_score=82.0,
        quality_score=84.0
    )
    db.add(a)
    db.commit()

    # Add child items
    sc = AnalysisScore(id=str(uuid.uuid4()), analysis_id=a.id, category="ATS", score=85.0, status="Strong")
    km = KeywordMatch(id=str(uuid.uuid4()), analysis_id=a.id, keyword="Python", category="Found", status="found")
    sg = SkillGap(id=str(uuid.uuid4()), analysis_id=a.id, skill_name="Kafka", priority="Must Have")
    iss = ResumeIssue(id=str(uuid.uuid4()), analysis_id=a.id, severity="Warning", category="Layout", title="Title", description="Desc")
    rec = Recommendation(id=str(uuid.uuid4()), analysis_id=a.id, section="Skills", title="Add Skills", action_item="Action")
    rep = Report(id=str(uuid.uuid4()), user_id=cascade_uid, analysis_id=a.id, file_path="dummy.pdf")
    ce = CandidateEvaluation(
        id=str(uuid.uuid4()),
        analysis_id=a.id,
        job_id=j.id,
        candidate_name="Cascade Candidate",
        stage="Screening",
        hiring_decision="Yes"
    )
    db.add_all([sc, km, sg, iss, rec, rep, ce])
    db.commit()

    # Now test deleting the Resume. It should cascade to Analysis, which cascades to scores, keywords, skills, issues, recommendations, reports, AND CandidateEvaluation!
    # Let's test if deleting Resume succeeds or raises FK error
    try:
        # Check CandidateEvaluation before delete
        ce_exists_before = db.query(CandidateEvaluation).filter(CandidateEvaluation.analysis_id == a.id).first() is not None
        
        # In resume deletion endpoint:
        db.query(CoverLetter).filter(CoverLetter.resume_id == r.id).update({"resume_id": None})
        # Delete CandidateEvaluation if not auto-cascaded, or let's test if db.delete(r) handles it
        db.delete(r)
        db.commit()

        # Check that analysis is deleted
        a_after = db.query(Analysis).filter(Analysis.id == a.id).first()
        ce_after = db.query(CandidateEvaluation).filter(CandidateEvaluation.id == ce.id).first()
        sc_after = db.query(AnalysisScore).filter(AnalysisScore.analysis_id == a.id).first()
        
        cascaded_ok = (a_after is None) and (sc_after is None)
        log_test("Resume Deletion Cascade to Analysis & Children", cascaded_ok, "Resume and child analysis cascaded cleanly")
        log_test("CandidateEvaluation Clean Deletion", ce_after is None, f"CandidateEvaluation after delete: {ce_after}")
    except Exception as del_err:
        db.rollback()
        log_test("Resume Deletion Cascade", False, f"Failed: {str(del_err)}")

    # Clean up test user & job
    try:
        db.delete(j)
        db.delete(u)
        db.commit()
    except Exception:
        db.rollback()

except Exception as e:
    db.rollback()
    log_test("Cascade Deletion Test Setup", False, str(e))

# ------------------------------------------------------------------
# SECTION 8: PDF REPORT GENERATOR AUDIT
# ------------------------------------------------------------------
print("\n[SECTION 8: PDF Report Generation]")
try:
    test_pdf_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), "uploads", "test_audit_report.pdf")
    dummy_analysis = {
        "overall_ats_score": 88.5,
        "job_match_score": 84.0,
        "keyword_match_score": 86.0,
        "quality_score": 90.0,
        "summary": "Outstanding alignment with senior backend engineering standards.",
        "resume_title": "Alex Rivera — Senior Backend Resume.pdf",
        "job_title": "Senior Backend Engineer",
        "company_name": "Stripe",
        "keywords": [{"keyword": "Python", "category": "Technologies"}, {"keyword": "FastAPI", "category": "Frameworks"}],
        "issues": [{"severity": "Passed", "category": "Single Column", "title": "Clean single-column layout verified", "description": "Readable across all ATS engines."}],
        "recommendations": [{"section": "Skills", "title": "Add Distributed Systems keywords", "action_item": "Incorporate Kafka and streaming queue details."}],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    generated_path = PDFReportService.generate_analysis_pdf(dummy_analysis, test_pdf_path)
    file_exists = os.path.exists(test_pdf_path)
    file_size = os.path.getsize(test_pdf_path) if file_exists else 0
    
    # Verify PDF magic bytes
    with open(test_pdf_path, "rb") as f:
        magic_bytes = f.read(5)
    is_valid_pdf = magic_bytes == b"%PDF-"

    log_test("PDF Generation & Magic Bytes",
             file_exists and file_size > 1000 and is_valid_pdf,
             f"Generated valid PDF ({file_size} bytes, magic: {magic_bytes.decode()})")
    
    # Remove test file
    try:
        os.remove(test_pdf_path)
    except Exception:
        pass
except Exception as e:
    log_test("PDF Report Generator", False, str(e))

# ------------------------------------------------------------------
# SECTION 9: AI HIRING COPILOT SERVICE AUDIT
# ------------------------------------------------------------------
print("\n[SECTION 9: AI Hiring Copilot Evaluation Engine]")
try:
    # Fetch an existing analysis to evaluate
    sample_analysis = db.query(Analysis).first()
    if sample_analysis:
        evaluation = CopilotService.evaluate_candidate(sample_analysis.id, db)
        has_decision = evaluation.get("hiring_decision") in ["Strong Yes", "Yes", "Leaning Yes", "Leaning No", "Strong No"]
        has_summary = bool(evaluation.get("executive_summary"))
        has_questions = len(evaluation.get("interview_questions") or []) == 4
        has_strengths = len(evaluation.get("strengths") or []) > 0
        has_gaps = "verified_skills" in (evaluation.get("skill_gap_analysis") or {})

        log_test("Copilot Candidate Evaluation",
                 has_decision and has_summary and has_questions and has_strengths and has_gaps,
                 f"Verdict: {evaluation.get('hiring_decision')}, Rating: {evaluation.get('rating')}*, Questions: {len(evaluation.get('interview_questions') or [])}")
        
        # Test pipeline analytics
        analytics = CopilotService.get_pipeline_analytics(db=db)
        has_funnel = len(analytics.get("stage_funnel", [])) > 0
        has_dist = len(analytics.get("score_distribution", [])) > 0
        has_heat = len(analytics.get("top_pool_skill_gaps", [])) > 0
        
        log_test("Copilot Talent Pool Analytics",
                 has_funnel and has_dist and has_heat,
                 f"Total screened: {analytics.get('total_screened')}, Top missing skills: {len(analytics.get('top_pool_skill_gaps', []))}")
    else:
        log_test("Copilot Evaluation", False, "No analysis found in database to evaluate")
except Exception as e:
    log_test("Copilot Service", False, str(e))

db.close()

print("\n==================================================")
print(f"AUDIT SUMMARY: {audit_results['passed']} PASSED, {audit_results['failed']} FAILED, {audit_results['warnings']} WARNINGS")
print("==================================================")

if audit_results["failed"] > 0:
    sys.exit(1)
sys.exit(0)
