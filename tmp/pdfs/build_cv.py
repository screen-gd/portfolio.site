from pathlib import Path
from html import escape

import pymupdf
from pypdf import PdfReader
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, KeepTogether


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'output' / 'pdf'
OUT.mkdir(parents=True, exist_ok=True)
PDF = OUT / 'Zaid_Ali_Ansari_CV.pdf'
TEXT = OUT / 'Zaid_Ali_Ansari_CV.md'

summary = (
    'Video editor and social media manager creating educational YouTube videos and short-form '
    'social content. Combines post-production and publishing experience with web development '
    'and AI-assisted tools for creative workflows.'
)

experience = [
    (
        'Video Editor & Social Media Manager', 'Work Smart Tutorials', '2024 - Present',
        [
            'Edited 50+ short-form videos and 4+ long-form educational productions for YouTube and Instagram.',
            'Contributed to content with an estimated cumulative reach of 500K+, with one video reaching 120K views.',
            'Handled footage selection, pacing, captions, color correction and grading, audio cleanup, sound design, and platform exports.',
            'Manage social media publishing schedules and coordinate content revisions for YouTube and Instagram.',
        ],
    ),
    (
        'Co-Founder & Creative Operations', 'ZNS Nexus', 'Sep 2025 - Present',
        [
            'Coordinate creative production, project planning, assets, requirements, and client-facing delivery for an early-stage service agency.',
            'Build reusable web applications and AI-assisted internal workflows using React, Next.js, and TypeScript.',
        ],
    ),
]

projects = [
    ('CutLab Studio', 'Designed a production management platform for video editors and creative teams, bringing project tracking, versioned deliverables, client feedback, and approvals into one workflow. Built with React, Next.js, TypeScript, and Convex.'),
    ('Planora', 'Built an open-source, self-hostable product management platform combining roadmaps, changelogs, and user feedback.'),
    ('Syllora', 'Built an AI-assisted learning platform that turns generated roadmaps, guides, and source materials into structured learning with embedded resources and task tracking.'),
]

skills = [
    ('Editing', 'Long-form and short-form editing, narrative pacing, captions, color grading, audio cleanup, sound design, thumbnail design, revision management'),
    ('Social media', 'YouTube and Instagram publishing, content scheduling'),
    ('Creative tools', 'DaVinci Resolve, Adobe Premiere Pro, Photoshop, Lightroom, OBS Studio'),
    ('Development', 'React, Next.js, TypeScript, JavaScript, Convex, Supabase, Git, GitHub'),
    ('AI and automation', 'OpenAI API, prompt engineering, LLM workflows, Make, Zapier'),
]

base = dict(fontName='Helvetica', fontSize=10.5, leading=14.2, textColor=colors.black, alignment=TA_LEFT)
styles = {
    'name': ParagraphStyle('Name', **{**base, 'fontName': 'Helvetica-Bold', 'fontSize': 25, 'leading': 29}),
    'title': ParagraphStyle('Role', **{**base, 'fontSize': 11.5, 'leading': 16}),
    'contact': ParagraphStyle('Contact', **{**base, 'fontSize': 9.4, 'leading': 13}),
    'body': ParagraphStyle('Body', **base),
    'section': ParagraphStyle('Section', **{**base, 'fontName': 'Helvetica-Bold', 'fontSize': 11, 'leading': 14, 'spaceBefore': 10, 'spaceAfter': 5, 'keepWithNext': True}),
    'entry': ParagraphStyle('Entry', **{**base, 'fontName': 'Helvetica-Bold', 'spaceBefore': 3, 'keepWithNext': True}),
    'meta': ParagraphStyle('Meta', **{**base, 'fontSize': 9.5, 'leading': 12.5, 'spaceAfter': 3, 'keepWithNext': True}),
    'bullet': ParagraphStyle('Bullet', **{**base, 'leftIndent': 10, 'firstLineIndent': 0, 'bulletIndent': 0, 'spaceAfter': 2}),
    'project': ParagraphStyle('Project', **{**base, 'spaceAfter': 4}),
}


def paragraph(text, kind='body'):
    return Paragraph(text, styles[kind])


def link(label, url):
    return f'<link href="{escape(url, quote=True)}" color="#000000">{escape(label)}</link>'


