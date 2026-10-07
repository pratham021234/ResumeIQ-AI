import os
import re
from typing import Dict, Any, List, Optional
import pymupdf as fitz
from docx import Document

EMAIL_REGEX = r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+'
PHONE_REGEX = r'(?:(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})'
LINKEDIN_REGEX = r'(?:linkedin\.com\/(?:in|pub)\/([a-zA-Z0-9_-]+)|linkedin:\s*([a-zA-Z0-9_-]+))'
GITHUB_REGEX = r'(?:github\.com\/([a-zA-Z0-9_-]+)|github:\s*([a-zA-Z0-9_-]+))'
URL_REGEX = r'https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)'

SECTION_HEADERS = {
    "summary": ["summary", "professional summary", "profile", "about me", "objective", "career objective"],
    "experience": ["experience", "work experience", "professional experience", "employment history", "work history"],
    "education": ["education", "academic background", "academic qualifications", "degrees"],
    "skills": ["skills", "technical skills", "core competencies", "technologies", "key skills", "tools & technologies"],
    "projects": ["projects", "personal projects", "key projects", "notable projects"],
    "certifications": ["certifications", "licenses", "certificates", "credentials"]
}

class ResumeParser:
    @staticmethod
    def parse_file(file_path: str, file_type: Optional[str] = None) -> Dict[str, Any]:
        ext = os.path.splitext(file_path)[1].lower()
        if ext == ".pdf" or file_type == "application/pdf":
            return ResumeParser.parse_pdf(file_path)
        elif ext in [".docx", ".doc"] or "word" in (file_type or ""):
            return ResumeParser.parse_docx(file_path)
        else:
            # Fallback to plain text reading
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    text = f.read()
                return ResumeParser.process_raw_text(text, filename=os.path.basename(file_path))
            except Exception as e:
                raise ValueError(f"Unsupported or unreadable file format: {ext} ({str(e)})")

    @staticmethod
    def parse_pdf(file_path: str) -> Dict[str, Any]:
        doc = fitz.open(file_path)
        page_count = len(doc)
        full_text_pages = []
        has_tables = False
        has_images = False
        multi_column_detected = False
        font_sizes = []
        image_count = 0

        for page_idx, page in enumerate(doc):
            text = page.get_text()
            full_text_pages.append(text)
            
            # Detect images
            images = page.get_images()
            if images:
                has_images = True
                image_count += len(images)

            # Detect layouts and fonts via blocks
            blocks = page.get_text("blocks")
            # If there are multiple blocks at overlapping y coordinates but distinct x coordinates, likely multi-column
            x_coords = []
            for b in blocks:
                # b: (x0, y0, x1, y1, text, block_no, block_type)
                if len(b) >= 5 and isinstance(b[4], str) and b[4].strip():
                    x_coords.append((b[0], b[2]))
                    # Also collect font metadata if dict extraction is available
            
            # Check for multi-column (e.g. left column starting < page_width/3 and right column starting > page_width/2)
            page_width = page.rect.width
            left_col = [x0 for x0, x1 in x_coords if x0 < page_width * 0.4 and x1 < page_width * 0.55]
            right_col = [x0 for x0, x1 in x_coords if x0 > page_width * 0.45]
            if len(left_col) >= 3 and len(right_col) >= 3:
                multi_column_detected = True

            # Detect drawings / tables
            drawings = page.get_drawings()
            if len(drawings) > 15:
                has_tables = True

        raw_text = "\n".join(full_text_pages)
        formatting_meta = {
            "page_count": page_count,
            "has_tables": has_tables,
            "has_images": has_images,
            "image_count": image_count,
            "multi_column_detected": multi_column_detected,
            "word_count": len(raw_text.split()),
            "character_count": len(raw_text),
            "file_type": "PDF"
        }

        parsed = ResumeParser.process_raw_text(raw_text, filename=os.path.basename(file_path))
        parsed["formatting_meta"] = formatting_meta
        return parsed

    @staticmethod
    def parse_docx(file_path: str) -> Dict[str, Any]:
        doc = Document(file_path)
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        has_tables = len(doc.tables) > 0
        raw_text = "\n".join(paragraphs)

        formatting_meta = {
            "page_count": max(1, len(raw_text.split()) // 400),
            "has_tables": has_tables,
            "table_count": len(doc.tables),
            "has_images": False, # Docx image extraction
            "image_count": 0,
            "multi_column_detected": False,
            "word_count": len(raw_text.split()),
            "character_count": len(raw_text),
            "file_type": "DOCX"
        }

        parsed = ResumeParser.process_raw_text(raw_text, filename=os.path.basename(file_path))
        parsed["formatting_meta"] = formatting_meta
        return parsed

    @staticmethod
    def process_raw_text(raw_text: str, filename: str = "Resume.pdf") -> Dict[str, Any]:
        # Extract contact information
        emails = list(set(re.findall(EMAIL_REGEX, raw_text)))
        phones = list(set([m[0] if isinstance(m, tuple) else m for m in re.findall(PHONE_REGEX, raw_text)]))
        valid_phones = [p.strip() for p in phones if len(p.strip()) > 7]
        links = list(set(re.findall(URL_REGEX, raw_text)))

        linkedin_match = re.search(LINKEDIN_REGEX, raw_text, re.IGNORECASE)
        linkedin = linkedin_match.group(0) if linkedin_match else next((l for l in links if "linkedin.com" in l), None)

        github_match = re.search(GITHUB_REGEX, raw_text, re.IGNORECASE)
        github = github_match.group(0) if github_match else next((l for l in links if "github.com" in l), None)
        
        # Section extraction
        lines = [line.strip() for line in raw_text.split("\n") if line.strip()]
        sections: Dict[str, List[str]] = {
            "summary": [],
            "experience": [],
            "education": [],
            "skills": [],
            "projects": [],
            "certifications": [],
            "other": []
        }

        current_section = "summary"
        header_detected_counts = {}

        for line in lines:
            normalized_line = re.sub(r'[^a-zA-Z\s]', '', line).lower().strip()
            
            # Check if line matches a known section header
            matched_header = None
            for sec, variants in SECTION_HEADERS.items():
                if normalized_line in variants or any(normalized_line.startswith(v) and len(normalized_line) < len(v) + 5 for v in variants):
                    matched_header = sec
                    header_detected_counts[sec] = True
                    break
            
            if matched_header:
                current_section = matched_header
            else:
                sections[current_section].append(line)

        # Merge sections text
        parsed_sections = {k: "\n".join(v) for k, v in sections.items()}

        return {
            "file_name": filename,
            "raw_text": raw_text,
            "contact_info": {
                "email": emails[0] if emails else None,
                "emails": emails,
                "phone": valid_phones[0] if valid_phones else None,
                "phones": valid_phones,
                "linkedin": linkedin,
                "github": github,
                "links": links
            },
            "detected_headers": list(header_detected_counts.keys()),
            "parsed_sections": parsed_sections
        }
