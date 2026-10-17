"""Build the approved Taha pages using existing Maryam page components.
Run only before first publication: regenerating verse markup can invalidate highlights.
The Quran is read verbatim; normalization is solely for locating glossary terms.
"""
from pathlib import Path
import re, json, html, unicodedata
ROOT=Path(__file__).resolve().parents[1]
AR=str.maketrans('0123456789','٠١٢٣٤٥٦٧٨٩')
def num(n): return str(n).translate(AR)
def norm(s):
    s=s.replace('ٰ','ا').translate(str.maketrans({'ٱ':'ا','أ':'ا','إ':'ا','آ':'ا','ؤ':'و','ئ':'ي','ى':'ا','ء':'','ـ':''}))
    return ''.join(c for c in s if not unicodedata.category(c).startswith('M') and c not in '۞۩اۥۦ').strip()
quran=json.loads(re.search(r'const QURAN_DATA\s*=\s*(\[.*\]);',(ROOT/'assets/quran-data.js').read_text(),re.S)[1])
verses=next(s['verses'] for s in quran if s['id']==20)
glossary={}
for line in (ROOT/'project-docs/taha-glossary.txt').read_text().splitlines():
    if not line or line.startswith('#'): continue
    n,*items=line.split('|')
    glossary[int(n)]=[p.split('=',1) for p in items]

def annotate(n):
    original=verses[n-1]
    # Segment actual tokens, retaining each exact code point and pause marker.
    tokens=list(re.finditer(r'[^\sۖۗۘۙۚۛ۞۩]+',original))
    spans=[]
    for word,meaning in glossary.get(n,[]):
        parts=word.split()
        matches=[]
        for i in range(len(tokens)-len(parts)+1):
            chunk=tokens[i:i+len(parts)]
            if [norm(t.group()) for t in chunk]==[norm(p) for p in parts]:
                matches.append((chunk[0].start(),chunk[-1].end(),meaning))
        if not matches:
            raise ValueError(f'{n}: cannot locate {word!r}; tokens: '+', '.join(norm(t.group()) for t in tokens))
        spans.extend(matches)
    spans.sort()
    out=[]; end=0
    for a,b,meaning in spans:
        assert a>=end, (n,'overlapping glossary')
        assert meaning.endswith('.') and '"' not in meaning
        out.append(html.escape(original[end:a]))
        out.append(f'<span class="wq" data-m="{html.escape(meaning,quote=True)}">{html.escape(original[a:b])}</span>')
        end=b
    out.append(html.escape(original[end:]))
    return ''.join(out)

# Resolve everything before writing any pages.
annotated={n:annotate(n) for n in range(1,136)}
plan=(ROOT/'project-docs/taha-plan.md').read_text()
axes=[]
slugs=['quran-tadhkirah','musa-risalah','firawn-saharah','bani-israel-ijl','quran-qiyamah','adam-huda','sabr-khitam']
colors=['gold','purple','coral','green','blue','purple','gold']
for line in plan.splitlines():
    if not line.startswith('| ') or '–' not in line: continue
    title,rng,subtitle,reason=[x.strip() for x in line.strip('|').split('|')]
    a,b=map(int,rng.split('–'))
    if not axes or axes[-1]['title']!=title:
        i=len(axes)
        axes.append(dict(file=f'{i+1:02}-{slugs[i]}.html',title=title,range=f'{a}-{b}',color=colors[i],subsections=[]))
    axes[-1]['subsections'].append(dict(title=subtitle,range=f'{a}-{b}'))
    axes[-1]['range']=axes[-1]['range'].split('-')[0]+f'-{b}'
assert len(axes)==7 and sum(len(m['subsections']) for m in axes)==21
base=ROOT/'surahs/020-taha'; pages=base/'mahawir-pages'; pages.mkdir(parents=True,exist_ok=True)
info=dict(id=20,name_ar='طه',type='مكية',total_verses=135,muqaddimah=dict(file='00-muqaddimat-alsurah.html',title='مقدمة السورة'),mahawir=axes)
(base/'info.json').write_text(json.dumps(info,ensure_ascii=False,indent=2)+'\n')
reference=(ROOT/'surahs/019-maryam/mahawir-pages/01-zakariyya-yahya.html').read_text()
prefix=reference.split('<header>')[0]
prefix=prefix.replace('data-surah="19"','data-surah="20"').replace('id=19','id=20').replace('سورة مريم','سورة طه')
prefix=re.sub(r'<title>.*?</title>','<title>{title} — سورة طه</title>',prefix)
prefix=re.sub(r'data-mahwar="[^"]+"','data-mahwar="{mahwar}"',prefix)
editor=re.search(r'<div class="note-editor">.*?<div class="note-editor-actions">.*?</div>\s*</div>',reference,re.S)[0]
ending=reference[reference.index('<div id="selectionMenu">'):]
source='<a href="https://quranpedia.net/surah/1/20/book/3" target="_blank" rel="noopener">مصدر معاني المفردات: تفسير السعدي — سورة طه</a>'
def note(group,placeholder):
    e=re.sub(r'data-placeholder="[^"]*"',f'data-placeholder="{placeholder}"',editor)
    return f'<div class="notes-list"></div>\n<button type="button" class="note-add-btn" data-note-group="{group}">➕ إضافة</button>\n'+e

