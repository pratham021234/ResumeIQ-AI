import math
import pytest
from app.scoring.ats_scoring import ATSScoringEngine, score_to_status

class TestATSScoringEngine:
    @pytest.fixture
    def sample_parsed_resume(self, synthetic_resume_text):
        from app.parsers.resume_parser import ResumeParser
        return ResumeParser.process_raw_text(synthetic_resume_text, filename="alex_resume.pdf")

    def test_score_to_status_mapping(self):
        assert score_to_status(95.0) == "Excellent"
        assert score_to_status(90.0) == "Excellent"
        assert score_to_status(85.0) == "Strong"
        assert score_to_status(80.0) == "Strong"
        assert score_to_status(75.0) == "Good"
        assert score_to_status(70.0) == "Good"
        assert score_to_status(65.0) == "Needs Improvement"
        assert score_to_status(60.0) == "Needs Improvement"
        assert score_to_status(55.0) == "Poor"
        assert score_to_status(0.0) == "Poor"

    def test_audit_formatting_standard_resume(self, sample_parsed_resume):
        sample_parsed_resume["formatting_meta"] = {
            "page_count": 1,
            "has_tables": False,
            "has_images": False,
            "image_count": 0,
            "multi_column_detected": False,
            "word_count": 350,
            "character_count": 2200,
            "file_type": "PDF"
        }
        score, issues = ATSScoringEngine.audit_formatting(sample_parsed_resume)
        
        # Standard clean resume should score high (>= 90)
        assert 90.0 <= score <= 100.0
        assert isinstance(issues, list)
        assert len(issues) > 0
        assert all("severity" in i for i in issues)

    def test_audit_formatting_penalties(self, sample_parsed_resume):
        # Resume with multi-column, tables, images, and brief length
        sample_parsed_resume["formatting_meta"] = {
            "page_count": 1,
            "has_tables": True,
            "has_images": True,
            "image_count": 3,
            "multi_column_detected": True,
            "word_count": 100,  # brief length penalty
            "character_count": 600,
            "file_type": "PDF"
        }
        score, issues = ATSScoringEngine.audit_formatting(sample_parsed_resume)
        
        # Penalties should reduce score, but engine enforces floor at 35.0
        assert 35.0 <= score < 75.0
        warning_categories = [i["category"] for i in issues if i["severity"] in ("Warning", "Critical")]
        assert "Multi-column layout" in warning_categories
        assert "Tables" in warning_categories
        assert "Graphics" in warning_categories

    def test_calculate_full_analysis_valid_input(self, sample_parsed_resume):
        jd_title = "Senior Backend Engineer"
        jd_company = "Stripe"
        jd_text = """
        We need a Senior Backend Engineer with strong expertise in Python, FastAPI, PostgreSQL,
        Redis, AWS, Docker, Kubernetes, and REST APIs. Experience with microservices is essential.
        """
        
        analysis = ATSScoringEngine.calculate_full_analysis(
            sample_parsed_resume,
            jd_title=jd_title,
            jd_company=jd_company,
            jd_text=jd_text
        )
        
        assert "overall_ats_score" in analysis
        assert "job_match_score" in analysis
        assert "scores" in analysis
        assert "sections_analysis" in analysis
        
        overall = analysis["overall_ats_score"]
        job_match = analysis["job_match_score"]
        
        # Documented range: 0.0 to 100.0
        assert 0.0 <= overall <= 100.0
        assert 0.0 <= job_match <= 100.0
        assert not math.isnan(overall)
        assert not math.isinf(overall)
        assert not math.isnan(job_match)
        assert not math.isinf(job_match)
        
        # Check scores breakdown
        breakdown = analysis["scores"]
        assert len(breakdown) >= 6
        for cat in breakdown:
            assert 0.0 <= cat["score"] <= 100.0
            assert cat["status"] in ["Excellent", "Strong", "Good", "Needs Improvement", "Poor"]

    def test_scoring_determinism(self, sample_parsed_resume):
        jd_title = "Senior Backend Engineer"
        jd_company = "Scale AI"
        jd_text = "Looking for Python, FastAPI, PostgreSQL, and Kubernetes specialists."
        
        run_1 = ATSScoringEngine.calculate_full_analysis(sample_parsed_resume, jd_title, jd_company, jd_text)
        run_2 = ATSScoringEngine.calculate_full_analysis(sample_parsed_resume, jd_title, jd_company, jd_text)
        
        assert run_1["overall_ats_score"] == run_2["overall_ats_score"]
        assert run_1["job_match_score"] == run_2["job_match_score"]
        assert run_1["keyword_match_score"] == run_2["keyword_match_score"]
        assert run_1["quality_score"] == run_2["quality_score"]

    def test_empty_resume_and_jd_edge_cases(self):
        empty_resume = {
            "file_name": "empty.pdf",
            "raw_text": "",
            "contact_info": {},
            "detected_headers": [],
            "parsed_sections": {},
            "formatting_meta": {}
        }
        
        analysis = ATSScoringEngine.calculate_full_analysis(
            empty_resume,
            jd_title="",
            jd_company="",
            jd_text=""
        )
        
        assert 0.0 <= analysis["overall_ats_score"] <= 100.0
        assert not math.isnan(analysis["overall_ats_score"])
        assert not math.isinf(analysis["overall_ats_score"])
        assert 0.0 <= analysis["job_match_score"] <= 100.0
