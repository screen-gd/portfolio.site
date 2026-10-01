from html import escape
from pathlib import Path

import pymupdf
from pypdf import PdfReader
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'output' / 'pdf'
OUT.mkdir(parents=True, exist_ok=True)
PDF = OUT / 'Zaid_Ali_Ansari_CV_Designed.pdf'
TEXT = OUT / 'Zaid_Ali_Ansari_CV_Designed.md'
PREVIEW = OUT / 'Zaid_Ali_Ansari_CV_Designed.png'
pdfmetrics.registerFont(TTFont('Arial', 'C:/Windows/Fonts/arial.ttf'))
pdfmetrics.registerFont(TTFont('Arial-Bold', 'C:/Windows/Fonts/arialbd.ttf'))
pdfmetrics.registerFontFamily('Arial', normal='Arial', bold='Arial-Bold')

W, H = A4
SIDEBAR = 208
INK = HexColor('#303b4d')
BODY = HexColor('#20242b')
C = canvas.Canvas(str(PDF), pagesize=A4)
C.setTitle('Zaid Ali Ansari CV')
C.setAuthor('Zaid Ali Ansari')
C.setFillColor(INK)
C.rect(0, 0, SIDEBAR, H, stroke=0, fill=1)
boxes = []


def paragraph(text, x, top, width, size=9.5, leading=12.5, bold=False, light=False):
    """Draw measured text in page coordinates, with top measured from the page top."""
    style = ParagraphStyle('Text', fontName='Arial-Bold' if bold else 'Arial',
                           fontSize=size, leading=leading, textColor=white if light else BODY)
    item = Paragraph(text, style)
    _, height = item.wrap(width, H)
    assert top + height < H - 24, f'Text overflows page: {text}'
    item.drawOn(C, x, H - top - height)
    boxes.append((x, top, x + width, top + height, text))
    return top + height


def heading(label, x, top, width, light=False):
    C.setFillColor(white if light else INK)
    C.setFont('Arial-Bold', 17)
    C.drawString(x, H - top - 17, label)
    C.setStrokeColor(white if light else INK)
    C.setLineWidth(0.65)
    C.line(x, H - top - 24, x + width, H - top - 24)
    return top + 33


def bullets(items, x, top, width, light=False, size=9.5):
    for text in items:
        C.setFillColor(white if light else BODY)
        C.circle(x + 2, H - top - 6, 1.1, stroke=0, fill=1)
        top = paragraph(escape(text), x + 10, top, width - 10,
                        size=size, leading=12.5, light=light) + 3
    return top


summary = ('Video editor and social media manager producing educational YouTube videos and '
           'short-form content. Combines editing, post-production and publishing experience '
           'with web development and AI-assisted tools for creative workflows.')

experience = [
    ('2024 - Present', 'Work Smart Tutorials', 'Video Editor & Social Media Manager', [
        'Edited 50+ short-form videos and 4+ long-form educational productions for YouTube and Instagram.',
        'One video reached 120K views; estimated cumulative content reach is 500K+.',
        'Handle pacing, captions, color grading, audio cleanup, sound design and platform exports.',
        'Manage social media publishing schedules and coordinate revisions.',
    ]),
    ('Sep 2025 - Present', 'ZNS Nexus', 'Co-Founder & Creative Operations', [
        'Coordinate creative production, project planning, assets and client-facing delivery.',
        'Build reusable web applications and AI-assisted internal workflows with React, Next.js and TypeScript.',
    ]),
]

projects = [
    ('Relay', 'Next.js, TypeScript, Convex, Clerk', 'relay-app.cc.cd', [
        'Built a local-first workspace for freelance video editors and small teams.',
        'Added project tracking, versioned deliverables, client review portals and payment tracking.',
    ]),
    ('Col', 'Next.js, React, TypeScript, Tailwind CSS', 'collection-of-libs.vercel.app', [
        'Built an open-source directory of 56 UI libraries across 8 categories.',
        'Added component search, stack filters, saved libraries and links to official documentation.',
    ]),
]

