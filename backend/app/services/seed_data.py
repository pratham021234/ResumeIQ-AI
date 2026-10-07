import os
import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.models.models import (
    User, Resume, ResumeVersion, JobDescription, Analysis,
    AnalysisScore, KeywordMatch, SkillGap, ResumeIssue, Recommendation,
    CoverLetter, Subscription, Report
)
from app.core.security import get_password_hash
from app.scoring.ats_scoring import ATSScoringEngine
from app.parsers.resume_parser import ResumeParser
from app.services.pdf_report_service import PDFReportService

SAMPLE_RESUME_TEXT = """ALEX RIVERA
San Francisco, CA • alex.rivera.dev@gmail.com • (415) 890-2341 • linkedin.com/in/alexrivera-dev • github.com/alexrivera

PROFESSIONAL SUMMARY
Senior Backend & Systems Engineer with 6+ years of experience building high-throughput microservices, scalable distributed architectures, and developer platforms. Proven expertise in Python, FastAPI, PostgreSQL, and AWS with a track record of driving 99.99% system availability and optimizing API latency for 5M+ daily requests.

TECHNICAL SKILLS
Languages: Python, Go, TypeScript, SQL
Frameworks & Libraries: FastAPI, Django, Flask, Node.js, Next.js, Pydantic, SQLAlchemy
Databases & Storage: PostgreSQL, Redis, Elasticsearch, DynamoDB
Cloud & DevOps: Docker, Kubernetes, AWS (ECS, S3, RDS, Lambda), GitHub Actions, Terraform
Core Competencies: REST APIs, System Design, Microservices, Event-Driven Architecture, CI/CD Pipelines

PROFESSIONAL EXPERIENCE
Senior Backend Engineer — CloudScale Technologies | San Francisco, CA
2022 – Present
• Architected and deployed asynchronous REST APIs using FastAPI and PostgreSQL, serving 5M+ daily requests with sub-45ms p99 latency.
• Engineered distributed caching layer with Redis cluster, reducing primary database load by 42% and preventing peak throughput bottlenecks.
• Spearheaded migration of monolithic Django service to containerized microservices orchestrated via Kubernetes on AWS ECS.
• Automated end-to-end CI/CD deployment pipelines using GitHub Actions and Terraform, accelerating release frequency from bi-weekly to 4x daily.
• Mentored 5 mid-level backend engineers on concurrency patterns, automated testing with Pytest, and database index optimization.

Software Engineer — Apex Financial Systems | Austin, TX
2020 – 2022
• Designed and maintained financial transaction processing pipelines handling $25M+ in monthly automated ledger reconciliations.
• Implemented webhook subscription platform utilizing RabbitMQ message queues to guarantee zero event loss across banking partners.
• Optimized PostgreSQL database queries and indexes, decreasing reporting export time from 14 minutes to under 45 seconds.
• Collaborated cross-functionally with product and compliance teams to ensure strict SOC2 and PCI-DSS security compliance.

Junior Software Engineer — NovaByte Labs | Austin, TX
2018 – 2020
• Built RESTful API endpoints using Python, Flask, and SQLAlchemy supporting internal analytics dashboard.
• Authored comprehensive unit and integration test suites achieving 88% code coverage.
• Resolved production customer issues, triaged bugs, and reduced customer response latency by 30%.

EDUCATION
Bachelor of Science in Computer Science — University of Texas at Austin (2014 – 2018)

CERTIFICATIONS
• AWS Certified Solutions Architect – Associate (2023)
• Certified Kubernetes Application Developer (CKAD) (2024)
"""

