import os
import io
from typing import Dict, Any
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

class PDFReportService:
    @staticmethod
    def generate_analysis_pdf(analysis_data: Dict[str, Any], output_path: str) -> str:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        doc = SimpleDocTemplate(
            output_path,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=22,
            leading=26,
            textColor=colors.HexColor("#0f172a")
        )
        
        subtitle_style = ParagraphStyle(
            'ReportSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#64748b")
        )

        section_heading = ParagraphStyle(
            'SectionHeading',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=13,
            leading=17,
            textColor=colors.HexColor("#1e293b"),
            spaceBefore=12,
            spaceAfter=6
        )

        body_style = ParagraphStyle(
            'ReportBody',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=13,
            textColor=colors.HexColor("#334155")
        )

        story = []

        # Header Banner
        header_data = [
            [
                Paragraph("<b>ResumeIQ AI</b> — ATS Audit Report", title_style),
                Paragraph(f"Generated: <b>{analysis_data.get('created_at', 'Today')[:10]}</b>", subtitle_style)
            ]
        ]
        header_table = Table(header_data, colWidths=[5.0*inch, 2.2*inch])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('ALIGN', (1,0), (1,0), 'RIGHT'),
        ]))
        story.append(header_table)
        story.append(Spacer(1, 10))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e2e8f0"), spaceAfter=12))

        # Target Role & Resume Metadata Card
        resume_name = analysis_data.get("resume_title") or "Candidate Resume.pdf"
        job_title = analysis_data.get("job_title") or "Software Engineer"
        company = analysis_data.get("company_name") or "Target Company"
        
        meta_data = [
            [
                Paragraph("<b>Resume:</b> " + resume_name, body_style),
                Paragraph("<b>Target Role:</b> " + job_title, body_style),
                Paragraph("<b>Company:</b> " + company, body_style)
            ]
        ]
        meta_table = Table(meta_data, colWidths=[2.4*inch, 2.5*inch, 2.3*inch])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#e2e8f0")),
            ('PADDING', (0,0), (-1,-1), 8),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        story.append(meta_table)
        story.append(Spacer(1, 12))

        # Core Metrics Overview (4 score cards)
        ats_score = analysis_data.get("overall_ats_score", 0)
        job_match = analysis_data.get("job_match_score", 0)
        keyword_match = analysis_data.get("keyword_match_score", 0)
        quality_score = analysis_data.get("quality_score", 0)

        def get_score_color(score):
            if score >= 80: return colors.HexColor("#10b981") # emerald
            if score >= 70: return colors.HexColor("#3b82f6") # blue
            if score >= 60: return colors.HexColor("#f59e0b") # amber
            return colors.HexColor("#ef4444") # rose

        scores_data = [
            [
                Paragraph(f"<font size=18 color='{get_score_color(ats_score).hexval()}'><b>{ats_score:.0f}/100</b></font><br/><font size=8 color='#64748b'>ATS SCORE</font>", body_style),
                Paragraph(f"<font size=18 color='{get_score_color(job_match).hexval()}'><b>{job_match:.0f}%</b></font><br/><font size=8 color='#64748b'>JOB MATCH</font>", body_style),
                Paragraph(f"<font size=18 color='{get_score_color(keyword_match).hexval()}'><b>{keyword_match:.0f}%</b></font><br/><font size=8 color='#64748b'>KEYWORD MATCH</font>", body_style),
                Paragraph(f"<font size=18 color='{get_score_color(quality_score).hexval()}'><b>{quality_score:.0f}%</b></font><br/><font size=8 color='#64748b'>RESUME QUALITY</font>", body_style)
            ]
        ]
        scores_table = Table(scores_data, colWidths=[1.8*inch, 1.8*inch, 1.8*inch, 1.8*inch])
        scores_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f1f5f9")),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('PADDING', (0,0), (-1,-1), 10),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        story.append(scores_table)
        story.append(Spacer(1, 14))

        # Executive Summary
        if analysis_data.get("summary"):
            story.append(Paragraph("<b>Executive Assessment</b>", section_heading))
            story.append(Paragraph(analysis_data.get("summary", ""), body_style))
            story.append(Spacer(1, 10))

        # Missing Keywords & Gap Table
        keywords = analysis_data.get("keywords", [])
        critical_kw = [k["keyword"] for k in keywords if k["category"] == "Critical Missing"]
        recommended_kw = [k["keyword"] for k in keywords if k["category"] == "Recommended"]
        found_kw = [k["keyword"] for k in keywords if k["category"] == "Already Found"]

        story.append(Paragraph("<b>Keyword & Technical Coverage</b>", section_heading))
        kw_rows = [
            [
                Paragraph("<font color='#b91c1c'><b>Critical Missing:</b></font>", body_style),
                Paragraph(", ".join(critical_kw[:8]) if critical_kw else "None! Excellent core keyword alignment.", body_style)
            ],
            [
                Paragraph("<font color='#b45309'><b>Recommended Additions:</b></font>", body_style),
                Paragraph(", ".join(recommended_kw[:8]) if recommended_kw else "None.", body_style)
            ],
            [
                Paragraph("<font color='#047857'><b>Successfully Matched:</b></font>", body_style),
                Paragraph(", ".join(found_kw[:10]) if found_kw else "None.", body_style)
            ]
        ]
        kw_table = Table(kw_rows, colWidths=[1.8*inch, 5.4*inch])
        kw_table.setStyle(TableStyle([
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#e2e8f0")),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#f1f5f9")),
            ('PADDING', (0,0), (-1,-1), 6),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ]))
        story.append(kw_table)
        story.append(Spacer(1, 12))

        # Formatting Audit Findings
        issues = analysis_data.get("issues", [])
        if issues:
            story.append(Paragraph("<b>ATS Formatting & Structural Compliance</b>", section_heading))
            audit_rows = [
                [
                    Paragraph("<b>Audit Category</b>", body_style),
                    Paragraph("<b>Status</b>", body_style),
                    Paragraph("<b>Finding & Action</b>", body_style)
                ]
            ]
            for iss in issues[:6]:
                status_color = "#10b981" if iss["severity"] == "Passed" else ("#f59e0b" if iss["severity"] == "Warning" else "#ef4444")
                audit_rows.append([
                    Paragraph(f"<b>{iss['category']}</b>", body_style),
                    Paragraph(f"<font color='{status_color}'><b>{iss['severity'].upper()}</b></font>", body_style),
                    Paragraph(f"<b>{iss['title']}</b>: {iss.get('recommendation') or iss['description']}", body_style)
                ])
            audit_table = Table(audit_rows, colWidths=[1.8*inch, 1.1*inch, 4.3*inch])
            audit_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f8fafc")),
                ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#e2e8f0")),
                ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#f1f5f9")),
                ('PADDING', (0,0), (-1,-1), 5),
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ]))
            story.append(audit_table)
            story.append(Spacer(1, 12))

        # Key Recommendations
        recs = analysis_data.get("recommendations", [])
        if recs:
            story.append(Paragraph("<b>Priority Action Items</b>", section_heading))
            for i, rec in enumerate(recs[:4], start=1):
                p_text = f"<b>{i}. [{rec.get('section', 'General')}] {rec.get('title', '')}</b>: {rec.get('action_item', '')}"
                story.append(Paragraph(p_text, body_style))
                story.append(Spacer(1, 4))

        # Footer note
        story.append(Spacer(1, 14))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e2e8f0"), spaceAfter=8))
        story.append(Paragraph(
            "<font color='#94a3b8' size=8>ResumeIQ AI — Proprietary ATS Compatibility Engine. This analysis report is confidential and tailored to candidate application optimization.</font>",
            body_style
        ))

        doc.build(story)
        return output_path

    @staticmethod
    def generate_recruiter_leaderboard_pdf(
        job_title: str,
        company: str,
        candidates: list,
        output_path: str
    ) -> str:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        doc = SimpleDocTemplate(
            output_path,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'RecruiterReportTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=20,
            leading=24,
            textColor=colors.HexColor("#0f172a")
        )
        subtitle_style = ParagraphStyle(
            'RecruiterReportSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#64748b")
        )
        table_hdr = ParagraphStyle(
            'RecruiterHdr',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#1e293b")
        )
        body_style = ParagraphStyle(
            'RecruiterBody',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8,
            leading=11,
            textColor=colors.HexColor("#334155")
        )
        bold_body = ParagraphStyle(
            'RecruiterBoldBody',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=8,
            leading=11,
            textColor=colors.HexColor("#0f172a")
        )

        story = []

        # Header
        story.append(Paragraph(f"<b>Candidate Screening Leaderboard</b>", title_style))
        story.append(Spacer(1, 4))
        story.append(Paragraph(f"Position: <b>{job_title}</b> at <b>{company}</b> • Screened Candidates: {len(candidates)}", subtitle_style))
        story.append(Spacer(1, 12))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e2e8f0"), spaceAfter=12))

        # Leaderboard Table
        rows = [
            [
                Paragraph("<b>Rank</b>", table_hdr),
                Paragraph("<b>Candidate</b>", table_hdr),
                Paragraph("<b>ATS Score</b>", table_hdr),
                Paragraph("<b>Match</b>", table_hdr),
                Paragraph("<b>Top Strengths</b>", table_hdr),
                Paragraph("<b>Screening Concerns</b>", table_hdr)
            ]
        ]

        for c in candidates:
            rank_str = f"#{c.get('rank', '-')}"
            cand_info = f"<b>{c.get('candidate_name', 'Applicant')}</b><br/><font color='#64748b'>{c.get('email', '')}</font>"
            ats_str = f"<b>{c.get('ats_score', 0)}</b>"
            match_str = f"<b>{c.get('match_score', 0)}</b>"
            strengths_str = "<br/>• ".join([""] + c.get('strengths', [])[:2]) if c.get('strengths') else "Strong profile alignment"
            concerns_str = "<br/>• ".join([""] + c.get('concerns', [])[:2]) if c.get('concerns') else "None flagged"

            rows.append([
                Paragraph(rank_str, bold_body),
                Paragraph(cand_info, body_style),
                Paragraph(ats_str, bold_body),
                Paragraph(match_str, bold_body),
                Paragraph(strengths_str, body_style),
                Paragraph(concerns_str, body_style)
            ])

        col_widths = [0.6*inch, 2.0*inch, 0.8*inch, 0.7*inch, 1.7*inch, 1.4*inch]
        leaderboard_table = Table(rows, colWidths=col_widths)
        leaderboard_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#cbd5e1")),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
            ('PADDING', (0,0), (-1,-1), 6),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ]))
        story.append(leaderboard_table)

        # Footer
        story.append(Spacer(1, 18))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e2e8f0"), spaceAfter=8))
        story.append(Paragraph(
            "<font color='#94a3b8' size=8>ResumeIQ AI — Recruiter Talent Intelligence & Batch Screening Engine.</font>",
            body_style
        ))

        doc.build(story)
        return output_path