# Reuse the supplied portrait and clip it in the layout without changing the image.
C.saveState()
photo_x, photo_top, diameter = 42, 35, 124
clip = C.beginPath()
clip.circle(photo_x + diameter / 2, H - photo_top - diameter / 2, diameter / 2)
C.clipPath(clip, stroke=0, fill=0)
photo_height = diameter * 373 / 280
C.drawImage(str(ROOT / 'tmp/pdfs/original-portrait-217.jpeg'), photo_x,
            H - photo_top - diameter - (photo_height - diameter) / 2,
            width=diameter, height=photo_height)
C.restoreState()

sx, sw = 33, SIDEBAR - 56
top = heading('Contact', sx, 185, sw, light=True)
contacts = [
    ('Location', 'Sharjah, UAE', None),
    ('Phone', '+971 52 624 3982', 'tel:+971526243982'),
    ('Email', 'zaid.ansari5127@gmail.com', 'mailto:zaid.ansari5127@gmail.com'),
    ('Portfolio', 'screeen.us.ci', 'https://screeen.us.ci'),
    ('LinkedIn', 'zaid-ali-ansari', 'https://linkedin.com/in/zaid-ali-ansari'),
    ('GitHub', 'screen-gd', 'https://github.com/screen-gd'),
]
for label, value, url in contacts:
    top = paragraph(escape(label), sx, top, sw, size=8.5, leading=10.5, bold=True, light=True)
    markup = escape(value)
    if url:
        markup = f'<link href="{escape(url, quote=True)}" color="#ffffff">{markup}</link>'
    top = paragraph(markup, sx, top, sw, size=8.2, leading=10.5, light=True) + 3

top = heading('Education', sx, top + 7, sw, light=True)
for year, qualification in [('2026', 'Higher Secondary Certificate<br/>Class 12, Commerce'),
                            ('2024', 'Secondary School Certificate<br/>Class 10')]:
    top = paragraph(year, sx, top, sw, size=9, leading=12, light=True) + 3
    top = paragraph(qualification, sx, top, sw, size=9, leading=12, bold=True, light=True) + 3
    top += 4
top = paragraph('St. Anthony High School<br/>and Junior College', sx, top, sw,
                size=8.5, leading=11.5, light=True) + 3
top = paragraph('Maharashtra State Board', sx, top, sw, size=8, leading=10.5, light=True)

top = heading('Expertise', sx, top + 14, sw, light=True)
expertise = ['Video editing', 'Social media publishing', 'Color grading and audio',
             'Web development', 'AI workflow automation']
top = bullets(expertise, sx, top, sw, light=True, size=9)
top = heading('Languages', sx, top + 8, sw, light=True)
top = paragraph('English<br/>Hindi / Urdu', sx, top, sw, size=9, leading=14, light=True)
top = heading('Training', sx, top + 8, sw, light=True)
top = paragraph('<b>Generative AI Mastermind</b><br/>Outskill', sx, top, sw,
                size=8.7, leading=12, light=True)

mx, mw = 228, W - 248
C.setFillColor(INK)
C.setFont('Arial-Bold', 27)
C.drawString(mx, H - 67, 'Zaid Ali Ansari')
top = paragraph('Video Editor &amp; Social Media Manager', mx, 79, mw,
                size=10.4, leading=14.2, bold=True)
top = paragraph(escape(summary), mx, top + 16, mw, size=9.4, leading=12.8)

top = heading('Experience', mx, top + 17, mw)
for dates, company, role, items in experience:
    top = paragraph(escape(dates), mx + 13, top, mw - 13, size=9.5, leading=12.5, bold=True)
    top = paragraph(escape(company), mx + 13, top + 1, mw - 13, size=9.2, leading=12.2)
    top = paragraph(escape(role), mx + 13, top + 3, mw - 13,
                    size=10, leading=13.2, bold=True) + 6
    start = top
    top = bullets(items, mx + 13, top, mw - 13, size=9.4)
    C.setStrokeColor(INK)
    C.setLineWidth(0.55)
    C.line(mx + 3.5, H - start + 35, mx + 3.5, H - top + 10)
    C.setFillColor(white)
    C.circle(mx + 3.5, H - start + 35, 3, stroke=1, fill=1)
    top += 6