SAMPLE_JD_TEXT = """About the Role:
Stripe is looking for a Senior Backend Engineer to join our Core Infrastructure and Payments Platform team. You will design, build, and maintain mission-critical distributed systems and high-availability APIs that power billions of dollars in global commerce.

Responsibilities:
• Architect, build, and operate resilient backend services and REST APIs supporting global transactional scale.
• Work with distributed databases, relational systems (PostgreSQL), and high-throughput caching (Redis).
• Collaborate with cross-functional engineering teams to establish CI/CD best practices, observability, and containerized deployments using Docker and Kubernetes.
• Drive performance optimization, reduce latency, and ensure fault-tolerant microservice architectures across AWS infrastructure.
• Champion engineering excellence, code reviews, unit testing, and architectural design reviews.

Requirements:
• 5+ years of software engineering experience with backend systems.
• Deep proficiency in Python, Go, or Java, with strong experience building web frameworks (e.g. FastAPI, Django, or Spring).
• Hands-on expertise with PostgreSQL, SQL optimization, and distributed caching (Redis).
• Strong working knowledge of cloud platforms (AWS/GCP), Docker, Kubernetes, and CI/CD pipelines.
• Solid foundation in microservices architecture, system design, and API security.
• Excellent communication skills and passion for mentoring fellow engineers.
"""

