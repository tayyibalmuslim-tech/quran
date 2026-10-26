/* Hashtags use the existing per-page notes; no separate user-data index. */
(function(){
  'use strict';
  const pages = new Map();
  let records = [], selected = '';
  const $ = id => document.getElementById(id);
  function read(value){
    const parsed = JSON.parse(value);
    return parsed && 'data' in parsed && 'ts' in parsed ? parsed : {data:parsed, ts:0};
  }
  function localPages(){
    for(let i = 0; i < localStorage.length; i++){
      const key = localStorage.key(i);
      const match = key.match(/^quran-tadabbur-notes-(\d+)-(.+)$/);
      if(!match) continue;
      try{pages.set(match[1] + '_' + match[2], {...read(localStorage.getItem(key)), surah:+match[1], mahwar:match[2]});}catch(e){}
    }
  }
  function tagsOf(entry){
    return Array.isArray(entry.tags) ? [...new Set(entry.tags.filter(t => typeof t === 'string' && t).map(t => t.normalize('NFC')))] : [];
  }
  const en = value => value.replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
  async function pageMetadata(page, surahs){
    const surah = surahs.find(s => +s.id === page.surah);
    if(!surah) throw Error('سورة غير موجودة');
    const base = page.surah === 2 ? '002-baqarah' : String(page.surah).padStart(3, '0') + '-' + surah.name_translit.toLowerCase().replace(/'/g, '').replace(/\s+/g, '-');
    const url = 'surahs/' + base + '/mahawir-pages/' + page.mahwar + '.html';
    const response = await fetch(url);
    if(!response.ok) throw Error('تعذر تحميل مرجع الملاحظات');
    const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
    const groups = new Map();
    doc.querySelectorAll('.note-add-btn').forEach((button, order) => {
      const wrap = button.closest('.ayah-note-block') || button.closest('.field-value');
      const block = button.closest('.sub-block');
      const source = wrap.querySelector('.tafsir-ayah') || block?.querySelector('.verses-text');
      let verses = source ? [...en(source.textContent).matchAll(/\((\d+)\)/g)].map(m => +m[1]) : [];
      if(!verses.length){
        const range = block?.querySelector('.sub-range') || doc.querySelector('header .range');
        const nums = range ? en(range.textContent).match(/\d+/g)?.map(Number) || [] : [];
        if(nums.length) for(let n = nums[0]; n <= (nums[1] || nums[0]); n++) verses.push(n);
      }
      verses = [...new Set(verses)].sort((a,b) => a-b);
      groups.set(button.dataset.noteGroup, {verses, order, url});
    });
    return groups;
  }
  function render(){
    const counts = new Map();
    records.forEach(r => r.tags.forEach(t => counts.set(t, (counts.get(t) || 0) + 1)));
    $('tags').replaceChildren();
    const query = $('search').value.replace(/^#/, '').trim();
    [...counts].sort((a,b) => a[0].localeCompare(b[0], 'ar')).filter(([t]) => t.includes(query)).forEach(([tag,count]) => {
      const button = document.createElement('button');button.textContent = '#' + tag + ' (' + count + ')';
      button.setAttribute('aria-pressed', String(selected === tag));
      button.onclick = () => { location.hash = encodeURIComponent(tag); };
      $('tags').appendChild(button);
    });
    $('heading').textContent = selected ? '#' + selected : 'كل الملاحظات المصنفة';
    $('notes').replaceChildren();
    const filtered = records.filter(r => !selected || r.tags.includes(selected));
    filtered.forEach(r => {
      const article = document.createElement('article');article.className = 'card';
      const link = document.createElement('a');link.className = 'meta';link.href = r.url;
      const surah = QURAN_DATA.find(s => s.id === r.surah);
      link.textContent = 'سورة ' + surah.name + (r.verses.length ? ' — الآيات ' + r.verses.join('، ') : ' — مقدمة السورة');
      article.appendChild(link);
      const verse = document.createElement('div');verse.className = 'verse';
      verse.textContent = r.verses.map(n => surah.verses[n-1] ? '﴿' + surah.verses[n-1] + '﴾ (' + n + ')' : '').join(' ');
      if(!r.verses.length) verse.textContent = 'ملاحظة عامة على السورة';
      article.appendChild(verse);
      // Render a restricted rich-text fragment, never executable stored HTML.
      const note = document.createElement('div');note.className = 'note';
      const parsed = new DOMParser().parseFromString(r.html, 'text/html');
      const allowed = new Set(['B','STRONG','I','EM','U','SPAN','FONT','BR','DIV','P']);
      function copy(from,to){[...from.childNodes].forEach(child => {
        if(child.nodeType === 3){to.appendChild(document.createTextNode(child.textContent));return;}
        if(child.nodeType !== 1 || ['SCRIPT','STYLE','IFRAME','OBJECT'].includes(child.tagName)) return;
        const target = allowed.has(child.tagName) ? document.createElement(child.tagName) : document.createElement('span');
        ['color','font-size','font-weight','font-style','text-decoration'].forEach(prop => {target.style.setProperty(prop, child.style.getPropertyValue(prop));});
        if(child.tagName === 'FONT' && child.getAttribute('color')) target.style.color = child.getAttribute('color');
        copy(child,target);to.appendChild(target);
      });}
      copy(parsed.body,note);article.appendChild(note);
      const tags = document.createElement('div');tags.className = 'note-tags';
      r.tags.forEach(tag => {const a = document.createElement('a');a.href = '#' + encodeURIComponent(tag);a.textContent = '#' + tag;tags.appendChild(a);});
      article.appendChild(tags);$('notes').appendChild(article);
    });
    if(!filtered.length){const empty = document.createElement('p');empty.textContent = selected ? 'لا توجد ملاحظات مرتبطة بهذا الهاشتاج.' : 'أضف هاشتاجًا من محرر الملاحظة ليظهر هنا.';$('notes').appendChild(empty);}
    return filtered.length;
  }
  function hash(){try{selected = decodeURIComponent(location.hash.slice(1));}catch(e){selected = '';}}
  async function load(){
    let cloudFailed = false, missing = 0;
    try{
      localPages();
      if(window.TadabburCloud){
        await window.TadabburCloud.ready;
        try{
          for(const page of await window.TadabburCloud.loadAllNotes()){
            const match = page.id.match(/^(\d+)_(.+)$/);if(!match) continue;
            const local = pages.get(page.id);
            if(!local || (page.notesTs || 0) >= local.ts) pages.set(page.id, {surah:+match[1], mahwar:match[2], data:JSON.parse(page.notes), ts:page.notesTs || 0});
          }
        }catch(e){cloudFailed = true;}
      }
      const response = await fetch('data/surahs-list.json');
      if(!response.ok) throw Error('فشل تحميل فهرس السور');
      const surahs = await response.json();
      for(const [id,page] of pages){
        const groups = Object.entries(page.data || {}).filter(([,items]) => Array.isArray(items) && items.some(entry => entry && tagsOf(entry).length));
        if(!groups.length) continue;
        let meta;
        try{meta = await pageMetadata(page, surahs);}catch(e){missing++;continue;}
        groups.forEach(([group,items]) => items.forEach((entry,index) => {
          const tags = tagsOf(entry);if(!tags.length) return;
          const ref = meta.get(group);
          if(!ref){missing++;return;}
          records.push({...ref, surah:page.surah, mahwar:page.mahwar, html:entry.html || '', tags, index});
        }));
      }
      records.sort((a,b) => a.surah-b.surah || (a.verses[0] || 0)-(b.verses[0] || 0) || a.mahwar.localeCompare(b.mahwar) || a.order-b.order || a.index-b.index);
      hash();render();
      $('status').textContent = (cloudFailed ? 'تعذر تحميل الملاحظات السحابية؛ المعروض هو المتاح على هذا الجهاز. ' : '') + (missing ? 'تعذر تحميل بعض مراجع الملاحظات؛ أعد تحميل الصفحة للمحاولة. ' : '') + (!records.length && !cloudFailed && !missing ? 'لا توجد ملاحظات بها هاشتاجات بعد. أضف هاشتاجًا من محرر أي ملاحظة.' : '');
    }catch(e){$('status').textContent = 'تعذر تحميل الملاحظات. أعد تحميل الصفحة للمحاولة.';}
  }
  $('search').addEventListener('input',render);
  window.addEventListener('hashchange', () => {hash();render();});
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load, {once:true});
  else load();
})();
