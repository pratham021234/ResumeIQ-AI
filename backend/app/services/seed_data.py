import os
import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.models.models import (
    User, Resume, ResumeVersion, JobDescription, Analysis,
    AnalysisScore, KeywordMatch, SkillGap, ResumeIssue, Recommendation,
    CoverLetter, Subscription, Report, Invoice, Payment, Plan, UsageTracker
)
from app.core.security import get_password_hash
from app.scoring.ats_scoring import ATSScoringEngine
from app.parsers.resume_parser import ResumeParser
from app.services.pdf_report_service import PDFReportService
from app.services.billing_service import BillingService

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
    # Ensure standard plans exist
    BillingService.seed_plans(db)

    # Check if demo user already exists
    demo_user = db.query(User).filter(User.email == "demo@resumeiq.ai").first()
    if demo_user:
        # Check if recruiter is seeded
        recruiter_user = db.query(User).filter(User.email == "recruiter@resumeiq.ai").first()
        if not recruiter_user:
            recruiter_user = User(
                id=str(uuid.uuid4()),
                email="recruiter@resumeiq.ai",
                hashed_password=get_password_hash("password123"),
                full_name="Elena Rostova (Recruiter)",
                plan="recruiter",
                is_recruiter=True
            )
            db.add(recruiter_user)
            db.commit()

        # Ensure demo user has active Pro subscription & invoice
        demo_sub = db.query(Subscription).filter(Subscription.user_id == demo_user.id).first()
        if not demo_sub:
            demo_sub = Subscription(
                id=str(uuid.uuid4()),
                user_id=str(demo_user.id),
                plan="pro",
                provider="stripe",
                provider_subscription_id="sub_stripe_demo_alex",
                status="active",
                current_period_start=datetime.now(timezone.utc) - timedelta(days=5),
                current_period_end=datetime.now(timezone.utc) + timedelta(days=25),
                cancel_at_period_end=False,
                created_at=datetime.now(timezone.utc) - timedelta(days=5)
            )
            db.add(demo_sub)
            db.commit()

        demo_inv = db.query(Invoice).filter(Invoice.user_id == demo_user.id).first()
        if not demo_inv and demo_sub:
            demo_inv = Invoice(
                id=str(uuid.uuid4()),
                user_id=str(demo_user.id),
                subscription_id=str(demo_sub.id),
                invoice_number="INV-202610-PRO-001",
                provider="stripe",
                provider_invoice_id="in_stripe_demo_alex",
                amount=299.0,
                currency="INR",
                status="paid",
                plan_name="Pro",
                paid_at=datetime.now(timezone.utc) - timedelta(days=5),
                created_at=datetime.now(timezone.utc) - timedelta(days=5)
            )
            db.add(demo_inv)
            demo_pay = Payment(
                id=str(uuid.uuid4()),
                user_id=str(demo_user.id),
                subscription_id=str(demo_sub.id),
                invoice_id=str(demo_inv.id),
                provider="stripe",
                provider_payment_id="pay_stripe_demo_alex",
                amount=299.0,
                currency="INR",
                status="succeeded",
                payment_method="card",
                created_at=datetime.now(timezone.utc) - timedelta(days=5)
            )
            db.add(demo_pay)
            db.commit()

        # Ensure recruiter user has active Recruiter subscription & invoice
        if recruiter_user:
            rec_sub = db.query(Subscription).filter(Subscription.user_id == recruiter_user.id).first()
            if not rec_sub:
                rec_sub = Subscription(
                    id=str(uuid.uuid4()),
                    user_id=str(recruiter_user.id),
                    plan="recruiter",
                    provider="razorpay",
                    provider_subscription_id="sub_rzp_demo_elena",
                    status="active",
                    current_period_start=datetime.now(timezone.utc) - timedelta(days=10),
                    current_period_end=datetime.now(timezone.utc) + timedelta(days=20),
                    cancel_at_period_end=False,
                    created_at=datetime.now(timezone.utc) - timedelta(days=10)
                )
                db.add(rec_sub)
                db.commit()

            rec_inv = db.query(Invoice).filter(Invoice.user_id == recruiter_user.id).first()
            if not rec_inv and rec_sub:
                rec_inv = Invoice(
                    id=str(uuid.uuid4()),
                    user_id=str(recruiter_user.id),
                    subscription_id=str(rec_sub.id),
                    invoice_number="INV-202610-REC-001",
                    provider="razorpay",
                    provider_invoice_id="inv_rzp_demo_elena",
                    amount=1999.0,
                    currency="INR",
                    status="paid",
                    plan_name="Recruiter",
                    paid_at=datetime.now(timezone.utc) - timedelta(days=10),
                    created_at=datetime.now(timezone.utc) - timedelta(days=10)
                )
                db.add(rec_inv)
                rec_pay = Payment(
                    id=str(uuid.uuid4()),
                    user_id=str(recruiter_user.id),
                    subscription_id=str(rec_sub.id),
                    invoice_id=str(rec_inv.id),
                    provider="razorpay",
                    provider_payment_id="pay_rzp_demo_elena",
                    amount=1999.0,
                    currency="INR",
                    status="succeeded",
                    payment_method="upi",
                    created_at=datetime.now(timezone.utc) - timedelta(days=10)
                )
                db.add(rec_pay)
                db.commit()

        # Update primary JDs with skills if empty
        jds = db.query(JobDescription).all()
        for j in jds:
            if not getattr(j, "skills", None):
                setattr(j, "skills", ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker", "AWS", "Kubernetes"])
                setattr(j, "experience_level", getattr(j, "experience_level", None) or "Senior")
                setattr(j, "status", getattr(j, "status", None) or "Active")
        db.commit()

        # Check if Jordan Lee is seeded
        res2_check = db.query(Resume).filter(Resume.file_name == "Jordan_Lee_Senior_Backend.pdf").first()
        target_jd = jds[0] if jds else None
        if not res2_check and target_jd:
            res2 = Resume(
                id=str(uuid.uuid4()),
                user_id=demo_user.id,
                title="Jordan Lee Resume",
                file_name="Jordan_Lee_Senior_Backend.pdf",
                file_path="uploads/demo_jordan.pdf",
                file_size=845120,
                file_type="application/pdf",
                raw_text="JORDAN LEE\nSeattle, WA • jordan.lee@techmail.io • (206) 555-0192\n\nSUMMARY\nBackend Engineer with 5 years building scalable web APIs with Go, Python, PostgreSQL, and Docker.\n\nSKILLS\nGo, Python, PostgreSQL, Docker, Redis, REST APIs, Git, Linux\n\nEXPERIENCE\nBackend Developer | NovaCloud (2021 - Present)\n- Developed distributed backend services processing 2M daily API events.\n- Improved PostgreSQL query response times by 35% with index tuning.\n- Containerized microservices using Docker.",
                parsed_sections={
                    "summary": "Backend Engineer with 5 years building scalable web APIs with Go, Python, PostgreSQL, and Docker.",
                    "skills": "Go, Python, PostgreSQL, Docker, Redis, REST APIs, Git, Linux",
                    "experience": "Backend Developer | NovaCloud (2021 - Present)\n- Developed distributed backend services processing 2M daily API events.\n- Improved PostgreSQL query response times by 35% with index tuning.",
                    "education": "B.S. in Computer Science — University of Washington (2020)"
                },
                formatting_meta={
                    "candidate_name": "Jordan Lee",
                    "candidate_email": "jordan.lee@techmail.io",
                    "candidate_phone": "(206) 555-0192",
                    "education": "B.S. in Computer Science"
                }
            )
            db.add(res2)
            db.commit()

            a_res2 = Analysis(
                id=str(uuid.uuid4()),
                user_id=demo_user.id,
                resume_id=res2.id,
                job_id=target_jd.id,
                overall_ats_score=86.0,
                job_match_score=84.5,
                keyword_match_score=82.0,
                quality_score=88.0,
                summary="Solid backend background with Go, Python, and PostgreSQL. Demonstrates good concurrency knowledge.",
                screening_summary={
                    "strengths": [
                        "Strong Go and Python backend fundamentals",
                        "Demonstrated database query optimization (35% speedup)",
                        "Solid Docker containerization experience"
                    ],
                    "concerns": [
                        "Missing Kubernetes production orchestration",
                        "Limited cloud provider depth (AWS/GCP)"
                    ],
                    "recommendation": "Strong Candidate"
                },
                created_at=datetime.now(timezone.utc) - timedelta(hours=6)
            )
            db.add(a_res2)

            res3 = Resume(
                id=str(uuid.uuid4()),
                user_id=demo_user.id,
                title="Sarah Chen Resume",
                file_name="Sarah_Chen_FullStack.pdf",
                file_path="uploads/demo_sarah.pdf",
                file_size=912400,
                file_type="application/pdf",
                raw_text="SARAH CHEN\nNew York, NY • sarah.chen@innovate.org • (917) 555-4412\n\nSUMMARY\nFull Stack & Backend Developer with 4 years experience with Python, Django, REST APIs, and MySQL.\n\nSKILLS\nPython, Django, Flask, JavaScript, MySQL, Redis, Git\n\nEXPERIENCE\nSoftware Engineer | FinEdge (2022 - Present)\n- Maintained customer billing APIs handling 50k transactions weekly.\n- Built internal admin dashboards with Django.",
                parsed_sections={
                    "summary": "Full Stack & Backend Developer with 4 years experience with Python, Django, REST APIs, and MySQL.",
                    "skills": "Python, Django, Flask, JavaScript, MySQL, Redis, Git",
                    "experience": "Software Engineer | FinEdge (2022 - Present)\n- Maintained customer billing APIs handling 50k transactions weekly.",
                    "education": "M.S. in Data Science — Columbia University (2021)"
                },
                formatting_meta={
                    "candidate_name": "Sarah Chen",
                    "candidate_email": "sarah.chen@innovate.org",
                    "candidate_phone": "(917) 555-4412",
                    "education": "M.S. in Data Science"
                }
            )
            db.add(res3)
            db.commit()

            a_res3 = Analysis(
                id=str(uuid.uuid4()),
                user_id=demo_user.id,
                resume_id=res3.id,
                job_id=target_jd.id,
                overall_ats_score=78.5,
                job_match_score=74.0,
                keyword_match_score=72.0,
                quality_score=80.0,
                summary="Good Python web experience with Django. Lacks high-concurrency microservices and Docker/Kubernetes.",
                screening_summary={
                    "strengths": [
                        "Strong academic credentials (M.S. in Data Science)",
                        "Solid Python and relational database foundations"
                    ],
                    "concerns": [
                        "Missing Docker and Kubernetes",
                        "Limited cloud architecture and microservices exposure"
                    ],
                    "recommendation": "Review Recommended"
                },
                created_at=datetime.now(timezone.utc) - timedelta(hours=18)
            )
            db.add(a_res3)
            db.commit()

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
        jd_title=str(jd.title),
        jd_company=str(jd.company),
        jd_text=str(jd.raw_text)
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

    # Set screening summary for primary analysis
    setattr(analysis, "screening_summary", {
        "strengths": [
            "Strong Python & FastAPI microservices architecture",
            "Quantified business metrics: sub-45ms p99 latency & $25M+ transaction processing",
            "Hands-on production Kubernetes and AWS cloud infrastructure"
        ],
        "concerns": [
            "Missing Docker container orchestration mentions in early roles",
            "Limited Kafka event streaming exposure compared to RabbitMQ"
        ],
        "recommendation": "Strong Candidate"
    })

    # Seed Recruiter Account & Additional Candidates
    recruiter_user = db.query(User).filter(User.email == "recruiter@resumeiq.ai").first()
    if not recruiter_user:
        recruiter_user = User(
            id=str(uuid.uuid4()),
            email="recruiter@resumeiq.ai",
            hashed_password=get_password_hash("password123"),
            full_name="Elena Rostova (Recruiter)",
            plan="enterprise",
            is_recruiter=True
        )
        db.add(recruiter_user)
        db.commit()
        db.refresh(recruiter_user)

    # Update primary JD with skills and experience level
    setattr(jd, "skills", ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker", "AWS", "Kubernetes"])
    setattr(jd, "experience_level", "Senior")
    setattr(jd, "status", "Active")

    # Candidate 2: Jordan Lee
    res2 = Resume(
        id=str(uuid.uuid4()),
        user_id=demo_user.id,
        title="Jordan Lee Resume",
        file_name="Jordan_Lee_Senior_Backend.pdf",
        file_path="uploads/demo_jordan.pdf",
        file_size=845120,
        file_type="application/pdf",
        raw_text="JORDAN LEE\nSeattle, WA • jordan.lee@techmail.io • (206) 555-0192\n\nSUMMARY\nBackend Engineer with 5 years building scalable web APIs with Go, Python, PostgreSQL, and Docker.\n\nSKILLS\nGo, Python, PostgreSQL, Docker, Redis, REST APIs, Git, Linux\n\nEXPERIENCE\nBackend Developer | NovaCloud (2021 - Present)\n- Developed distributed backend services processing 2M daily API events.\n- Improved PostgreSQL query response times by 35% with index tuning.\n- Containerized microservices using Docker.",
        parsed_sections={
            "summary": "Backend Engineer with 5 years building scalable web APIs with Go, Python, PostgreSQL, and Docker.",
            "skills": "Go, Python, PostgreSQL, Docker, Redis, REST APIs, Git, Linux",
            "experience": "Backend Developer | NovaCloud (2021 - Present)\n- Developed distributed backend services processing 2M daily API events.\n- Improved PostgreSQL query response times by 35% with index tuning.",
            "education": "B.S. in Computer Science — University of Washington (2020)"
        },
        formatting_meta={
            "candidate_name": "Jordan Lee",
            "candidate_email": "jordan.lee@techmail.io",
            "candidate_phone": "(206) 555-0192",
            "education": "B.S. in Computer Science"
        }
    )
    db.add(res2)
    db.commit()

    a_res2 = Analysis(
        id=str(uuid.uuid4()),
        user_id=demo_user.id,
        resume_id=res2.id,
        job_id=jd.id,
        overall_ats_score=81.0,
        job_match_score=79.5,
        keyword_match_score=80.0,
        quality_score=84.0,
        summary="Solid backend background with Go, Python, and PostgreSQL. Demonstrates good concurrency knowledge.",
        screening_summary={
            "strengths": [
                "Strong Go and Python backend fundamentals",
                "Demonstrated database query optimization (35% speedup)",
                "Solid Docker containerization experience"
            ],
            "concerns": [
                "Missing Kubernetes production orchestration",
                "Limited cloud provider depth (AWS/GCP)"
            ],
            "recommendation": "Strong Candidate"
        },
        created_at=datetime.now(timezone.utc) - timedelta(hours=6)
    )
    db.add(a_res2)

    # Candidate 3: Sarah Chen
    res3 = Resume(
        id=str(uuid.uuid4()),
        user_id=demo_user.id,
        title="Sarah Chen Resume",
        file_name="Sarah_Chen_FullStack.pdf",
        file_size=912400,
        file_type="application/pdf",
        raw_text="SARAH CHEN\nNew York, NY • sarah.chen@innovate.org • (917) 555-4412\n\nSUMMARY\nFull Stack & Backend Developer with 4 years experience with Python, Django, REST APIs, and MySQL.\n\nSKILLS\nPython, Django, Flask, JavaScript, MySQL, Redis, Git\n\nEXPERIENCE\nSoftware Engineer | FinEdge (2022 - Present)\n- Maintained customer billing APIs handling 50k transactions weekly.\n- Built internal admin dashboards with Django.",
        parsed_sections={
            "summary": "Full Stack & Backend Developer with 4 years experience with Python, Django, REST APIs, and MySQL.",
            "skills": "Python, Django, Flask, JavaScript, MySQL, Redis, Git",
            "experience": "Software Engineer | FinEdge (2022 - Present)\n- Maintained customer billing APIs handling 50k transactions weekly.",
            "education": "M.S. in Data Science — Columbia University (2021)"
        },
        formatting_meta={
            "candidate_name": "Sarah Chen",
            "candidate_email": "sarah.chen@innovate.org",
            "candidate_phone": "(917) 555-4412",
            "education": "M.S. in Data Science"
        }
    )
    db.add(res3)
    db.commit()

    a_res3 = Analysis(
        id=str(uuid.uuid4()),
        user_id=demo_user.id,
        resume_id=res3.id,
        job_id=jd.id,
        overall_ats_score=74.5,
        job_match_score=71.0,
        keyword_match_score=70.0,
        quality_score=78.0,
        summary="Good Python web experience with Django. Lacks high-concurrency microservices and Docker/Kubernetes.",
        screening_summary={
            "strengths": [
                "Strong academic credentials (M.S. in Data Science)",
                "Solid Python and relational database foundations"
            ],
            "concerns": [
                "Missing Docker and Kubernetes",
                "Limited cloud architecture and microservices exposure"
            ],
            "recommendation": "Review Recommended"
        },
        created_at=datetime.now(timezone.utc) - timedelta(hours=18)
    )
    db.add(a_res3)

    db.commit()
    return demo_user