def seed_database(db: Session):
    # Check if demo user already exists
    demo_user = db.query(User).filter(User.email == "demo@resumeiq.ai").first()
    if demo_user:
        return demo_user

    # Create demo user
    demo_user = User(
        id=str(uuid.uuid4()),
        email="demo@resumeiq.ai",
        hashed_password=get_password_hash("password123"),
        full_name="Alex Rivera",
        plan="pro",
        is_recruiter=False
    )
    db.add(demo_user)
    db.commit()
    db.refresh(demo_user)

    # Create subscription
    sub = Subscription(
        id=str(uuid.uuid4()),
        user_id=demo_user.id,
        plan="pro",
        status="active",
        current_period_end=datetime.now(timezone.utc) + timedelta(days=365)
    )
    db.add(sub)

    # Create sample resume
    parsed_resume = ResumeParser.process_raw_text(SAMPLE_RESUME_TEXT, "Alex_Rivera_Senior_Backend_Resume.pdf")
    parsed_resume["formatting_meta"] = {
        "page_count": 2,
        "has_tables": False,
        "has_images": False,
        "image_count": 0,
        "multi_column_detected": False,
        "word_count": len(SAMPLE_RESUME_TEXT.split()),
        "character_count": len(SAMPLE_RESUME_TEXT),
        "file_type": "PDF"
    }

    resume = Resume(
        id=str(uuid.uuid4()),
        user_id=demo_user.id,
        title="Alex Rivera — Senior Backend Resume",
        file_name="Alex_Rivera_Senior_Backend_Resume.pdf",
        file_path="uploads/demo_resume.pdf",
        file_size=1048576,
        file_type="application/pdf",
        raw_text=SAMPLE_RESUME_TEXT,
        parsed_sections=parsed_resume["parsed_sections"],
        formatting_meta=parsed_resume["formatting_meta"]
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)

    # Resume version
    version1 = ResumeVersion(
        id=str(uuid.uuid4()),
        resume_id=resume.id,
        version_num=1,
        title="Initial Upload — Cloud & Backend Targeted",
        content_json={"raw_text": SAMPLE_RESUME_TEXT},
        notes="Tailored for senior backend and distributed systems roles."
    )
    db.add(version1)

    # Create Job Description
    jd = JobDescription(
        id=str(uuid.uuid4()),
        user_id=demo_user.id,
        title="Senior Backend Engineer",
        company="Stripe",
        raw_text=SAMPLE_JD_TEXT,
        parsed_keywords={"detected": ["FastAPI", "PostgreSQL", "AWS", "Docker", "Kubernetes", "Redis", "Microservices"]}
    )
    db.add(jd)
    db.commit()
    db.refresh(jd)

    # Run ATS scoring
    analysis_res = ATSScoringEngine.calculate_full_analysis(
        parsed_resume,
        jd_title=jd.title,
        jd_company=jd.company,
        jd_text=jd.raw_text
    )

    # Create Analysis record
    analysis = Analysis(
        id="demo-analysis-alex-stripe",
        user_id=demo_user.id,
        resume_id=resume.id,
        job_id=jd.id,
        overall_ats_score=analysis_res["overall_ats_score"],
        job_match_score=analysis_res["job_match_score"],
        keyword_match_score=analysis_res["keyword_match_score"],
        quality_score=analysis_res["quality_score"],
        summary=analysis_res["summary"],
        created_at=datetime.now(timezone.utc) - timedelta(hours=2)
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    # Insert scores
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

    # Insert keywords
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

    # Insert skill gaps
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

    # Insert issues
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

    # Insert recommendations
    for rec in analysis_res["recommendations"]:
        db.add(Recommendation(
            id=str(uuid.uuid4()),
            analysis_id=analysis.id,
            section=rec["section"],
            priority=rec["priority"],
            title=rec["title"],
            action_item=rec["action_item"]
        ))

    # Generate demo report PDF
    pdf_path = f"uploads/reports/{analysis.id}_report.pdf"
    analysis_full_dict = {
        **analysis_res,
        "resume_title": resume.title,
        "job_title": jd.title,
        "company_name": jd.company,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    PDFReportService.generate_analysis_pdf(analysis_full_dict, pdf_path)
    
    db.add(Report(
        id=str(uuid.uuid4()),
        user_id=demo_user.id,
        analysis_id=analysis.id,
        file_path=pdf_path,
        format="pdf"
    ))

    # Add a sample Cover Letter
    db.add(CoverLetter(
        id=str(uuid.uuid4()),
        user_id=demo_user.id,
        resume_id=resume.id,
        job_id=jd.id,
        title=f"Cover Letter — {jd.title} at {jd.company}",
        content=(
            f"Dear Hiring Team at {jd.company},\n\n"
            f"I am writing to express my enthusiastic interest in the {jd.title} position at {jd.company}. "
            f"With 6+ years of specialized experience designing high-throughput microservices, distributed caching architectures, "
            f"and resilient cloud infrastructure on AWS, I am eager to contribute to Stripe's mission-critical payment infrastructure.\n\n"
            f"In my current role at CloudScale Technologies, I architected and deployed asynchronous REST services using FastAPI "
            f"and PostgreSQL that reliably process 5M+ daily requests with sub-45ms p99 latency. Additionally, by engineering a Redis "
            f"distributed caching layer and containerizing microservices via Kubernetes, our engineering team reduced primary database load "
            f"by 42% and enhanced deployment velocity 4-fold.\n\n"
            f"Stripe's engineering culture and dedication to rock-solid infrastructure reliability deeply resonate with my technical values. "
            f"I would welcome the opportunity to discuss how my background in distributed systems and API performance can benefit your team.\n\n"
            f"Sincerely,\nAlex Rivera\n(415) 890-2341 • alex.rivera.dev@gmail.com"
        ),
        tone="Professional",
        length="Standard"
    ))

    # Add a 2nd historical analysis for dashboard trend charting
    jd2 = JobDescription(
        id=str(uuid.uuid4()),
        user_id=demo_user.id,
        title="Staff Platform Engineer",
        company="Vercel",
        raw_text="Vercel is looking for a Staff Platform Engineer to scale developer infrastructure, Next.js deployment pipelines, and global Edge network systems. Must have expertise in Go/TypeScript, distributed systems, and Kubernetes.",
        parsed_keywords={"detected": ["Kubernetes", "TypeScript", "Distributed Systems"]}
    )
    db.add(jd2)
    db.commit()

    analysis2 = Analysis(
        id=str(uuid.uuid4()),
        user_id=demo_user.id,
        resume_id=resume.id,
        job_id=jd2.id,
        overall_ats_score=81.5,
        job_match_score=78.0,
        keyword_match_score=75.0,
        quality_score=86.0,
        summary="Solid technical alignment with platform requirements. Expanding on Kubernetes Edge networking details will enhance ATS positioning.",
        created_at=datetime.now(timezone.utc) - timedelta(days=5)
    )
    db.add(analysis2)

    db.commit()
    return demo_user
