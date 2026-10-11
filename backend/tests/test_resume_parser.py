import os
import pytest
from app.parsers.resume_parser import ResumeParser

class TestResumeParser:
    def test_parse_valid_text_resume(self, synthetic_resume_text, tmp_path):
        txt_file = tmp_path / "valid_resume.txt"
        txt_file.write_text(synthetic_resume_text, encoding="utf-8")
        
        result = ResumeParser.parse_file(str(txt_file))
        assert result is not None
        assert "raw_text" in result
        assert "contact_info" in result
        assert "parsed_sections" in result
        
        # Verify contact extraction
        contact = result["contact_info"]
        assert contact["email"] == "alex.rivera@example.com"
        assert "415" in (contact["phone"] or "")
        assert contact["linkedin"] is not None
        assert "alexrivera-test" in contact["linkedin"]
        
        # Verify detected sections
        sections = result["parsed_sections"]
        assert "experience" in sections
        assert "skills" in sections
        assert "FastAPI" in sections["skills"]
        assert len(result["detected_headers"]) >= 3

    def test_parse_valid_pdf_resume(self, synthetic_pdf_file):
        result = ResumeParser.parse_file(synthetic_pdf_file)
        assert result is not None
        assert "formatting_meta" in result
        meta = result["formatting_meta"]
        assert meta["file_type"] == "PDF"
        assert meta["page_count"] >= 1
        assert meta["word_count"] > 20
        assert "alex.rivera@example.com" in result["raw_text"]

    def test_parse_valid_docx_resume(self, synthetic_docx_file):
        result = ResumeParser.parse_file(synthetic_docx_file)
        assert result is not None
        assert "formatting_meta" in result
        meta = result["formatting_meta"]
        assert meta["file_type"] == "DOCX"
        assert meta["word_count"] > 20
        assert "CloudScale Technologies" in result["raw_text"]

    def test_parse_empty_text_file(self, tmp_path):
        empty_file = tmp_path / "empty.txt"
        empty_file.write_text("", encoding="utf-8")
        
        result = ResumeParser.parse_file(str(empty_file))
        assert result["raw_text"] == ""
        assert result["contact_info"]["email"] is None
        assert result["contact_info"]["phone"] is None
        assert result["detected_headers"] == []

    def test_parse_empty_or_corrupt_pdf(self, tmp_path):
        corrupt_pdf = tmp_path / "corrupt.pdf"
        corrupt_pdf.write_bytes(b"NOT_A_REAL_PDF_HEADER_DATA")
        
        with pytest.raises(Exception):
            ResumeParser.parse_file(str(corrupt_pdf))

    def test_parse_unsupported_file_extension(self, tmp_path):
        # A file with an unreadable binary format that cannot be read as text or parsed
        bin_file = tmp_path / "resume.exe"
        bin_file.write_bytes(b"\x00\x01\x02\x03\x04\xff\xfe")
        
        # Plain text fallback will read bytes with errors='ignore', yielding unparseable or minimal text
        result = ResumeParser.parse_file(str(bin_file))
        assert result is not None
        assert result["contact_info"]["email"] is None

    def test_missing_contact_info_handled_gracefully(self, tmp_path):
        resume_no_contact = """SUMMARY
Software engineer with passion for distributed computing.
EXPERIENCE
Built scalable microservices.
"""
        txt_file = tmp_path / "no_contact.txt"
        txt_file.write_text(resume_no_contact, encoding="utf-8")
        
        result = ResumeParser.parse_file(str(txt_file))
        assert result["contact_info"]["email"] is None
        assert result["contact_info"]["phone"] is None
        assert result["contact_info"]["linkedin"] is None
        assert "summary" in result["parsed_sections"]
