import pytest
from app.scoring.keyword_extractor import (
    extract_keywords_from_jd,
    match_keyword_in_text,
    normalize_token,
    KEYWORD_SYNONYMS,
    TECH_KEYWORDS_CATALOG
)

class TestKeywordMatcher:
    def test_extract_keywords_from_valid_jd(self):
        jd_text = """
        We are seeking a Senior Backend Engineer with extensive experience in Python, FastAPI, and PostgreSQL.
        You should also be skilled in Docker, Kubernetes (k8s), and AWS cloud architectures.
        Experience in building distributed REST APIs and caching with Redis is required.
        """
        keywords = extract_keywords_from_jd(jd_text)
        assert len(keywords) > 0
        extracted_names = [k["keyword"].lower() for k in keywords]
        
        assert "python" in extracted_names
        assert "fastapi" in extracted_names
        assert "postgresql" in extracted_names
        assert "docker" in extracted_names
        assert "redis" in extracted_names

    def test_keyword_relevance_distinction(self):
        # Repetitive keyword should have 'high' relevance
        jd_text = "Python developer needed. Must love Python programming and Python testing. Familiarity with Docker."
        keywords = extract_keywords_from_jd(jd_text)
        kw_map = {k["keyword"].lower(): k for k in keywords}
        
        assert "python" in kw_map
        assert kw_map["python"]["relevance"] == "high"
        assert kw_map["python"]["count"] >= 3

    def test_synonym_and_alias_matching(self):
        # Text contains abbreviations; match should detect them
        text = "Engineered microservices on k8s with postgres and aws."
        norm_text = normalize_token(text)
        
        assert match_keyword_in_text("kubernetes", norm_text) is True
        assert match_keyword_in_text("postgresql", norm_text) is True
        assert match_keyword_in_text("aws", norm_text) is True
        assert match_keyword_in_text("amazon web services", norm_text) is True

    def test_empty_job_description(self):
        keywords = extract_keywords_from_jd("")
        assert keywords == []

    def test_whitespace_and_punctuation_jd(self):
        keywords = extract_keywords_from_jd("   \n\t   --- ... !!! ??? ")
        assert keywords == []

    def test_empty_resume_matching(self):
        empty_text = ""
        assert match_keyword_in_text("python", empty_text) is False
        assert match_keyword_in_text("fastapi", empty_text) is False

    def test_non_matching_keywords(self):
        text = "Proficient in Ruby, Rails, and SQLite for small web apps."
        norm_text = normalize_token(text)
        
        assert match_keyword_in_text("python", norm_text) is False
        assert match_keyword_in_text("kubernetes", norm_text) is False
        assert match_keyword_in_text("ruby", norm_text) is True

    def test_token_normalization_special_characters(self):
        raw = "Expert in C++, Node.js, Next.js, and CI/CD pipelines!"
        cleaned = normalize_token(raw)
        
        assert "c++" in cleaned
        assert "node.js" in cleaned
        assert "ci/cd" in cleaned
