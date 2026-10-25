"""Publish the book JSON as A5 PDF and EPUB 3, then validate both artifacts."""
import argparse
import copy
from datetime import datetime, timezone
import hashlib
from html import escape
from html.parser import HTMLParser
import io
import json
import os
from pathlib import Path
import re
import shutil
import urllib.parse
import urllib.request
import uuid
import zipfile
import xml.etree.ElementTree as ET

from fontTools.ttLib import TTFont as FontFile
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools import subset
import pypdfium2 as pdfium
from pypdf import PdfReader
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A5
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, PageBreak, CondPageBreak, Preformatted, Table, TableStyle, KeepTogether, Image, Flowable
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.graphics import renderPDF
from svglib.svglib import svg2rlg

INK = colors.HexColor('#142034')
CORAL = colors.HexColor('#bb4b30')
MUTED = colors.HexColor('#627084')
WIDTH, HEIGHT = A5
MARGIN = 39
CONTENT = WIDTH - 2 * MARGIN
PARTS = {'01': '认识你的执行搭档', '02': '把想法变成工作', '03': '上下文与现状调查', '04': '决定怎样推进', '05': '让成果经得起检查', '06': '当 Codex 做错了怎么办', '07': '扩展与复用 Codex 的能力', '08': '长任务、协作与真正的掌控'}


class Node:
    def __init__(self, tag='root', attrs=None):
        self.tag, self.attrs, self.children = tag, dict(attrs or []), []

    def text(self):
        return ''.join(child.text() if isinstance(child, Node) else child for child in self.children)


