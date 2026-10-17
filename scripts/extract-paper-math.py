"""Preserve Word math layout for the browser without changing the source document."""
from pathlib import Path
import html
import json
import re
import xml.etree.ElementTree as ET
import zipfile

ROOT = Path(__file__).resolve().parents[1]
NS = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
      'm': 'http://schemas.openxmlformats.org/officeDocument/2006/math'}
def name(e):
    return e.tag.split('}')[-1]
def row(e):
    return ''.join(convert(c) for c in e) if e is not None else ''
def convert(e):
    tag = name(e)
    if tag.endswith('Pr') or tag in ('bookmarkStart', 'bookmarkEnd', 'proofErr'):
        return ''
    if tag == 't':
        return html.escape(e.text or '')
    if tag == 'f':
        return '<span class="math-frac"><span>'+row(e.find('m:num', NS))+'</span><span>'+row(e.find('m:den', NS))+'</span></span>'
    if tag in ('sSub', 'sSup'):
        child, target = ('sub', 'sub') if tag == 'sSub' else ('sup', 'sup')
        return '<span class="math-script">'+row(e.find('m:e', NS))+'<'+target+'>'+row(e.find('m:'+child, NS))+'</'+target+'></span>'
    if tag == 'd':
        beg = e.find('m:dPr/m:begChr', NS)
        end = e.find('m:dPr/m:endChr', NS)
        left = beg.get('{'+NS['m']+'}val', '(') if beg is not None else '('
        right = end.get('{'+NS['m']+'}val', ')') if end is not None else ')'
        return html.escape(left)+''.join(row(c) for c in e.findall('m:e', NS))+html.escape(right)
    if tag == 'oMath':
        return '<span class="paper-math">'+row(e)+'</span>'
    if tag == 'r' and e.tag.startswith('{'+NS['w']+'}'):
        value = row(e)
        align = e.find('w:rPr/w:vertAlign', NS)
        if align is not None:
            t = {'superscript':'sup','subscript':'sub'}.get(align.get('{'+NS['w']+'}val'))
            if t:
                return '<'+t+'>'+value+'</'+t+'>'
        return value
    if tag in ('tab','br'):
        return ' '
    return row(e)

data = json.loads((ROOT/'dist/assets/paper-content.json').read_text(encoding='utf-8'))
xml = ET.fromstring(zipfile.ZipFile(ROOT/'dist/assets/paper-original.docx').read('word/document.xml'))
normalize = lambda s: re.sub(r'[\s\u200b-\u200d\ufeff]', '', s)
lookup = {normalize(p['text']):i for i,p in enumerate(data) if p['text'].strip()}
out = {}
for p in xml.findall('.//w:p', NS):
    text = ''.join(e.text or '' for e in p.iter() if e.tag in ('{'+NS['w']+'}t','{'+NS['m']+'}t'))
    i = lookup.get(normalize(text))
    if i is not None and (p.find('.//m:oMath', NS) is not None or p.find('.//w:vertAlign', NS) is not None):
        out[str(i)] = {'text': data[i]['text'], 'html': row(p).strip()}

# Word stores the prime in (12) on an oversized base run. Display the intended
# factors, matching the numerical substitution immediately below it.
out['189']['html'] = '<span class="paper-math">F<sub>s3</sub> = <span class="math-frac"><span>W<sub>3</sub> γ′ tgφ</span><span>(W<sub>3</sub> + P)(γ′ + γ<sub>w</sub>) tgβ</span></span> =</span>'
(ROOT/'dist/assets/paper-math.json').write_text(json.dumps(out, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print(f'Preserved math and superscripts in {len(out)} paragraphs.')
