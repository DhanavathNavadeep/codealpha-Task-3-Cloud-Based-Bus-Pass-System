import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generate_pass_pdf(pass_dict):
    """
    Generates a PDF stream for a digital bus pass using ReportLab.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    story = []

    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=22,
        textColor=colors.HexColor('#1E3A8A'),
        alignment=1, # Center
        spaceAfter=20
    )

    story.append(Paragraph("<b>CITY EXPRESS TRANSIT AUTHORITY</b>", title_style))
    story.append(Paragraph("<b>DIGITAL BUS PASS RECEIPT</b>", ParagraphStyle('SubTitle', parent=styles['Heading2'], alignment=1, textColor=colors.HexColor('#059669'))))
    story.append(Spacer(1, 15))

    data = [
        [Paragraph("<b>Pass Number</b>", styles['Normal']), Paragraph(str(pass_dict.get('pass_number')), styles['Normal'])],
        [Paragraph("<b>Passenger Name</b>", styles['Normal']), Paragraph(str(pass_dict.get('user_name')), styles['Normal'])],
        [Paragraph("<b>Route Code & Name</b>", styles['Normal']), Paragraph(f"{pass_dict.get('route_code')} - {pass_dict.get('route_name')}", styles['Normal'])],
        [Paragraph("<b>Route Journey</b>", styles['Normal']), Paragraph(f"{pass_dict.get('source')} ➔ {pass_dict.get('destination')}", styles['Normal'])],
        [Paragraph("<b>Pass Duration</b>", styles['Normal']), Paragraph(str(pass_dict.get('pass_type')), styles['Normal'])],
        [Paragraph("<b>Valid From</b>", styles['Normal']), Paragraph(str(pass_dict.get('start_date')), styles['Normal'])],
        [Paragraph("<b>Expires On</b>", styles['Normal']), Paragraph(str(pass_dict.get('expiry_date')), styles['Normal'])],
        [Paragraph("<b>Total Fare Paid</b>", styles['Normal']), Paragraph(f"₹{pass_dict.get('total_fare'):,.2f}", styles['Normal'])],
        [Paragraph("<b>Status</b>", styles['Normal']), Paragraph(str(pass_dict.get('status')).upper(), styles['Normal'])],
    ]

    t = Table(data, colWidths=[180, 320])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F3F4F6')),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#D1D5DB')),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#111827')),
    ]))

    story.append(t)
    story.append(Spacer(1, 25))
    story.append(Paragraph("<i>This is a computer-generated digital pass. Please present the QR code on your mobile device during inspection.</i>", styles['Italic']))

    doc.build(story)
    buffer.seek(0)
    return buffer
