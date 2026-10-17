from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree as ET
import json, shutil, hashlib
from PIL import Image, ImageOps, ImageDraw

root = Path(__file__).resolve().parents[1]
source = root.parent / '土力学论文/用一条安全系数曲线解码梅大高速塌方的秘密.docx'
assets = root / 'dist/assets'
assets.mkdir(parents=True, exist_ok=True)
ns = {'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'm':'http://schemas.openxmlformats.org/officeDocument/2006/math', 'a':'http://schemas.openxmlformats.org/drawingml/2006/main', 'r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
with ZipFile(source) as z:
    xml = ET.fromstring(z.read('word/document.xml'))
    rels = {r.attrib['Id']:r.attrib['Target'] for r in ET.fromstring(z.read('word/_rels/document.xml.rels'))}
    paragraphs=[]
    mapping=[]
    for p in xml.findall('.//w:body//w:p',ns):
        text=''.join(t.text or '' for t in p.iter() if t.tag in ('{'+ns['w']+'}t','{'+ns['m']+'}t'))
        imgs=[rels[b.attrib['{'+ns['r']+'}embed']] for b in p.findall('.//a:blip',ns)]
        if text or imgs:
            paragraphs.append({'text':text,'images':imgs})
    for n in z.namelist():
        if n.startswith('word/media/') and not n.endswith('/'):
            (assets/Path(n).name).write_bytes(z.read(n))
    (assets/'paper-content.json').write_text(json.dumps(paragraphs,ensure_ascii=False,indent=2),encoding='utf-8')
    for i,p in enumerate(paragraphs):
        if p['images']:
            mapping.append({'images':p['images'],'next':[a['text'] for a in paragraphs[i+1:i+4]]})
shutil.copy2(source,assets/'paper-original.docx')
(root/'scripts/media-map.json').write_text(json.dumps(mapping,ensure_ascii=False,indent=2),encoding='utf-8')
thumbs=[]
for f in sorted(assets.glob('*.jpeg')):
    im=Image.open(f).convert('RGB'); tile=Image.new('RGB',(400,300),'#eeeeee')
    fit=ImageOps.contain(im,(390,260));tile.paste(fit,((400-fit.width)//2,8))
    ImageDraw.Draw(tile).text((12,278),f.name,fill='black');thumbs.append(tile)
sheet=Image.new('RGB',(1200,300*((len(thumbs)+2)//3)),'white')
for i,t in enumerate(thumbs):sheet.paste(t,((i%3)*400,(i//3)*300))
sheet.save(root/'scripts/contact-sheet.jpg')
print(json.dumps({'paragraphs':len(paragraphs),'media':mapping,'sha256':hashlib.sha256(source.read_bytes()).hexdigest()},ensure_ascii=True))
