import io
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from typing import Dict, Any

def generate_pdf_report(report_data: Dict[str, Any]) -> io.BytesIO:
    """
    Generates a professional forensic PDF report using ReportLab.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40, leftMargin=40,
        topMargin=40, bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Styles
    brand_title = ParagraphStyle(
        "BrandTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=24,
        leading=28,
        textColor=colors.HexColor("#0A0F1D")
    )
    
    subhead = ParagraphStyle(
        "Subhead",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#64748B")
    )
    
    section_title = ParagraphStyle(
        "SectionTitle",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#0F172A")
    )
    
    body_text = ParagraphStyle(
        "BodyText",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#334155")
    )

    bold_text = ParagraphStyle(
        "BoldText",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#0F172A")
    )

    verdict_style = ParagraphStyle(
        "VerdictStyle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=18,
        alignment=1  # Centered
    )

    story = []
    
    # 1. Header
    story.append(Paragraph("TRUSTLENS FORENSIC INTELLIGENCE", brand_title))
    story.append(Paragraph("Automated Fake Review, Spam Campaign & Syndicate Detection Report", subhead))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#06B6D4"), spaceAfter=15))
    
    # 2. Target Metadata
    title = report_data.get("target_title", "Review Analysis Target")
    r_id = report_data.get("id", "Unknown")
    date_str = report_data.get("created_at") or "Recent"
    source = report_data.get("source_type", "Manual Entry")
    
    meta_data = [
        [Paragraph(f"<b>Target:</b> {title}", body_text), Paragraph(f"<b>Report ID:</b> {r_id[:16]}...", body_text)],
        [Paragraph(f"<b>Source:</b> {source.upper()}", body_text), Paragraph(f"<b>Date:</b> {date_str[:19]}", body_text)]
    ]
    t_meta = Table(meta_data, colWidths=[280, 240])
    t_meta.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
        ("TOPPADDING", (0,0), (-1,-1), 0),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 15))
    
    # 3. Overall Verdict Banner
    trust_score = float(report_data.get("trust_score", 100.0))
    verdict = report_data.get("verdict", "Trustworthy")
    fake_prob = float(report_data.get("fake_probability", 0.0))
    
    if trust_score >= 75:
        banner_bg = colors.HexColor("#ECFDF5")
        text_color = colors.HexColor("#059669")
    elif trust_score >= 45:
        banner_bg = colors.HexColor("#FFFBEB")
        text_color = colors.HexColor("#D97706")
    else:
        banner_bg = colors.HexColor("#FEF2F2")
        text_color = colors.HexColor("#DC2626")
        
    verdict_p = Paragraph(f"<font color='{text_color.hexval()}'>{verdict.upper()} (Trust Score: {trust_score}/100)</font>", verdict_style)
    sub_verdict_p = Paragraph(f"<font color='#64748B'>Overall Deceptive Review Probability: <b>{fake_prob}%</b></font>", ParagraphStyle("SubV", parent=body_text, alignment=1))
    
    banner_table = Table([[verdict_p], [sub_verdict_p]], colWidths=[520])
    banner_table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), banner_bg),
        ("ALIGN", (0,0), (-1,-1), "CENTER"),
        ("TOPPADDING", (0,0), (-1,-1), 8),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
        ("BOX", (0,0), (-1,-1), 1, text_color)
    ]))
    story.append(banner_table)
    story.append(Spacer(1, 20))
    
    # 4. Forensic Metrics Summary Grid
    summary = report_data.get("metrics_summary", {})
    total_reviews = report_data.get("total_reviews", 0)
    flagged = report_data.get("flagged_reviews", 0)
    rings = summary.get("account_rings_detected", 0)
    bursts = summary.get("burst_windows_detected", 0)
    ai_ratio = summary.get("ai_generated_ratio", 0.0)
    verif_ratio = summary.get("verified_purchase_ratio", 0.0)
    
    metrics_data = [
        [
            Paragraph("<b>Total Reviews</b>", body_text), Paragraph(str(total_reviews), bold_text),
            Paragraph("<b>Flagged Suspicious</b>", body_text), Paragraph(str(flagged), bold_text)
        ],
        [
            Paragraph("<b>Coordinated Rings</b>", body_text), Paragraph(str(rings), bold_text),
            Paragraph("<b>Spam Burst Spikes</b>", body_text), Paragraph(str(bursts), bold_text)
        ],
        [
            Paragraph("<b>AI Text Likelihood</b>", body_text), Paragraph(f"{ai_ratio}%", bold_text),
            Paragraph("<b>Verified Purchases</b>", body_text), Paragraph(f"{verif_ratio}%", bold_text)
        ]
    ]
    t_metrics = Table(metrics_data, colWidths=[140, 120, 140, 120])
    t_metrics.setStyle(TableStyle([
        ("GRID", (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ("BACKGROUND", (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ("TOPPADDING", (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
    ]))
    story.append(Paragraph("Key Forensic Indicators", section_title))
    story.append(Spacer(1, 6))
    story.append(t_metrics)
    story.append(Spacer(1, 15))
    
    # 5. Key Forensic Warnings
    warnings = summary.get("key_warnings", [])
    if warnings:
        story.append(Paragraph("Forensic Risk Flags", section_title))
        story.append(Spacer(1, 6))
        for w in warnings:
            story.append(Paragraph(f"• <font color='#DC2626'>{w}</font>", body_text))
            story.append(Spacer(1, 3))
        story.append(Spacer(1, 10))

    # 6. Flagged Reviews Sample Table
    reviews = report_data.get("reviews", [])
    flagged_reviews = [r for r in reviews if r.get("is_flagged") or r.get("fake_probability", 0) > 50][:8]
    
    if flagged_reviews:
        story.append(Paragraph(f"Sample Flagged Reviews ({len(flagged_reviews)} shown)", section_title))
        story.append(Spacer(1, 6))
        
        table_rows = [[
            Paragraph("<b>Reviewer</b>", bold_text),
            Paragraph("<b>Rating</b>", bold_text),
            Paragraph("<b>Fake Prob</b>", bold_text),
            Paragraph("<b>Review Snippet / Flags</b>", bold_text)
        ]]
        
        for fr in flagged_reviews:
            u = fr.get("reviewer_name", "Anon")
            rate = f"{fr.get('rating', 5.0)} ★"
            prob = f"{fr.get('fake_probability', 0)}%"
            flags_str = ", ".join(fr.get("linguistic_flags", [])[:2])
            text_snip = fr.get("review_text", "")[:100] + "..." if len(fr.get("review_text", "")) > 100 else fr.get("review_text", "")
            snippet_p = Paragraph(f"\"{text_snip}\"<br/><font color='#D97706'>Flags: {flags_str or 'High ML Deception Score'}</font>", body_text)
            
            table_rows.append([
                Paragraph(u, body_text),
                Paragraph(rate, body_text),
                Paragraph(f"<font color='#DC2626'>{prob}</font>", bold_text),
                snippet_p
            ])
            
        t_revs = Table(table_rows, colWidths=[90, 50, 65, 315])
        t_revs.setStyle(TableStyle([
            ("GRID", (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
            ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#F1F5F9")),
            ("TOPPADDING", (0,0), (-1,-1), 5),
            ("BOTTOMPADDING", (0,0), (-1,-1), 5),
            ("VALIGN", (0,0), (-1,-1), "TOP")
        ]))
        story.append(t_revs)
        story.append(Spacer(1, 20))
        
    # 7. Disclaimer Footer
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#CBD5E1"), spaceAfter=8))
    disclaimer = (
        "<b>Notice & Methodology Disclaimer:</b> TrustLens generates probabilistic estimates using statistical NLP, "
        "supervised machine learning, and heuristic behavioral network graphs. Reports are provided for analytical "
        "and investigative support, and do not constitute legal proof of malicious conduct."
    )
    story.append(Paragraph(disclaimer, ParagraphStyle("Disc", parent=body_text, fontSize=7.5, leading=10, textColor=colors.HexColor("#94A3B8"))))
    
    doc.build(story)
    buffer.seek(0)
    return buffer