class Tree(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.root = Node()
        self.stack = [self.root]
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        child = Node(tag, attrs)
        self.stack[-1].children.append(child)
        if tag not in ('img', 'br', 'hr', 'meta', 'link', 'input'):
            self.stack.append(child)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if self.stack[-1].tag == tag:
            self.stack.pop()

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                del self.stack[index:]
                return

    def handle_data(self, text):
        self.stack[-1].children.append(text)


def inline(node, site, chapter_by_href):
    if isinstance(node, str):
        return escape(node)
    content = ''.join(inline(child, site, chapter_by_href) for child in node.children)
    if node.tag in ('strong', 'b'):
        return f'<b>{content}</b>'
    if node.tag in ('em', 'i'):
        return f'<i>{content}</i>'
    if node.tag == 'code':
        return f'<font color="#a8482d">{content}</font>'
    if node.tag == 'br':
        return '<br/>'
    if node.tag == 'a':
        href = node.attrs.get('href', '')
        stem, _, fragment = href.partition('#')
        if stem in chapter_by_href:
            href = site + urllib.parse.quote(chapter_by_href[stem]['file'].replace('.md', '.html')) + (f'#{fragment}' if fragment else '')
        if href.startswith(('https://', 'http://', 'mailto:')):
            return f'<link href="{escape(href, quote=True)}" color="#a5472e">{content}</link>'
    return content


def fonts(payload, temporary):
    provenance = json.loads(Path(payload['fontSource']).read_text())
    source = Path(os.environ.get('PUBLISH_FONT', str(Path(payload['root']) / '.cache/publishing/NotoSansSC-variable.ttf')))
    if not source.exists():
        source.parent.mkdir(parents=True, exist_ok=True)
        urllib.request.urlretrieve(provenance['url'], source)
    if hashlib.sha256(source.read_bytes()).hexdigest() != provenance['sha256']:
        raise ValueError('Font SHA256 does not match assets/fonts/source.json')
    characters = ''.join(chapter['html'] + chapter['title'] for chapter in payload['chapters']) + payload['title'] + '目录离线版出版说明第一二三四五六七八部分认识你的执行搭档把想法变成工作上下文与现状调查决定怎样推进让成果经得起检查当做错了怎么办扩展复用能力长任务协作真正掌控参考反馈□☑✓↗→←↺·0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    characters += ''.join(Path(asset['source']).read_text(encoding='utf-8') for asset in payload['assets'] if asset['originalExtension'] == '.svg') + Path(payload['cover']).read_text(encoding='utf-8')
    characters += Path(__file__).read_text(encoding='utf-8')
    output = temporary / 'fonts'
    output.mkdir(exist_ok=True)
    paths = {}
    variable = FontFile(source)
    options = subset.Options()
    options.name_IDs = ['*']
    options.name_legacy = True
    options.recalc_bounds = True
    options.recalc_timestamp = False
    sub = subset.Subsetter(options=options)
    sub.populate(text=characters)
    sub.subset(variable)
    for weight, name in [(400, 'NotoSC'), (700, 'NotoSC-Bold')]:
        target = output / f'{name}.ttf'
        font = instantiateVariableFont(copy.deepcopy(variable), {'wght': weight}, inplace=True)
        # Unique PostScript names are essential: different weight instances of a
        # variable font otherwise retain one internal name and can collide in readers.
        style_name = 'Regular' if weight == 400 else 'Bold'
        for name_id, value in [(1, 'Codex Noto SC'), (2, style_name), (4, f'Codex Noto SC {style_name}'), (6, f'CodexNotoSC-{style_name}')]:
            font['name'].setName(value, name_id, 3, 1, 0x409)
            font['name'].setName(value, name_id, 1, 0, 0)
        font.save(target)
        pdfmetrics.registerFont(TTFont(name, str(target)))
        paths[name] = target
    pdfmetrics.registerFontFamily('NotoSC', normal='NotoSC', bold='NotoSC-Bold', italic='NotoSC', boldItalic='NotoSC-Bold')
    return paths


def drawing(source):
    xml = ET.fromstring(Path(source).read_text(encoding='utf-8'))
    for element in xml.iter():
        if 'font-family' in element.attrib:
            element.set('font-family', 'NotoSC')
        if element.tag.endswith('text'):
            element.set('font-family', 'NotoSC-Bold' if element.get('font-weight') in ('600', '700', 'bold') else 'NotoSC')
    # svglib has no pattern fill support; omit only the decorative dot pattern.
    for parent in xml.iter():
        for child in list(parent):
            if child.get('fill', '').startswith('url(#p)'):
                parent.remove(child)
    result = svg2rlg(io.BytesIO(ET.tostring(xml, encoding='utf-8')))
    if result is None:
        raise ValueError(f'Cannot render SVG: {source}')
    return result


class VectorImage(Flowable):
    def __init__(self, vector, width):
        super().__init__()
        self.vector = vector
        self.width = width
        self.height = vector.height * width / vector.width

    def draw(self):
        self.canv.saveState()
        scale = self.width / self.vector.width
        self.canv.scale(scale, scale)
        renderPDF.draw(self.vector, self.canv, 0, 0)
        self.canv.restoreState()


def rasterize(vector, target):
    stream = io.BytesIO()
    doc = canvas.Canvas(stream, pagesize=(vector.width, vector.height))
    renderPDF.draw(vector, doc, 0, 0)
    doc.save()
    pdf = pdfium.PdfDocument(stream.getvalue())
    page = pdf[0]
    page.render(scale=1.5).to_pil().save(target)
    page.close()
    pdf.close()


def prepare_images(payload, temporary):
    assets = temporary / 'assets'
    if assets.exists():
        shutil.rmtree(assets)
    assets.mkdir(exist_ok=True)
    vectors = {}
    for asset in payload['assets']:
        if asset['originalExtension'] == '.svg':
            vector = drawing(asset['source'])
            vectors[asset['name']] = vector
            rasterize(vector, assets / asset['name'])
            shutil.copyfile(asset['source'], assets / f"source-{asset['id']}.svg")
        else:
            shutil.copyfile(asset['source'], assets / asset['name'])
    cover = drawing(payload['cover'])
    rasterize(cover, assets / 'cover.png')
    shutil.copyfile(payload['cover'], assets / 'source-cover.svg')
    return assets, vectors, cover


def styles():
    common = dict(fontName='NotoSC', fontSize=9.4, leading=16.6, textColor=INK, wordWrap='CJK', splitLongWords=True, spaceAfter=8)
    return {
        'body': ParagraphStyle('Body', **common),
        'small': ParagraphStyle('Small', **{**common, 'fontSize': 8, 'leading': 13.5, 'textColor': MUTED}),
        'h1': ParagraphStyle('Chapter', **{**common, 'fontName': 'NotoSC-Bold', 'fontSize': 20, 'leading': 29, 'spaceAfter': 20, 'keepWithNext': True}),
        'h2': ParagraphStyle('Section', **{**common, 'fontName': 'NotoSC-Bold', 'fontSize': 12.5, 'leading': 20, 'spaceBefore': 14, 'spaceAfter': 9, 'keepWithNext': True}),
        'h3': ParagraphStyle('Subsection', **{**common, 'fontName': 'NotoSC-Bold', 'fontSize': 10.5, 'leading': 18, 'spaceBefore': 11, 'keepWithNext': True}),
        'quote': ParagraphStyle('Quote', **{**common, 'leftIndent': 12, 'rightIndent': 9, 'borderColor': CORAL, 'borderWidth': 1, 'borderPadding': 9, 'backColor': colors.HexColor('#f5f4ef')}),
        'cell': ParagraphStyle('Cell', **{**common, 'fontSize': 7.6, 'leading': 12.4, 'spaceAfter': 0}),
        'code': ParagraphStyle('Code', fontName='NotoSC', fontSize=7.4, leading=11.8, textColor=INK, backColor=colors.HexColor('#eef1f5'), borderPadding=8, spaceBefore=6, spaceAfter=12),
    }


def wrap_code(text, width, font='NotoSC', size=7.4):
    output = []
    for line in text.expandtabs(4).splitlines():
        current = ''
        for character in line:
            if current and pdfmetrics.stringWidth(current + character, font, size) > width:
                output.append(current)
                current = '    ' + character
            else:
                current += character
        output.append(current)
    return '\n'.join(output)


class CodeBlock(Preformatted):
    def wrap(self, available_width, available_height):
        self.width = available_width
        self.height = len(self.lines) * self.style.leading + 16
        return self.width, self.height

    def split(self, available_width, available_height):
        count = int((available_height - 16) / self.style.leading)
        if count < 1:
            return []
        if count >= len(self.lines):
            return [self]
        if len(self.lines) <= 6:
            return []
        return [CodeBlock('\n'.join(self.lines[:count]), self.style), CodeBlock('\n'.join(self.lines[count:]), self.style)]

    def draw(self):
        self.canv.saveState()
        self.canv.setFillColor(colors.HexColor('#eef1f5'))
        self.canv.roundRect(0, 0, self.width, self.height, 3, fill=1, stroke=0)
        self.canv.setFillColor(INK)
        text = self.canv.beginText(8, self.height - 8 - self.style.fontSize)
        text.setFont(self.style.fontName, self.style.fontSize, self.style.leading)
        for line in self.lines:
            text.textLine(line)
        self.canv.drawText(text)
        self.canv.restoreState()


def flow(node, styles, assets, vectors, payload, width=CONTENT):
    chapters = {chapter['href']: chapter for chapter in payload['chapters']}
    result = []
    for child_index, child in enumerate(node.children):
        if isinstance(child, str):
            if child.strip():
                result.append(Paragraph(escape(child.strip()), styles['body']))
            continue
        tag = child.tag
        if tag in ('h1', 'h2', 'h3', 'h4', 'h5'):
            heading = Paragraph(inline(child, payload['site'], chapters), styles['h1' if tag == 'h1' else 'h2' if tag == 'h2' else 'h3'])
            following = next((item for item in node.children[child_index + 1:] if isinstance(item, Node)), None)
            if following is not None and following.tag == 'table':
                # A multi-page table must not be kept whole with its heading.
                # Reserve a useful first fragment instead, then let row splitting work.
                result.append(CondPageBreak(145))
                heading.keepWithNext = False
            result.append(heading)
        elif tag == 'p':
            images = [item for item in child.children if isinstance(item, Node) and item.tag == 'img']
            if images:
                for image in images:
                    name = Path(image.attrs['src']).name
                    if name in vectors:
                        figure = VectorImage(vectors[name], width)
                    else:
                        bitmap = Image(str(assets / name))
                        ratio = min(width / bitmap.imageWidth, 260 / bitmap.imageHeight)
                        bitmap.drawWidth, bitmap.drawHeight = bitmap.imageWidth * ratio, bitmap.imageHeight * ratio
                        bitmap.hAlign = 'CENTER'
                        figure = bitmap
                    caption = Paragraph(escape(image.attrs.get('alt', '')), styles['small'])
                    result.append(KeepTogether([figure, Spacer(1, 4), caption, Spacer(1, 5)]))
            else:
                result.append(Paragraph(inline(child, payload['site'], chapters), styles['body']))
        elif tag == 'pre':
            result.append(CodeBlock(wrap_code(child.text().rstrip('\n'), width - 18), styles['code']))
        elif tag in ('ul', 'ol'):
            number = 0
            for item in child.children:
                if not isinstance(item, Node) or item.tag != 'li':
                    continue
                number += 1
                prefix = f'{number}. ' if tag == 'ol' else '• '
                if all(isinstance(value, str) or value.tag not in ('p', 'ul', 'ol', 'pre') for value in item.children):
                    result.append(Paragraph(escape(prefix) + inline(item, payload['site'], chapters), styles['body']))
                else:
                    nested = flow(item, styles, assets, vectors, payload, width - 10)
                    if nested and isinstance(nested[0], Paragraph):
                        nested[0] = Paragraph(escape(prefix) + nested[0].text, styles['body'])
                    result.extend(nested)
        elif tag == 'blockquote':
            text = '<br/>'.join(inline(item, payload['site'], chapters) for item in child.children if isinstance(item, Node))
            result.append(Paragraph(text, styles['quote']))
        elif tag == 'table':
            rows = []
            def collect(element):
                if element.tag == 'tr':
                    rows.append([Paragraph(inline(cell, payload['site'], chapters), styles['cell']) for cell in element.children if isinstance(cell, Node) and cell.tag in ('td', 'th')])
                else:
                    for item in element.children:
                        if isinstance(item, Node):
                            collect(item)
            collect(child)
            if rows:
                columns = len(rows[0])
                sizes = [width / columns] * columns
                table = Table(rows, colWidths=sizes, repeatRows=1, hAlign='LEFT', splitByRow=1)
                table.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e7edf3')), ('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LINEBELOW', (0, 0), (-1, 0), .6, CORAL), ('LINEBELOW', (0, 1), (-1, -1), .3, colors.HexColor('#dce1e6')), ('LEFTPADDING', (0, 0), (-1, -1), 6), ('RIGHTPADDING', (0, 0), (-1, -1), 6), ('TOPPADDING', (0, 0), (-1, -1), 6), ('BOTTOMPADDING', (0, 0), (-1, -1), 6)]))
                result += [table, Spacer(1, 12)]
        elif tag == 'hr':
            result.append(Spacer(1, 10))
        else:
            result.extend(flow(child, styles, assets, vectors, payload, width))
    return result


class BookDoc(BaseDocTemplate):
    def __init__(self, filename, payload, cover):
        super().__init__(filename, pagesize=A5, leftMargin=MARGIN, rightMargin=MARGIN, topMargin=43, bottomMargin=42, title=payload['title'], author=payload['brand'])
        self.payload, self.cover, self.current_chapter = payload, cover, ''
        frame = Frame(MARGIN, 42, CONTENT, HEIGHT - 85, leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates(PageTemplate('book', [frame], onPage=self.page))

    def page(self, canv, doc):
        if doc.page == 1:
            canv.setFillColor(colors.HexColor('#0b101c'))
            canv.rect(0, 0, WIDTH, HEIGHT, fill=1, stroke=0)
            scale = min(WIDTH / self.cover.width, HEIGHT / self.cover.height)
            canv.saveState()
            canv.translate((WIDTH - self.cover.width * scale) / 2, (HEIGHT - self.cover.height * scale) / 2)
            canv.scale(scale, scale)
            renderPDF.draw(self.cover, canv, 0, 0)
            canv.restoreState()
            return
        canv.saveState()
        canv.setFont('NotoSC', 6.8)
        canv.setFillColor(MUTED)
        canv.drawString(MARGIN, HEIGHT - 25, 'CODEX MASTERY LAB / 驾驭 Codex')
        canv.setStrokeColor(colors.HexColor('#d8dee5'))
        canv.setLineWidth(.4)
        canv.line(MARGIN, 31, WIDTH - MARGIN, 31)
        canv.drawString(MARGIN, 19, self.payload['date'] + ' · 中文实战教材')
        canv.drawRightString(WIDTH - MARGIN, 19, str(doc.page))
        canv.restoreState()

    def afterFlowable(self, flowable):
        if hasattr(flowable, 'chapter_key'):
            key, title = flowable.chapter_key, flowable.getPlainText()
            self.canv.bookmarkPage(key)
            self.canv.addOutlineEntry(title, key, 0, False)
            self.notify('TOCEntry', (0, title, self.page, key))


def make_pdf(payload, assets, vectors, cover, destination):
    style = styles()
    story = [Spacer(1, 1), PageBreak(), Paragraph(payload['title'], style['h1']), Paragraph('第一版 · 离线阅读版 / ' + payload['date'], style['h2']), Paragraph('Codex Mastery Lab 是独立开源中文教学项目。正文来自同一份 Markdown：导读、28 章与来源附录。网页交互在这里转换为明确的离线练习；示意、参考程序执行和读者实际验证仍分别标明。', style['body']), Paragraph('案例源码与在线阅读', style['h2']), Paragraph(f'<link href="{payload["site"]}">{payload["site"]}</link><br/><link href="https://github.com/liamamilin/codex-mastery">github.com/liamamilin/codex-mastery</link>', style['body']), Paragraph('运行命令必须在正文规定的工作目录执行。书中代码块为适应 A5 页面可能换行；复制命令优先使用网站或原始 Markdown，避免把版面换行当作命令换行。图片来自可编辑 SVG 与真实案例截图。中文字体为 Noto Sans SC，按 SIL Open Font License 嵌入。', style['small']), PageBreak(), Paragraph('目录', style['h1'])]
    toc = TableOfContents()
    toc.levelStyles = [ParagraphStyle('Contents', fontName='NotoSC', fontSize=9, leading=17, textColor=INK, leftIndent=0, firstLineIndent=0, spaceBefore=0)]
    toc.tableStyle = TableStyle([('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 0), ('TOPPADDING', (0, 0), (-1, -1), 4), ('BOTTOMPADDING', (0, 0), (-1, -1), 4), ('VALIGN', (0, 0), (-1, -1), 'TOP')])
    story += [toc, PageBreak()]
    previous_part = None
    for chapter in payload['chapters']:
        root = Tree(chapter['html']).root
        chapter_flow = flow(root, style, assets, vectors, payload)
        first = next((item for item in chapter_flow if isinstance(item, Paragraph)), None)
        if first is None:
            raise ValueError(f'No heading in {chapter["file"]}')
        first.chapter_key = chapter['id']
        if not chapter['file'].startswith('00-') and chapter['part'] in PARTS and chapter['part'] != previous_part:
            story += [Paragraph(f"PART {chapter['part']} / {PARTS[chapter['part']]}", style['small']), Spacer(1, 5)]
            previous_part = chapter['part']
        story += chapter_flow + [PageBreak()]
    doc = BookDoc(str(destination), payload, cover)
    doc.multiBuild(story)


def make_epub(payload, assets, font_paths, destination):
    source_hash = hashlib.sha256(''.join(chapter['sourceSha256'] for chapter in payload['chapters']).encode()).hexdigest()
    identifier = 'urn:uuid:' + str(uuid.uuid5(uuid.NAMESPACE_URL, payload['site'] + source_hash))
    css = '''@font-face{font-family:NotoSC;src:url('../fonts/NotoSC.ttf')}@font-face{font-family:NotoSC;src:url('../fonts/NotoSC-Bold.ttf');font-weight:bold}body{font-family:NotoSC,sans-serif;line-height:1.85;color:#142034;margin:1.2em}h1,h2,h3,h4{line-height:1.45;page-break-after:avoid}h1{font-size:1.8em;color:#a8482d;margin-top:1.8em}h2{font-size:1.25em;margin-top:1.6em}p{margin:.8em 0}a{color:#a8482d}img{max-width:100%;height:auto}pre{font-family:NotoSC,monospace;font-size:.78em;white-space:pre-wrap;overflow-wrap:anywhere;background:#eef1f5;padding:.7em;line-height:1.6}code{overflow-wrap:anywhere}table{border-collapse:collapse;width:100%;font-size:.82em}th,td{border-bottom:1px solid #d7dfe6;padding:.5em;text-align:left;vertical-align:top;overflow-wrap:anywhere}th{background:#e7edf3}blockquote{border-left:3px solid #bb4b30;padding-left:1em;color:#4c596c}.feedback{background:#f3f4ef;padding:.8em}.cover{margin:0;padding:0;text-align:center}.cover img{width:100%;max-height:100vh}'''
    files = {}
    def xhtml(title, body, extra=''):
        return '<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE html>\n<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="zh-CN" lang="zh-CN"><head><meta charset="utf-8"/><title>' + escape(title) + '</title><link rel="stylesheet" type="text/css" href="../styles/book.css"/></head><body' + extra + '>' + body + '</body></html>'
    files['EPUB/styles/book.css'] = css.encode()
    files['EPUB/text/cover.xhtml'] = xhtml(payload['title'], '<img src="../assets/cover.png" alt="驾驭 Codex 全书封面"/>', ' class="cover"').encode()
    note = '<h1>离线版出版说明</h1><p>正文来自导读、28 章与来源附录的唯一 Markdown 源稿。网页互动改为离线练习，不调用 Codex，不自动保存学习进度。</p><p>本版日期：' + payload['date'] + '。独立开源教学项目，非 OpenAI 官方教材。</p><p><a href="' + payload['site'] + '">在线阅读与案例入口</a>。命令与真实执行边界以各章说明为准。</p>'
    files['EPUB/text/publication.xhtml'] = xhtml('离线版出版说明', note).encode()
    previous_part = None
    for chapter in payload['chapters']:
        label = ''
        if not chapter['file'].startswith('00-') and chapter['part'] in PARTS and chapter['part'] != previous_part:
            label = f"<p>PART {chapter['part']} / {PARTS[chapter['part']]}</p>"
            previous_part = chapter['part']
        files['EPUB/text/' + chapter['href']] = xhtml(chapter['title'], label + chapter['html']).encode()
    links = ''.join(f'<li><a href="text/{chapter["href"]}">{escape(chapter["title"])}</a></li>' for chapter in payload['chapters'])
    files['EPUB/nav.xhtml'] = ('<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="zh-CN"><head><title>目录</title><link rel="stylesheet" href="styles/book.css"/></head><body><nav epub:type="toc" id="toc"><h1>目录</h1><ol>' + links + '</ol></nav></body></html>').encode()
    for name, font_path in font_paths.items():
        files[f'EPUB/fonts/{name}.ttf'] = font_path.read_bytes()
    for file in assets.iterdir():
        files['EPUB/assets/' + file.name] = file.read_bytes()
    manifest = ['<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>']
    spine = []
    media = {'.xhtml': 'application/xhtml+xml', '.css': 'text/css', '.ttf': 'font/ttf', '.png': 'image/png', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg'}
    for index, filename in enumerate(sorted(files)):
        if filename == 'EPUB/nav.xhtml':
            continue
        href = filename.removeprefix('EPUB/')
        item_id = f'item-{index}'
        prop = ' properties="cover-image"' if href == 'assets/cover.png' else ''
        manifest.append(f'<item id="{item_id}" href="{escape(href)}" media-type="{media[Path(href).suffix]}"{prop}/>')
        if href.startswith('text/'):
            spine.append((href, item_id))
    order = ['text/cover.xhtml', 'text/publication.xhtml'] + ['text/' + chapter['href'] for chapter in payload['chapters']]
    spine_map = dict(spine)
    files['EPUB/package.opf'] = ('<?xml version="1.0" encoding="utf-8"?><package xmlns="http://www.idpf.org/2007/opf" unique-identifier="book-id" version="3.0" xml:lang="zh-CN"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="book-id">' + identifier + '</dc:identifier><dc:title>' + escape(payload['title']) + '</dc:title><dc:language>zh-CN</dc:language><dc:creator>Codex Mastery Lab</dc:creator><dc:rights>See source repository licenses; embedded Noto Sans SC is SIL OFL 1.1.</dc:rights><meta property="dcterms:modified">' + payload['date'] + 'T00:00:00Z</meta></metadata><manifest>' + ''.join(manifest) + '</manifest><spine>' + ''.join(f'<itemref idref="{spine_map[href]}"/>' for href in order) + '</spine></package>').encode()
    files['META-INF/container.xml'] = b'<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'
    files['EPUB/fonts/OFL.txt'] = (Path(payload['root']) / 'assets/fonts/OFL.txt').read_bytes()
    # Include the font license in the manifest too.
    files['EPUB/package.opf'] = files['EPUB/package.opf'].replace(b'</manifest>', b'<item id="font-license" href="fonts/OFL.txt" media-type="text/plain"/></manifest>')
    with zipfile.ZipFile(destination, 'w') as output:
        output.writestr('mimetype', 'application/epub+zip', compress_type=zipfile.ZIP_STORED)
        for name, data in files.items():
            output.writestr(name, data, compress_type=zipfile.ZIP_DEFLATED)
    return files


def validate(payload, pdf_path, epub_path, temporary):
    pdf = PdfReader(pdf_path)
    all_text = '\n'.join(page.extract_text() or '' for page in pdf.pages)
    normalized = re.sub(r'\s+', '', all_text)
    missing = [chapter['title'] for chapter in payload['chapters'] if re.sub(r'\s+', '', chapter['title']) not in normalized]
    if missing:
        raise ValueError(f'PDF chapter headings missing from extracted Chinese text: {missing}')
    destinations = {item.title: pdf.get_destination_page_number(item) for item in pdf.outline if not isinstance(item, list)}
    body_checks = []
    for index, chapter in enumerate(payload['chapters']):
        if chapter['title'] not in destinations:
            raise ValueError(f'PDF chapter bookmark missing: {chapter["title"]}')
        first_page = destinations[chapter['title']]
        last_page = destinations[payload['chapters'][index + 1]['title']] if index + 1 < len(payload['chapters']) else len(pdf.pages)
        body = re.sub(r'\s+', '', ''.join(page.extract_text() or '' for page in pdf.pages[first_page:last_page]))
        paragraphs = []
        def collect_paragraphs(node):
            if node.tag == 'p' and len(re.sub(r'\s+', '', node.text())) >= 35:
                paragraphs.append(re.sub(r'\s+', '', node.text()))
            for child in node.children:
                if isinstance(child, Node):
                    collect_paragraphs(child)
        collect_paragraphs(Tree(chapter['html']).root)
        if not paragraphs or paragraphs[0][:24] not in body or paragraphs[-1][-24:] not in body:
            raise ValueError(f'PDF chapter body boundary not found: {chapter["file"]}')
        body_checks.append({'file': chapter['file'], 'firstPage': first_page + 1, 'lastPage': last_page, 'bodyBoundaryText': 'passed'})
    checks = {'pdfPages': len(pdf.pages), 'pdfExtractedCharacters': len(all_text), 'chapters': len(payload['chapters']) - 2, 'sourceDocuments': len(payload['chapters']), 'missingHeadings': missing}
    checks['pdfChapterBodies'] = body_checks
    with zipfile.ZipFile(epub_path) as epub:
        if epub.infolist()[0].filename != 'mimetype' or epub.infolist()[0].compress_type != zipfile.ZIP_STORED:
            raise ValueError('EPUB mimetype must be first and uncompressed')
        if epub.testzip() is not None or epub.read('mimetype') != b'application/epub+zip':
            raise ValueError('EPUB ZIP integrity or mimetype content failed')
        errors = []
        names = set(epub.namelist())
        for name in names:
            if name.endswith('.png') and not epub.read(name).startswith(b'\x89PNG\r\n\x1a\n'):
                errors.append(f'{name}: PNG MIME signature mismatch')
            if name.endswith(('.jpg', '.jpeg')) and not epub.read(name).startswith(b'\xff\xd8\xff'):
                errors.append(f'{name}: JPEG MIME signature mismatch')
        documents = {}
        for name in names:
            if name.endswith('.xhtml'):
                documents[name] = ET.fromstring(epub.read(name))
                ids = [item.get('id') for item in documents[name].iter() if item.get('id')]
                if len(ids) != len(set(ids)):
                    errors.append(f'{name}: duplicate element id')
        for name in names:
            if name.endswith(('.xhtml', '.opf', '.xml', '.svg')):
                document = ET.fromstring(epub.read(name))
                if name.endswith('.xhtml'):
                    for element in document.iter():
                        for attr in ('href', 'src'):
                            target = element.get(attr)
                            if not target or target.startswith(('https:', 'http:', 'mailto:', 'data:', '#')):
                                continue
                            parsed = urllib.parse.urlsplit(target)
                            resolved = os.path.normpath(str(Path(name).parent / urllib.parse.unquote(parsed.path)))
                            if resolved not in names:
                                errors.append(f'{name}: {target}')
                            elif parsed.fragment and resolved in documents:
                                ids = {item.get('id') for item in documents[resolved].iter()}
                                if urllib.parse.unquote(parsed.fragment) not in ids:
                                    errors.append(f'{name}: missing anchor {target}')
        if errors:
            raise ValueError(f'Broken EPUB links: {errors}')
        if len([name for name in names if re.search(r'text/chapter-\d+\.xhtml$', name)]) != len(payload['chapters']):
            raise ValueError('EPUB chapter count mismatch')
        checks['epubEntries'] = len(names)
        checks['epubXmlAndLocalLinks'] = 'passed'
        checks['epubImageMimeSignatures'] = 'passed'
    checks['date'] = payload['date']
    checks['artifacts'] = {file.name: {'bytes': file.stat().st_size, 'sha256': hashlib.sha256(file.read_bytes()).hexdigest()} for file in [pdf_path, epub_path]}
    checks['sourceManifest'] = [{'file': chapter['file'], 'sha256': chapter['sourceSha256']} for chapter in payload['chapters']]
    checks['limits'] = ['EPUB structure/XML/local links checked; no physical e-reader or EPUBCheck executed.', 'PDF layout requires rendered page inspection; PDF text extraction alone is insufficient.', 'Browser interactions are replaced with explicitly labelled offline exercises.']
    (pdf_path.parent / 'validation.json').write_text(json.dumps(checks, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    manifest = {
        'version': 1, 'generatedAt': datetime.now(timezone.utc).isoformat(),
        'sourceFiles': [{'path': 'book/' + chapter['file'], 'sha256': chapter['sourceSha256']} for chapter in payload['chapters']],
        'artifacts': {file.name: {'sha256': checks['artifacts'][file.name]['sha256'], 'size': file.stat().st_size, **({'pages': len(pdf.pages)} if file.suffix == '.pdf' else {})} for file in [pdf_path, epub_path]},
        'validation': {key: value for key, value in checks.items() if key not in ('sourceManifest', 'artifacts')},
    }
    (pdf_path.parent / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    (temporary / 'pdf-text.txt').write_text(all_text, encoding='utf-8')
    # Export representative page images for visual QA; page indices are recorded.
    selections = {0, 2, min(5, len(pdf.pages)-1)}
    for terms in [('标题', '网页地址'), ('步骤', '亲手操作'), ('工作区', '模型说了什么'), ('```',), ('实际执行',)]:
        for index, page in enumerate(pdf.pages):
            text = page.extract_text() or ''
            if index > 3 and all(term in text for term in terms):
                selections.add(index)
                break
    rendered = temporary / 'rendered'
    rendered.mkdir(exist_ok=True)
    visual = pdfium.PdfDocument(pdf_path)
    for index in sorted(selections):
        page = visual[index]
        page.render(scale=1.7).to_pil().save(rendered / f'page-{index+1:03d}.png')
        page.close()
    visual.close()
    print(json.dumps({**{key: value for key, value in checks.items() if key not in ('sourceManifest',)}, 'renderedPages': [index+1 for index in sorted(selections)]}, ensure_ascii=False, indent=2))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', required=True, type=Path)
    args = parser.parse_args()
    payload = json.loads(args.input.read_text(encoding='utf-8'))
    temporary = args.input.parent
    output = Path(payload['root']) / 'exports'
    output.mkdir(exist_ok=True)
    font_paths = fonts(payload, temporary)
    assets, vectors, cover = prepare_images(payload, temporary)
    pdf_path, epub_path = output / 'codex-mastery.pdf', output / 'codex-mastery.epub'
    make_pdf(payload, assets, vectors, cover, pdf_path)
    make_epub(payload, assets, font_paths, epub_path)
    validate(payload, pdf_path, epub_path, temporary)


if __name__ == '__main__':
    main()
