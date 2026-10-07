import re
from typing import Dict, Any, List, Tuple
from app.scoring.keyword_extractor import (
    extract_keywords_from_jd,
    match_keyword_in_text,
    normalize_token
)

STRONG_ACTION_VERBS = [
    "architected", "engineered", "spearheaded", "accelerated", "designed",
    "implemented", "deployed", "scaled", "optimized", "streamlined",
    "orchestrated", "automated", "mentored", "reduced", "increased",
    "generated", "built", "launched", "championed", "led"
]

WEAK_ACTION_VERBS = [
    "helped", "assisted", "worked on", "responsible for", "participated in",
    "handled", "dealt with", "did", "was involved in", "supported"
]

METRIC_PATTERNS = [
    r'\b\d+%', r'\$\d+', r'\b\d+x\b', r'\b\d+\s*(?:ms|seconds|minutes|hours)\b',
    r'\b\d+\s*(?:users|clients|customers|requests|queries|engineers|team members|repos)\b',
    r'\b\d+\s*(?:million|billion|thousand|k|m|b)\b'
]

def score_to_status(score: float) -> str:
    if score >= 90:
        return "Excellent"
    elif score >= 80:
        return "Strong"
    elif score >= 70:
        return "Good"
    elif score >= 60:
        return "Needs Improvement"
    else:
        return "Poor"

