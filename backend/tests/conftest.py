import os
import sys
from pathlib import Path
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient
from docx import Document
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

# Ensure backend root is on sys.path
backend_root = Path(__file__).resolve().parent.parent
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

from app.core.database import Base, get_db as core_get_db
from app.api.deps import get_db as deps_get_db
from app.models.models import User
from app.core.security import get_password_hash
from main import app

# Isolated in-memory SQLite engine for tests
TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)

@pytest.fixture
def db_session():
    """Provides a fresh isolated database session for each test."""
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()

@pytest.fixture
def client(db_session):
    """FastAPI TestClient with isolated test database session override."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[deps_get_db] = override_get_db
    app.dependency_overrides[core_get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def synthetic_resume_text() -> str:
    return """ALEX RIVERA
San Francisco, CA • alex.rivera@example.com • (415) 555-0199 • linkedin.com/in/alexrivera-test • github.com/alexrivera-test

PROFESSIONAL SUMMARY
Senior Backend & Systems Engineer with 6+ years of experience building high-throughput microservices, scalable distributed architectures, and developer platforms. Proven expertise in Python, FastAPI, PostgreSQL, and AWS with a track record of driving 99.99% system availability and optimizing API latency for 5M+ daily requests.

EXPERIENCE
CloudScale Technologies — Senior Backend Engineer (2022 - Present)
• Architected asynchronous REST APIs using FastAPI and PostgreSQL, serving 5M+ daily requests with sub-45ms p99 latency.
• Engineered distributed caching layer with Redis cluster, reducing primary database load by 42%.
• Spearheaded migration of monolithic Django service to containerized microservices orchestrated via Kubernetes on AWS ECS.
• Mentored 4 junior engineers on backend testing, code reviews, and distributed systems best practices.

DataStream Systems — Software Engineer (2019 - 2022)
• Developed data ingestion pipelines using Python and Docker, processing 2TB daily streaming data into PostgreSQL and Elasticsearch.
• Automated CI/CD deployment workflows using GitHub Actions, cutting release cycle time by 60%.
• Reduced query bottlenecks by creating optimized indexes and partitioning large database tables.

TECHNICAL SKILLS
Languages: Python, Go, TypeScript, SQL
Frameworks & Libraries: FastAPI, Django, Flask, Node.js, Next.js, Pydantic, SQLAlchemy
Databases & Storage: PostgreSQL, Redis, Elasticsearch, DynamoDB
Cloud & DevOps: Docker, Kubernetes, AWS (ECS, S3, RDS), GitHub Actions, Terraform
Architecture & Concepts: Microservices, REST APIs, System Design, CI/CD, Unit Testing

EDUCATION
University of California, Berkeley — B.S. in Computer Science (2015 - 2019)

CERTIFICATIONS
AWS Certified Solutions Architect – Associate
"""

@pytest.fixture
def synthetic_pdf_file(tmp_path, synthetic_resume_text) -> str:
    pdf_path = tmp_path / "synthetic_resume.pdf"
    c = canvas.Canvas(str(pdf_path), pagesize=letter)
    text_object = c.beginText(50, 750)
    text_object.setFont("Helvetica", 10)
    for line in synthetic_resume_text.splitlines()[:50]:
        text_object.textLine(line)
    c.drawText(text_object)
    c.showPage()
    c.save()
    return str(pdf_path)

@pytest.fixture
def synthetic_docx_file(tmp_path, synthetic_resume_text) -> str:
    docx_path = tmp_path / "synthetic_resume.docx"
    doc = Document()
    for line in synthetic_resume_text.splitlines():
        if line.isupper() and len(line) < 30:
            doc.add_heading(line, level=2)
        elif line.strip():
            doc.add_paragraph(line)
    doc.save(str(docx_path))
    return str(docx_path)