story = [
    paragraph('Zaid Ali Ansari', 'name'),
    paragraph('Video Editor &amp; Social Media Manager | Web Development', 'title'),
    Spacer(1, 5),
    paragraph('Sharjah, UAE | +971 52 624 3982 | ' + link('zaid.ansari5127@gmail.com', 'mailto:zaid.ansari5127@gmail.com'), 'contact'),
    paragraph(link('screeen.us.ci', 'https://screeen.us.ci') + ' | ' + link('linkedin.com/in/zaid-ali-ansari', 'https://linkedin.com/in/zaid-ali-ansari'), 'contact'),
    paragraph(link('github.com/zaid-gd', 'https://github.com/zaid-gd'), 'contact'),
    Spacer(1, 9),
    paragraph(escape(summary)),
    paragraph('Experience', 'section'),
]

for title, company, dates, bullets in experience:
    entry = [paragraph(escape(title), 'entry'), paragraph(escape(f'{company} | {dates}'), 'meta')]
    entry.extend(Paragraph(escape(bullet), styles['bullet'], bulletText='\u2022') for bullet in bullets)
    story.append(KeepTogether(entry))

story.append(paragraph('Selected projects', 'section'))
for name, description in projects:
    story.append(paragraph(f'<b>{escape(name)}:</b> {escape(description)}', 'project'))

story.append(paragraph('Skills', 'section'))
for label, values in skills:
    story.append(paragraph(f'<b>{escape(label)}:</b> {escape(values)}'))

story.extend([
    paragraph('Education', 'section'),
    paragraph('<b>Higher Secondary Certificate, Commerce, Class 12</b> | 2026'),
    paragraph('<b>Secondary School Certificate, Class 10</b> | 2024'),
    paragraph('St. Anthony High School and Junior College, Maharashtra State Board'),
    paragraph('Training and languages', 'section'),
    paragraph('<b>Training:</b> Generative AI Mastermind, Outskill'),
    paragraph('<b>Languages:</b> English, Hindi, Urdu'),
])

doc = SimpleDocTemplate(str(PDF), pagesize=A4, rightMargin=40, leftMargin=40,
                        topMargin=33, bottomMargin=32, title='Zaid Ali Ansari CV',
                        author='Zaid Ali Ansari', subject='Video editing, creative production and web development')
doc.build(story)

lines = [
    '# Zaid Ali Ansari',
    'Video Editor & Social Media Manager | Web Development', '',
    'Sharjah, UAE | +971 52 624 3982 | zaid.ansari5127@gmail.com',
    'Portfolio: https://screeen.us.ci',
    'LinkedIn: https://linkedin.com/in/zaid-ali-ansari',
    'GitHub: https://github.com/zaid-gd', '', summary, '', '## Experience', '',
]
for title, company, dates, bullets in experience:
    lines.extend([f'### {title}', f'{company} | {dates}', ''])
    lines.extend(f'- {bullet}' for bullet in bullets)
    lines.append('')
lines.extend(['## Selected projects', ''])
for name, description in projects:
    lines.extend([f'**{name}**', description, ''])
lines.extend(['## Skills', ''])
lines.extend(f'- **{label}:** {values}' for label, values in skills)
lines.extend(['', '## Education', '', 'Higher Secondary Certificate, Commerce, Class 12 | 2026',
              'Secondary School Certificate, Class 10 | 2024',
              'St. Anthony High School and Junior College, Maharashtra State Board', '',
              '## Training and languages', '', 'Training: Generative AI Mastermind, Outskill',
              'Languages: English, Hindi, Urdu', ''])
TEXT.write_text('\n'.join(lines), encoding='utf-8')

reader = PdfReader(PDF)
assert len(reader.pages) == 1, f'CV must be one page, got {len(reader.pages)}'
text = reader.pages[0].extract_text()
for expected in ['Zaid Ali Ansari', 'Work Smart Tutorials', '120K', '500K+', 'screeen.us.ci', '2024', '2026']:
    assert expected in text, f'Missing content: {expected}'
assert '\u2014' not in text
links = [a.get_object().get('/A', {}).get('/URI') for a in reader.pages[0]['/Annots']]
assert 'https://screeen.us.ci' in links
rendered = pymupdf.open(PDF)
page = rendered[0]
for block in page.get_text('blocks'):
    assert block[0] >= 38 and block[2] <= A4[0] - 38, f'Text outside horizontal margins: {block}'
    assert block[1] >= 30 and block[3] <= A4[1] - 30, f'Text outside vertical margins: {block}'
page.get_pixmap(matrix=pymupdf.Matrix(2, 2), alpha=False).save(ROOT / 'tmp' / 'pdfs' / 'consolidated-cv.png')
print(f'Created {PDF}\nEditable text: {TEXT}\nVerified: one page, required content, portfolio link and page margins.')