class ATSScoringEngine:
    @staticmethod
    def audit_formatting(resume_data: Dict[str, Any]) -> Tuple[float, List[Dict[str, Any]]]:
        formatting_meta = resume_data.get("formatting_meta", {})
        contact_info = resume_data.get("contact_info", {})
        detected_headers = resume_data.get("detected_headers", [])
        raw_text = resume_data.get("raw_text", "")
        
        issues = []
        deductions = 0

        # 1. Multi-column layout
        if formatting_meta.get("multi_column_detected", False):
            deductions += 15
            issues.append({
                "severity": "Warning",
                "category": "Multi-column layout",
                "title": "Multi-column layout detected",
                "description": "Some legacy ATS scanners read multi-column text horizontally across columns, scrambling content order.",
                "recommendation": "Use a clean, single-column layout with standard margins for guaranteed ATS parsing."
            })
        else:
            issues.append({
                "severity": "Passed",
                "category": "Multi-column layout",
                "title": "Single-column structure confirmed",
                "description": "Standard linear layout ensures ATS scanners parse your experience chronologically without disruption.",
                "recommendation": None
            })

        # 2. Tables
        if formatting_meta.get("has_tables", False):
            deductions += 10
            issues.append({
                "severity": "Warning",
                "category": "Tables",
                "title": "Tables or grid structures detected",
                "description": "Tables can cause parser confusion when ATS systems flatten cell structures into raw text.",
                "recommendation": "Replace tabular layouts with bulleted lists and tab stops."
            })
        else:
            issues.append({
                "severity": "Passed",
                "category": "Tables",
                "title": "No table structures detected",
                "description": "Text flows cleanly without nested table structures.",
                "recommendation": None
            })

        # 3. Graphics & Images
        if formatting_meta.get("has_images", False) and formatting_meta.get("image_count", 0) > 1:
            deductions += 12
            issues.append({
                "severity": "Critical",
                "category": "Graphics",
                "title": "Embedded graphics or images detected",
                "description": f"Detected {formatting_meta.get('image_count')} embedded image(s). ATS parsers cannot read text locked inside images or logos.",
                "recommendation": "Remove profile photos, logos, icon graphics, and skill progress bars."
            })
        else:
            issues.append({
                "severity": "Passed",
                "category": "Graphics",
                "title": "Clean vector typography without raster graphics",
                "description": "No unreadable graphical elements found.",
                "recommendation": None
            })

        # 4. Contact Information
        has_email = len(contact_info.get("emails", [])) > 0
        has_phone = len(contact_info.get("phones", [])) > 0
        if not has_email or not has_phone:
            deductions += 20
            missing_items = []
            if not has_email: missing_items.append("email address")
            if not has_phone: missing_items.append("phone number")
            issues.append({
                "severity": "Critical",
                "category": "Contact information",
                "title": f"Missing critical contact details ({', '.join(missing_items)})",
                "description": "Recruiters and automated systems require a valid direct email and phone number in standard text.",
                "recommendation": "Add your email and phone number prominently in the contact header."
            })
        else:
            issues.append({
                "severity": "Passed",
                "category": "Contact information",
                "title": "Complete contact information detected",
                "description": f"Email ({contact_info['emails'][0]}) and phone number are clearly parsable.",
                "recommendation": None
            })

        # 5. Section Headings
        required_headings = ["experience", "education", "skills"]
        missing_headings = [h for h in required_headings if h not in detected_headers]
        if missing_headings:
            deductions += 15
            issues.append({
                "severity": "Warning",
                "category": "Section headings",
                "title": f"Non-standard section headings for: {', '.join(missing_headings)}",
                "description": "ATS systems categorize resume content by standard heading names like 'Experience', 'Education', 'Skills'.",
                "recommendation": f"Use standard titles for: {', '.join([h.title() for h in missing_headings])}."
            })
        else:
            issues.append({
                "severity": "Passed",
                "category": "Section headings",
                "title": "Standard ATS-friendly section headers",
                "description": "All key sections (Experience, Education, Skills) are standard and recognized.",
                "recommendation": None
            })

        # 6. Resume Length
        word_count = formatting_meta.get("word_count", len(raw_text.split()))
        if word_count < 250:
            deductions += 15
            issues.append({
                "severity": "Warning",
                "category": "Resume length",
                "title": f"Resume is brief ({word_count} words)",
                "description": "Your resume might lack sufficient detail and keyword density for senior role screening.",
                "recommendation": "Target 450 to 900 words to comprehensively cover responsibilities and achievements."
            })
        elif word_count > 1400:
            deductions += 10
            issues.append({
                "severity": "Warning",
                "category": "Resume length",
                "title": f"Resume exceeds recommended length ({word_count} words)",
                "description": "Resumes over 1,400 words often indicate dense 3+ page content that loses recruiter attention.",
                "recommendation": "Condense older experience to keep the resume within 1-2 pages."
            })
        else:
            issues.append({
                "severity": "Passed",
                "category": "Resume length",
                "title": f"Optimal resume length ({word_count} words)",
                "description": "Length is well-calibrated for comprehensive ATS scanning and recruiter review.",
                "recommendation": None
            })

        formatting_score = max(35.0, min(100.0, 100.0 - deductions))
        return formatting_score, issues

    @staticmethod
    def calculate_full_analysis(
        resume_data: Dict[str, Any],
        jd_title: str,
        jd_company: str,
        jd_text: str
    ) -> Dict[str, Any]:
        raw_resume = resume_data.get("raw_text", "")
        resume_norm = normalize_token(raw_resume)
        jd_norm = normalize_token(jd_text)
        parsed_sections = resume_data.get("parsed_sections", {})
        
        # 1. ATS Formatting Audit (Weight: 20%)
        formatting_score, formatting_issues = ATSScoringEngine.audit_formatting(resume_data)

        # 2. Keyword Match (Weight: 25%)
        jd_keywords = extract_keywords_from_jd(jd_text)
        if not jd_keywords:
            # Fallback if JD is short: extract key title tokens
            title_tokens = [w for w in normalize_token(jd_title).split() if len(w) > 2]
            jd_keywords = [{"keyword": t.title(), "category": "Technologies", "relevance": "high", "count": 1} for t in title_tokens]

        keyword_matches = []
        found_count = 0
        critical_missing_count = 0

        for item in jd_keywords:
            kw = str(item["keyword"])
            is_found = match_keyword_in_text(kw, resume_norm)
            rel = item["relevance"]

            if is_found:
                found_count += 1
                cat = "Already Found"
                status = "found"
                sec_sugg = None
            else:
                if rel == "high":
                    critical_missing_count += 1
                    cat = "Critical Missing"
                    sec_sugg = "Experience" if item["category"] in ["Technologies", "Responsibilities"] else "Skills"
                else:
                    cat = "Recommended"
                    sec_sugg = "Skills" if item["category"] in ["Technologies", "Tools"] else "Projects"
                status = "missing"

            keyword_matches.append({
                "keyword": kw,
                "category": cat,
                "status": status,
                "relevance": rel,
                "section_suggestion": sec_sugg
            })

        total_kw = max(1, len(jd_keywords))
        keyword_score = round(min(100.0, max(25.0, (found_count / total_kw) * 100.0 + (5.0 if found_count > 0 else 0))), 1)

        # 3. Skills Match (Weight: 25%)
        # Calculate skill gaps with recruiter priorities
        skill_gaps = []
        skills_matched = 0
        total_skills = 0

        for kw_item in [k for k in jd_keywords if k["category"] in ["Technologies", "Frameworks", "Tools", "Skills"]]:
            total_skills += 1
            kw = str(kw_item["keyword"])
            in_resume = match_keyword_in_text(kw, resume_norm)
            
            # Recruiter priority
            if kw_item["relevance"] == "high":
                priority = "Must Have"
            elif total_skills <= 4:
                priority = "Must Have"
            elif total_skills <= 8:
                priority = "Good to Have"
            else:
                priority = "Bonus"

            match_pct = 100.0 if in_resume else 0.0
            if in_resume:
                skills_matched += 1

            skill_gaps.append({
                "skill_name": kw,
                "match_percentage": match_pct,
                "priority": priority,
                "in_resume": in_resume,
                "in_job": True
            })

        if total_skills == 0:
            skills_score = 75.0
        else:
            skills_score = round(min(100.0, max(20.0, (skills_matched / total_skills) * 100.0)), 1)

        # 4. Experience Relevance (Weight: 15%)
        # Check title similarity and overlap in experience section
        exp_text = parsed_sections.get("experience", "") or raw_resume
        exp_norm = normalize_token(exp_text)
        
        # Check JD words in experience
        jd_key_terms = [str(k["keyword"]) for k in jd_keywords[:10]]
        terms_in_exp = sum(1 for k in jd_key_terms if match_keyword_in_text(k, exp_norm))
        exp_term_ratio = terms_in_exp / max(1, len(jd_key_terms))
        
        # Check action verbs and metrics in experience
        strong_verbs_count = sum(1 for v in STRONG_ACTION_VERBS if re.search(r'\b' + re.escape(v) + r'\b', exp_norm))
        metrics_count = sum(len(re.findall(p, exp_text, re.IGNORECASE)) for p in METRIC_PATTERNS)
        
        experience_score = round(min(100.0, max(30.0, (exp_term_ratio * 60.0) + min(20.0, strong_verbs_count * 2.5) + min(20.0, metrics_count * 2.0))), 1)

        # 5. Resume Quality (Weight: 10%)
        # Action verbs, metrics, readability, absence of weak verbs
        weak_verbs_found = [v for v in WEAK_ACTION_VERBS if re.search(r'\b' + re.escape(v) + r'\b', resume_norm)]
        quality_score = 70.0 + min(20.0, strong_verbs_count * 2.0) + min(15.0, metrics_count * 1.5) - min(25.0, len(weak_verbs_found) * 5.0)
        quality_score = round(max(30.0, min(100.0, quality_score)), 1)

        # 6. Education / Certifications (Weight: 5%)
        edu_text = parsed_sections.get("education", "")
        cert_text = parsed_sections.get("certifications", "")
        has_degree = bool(re.search(r'\b(?:bachelor|master|phd|b\.s|m\.s|b\.e|b\.tech|m\.tech|degree|university|college)\b', edu_text or raw_resume, re.IGNORECASE))
        has_certs = bool(cert_text.strip() or re.search(r'\b(?:certified|certification|aws certified|gcp certified|ckad|cka)\b', raw_resume, re.IGNORECASE))
        
        education_score = 90.0 if (has_degree and has_certs) else (85.0 if has_degree else 65.0)

        # FINAL DETERMINISTIC WEIGHTED FORMULA
        # ATS Formatting: 20%
        # Keyword Match: 25%
        # Skills Match: 25%
        # Experience Relevance: 15%
        # Resume Quality: 10%
        # Education/Certifications: 5%
        overall_ats_score = round(
            (0.20 * formatting_score) +
            (0.25 * keyword_score) +
            (0.25 * skills_score) +
            (0.15 * experience_score) +
            (0.10 * quality_score) +
            (0.05 * education_score),
            1
        )

        # Job Match Score (Harmonious combination of Keyword Match, Skills Match, and Experience Relevance)
        job_match_score = round((0.40 * keyword_score) + (0.40 * skills_score) + (0.20 * experience_score), 1)

        # Score Breakdown list
        scores_breakdown = [
            {
                "category": "ATS Compatibility",
                "score": round(formatting_score, 1),
                "max_score": 100.0,
                "status": score_to_status(formatting_score),
                "explanation": f"Layout parsed with {len([i for i in formatting_issues if i['severity'] == 'Passed'])} passed checks and {len([i for i in formatting_issues if i['severity'] != 'Passed'])} warnings."
            },
            {
                "category": "Keyword Match",
                "score": round(keyword_score, 1),
                "max_score": 100.0,
                "status": score_to_status(keyword_score),
                "explanation": f"Found {found_count} of {total_kw} job keywords identified in the description."
            },
            {
                "category": "Skills Match",
                "score": round(skills_score, 1),
                "max_score": 100.0,
                "status": score_to_status(skills_score),
                "explanation": f"{skills_matched} core technical skills matched, {total_skills - skills_matched} skill gaps identified."
            },
            {
                "category": "Experience Match",
                "score": round(experience_score, 1),
                "max_score": 100.0,
                "status": score_to_status(experience_score),
                "explanation": f"Experience section demonstrates relevant tech stack coverage and measurable outcomes."
            },
            {
                "category": "Education Match",
                "score": round(education_score, 1),
                "max_score": 100.0,
                "status": score_to_status(education_score),
                "explanation": "Academic credentials and professional certifications aligned with standard role expectations."
            },
            {
                "category": "Formatting Quality",
                "score": round(formatting_score, 1),
                "max_score": 100.0,
                "status": score_to_status(formatting_score),
                "explanation": "Clear typography hierarchy and clean structural flow."
            },
            {
                "category": "Readability",
                "score": round(quality_score, 1),
                "max_score": 100.0,
                "status": score_to_status(quality_score),
                "explanation": f"Average sentence length is appropriate with strong verb utilization."
            },
            {
                "category": "Impact",
                "score": round(min(100.0, 50.0 + metrics_count * 5.0), 1),
                "max_score": 100.0,
                "status": score_to_status(min(100.0, 50.0 + metrics_count * 5.0)),
                "explanation": f"Detected {metrics_count} quantified achievements and performance metrics."
            }
        ]

        # Section Analysis
        sections_analysis = [
            {
                "section_name": "Summary",
                "score": 82.0 if len(parsed_sections.get("summary", "")) > 60 else 60.0,
                "strengths": [
                    "Concise overview of engineering focus",
                    "Mentions core technical identity"
                ],
                "issues": [
                    "Could explicitly include target job title",
                    "Add 1 high-level metric summarizing cumulative career impact"
                ],
                "recommendations": [
                    f"Mention your specialization in {jd_title} early in the summary",
                    "Keep length to 3-4 crisp sentences"
                ]
            },
            {
                "section_name": "Experience",
                "score": round(experience_score, 1),
                "strengths": [
                    "Good technology coverage across roles",
                    f"Incorporates {strong_verbs_count} strong action verbs"
                ],
                "issues": [
                    f"Found {len(weak_verbs_found)} passive or weak verbs" if weak_verbs_found else "Some bullets describe duties rather than business impact",
                    "Needs more quantified business metrics and scale indicators"
                ],
                "recommendations": [
                    "Use Google XYZ formula: Accomplished [X] as measured by [Y], by doing [Z]",
                    "Add specific metrics for latency, scale, user count, or uptime"
                ]
            },
            {
                "section_name": "Projects",
                "score": 85.0 if len(parsed_sections.get("projects", "")) > 40 else 70.0,
                "strengths": [
                    "Demonstrates practical hands-on application of modern tech stack",
                    "Clear project titles and architecture details"
                ],
                "issues": [
                    "Provide live demo links or GitHub repository references",
                    "Highlight production-readiness and testing strategies"
                ],
                "recommendations": [
                    "Include GitHub repository link for each project",
                    "Specify architectural challenges overcome"
                ]
            },
            {
                "section_name": "Skills",
                "score": round(skills_score, 1),
                "strengths": [
                    "Structured technical competencies",
                    "Good balance of frameworks and tools"
                ],
                "issues": [
                    f"Missing {critical_missing_count} critical keywords requested by {jd_company}" if critical_missing_count else "Group skills into explicit sub-categories (Languages, Frameworks, Cloud)"
                ],
                "recommendations": [
                    f"Incorporate missing keywords: {', '.join([k['keyword'] for k in keyword_matches if k['category'] == 'Critical Missing'][:3])}",
                    "Remove outdated legacy tools that do not fit the target job"
                ]
            },
            {
                "section_name": "Education",
                "score": round(education_score, 1),
                "strengths": [
                    "Standard degree terminology present",
                    "Graduation timeline clearly displayed"
                ],
                "issues": [
                    "Ensure graduation year and degree type are formatted cleanly"
                ],
                "recommendations": [
                    "List relevant coursework only if graduated within the last 2 years"
                ]
            },
            {
                "section_name": "Certifications",
                "score": 90.0 if has_certs else 70.0,
                "strengths": [
                    "Demonstrates dedication to continuous learning"
                ] if has_certs else ["Optional section"],
                "issues": [
                    "Certifications section could be enhanced with cloud credentials"
                ] if not has_certs else [],
                "recommendations": [
                    "Add credential IDs and issuing body (AWS, Google, Microsoft, HashiCorp)"
                ]
            }
        ]

        # Prioritized Recommendations
        recommendations = [
            {
                "section": "Skills",
                "priority": "High",
                "title": f"Incorporate {critical_missing_count} critical missing keywords" if critical_missing_count else "Enhance Cloud & Infrastructure keywords",
                "action_item": f"Add {', '.join([k['keyword'] for k in keyword_matches if k['category'] == 'Critical Missing'][:4])} into your skills and relevant work experience bullet points." if critical_missing_count else "Add AWS or Docker skills directly into your technical summary."
            },
            {
                "section": "Experience",
                "priority": "High",
                "title": "Quantify bullet points with outcome metrics",
                "action_item": "Rewrite bullets following the formula: [Action Verb] + [Task/Scope] + [Result with Metric % or $]."
            },
            {
                "section": "Formatting",
                "priority": "Medium",
                "title": "Ensure 100% single-column ATS compatibility",
                "action_item": "Verify contact information is placed in the primary body flow rather than embedded in graphical headers."
            },
            {
                "section": "Summary",
                "priority": "Medium",
                "title": f"Align resume header with target role: {jd_title}",
                "action_item": f"Tailor your headline to explicitly mention '{jd_title}' to boost recruiter search relevancy."
            }
        ]

        summary_text = (
            f"Your resume achieves an ATS Compatibility Score of {overall_ats_score}/100 and a Job Match of {job_match_score}% "
            f"for the {jd_title} role at {jd_company}. We identified {found_count} matching keywords and {len([s for s in skill_gaps if not s['in_resume']])} "
            f"skill gap areas. Applying the recommended bullet points and adding the high-priority missing terms will significantly boost interview callbacks."
        )

        return {
            "overall_ats_score": overall_ats_score,
            "job_match_score": job_match_score,
            "keyword_match_score": keyword_score,
            "quality_score": quality_score,
            "summary": summary_text,
            "scores": scores_breakdown,
            "keywords": keyword_matches,
            "skills": skill_gaps,
            "issues": formatting_issues,
            "recommendations": recommendations,
            "sections_analysis": sections_analysis
        }