top = heading('Projects', mx, top + 1, mw)
for name, stack, site, items in projects:
    top = paragraph(escape(name), mx, top, mw, size=12, leading=15, bold=True)
    top = paragraph(escape(stack), mx, top + 1, mw, size=8.6, leading=11.5)
    top = paragraph(f'<link href="https://{site}" color="#303b4d">{site}</link>', mx,
                    top + 1, mw, size=8.4, leading=11) + 5
    top = bullets(items, mx, top, mw, size=9.4) + 5

top = heading('Tools', mx, top, mw)
gap = 15
col_width = (mw - gap) / 2
creative = ['DaVinci Resolve', 'Adobe Premiere Pro', 'Adobe Photoshop', 'Adobe Lightroom', 'OBS Studio']
development = ['React / Next.js', 'TypeScript / JavaScript', 'Convex / Supabase', 'Git / GitHub', 'OpenAI API', 'Make / Zapier']
for x, label, items in [(mx, 'Creative production', creative),
                         (mx + col_width + gap, 'Development and AI', development)]:
    column_top = paragraph(escape(label), x, top, col_width, size=9.2, leading=12.5, bold=True) + 7
    bullets(items, x, column_top, col_width, size=9.1)

C.showPage()
C.save()

lines = ['# Zaid Ali Ansari', 'Video Editor & Social Media Manager', '',
         'Sharjah, UAE | +971 52 624 3982 | zaid.ansari5127@gmail.com',
         'Portfolio: https://screeen.us.ci', 'LinkedIn: https://linkedin.com/in/zaid-ali-ansari',
         'GitHub: https://github.com/screen-gd', '', summary, '', '## Experience', '']
for dates, company, role, items in experience:
    lines.extend([f'### {role}', f'{company} | {dates}', ''])
    lines.extend(f'- {item}' for item in items)
    lines.append('')
lines.extend(['## Projects', ''])
for name, stack, site, items in projects:
    lines.extend([f'### {name}', stack, f'https://{site}', ''])
    lines.extend(f'- {item}' for item in items)
    lines.append('')
lines.extend(['## Tools', '', f'Creative production: {", ".join(creative)}',
              f'Development and AI: {", ".join(development)}', '', '## Education', '',
              '2026 | Higher Secondary Certificate, Class 12, Commerce',
              '2024 | Secondary School Certificate, Class 10',
              'St. Anthony High School and Junior College, Maharashtra State Board', '',
              '## Expertise', '', ', '.join(expertise), '', '## Languages', '', 'English, Hindi, Urdu',
              '', '## Training', '', 'Generative AI Mastermind, Outskill', ''])
TEXT.write_text('\n'.join(lines), encoding='utf-8')

reader = PdfReader(PDF)
assert len(reader.pages) == 1
text = reader.pages[0].extract_text()
for expected in ['Relay', 'Col', '2024', '2026', '500K+', '120K', 'Social Media Manager', 'screeen.us.ci']:
    assert expected in text, f'Missing text: {expected}'
for stale in ['CutLab', 'Planora', 'Syllora']:
    assert stale not in text, f'Outdated project: {stale}'
uris = [a.get_object().get('/A', {}).get('/URI') for a in reader.pages[0]['/Annots']]
assert 'https://screeen.us.ci' in uris
for x1, y1, x2, y2, text in boxes:
    assert x1 >= 24 and x2 <= W - 18 and y1 >= 24 and y2 <= H - 24
doc = pymupdf.open(PDF)
doc[0].get_pixmap(matrix=pymupdf.Matrix(2, 2), alpha=False).save(PREVIEW)
print(f'Created {PDF}\nVerified one page, updated projects, dates, metrics and contact links.')