def page(filename,title,badge,rng,body,nav):
    head=prefix.replace('{title}',title).replace('{mahwar}',filename[:-5])
    text=head+f'<header><span class="mahwar-badge">{badge}</span><h1>{title}</h1><p class="range">{rng}</p></header>\n<main>\n'+body+'\n'+nav+'\n</main>\n<footer>سورة طه — مصحف التدبر<br>'+source+'</footer>\n'+ending
    (pages/filename).write_text(text)

def box(title,body):
    return f'<section class="sub-block"><div class="sub-header"><span class="sub-title">{title}</span></div><div class="field"><div class="field-value">{body}</div></div></section>\n'

words=sum(len(v.split()) for v in verses)
intro='<div class="info-grid">'+''.join(f'<div class="info-card"><div class="info-label">{k}</div><div class="info-value">{v}</div></div>' for k,v in [('نوع السورة','مكية'),('ترتيبها في المصحف',num(20)),('عدد آياتها',num(135)),('كلمات النص المعتمد',num(words))])+'</div>\n'
intro+=box('التعريف بالسورة','<p>سورة طه سورة مكية، ترتيبها العشرون في المصحف، وعدد آياتها مائة وخمس وثلاثون. سميت بما افتتحت به، وتبدأ ببيان أن القرآن تذكرة لمن يخشى، ثم تعرض عظمة منزّله وكمال ملكه وعلمه.</p><p>تتضمن السورة تثبيت النبي ﷺ بالوحي وأخبار الرسل؛ فتفصل خبر موسى منذ النداء والاصطفاء إلى مواجهة فرعون ونجاة بني إسرائيل وفتنة العجل. وتعرض مشاهد القيامة وقصة آدم، وتبين عاقبة اتباع الهدى والإعراض عنه، وتختم بالتوجيه إلى الصبر والتسبيح والصلاة.</p>')
intro+=box('فضل السورة','<div class="field-value empty">لم يُدرج هنا حديث في فضل خاص للسورة؛ يُضاف بعد التحقق من صحته ومصدره.</div>')
intro+=box('أبرز موضوعات السورة','تفتتح السورة بالقرآن والتذكير بالله، ثم تعرض اصطفاء موسى ودعاءه ورعاية الله له، وإرساله مع هارون إلى فرعون. وتتوالى مشاهد الحوار والمواجهة وإيمان السحرة وثباتهم، ثم النجاة والتذكير بالنعم وفتنة العجل وإبطال عبادته. وتصل السورة ذلك بالذكر ومشاهد الحشر والحساب، ثم بقصة آدم وعداوة الشيطان ووعد من اتبع الهدى ووعيد المعرض عنه. وتختم بالعبرة من الأمم الماضية، والصبر والعبادة، وإقامة الحجة وانتظار العاقبة.')
intro+=box('تدبراتي الشخصية',note('muqaddimah-20-tadabbur','اكتب ملاحظتك العامة على السورة...'))
page('00-muqaddimat-alsurah.html','مقدمة سورة طه','مقدمة السورة','قبل المحور الأول',intro,f'<div class="nav-links"><a href="{axes[0]["file"]}">ابدأ المحور الأول ←</a></div>')
for i,m in enumerate(axes):
    blocks=[]
    for sub in m['subsections']:
        a,b=map(int,sub['range'].split('-'))
        text=' '.join(f'{annotated[n]} <span class="ayah-num">({num(n)})</span>' for n in range(a,b+1))
        block=f'<section class="sub-block" id="section-{a}-{b}">\n<div class="sub-header"><span class="sub-title">{sub["title"]}</span><span class="sub-range">{num(a)}–{num(b)}</span></div>\n'
        block+=f'<div class="field"><div class="field-label">نص الآيات — المس الكلمة المسطرة لمعناها</div><div class="field-value verses-text">﴿{text}﴾</div></div>\n'
        block+='<div class="field"><div class="field-label">التدبر</div><div class="field-value">'+note(f'tadabbur-20-{a}-{b}','اكتب تدبرك...')+'</div></div>\n'
        block+='<div class="field"><div class="field-label">المعنى التفصيلي</div><div class="field-value">\n'
        for n in range(a,b+1):
            group=f'tafsir-20-{n}'
            block+=f'<div class="ayah-note-block" data-note-group="{group}"><span class="tafsir-ayah">{html.escape(verses[n-1])} ({num(n)})</span>\n'+note(group,'اكتب المعنى التفصيلي للآية...')+'</div>\n'
        blocks.append(block+'</div></div>\n</section>')
    prev=axes[i-1]['file'] if i else info['muqaddimah']['file']
    nav=f'<div class="nav-links"><a href="{prev}">→ {"المحور السابق" if i else "مقدمة السورة"}</a>'
    nav+=(f'<a href="{axes[i+1]["file"]}">المحور التالي ←</a>' if i+1<len(axes) else '<a href="../../../surah.html?id=20">فهرس سورة طه ←</a>')+'</div>'
    a,b=map(int,m['range'].split('-'))
    page(m['file'],m['title'],f'المحور {num(i+1)} من {num(len(axes))}',f'الآيات {num(a)}–{num(b)}','\n'.join(blocks),nav)
print(f'Built 8 pages, {len(verses)} verses, {words} whitespace-delimited words.')
