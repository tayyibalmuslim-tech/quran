"""Validate Taha's exact Quran text, coverage, index, HTML, and editor structure.
Run from any directory: python3 scripts/validate_taha.py
Uses only Python's standard library. Does not impose verse/word-count limits.
"""
from pathlib import Path
from html.parser import HTMLParser
import json
import re

ROOT = Path(__file__).resolve().parents[1]
VOID = set('area base br col embed hr img input link meta param source track wbr'.split())

class Node:
    def __init__(self, tag='', attrs=(), parent=None):
        self.tag, self.attrs, self.parent, self.children = tag, dict(attrs), parent, []
    def find(self, cls):
        return [n for n in self.walk() if cls in n.attrs.get('class', '').split()]
    def walk(self):
        for n in self.children:
            if isinstance(n, Node):
                yield n
                yield from n.walk()
    def text(self):
        return ''.join(n.text() if isinstance(n, Node) else n for n in self.children)

class Document(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.root = Node()
        self.current = self.root
        self.feed(text)
        assert self.current is self.root, 'Unclosed HTML tag'
    def handle_starttag(self, tag, attrs):
        n = Node(tag, attrs, self.current)
        self.current.children.append(n)
        if tag not in VOID:
            self.current = n
    def handle_endtag(self, tag):
        assert self.current.tag == tag, f'Unbalanced tag: {tag}, expected {self.current.tag}'
        self.current = self.current.parent
    def handle_data(self, data):
        self.current.children.append(data)

AR = str.maketrans('0123456789', '٠١٢٣٤٥٦٧٨٩')
def num(n):
    return str(n).translate(AR)

quran = json.loads(re.search(r'const QURAN_DATA\s*=\s*(\[.*\]);', (ROOT/'assets/quran-data.js').read_text(), re.S)[1])
verses = next(s['verses'] for s in quran if s['id'] == 20)
base = ROOT/'surahs/020-taha'
info = json.loads((base/'info.json').read_text())
assert info['id'] == 20 and info['total_verses'] == len(verses) == 135
seen, groups, section_count, tooltip_count = [], [], 0, 0
for m in [dict(info['muqaddimah'], subsections=[]), *info['mahawir']]:
    path = base/'mahawir-pages'/m['file']
    text = path.read_text()
    doc = Document(text).root
    nodes = list(doc.walk())
    body = next(n for n in nodes if n.tag == 'body')
    assert body.attrs['data-surah'] == '20'
    assert body.attrs['data-mahwar'] == path.stem
    ids = [n.attrs['id'] for n in nodes if 'id' in n.attrs]
    assert len(ids) == len(set(ids)), 'Duplicate element ID'
    assert {'verseModalOverlay', 'tabSearch', 'tabRange', 'selectionMenu'} <= set(ids)
    head = next(n for n in nodes if n.tag == 'head')
    assets = [n.attrs.get('src', n.attrs.get('href', '')) for n in head.walk()]
    expected_assets = ['tadabbur.css','quran-data.js','firebase-sync.js','tadabbur-engine.js','tadabbur-toc.js']
    indices = [next(i for i, p in enumerate(assets) if p.endswith(a)) for a in expected_assets]
    assert indices == sorted(indices)
    assert 'position:sticky' in text and '.wq::after' in text
    for n in nodes:
        for attr in ['src', 'href']:
            link = n.attrs.get(attr, '')
            if link and not re.match(r'^(https?:|#)', link):
                assert (path.parent/link.split('?')[0].split('#')[0]).resolve().exists(), link
    for button in doc.find('note-add-btn'):
        group = button.attrs['data-note-group']
        assert group not in groups, f'Duplicate note identity: {group}'
        groups.append(group)
        siblings = [n for n in button.parent.children if isinstance(n, Node)]
        editor = siblings[siblings.index(button)+1]
        assert 'note-editor' in editor.attrs.get('class', '')
        for cls in ['note-toolbar','note-editable','note-save-btn','note-cancel-btn','verse-add-btn']:
            assert editor.find(cls), f'Missing editor control: {cls}'
    for w in doc.find('wq'):
        assert w.attrs.get('data-m', '').endswith('.')
        assert not w.find('wq') and not re.search('[ۖۗۘۙۚۛ۞۩]', w.text())
        tooltip_count += 1
    blocks = [n for n in doc.find('sub-block') if 'id' in n.attrs]
    assert len(blocks) == len(m['subsections'])
    for block, sub in zip(blocks, m['subsections']):
        a, b = map(int, sub['range'].split('-'))
        assert block.find('sub-title')[0].text() == sub['title']
        assert block.find('sub-range')[0].text() == f'{num(a)}–{num(b)}'
        verseblock = block.find('verses-text')[0]
        assert 'field-value' in verseblock.attrs['class'].split(), 'Missing highlight integration'
        expected = '﴿'+' '.join(f'{verses[n-1]} ({num(n)})' for n in range(a,b+1))+'﴾'
        assert verseblock.text() == expected, f'Quran text mismatch: {sub["range"]}'
        detail = block.find('ayah-note-block')
        assert len(detail) == b-a+1
        for n, ayah in zip(range(a,b+1), detail):
            assert ayah.find('tafsir-ayah')[0].text() == f'{verses[n-1]} ({num(n)})'
            assert not ayah.find('tafsir-text'), f'Unexpected prewritten explanation: {n}'
            assert ayah.attrs['data-note-group'] == f'tafsir-20-{n}'
            seen.append(n)
        section_count += 1
    if m['subsections']:
        assert m['range'] == m['subsections'][0]['range'].split('-')[0]+'-'+m['subsections'][-1]['range'].split('-')[1]
    print(f'{m["file"]}: OK')
assert seen == list(range(1,136)), 'Verse gap, overlap, or reordering'
assert 20 in json.loads(re.search(r'READY_SURAHS\s*=\s*(\[[^]]+\])', (ROOT/'index.html').read_text())[1])
print(f'PASS: {len(seen)} exact verses; {section_count} sections; {tooltip_count} tooltips; {len(groups)} complete editors; all links resolve.')
