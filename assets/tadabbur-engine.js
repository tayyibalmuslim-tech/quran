/* ============================================
   tadabbur-engine.js
   المحرك المشترك لنظام الهايلايت + الملاحظات + إدراج الآيات
   يُستخدم في كل صفحات المحاور بكل السور

   يعتمد على وجود البيانات دي في وسم <body>:
   <body data-surah="2" data-mahwar="01-muqaddimah">

   ويعتمد على تحميل quran-data.js قبله (فيه QURAN_DATA)
   ============================================ */

(function(){
  'use strict';

  // ---------- قراءة هوية الصفحة الحالية (سورة + محور) ----------
  const body = document.body;
  const SURAH_ID = body.dataset.surah || 'unknown';
  const MAHWAR_ID = body.dataset.mahwar || 'unknown';

  // مفاتيح تخزين ديناميكية: كل سورة/محور له مفتاحه الخاص تلقائياً
  const STORAGE_KEY = `quran-tadabbur-hl-${SURAH_ID}-${MAHWAR_ID}`;
  const NOTES_KEY = `quran-tadabbur-notes-${SURAH_ID}-${MAHWAR_ID}`;

  document.addEventListener('DOMContentLoaded', function(){
    initHighlightSystem();
    initNotesSystem();
    initVerseModal();
  });

  /* ============================================
     1) نظام الهايلايت والشطب
     ============================================ */
  function initHighlightSystem(){
    const content = document.querySelector('main');
    const menu = document.getElementById('selectionMenu');
    if(!content || !menu) return;

    let savedRange = null;

    const blocks = content.querySelectorAll('.field-value, .glossary-item');
    blocks.forEach((el, i)=>{ if(!el.dataset.hlId) el.dataset.hlId = 'b' + i; });

    function showMenuForRange(range){
      savedRange = range.cloneRange();
      const rect = range.getBoundingClientRect();
      if(rect.width === 0 && rect.height === 0) return;
      let x = rect.left + window.scrollX + rect.width/2 - menu.offsetWidth/2;
      let y = rect.bottom + window.scrollY + 10;
      x = Math.max(8, Math.min(x, window.scrollX + document.documentElement.clientWidth - menu.offsetWidth - 8));
      menu.style.left = x + 'px';
      menu.style.top = y + 'px';
      menu.classList.add('show');
      requestAnimationFrame(()=>{
        let x2 = rect.left + window.scrollX + rect.width/2 - menu.offsetWidth/2;
        x2 = Math.max(8, Math.min(x2, window.scrollX + document.documentElement.clientWidth - menu.offsetWidth - 8));
        menu.style.left = x2 + 'px';
      });
    }
    function hideMenu(){ menu.classList.remove('show'); }

    let selTimer = null;
    function checkSelection(){
      const sel = window.getSelection();
      if(!sel || sel.isCollapsed || sel.rangeCount === 0){ hideMenu(); return; }
      const range = sel.getRangeAt(0);
      let anc = range.commonAncestorContainer;
      if(anc.nodeType === 3) anc = anc.parentElement;
      if(!content.contains(anc)){ hideMenu(); return; }
      if(anc.closest && anc.closest('.note-editable')){ hideMenu(); return; }
      if(sel.toString().trim().length === 0){ hideMenu(); return; }
      showMenuForRange(range);
    }
    document.addEventListener('selectionchange', ()=>{
      clearTimeout(selTimer);
      selTimer = setTimeout(checkSelection, 350);
    });

    ['mousedown','touchstart'].forEach(ev=>{
      menu.addEventListener(ev, (e)=>{ e.preventDefault(); }, {passive:false});
    });

    function getTextNodesInRange(range){
      let root = range.commonAncestorContainer;
      if(root.nodeType === 3) root = root.parentNode;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
      const nodes = [];
      let n;
      while((n = walker.nextNode())){
        if(!range.intersectsNode(n)) continue;
        if(n.textContent === '') continue;
        if(!content.contains(n)) continue;
        nodes.push(n);
      }
      return nodes;
    }

    function wrapRange(range, tagName, className){
      if(!range || range.collapsed) return;

      if(range.startContainer === range.endContainer && range.startContainer.nodeType === 3){
        try{
          const w = document.createElement(tagName);
          w.className = className;
          range.surroundContents(w);
          return;
        }catch(e){ /* fall through */ }
      }

      const nodes = getTextNodesInRange(range);
      if(nodes.length === 0) return;

      const last = nodes[nodes.length - 1];
      if(last === range.endContainer && range.endOffset < last.length){
        last.splitText(range.endOffset);
      }
      const first = nodes[0];
      if(first === range.startContainer && range.startOffset > 0){
        nodes[0] = first.splitText(range.startOffset);
      }

      nodes.forEach(node=>{
        if(node.textContent === '') return;
        const p = node.parentElement;
        if(p && p.tagName.toLowerCase() === tagName && p.className === className) return;
        const w = document.createElement(tagName);
        w.className = className;
        node.parentNode.insertBefore(w, node);
        w.appendChild(node);
      });
    }

    function unwrapNode(node){
      const parent = node.parentNode;
      while(node.firstChild) parent.insertBefore(node.firstChild, node);
      parent.removeChild(node);
      parent.normalize();
    }

    function removeFormattingInRange(range){
      if(!range) return;
      const marks = content.querySelectorAll('mark, del');
      let removed = false;
      marks.forEach(m=>{
        if(range.intersectsNode(m)){ unwrapNode(m); removed = true; }
      });
      if(!removed){
        let node = range.commonAncestorContainer;
        if(node.nodeType === 3) node = node.parentElement;
        const target = node && node.closest ? node.closest('mark, del') : null;
        if(target) unwrapNode(target);
      }
    }

    menu.addEventListener('click', (e)=>{
      const btn = e.target.closest('button');
      if(!btn || !savedRange) return;
      const action = btn.dataset.action;

      if(action === 'strike'){
        wrapRange(savedRange, 'del', 'hl-strike');
      } else if(action === 'remove'){
        removeFormattingInRange(savedRange);
      } else if(action && action.startsWith('hl-')){
        wrapRange(savedRange, 'mark', action);
      }

      const sel = window.getSelection();
      if(sel) sel.removeAllRanges();
      savedRange = null;
      hideMenu();
      saveHighlights();
    });

    document.addEventListener('mousedown', (e)=>{
      if(!menu.contains(e.target)) hideMenu();
    });

    function saveHighlights(){
      const data = {};
      blocks.forEach(el=>{
        if(el.querySelector('mark, del')){
          data[el.dataset.hlId] = el.innerHTML;
        }
      });
      try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }catch(e){}
    }

    function loadHighlights(){
      let data = {};
      try{ data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }catch(e){}
      blocks.forEach(el=>{
        if(data[el.dataset.hlId]){
          el.innerHTML = data[el.dataset.hlId];
        }
      });
    }

    loadHighlights();
  }

  /* ============================================
     2) نظام الملاحظات (المعنى التفصيلي + التدبر)
     ============================================ */
  function initNotesSystem(){
    let notesData = {};
    try{ notesData = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}'); }catch(e){ notesData = {}; }

    function saveNotes(){
      try{ localStorage.setItem(NOTES_KEY, JSON.stringify(notesData)); }catch(e){}
    }

    const ALLOWED_TAGS = new Set(['B','STRONG','I','EM','U','FONT','SPAN','BR','DIV','P']);
    function sanitize(node){
      [...node.childNodes].forEach(child=>{
        if(child.nodeType === 1){
          if(!ALLOWED_TAGS.has(child.tagName)){
            while(child.firstChild) child.parentNode.insertBefore(child.firstChild, child);
            child.remove();
            return;
          }
          [...child.attributes].forEach(attr=>{
            if(!['color','style','size','class','contenteditable'].includes(attr.name)) child.removeAttribute(attr.name);
          });
          if(child.hasAttribute('style')){
            const style = child.getAttribute('style');
            const safe = style.split(';').filter(s=>{
              const prop = s.split(':')[0].trim().toLowerCase();
              return ['color','background-color','font-size','font-weight','font-style','text-decoration'].includes(prop);
            }).join(';');
            child.setAttribute('style', safe);
          }
          sanitize(child);
        } else if(child.nodeType !== 3){
          child.remove();
        }
      });
    }

    function renderGroup(group){
      document.querySelectorAll(`[data-note-group="${group}"].note-add-btn`).forEach(btn=>{
        const wrap = btn.closest('.ayah-note-block') || btn.closest('.field-value');
        const list = wrap.querySelector('.notes-list');
        const items = notesData[group] || [];
        list.innerHTML = '';
        items.forEach((html, idx)=>{
          const item = document.createElement('div');
          item.className = 'note-item';
          const p = document.createElement('div');
          p.className = 'note-text';
          p.innerHTML = html;

          const actionsRow = document.createElement('div');
          actionsRow.className = 'note-item-actions';

          const editBtn = document.createElement('button');
          editBtn.className = 'note-edit-btn';
          editBtn.textContent = '✏️ تعديل';
          editBtn.addEventListener('click', ()=> openEditor(group, wrap, idx));

          const deleteBtn = document.createElement('button');
          deleteBtn.className = 'note-delete-btn';
          deleteBtn.textContent = '🗑️ حذف';
          deleteBtn.addEventListener('click', ()=> deleteNote(group, wrap, idx));

          actionsRow.appendChild(editBtn);
          actionsRow.appendChild(deleteBtn);
          item.appendChild(p);
          item.appendChild(actionsRow);
          list.appendChild(item);
        });
      });
    }

    function deleteNote(group, wrap, idx){
      const items = notesData[group] || [];
      const preview = (items[idx] || '').replace(/<[^>]*>/g, '').trim();
      const shortPreview = preview.length > 40 ? preview.slice(0, 40) + '...' : preview;
      const confirmed = confirm(`هل تريد حذف هذه الفقرة؟\n\n"${shortPreview}"\n\nلا يمكن التراجع بعد الحذف.`);
      if(!confirmed) return;
      items.splice(idx, 1);
      notesData[group] = items;
      saveNotes();
      renderGroup(group);
    }

    function openEditor(group, wrap, editIndex){
      const editor = wrap.querySelector('.note-editor');
      const editable = editor.querySelector('.note-editable');
      const items = notesData[group] || [];
      editable.innerHTML = (editIndex !== undefined && editIndex !== null) ? items[editIndex] : '';
      editor.dataset.editIndex = (editIndex !== undefined && editIndex !== null) ? editIndex : '';
      editor.classList.add('open');
      editable.focus();
    }

    function closeEditor(wrap){
      const editor = wrap.querySelector('.note-editor');
      editor.classList.remove('open');
      editor.querySelector('.note-editable').innerHTML = '';
      editor.dataset.editIndex = '';
    }

    document.querySelectorAll('.note-add-btn').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const wrap = btn.closest('.ayah-note-block') || btn.closest('.field-value');
        openEditor(btn.dataset.noteGroup, wrap, null);
      });
    });

    const GDOCS_COLORS = [
      ['#ffffff','#f3f3f3','#efefef','#d9d9d9','#cccccc','#b7b7b7','#999999','#666666','#434343','#000000'],
      ['#f4cccc','#fce5cd','#fff2cc','#d9ead3','#d0e0e3','#c9daf8','#cfe2f3','#d9d2e9','#ead1dc','#ffffff'],
      ['#ea9999','#f9cb9c','#ffe599','#b6d7a8','#a2c4c9','#a4c2f4','#9fc5e8','#b4a7d6','#d5a6bd','#e6e6e6'],
      ['#e06666','#f6b26b','#ffd966','#93c47d','#76a5af','#6d9eeb','#6fa8dc','#8e7cc3','#c27ba0','#cccccc'],
      ['#cc0000','#e69138','#f1c232','#6aa84f','#45818e','#3c78d8','#3d85c6','#674ea7','#a64d79','#999999'],
      ['#990000','#b45f06','#bf9000','#38761d','#134f5c','#1155cc','#0b5394','#351c75','#741b47','#666666'],
      ['#660000','#783f04','#7f6000','#274e13','#0c343d','#1c4587','#073763','#20124d','#4c1130','#000000']
    ];

    function buildColorPopup(){
      const popup = document.createElement('div');
      popup.className = 'color-popup';
      const grid = document.createElement('div');
      grid.className = 'color-grid';
      GDOCS_COLORS.forEach(row=>{
        row.forEach(hex=>{
          const sw = document.createElement('button');
          sw.type = 'button';
          sw.className = 'swatch';
          sw.style.background = hex;
          sw.dataset.color = hex;
          sw.title = hex;
          grid.appendChild(sw);
        });
      });
      popup.appendChild(grid);

      const footer = document.createElement('div');
      footer.className = 'color-popup-footer';

      const dropperBtn = document.createElement('button');
      dropperBtn.type = 'button';
      dropperBtn.className = 'dropper-btn';
      dropperBtn.title = 'قطّارة الألوان — اختر لون من أي مكان في الشاشة';
      dropperBtn.textContent = '💧';
      footer.appendChild(dropperBtn);

      const customBtn = document.createElement('button');
      customBtn.type = 'button';
      customBtn.className = 'custom-btn';
      customBtn.title = 'افتح منتقي الألوان الكامل لاختيار أي لون آخر';
      customBtn.innerHTML = '+ لون آخر';
      const customInput = document.createElement('input');
      customInput.type = 'color';
      customInput.className = 'custom-color-input';
      footer.appendChild(customBtn);
      footer.appendChild(customInput);

      popup.appendChild(footer);
      return { popup, grid, dropperBtn, customBtn, customInput };
    }

    function setupColorPicker(triggerBtn, editable){
      const { popup, grid, dropperBtn, customBtn, customInput } = buildColorPopup();
      triggerBtn.parentElement.style.position = 'relative';
      triggerBtn.parentElement.appendChild(popup);
      const swatch = triggerBtn.querySelector('.color-swatch');
      let savedSel = null;

      function saveSelection(){
        const sel = window.getSelection();
        if(sel && sel.rangeCount > 0){
          const r = sel.getRangeAt(0);
          if(editable.contains(r.commonAncestorContainer)) savedSel = r.cloneRange();
        }
      }
      editable.addEventListener('mouseup', saveSelection);
      editable.addEventListener('keyup', saveSelection);

      function applyColor(hex){
        editable.focus();
        const sel = window.getSelection();
        sel.removeAllRanges();
        if(savedSel) sel.addRange(savedSel);
        try{ document.execCommand('styleWithCSS', false, true); }catch(e){}
        const ok = document.execCommand('foreColor', false, hex);
        if(!ok || !savedSel || savedSel.collapsed){
          if(savedSel && !savedSel.collapsed){
            try{
              const span = document.createElement('span');
              span.style.color = hex;
              savedSel.surroundContents(span);
            }catch(e){}
          }
        }
        if(swatch) swatch.style.background = hex;
        popup.classList.remove('open');
      }

      triggerBtn.addEventListener('mousedown', (e)=>{ e.preventDefault(); saveSelection(); });
      triggerBtn.addEventListener('click', (e)=>{
        e.stopPropagation();
        document.querySelectorAll('.color-popup.open').forEach(p=>{ if(p!==popup) p.classList.remove('open'); });
        popup.classList.toggle('open');
      });

      grid.addEventListener('mousedown', (e)=> e.preventDefault());
      grid.addEventListener('click', (e)=>{
        const sw = e.target.closest('.swatch');
        if(!sw) return;
        applyColor(sw.dataset.color);
      });

      dropperBtn.addEventListener('mousedown', (e)=> e.preventDefault());
      dropperBtn.addEventListener('click', async ()=>{
        if(!window.EyeDropper){
          alert('قطّارة الألوان غير مدعومة في هذا المتصفح، جرّب Chrome أو Edge.');
          return;
        }
        try{
          const result = await new EyeDropper().open();
          applyColor(result.sRGBHex);
        }catch(e){ /* المستخدم ألغى الاختيار */ }
      });

      customBtn.addEventListener('mousedown', (e)=> e.preventDefault());
      customBtn.addEventListener('click', ()=> customInput.click());
      customInput.addEventListener('input', ()=> applyColor(customInput.value));

      document.addEventListener('mousedown', (e)=>{
        if(!popup.contains(e.target) && e.target !== triggerBtn && !triggerBtn.contains(e.target)){
          popup.classList.remove('open');
        }
      });
    }

    const HL_COLORS = [
      {hex:'#fde68a', label:'أصفر'},
      {hex:'#bbf7d0', label:'أخضر'},
      {hex:'#fbcfe8', label:'وردي'},
      {hex:'#bfdbfe', label:'أزرق'}
    ];

    function setupHighlightPicker(triggerBtn, editable){
      const popup = document.createElement('div');
      popup.className = 'hl-popup';
      HL_COLORS.forEach(c=>{
        const sw = document.createElement('button');
        sw.type = 'button';
        sw.className = 'hl-swatch';
        sw.style.background = c.hex;
        sw.title = c.label;
        sw.dataset.color = c.hex;
        popup.appendChild(sw);
      });
      const noneBtn = document.createElement('button');
      noneBtn.type = 'button';
      noneBtn.className = 'hl-none';
      noneBtn.title = 'إزالة الهايلايت';
      noneBtn.textContent = '✕';
      popup.appendChild(noneBtn);

      triggerBtn.parentElement.style.position = 'relative';
      triggerBtn.parentElement.appendChild(popup);

      let savedSel = null;
      function saveSelection(){
        const sel = window.getSelection();
        if(sel && sel.rangeCount > 0){
          const r = sel.getRangeAt(0);
          if(editable.contains(r.commonAncestorContainer)) savedSel = r.cloneRange();
        }
      }
      editable.addEventListener('mouseup', saveSelection);
      editable.addEventListener('keyup', saveSelection);

      function applyHighlight(hex){
        editable.focus();
        const sel = window.getSelection();
        sel.removeAllRanges();
        if(savedSel) sel.addRange(savedSel);
        try{ document.execCommand('styleWithCSS', false, true); }catch(e){}
        const cmd = document.queryCommandSupported && document.queryCommandSupported('hiliteColor') ? 'hiliteColor' : 'backColor';
        const ok = document.execCommand(cmd, false, hex || 'transparent');
        if((!ok || !savedSel || savedSel.collapsed) && savedSel && !savedSel.collapsed && hex){
          try{
            const span = document.createElement('span');
            span.style.backgroundColor = hex;
            savedSel.surroundContents(span);
          }catch(e){}
        }
        popup.classList.remove('open');
      }

      triggerBtn.addEventListener('mousedown', (e)=>{ e.preventDefault(); saveSelection(); });
      triggerBtn.addEventListener('click', (e)=>{
        e.stopPropagation();
        document.querySelectorAll('.hl-popup.open, .color-popup.open').forEach(p=>{ if(p!==popup) p.classList.remove('open'); });
        popup.classList.toggle('open');
      });

      popup.addEventListener('mousedown', (e)=> e.preventDefault());
      popup.addEventListener('click', (e)=>{
        const sw = e.target.closest('.hl-swatch');
        if(sw){ applyHighlight(sw.dataset.color); return; }
        if(e.target.closest('.hl-none')){ applyHighlight(null); }
      });

      document.addEventListener('mousedown', (e)=>{
        if(!popup.contains(e.target) && e.target !== triggerBtn && !triggerBtn.contains(e.target)){
          popup.classList.remove('open');
        }
      });
    }

    document.querySelectorAll('.note-editor').forEach(editor=>{
      const wrap = editor.closest('.ayah-note-block') || editor.closest('.field-value');
      const group = wrap.querySelector('.note-add-btn').dataset.noteGroup;
      const editable = editor.querySelector('.note-editable');
      const saveBtn = editor.querySelector('.note-save-btn');
      const cancelBtn = editor.querySelector('.note-cancel-btn');
      const toolbar = editor.querySelector('.note-toolbar');

      const stateBtns = toolbar.querySelectorAll('button[data-cmd="bold"], button[data-cmd="italic"], button[data-cmd="underline"]');
      function refreshToolbarState(){
        stateBtns.forEach(b=>{
          try{ b.classList.toggle('active', document.queryCommandState(b.dataset.cmd)); }catch(e){}
        });
      }
      toolbar.querySelectorAll('button[data-cmd]').forEach(tBtn=>{
        tBtn.addEventListener('mousedown', (e)=> e.preventDefault());
        tBtn.addEventListener('click', ()=>{
          editable.focus();
          document.execCommand(tBtn.dataset.cmd, false, null);
          refreshToolbarState();
        });
      });
      editable.addEventListener('keyup', refreshToolbarState);
      editable.addEventListener('mouseup', refreshToolbarState);
      editable.addEventListener('focus', refreshToolbarState);

      const sizeSelect = toolbar.querySelector('select[data-cmd="fontSize"]');
      if(sizeSelect){
        sizeSelect.addEventListener('mousedown', (e)=> e.stopPropagation());
        sizeSelect.addEventListener('change', ()=>{
          editable.focus();
          document.execCommand('fontSize', false, sizeSelect.value);
        });
      }

      const colorBtn = toolbar.querySelector('.color-trigger');
      if(colorBtn){
        setupColorPicker(colorBtn, editable);
      }

      const hlBtn = toolbar.querySelector('.hl-trigger');
      if(hlBtn){
        setupHighlightPicker(hlBtn, editable);
      }

      saveBtn.addEventListener('click', ()=>{
        sanitize(editable);
        const html = editable.innerHTML.trim();
        const text = editable.textContent.trim();
        if(!text) return;
        if(!notesData[group]) notesData[group] = [];
        const idx = editor.dataset.editIndex;
        if(idx !== '' && idx !== undefined){
          notesData[group][parseInt(idx)] = html;
        } else {
          notesData[group].push(html);
        }
        saveNotes();
        renderGroup(group);
        closeEditor(wrap);
      });

      cancelBtn.addEventListener('click', ()=> closeEditor(wrap));
    });

    document.querySelectorAll('.note-add-btn').forEach(btn=> renderGroup(btn.dataset.noteGroup));
  }

  /* ============================================
     3) نافذة البحث عن الآيات وإدراجها
     ============================================ */
  function initVerseModal(){
    if(typeof QURAN_DATA === 'undefined'){
      console.error('ملف quran-data.js غير محمّل');
      return;
    }

    const overlay = document.getElementById('verseModalOverlay');
    if(!overlay) return;
    const closeBtn = document.getElementById('verseModalClose');
    const searchInput = document.getElementById('verseSearchInput');
    const resultsBox = document.getElementById('verseResults');

    function normalize(text){
      return text
        .replace(/[\u0610-\u061A\u064B-\u065F\u06D6-\u06ED\u0670]/g, '')
        .replace(/[إأآٱا]/g, 'ا')
        .replace(/ى/g, 'ي')
        .replace(/ة/g, 'ه')
        .replace(/ؤ/g, 'و')
        .replace(/ئ/g, 'ي')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
    }

    const normalizedSurahNames = QURAN_DATA.map(s => normalize(s.name));

    function tryParseReference(query){
      const parts = query.trim().split(/\s+/);
      if(parts.length < 2) return null;
      const lastPart = parts[parts.length - 1];
      const ayahNum = parseInt(lastPart);
      if(isNaN(ayahNum)) return null;
      const surahQuery = normalize(parts.slice(0, -1).join(' '));
      if(!surahQuery) return null;

      for(let i = 0; i < QURAN_DATA.length; i++){
        if(normalizedSurahNames[i].includes(surahQuery) || surahQuery.includes(normalizedSurahNames[i])){
          const surah = QURAN_DATA[i];
          if(ayahNum >= 1 && ayahNum <= surah.verses.length){
            return { surahIndex: i, ayahIndex: ayahNum - 1 };
          }
        }
      }
      return null;
    }

    function searchByText(query, limit){
      const nq = normalize(query);
      if(nq.length < 2) return [];
      const results = [];
      for(let si = 0; si < QURAN_DATA.length && results.length < limit; si++){
        const surah = QURAN_DATA[si];
        for(let vi = 0; vi < surah.verses.length; vi++){
          const verseText = surah.verses[vi];
          if(normalize(verseText).includes(nq)){
            results.push({ surahIndex: si, ayahIndex: vi });
            if(results.length >= limit) break;
          }
        }
      }
      return results;
    }

    function renderResults(refs, query){
      resultsBox.innerHTML = '';
      if(refs.length === 0){
        resultsBox.innerHTML = '<div class="verse-no-results">لا توجد نتائج مطابقة</div>';
        return;
      }
      refs.forEach(ref=>{
        const surah = QURAN_DATA[ref.surahIndex];
        const verseText = surah.verses[ref.ayahIndex];
        const item = document.createElement('div');
        item.className = 'verse-result-item';
        const refLabel = document.createElement('div');
        refLabel.className = 'verse-result-ref';
        refLabel.textContent = `سورة ${surah.name} — آية ${ref.ayahIndex + 1}`;
        const textLabel = document.createElement('div');
        textLabel.className = 'verse-result-text';
        textLabel.textContent = `﴿${verseText}﴾`;
        item.appendChild(refLabel);
        item.appendChild(textLabel);
        item.addEventListener('click', ()=> insertVerse(surah, ref.ayahIndex));
        resultsBox.appendChild(item);
      });
    }

    function runSearch(query){
      if(!query || query.trim().length === 0){
        resultsBox.innerHTML = '<div class="verse-no-results">اكتب في الأعلى للبحث عن آية</div>';
        return;
      }
      const ref = tryParseReference(query);
      if(ref){
        renderResults([ref], query);
        return;
      }
      const results = searchByText(query, 30);
      renderResults(results, query);
    }

    let searchTimer = null;
    searchInput.addEventListener('input', ()=>{
      clearTimeout(searchTimer);
      searchTimer = setTimeout(()=> runSearch(searchInput.value), 200);
    });

    let activeEditable = null;
    let savedInsertRange = null;

    function insertVerses(refs){
      if(!activeEditable || refs.length === 0) return;

      let combinedText = '';
      refs.forEach(ref=>{
        const surah = QURAN_DATA[ref.surahIndex];
        combinedText += `﴿${surah.verses[ref.ayahIndex]}﴾ `;
      });

      let refLabel;
      if(refs.length === 1){
        const surah = QURAN_DATA[refs[0].surahIndex];
        refLabel = `(سورة ${surah.name} — آية ${refs[0].ayahIndex + 1}) `;
      } else {
        const firstSurah = QURAN_DATA[refs[0].surahIndex];
        const lastSurah = QURAN_DATA[refs[refs.length-1].surahIndex];
        if(firstSurah.id === lastSurah.id){
          refLabel = `(سورة ${firstSurah.name} — الآيات ${refs[0].ayahIndex + 1}-${refs[refs.length-1].ayahIndex + 1}) `;
        } else {
          refLabel = `(من سورة ${firstSurah.name} آية ${refs[0].ayahIndex + 1} إلى سورة ${lastSurah.name} آية ${refs[refs.length-1].ayahIndex + 1}) `;
        }
      }

      const wrapper = document.createElement('span');
      wrapper.className = 'inserted-verse';
      wrapper.textContent = combinedText;

      const refSpan = document.createElement('span');
      refSpan.className = 'iv-ref';
      refSpan.textContent = refLabel;
      wrapper.appendChild(refSpan);

      activeEditable.focus();
      const sel = window.getSelection();
      sel.removeAllRanges();

      if(savedInsertRange && activeEditable.contains(savedInsertRange.startContainer)){
        sel.addRange(savedInsertRange);
        const range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(wrapper);
        range.setStartAfter(wrapper);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      } else {
        activeEditable.appendChild(wrapper);
        const range = document.createRange();
        range.setStartAfter(wrapper);
        range.collapse(true);
        sel.addRange(range);
      }

      closeModal();
    }

    function insertVerse(surah, ayahIndex){
      insertVerses([{ surahIndex: QURAN_DATA.indexOf(surah), ayahIndex }]);
    }

    function openModal(editable){
      activeEditable = editable;
      const sel = window.getSelection();
      if(sel && sel.rangeCount > 0 && editable.contains(sel.getRangeAt(0).startContainer)){
        savedInsertRange = sel.getRangeAt(0).cloneRange();
      } else {
        savedInsertRange = null;
      }
      overlay.classList.add('open');
      searchInput.value = '';
      resultsBox.innerHTML = '<div class="verse-no-results">اكتب في الأعلى للبحث عن آية</div>';
      document.querySelector('.verse-tab[data-tab="search"]').click();
      setTimeout(()=> searchInput.focus(), 50);
    }

    function closeModal(){
      overlay.classList.remove('open');
      activeEditable = null;
    }

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e)=>{ if(e.target === overlay) closeModal(); });
    document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape' && overlay.classList.contains('open')) closeModal(); });

    const tabSearchBtn = document.querySelector('.verse-tab[data-tab="search"]');
    const tabRangeBtn = document.querySelector('.verse-tab[data-tab="range"]');
    const tabSearchPanel = document.getElementById('tabSearch');
    const tabRangePanel = document.getElementById('tabRange');

    tabSearchBtn.addEventListener('click', ()=>{
      tabSearchBtn.classList.add('active');
      tabRangeBtn.classList.remove('active');
      tabSearchPanel.style.display = 'flex';
      tabRangePanel.style.display = 'none';
      setTimeout(()=> searchInput.focus(), 50);
    });
    tabRangeBtn.addEventListener('click', ()=>{
      tabRangeBtn.classList.add('active');
      tabSearchBtn.classList.remove('active');
      tabRangePanel.style.display = 'flex';
      tabSearchPanel.style.display = 'none';
    });

    const rangeSurahSelect = document.getElementById('rangeSurahSelect');
    const rangeFromInput = document.getElementById('rangeFromInput');
    const rangeToInput = document.getElementById('rangeToInput');
    const rangeAddBtn = document.getElementById('rangeAddBtn');
    const rangePreview = document.getElementById('rangePreview');

    QURAN_DATA.forEach((surah, i)=>{
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `${surah.id}. ${surah.name} (${surah.verses.length} آية)`;
      rangeSurahSelect.appendChild(opt);
    });

    function updateRangePreview(){
      const si = parseInt(rangeSurahSelect.value);
      const surah = QURAN_DATA[si];
      const from = parseInt(rangeFromInput.value) || 1;
      const to = parseInt(rangeToInput.value) || 1;
      if(!surah || from < 1 || to < from || to > surah.verses.length){
        rangePreview.textContent = 'حدد مدى آيات صحيح داخل عدد آيات السورة';
        rangeAddBtn.disabled = true;
        return;
      }
      const count = to - from + 1;
      rangePreview.textContent = `سيتم إضافة ${count} آية من سورة ${surah.name} (من آية ${from} إلى آية ${to})`;
      rangeAddBtn.disabled = false;
    }

    rangeSurahSelect.addEventListener('change', ()=>{
      const si = parseInt(rangeSurahSelect.value);
      rangeFromInput.max = QURAN_DATA[si].verses.length;
      rangeToInput.max = QURAN_DATA[si].verses.length;
      updateRangePreview();
    });
    rangeFromInput.addEventListener('input', updateRangePreview);
    rangeToInput.addEventListener('input', updateRangePreview);
    updateRangePreview();

    rangeAddBtn.addEventListener('click', ()=>{
      const si = parseInt(rangeSurahSelect.value);
      const from = parseInt(rangeFromInput.value);
      const to = parseInt(rangeToInput.value);
      const refs = [];
      for(let ayah = from; ayah <= to; ayah++){
        refs.push({ surahIndex: si, ayahIndex: ayah - 1 });
      }
      insertVerses(refs);
    });

    document.querySelectorAll('.verse-add-btn').forEach(btn=>{
      btn.addEventListener('mousedown', (e)=> e.preventDefault());
      btn.addEventListener('click', ()=>{
        const toolbar = btn.closest('.note-toolbar');
        const editor = toolbar.closest('.note-editor');
        const editable = editor.querySelector('.note-editable');
        openModal(editable);
      });
    });

    document.querySelectorAll('.note-editable').forEach(editable=>{
      editable.addEventListener('keydown', (e)=>{
        if(e.key !== '(') return;
        const sel = window.getSelection();
        if(!sel || sel.rangeCount === 0) return;
        const range = sel.getRangeAt(0);
        const node = range.startContainer;
        const offset = range.startOffset;
        if(node.nodeType !== 3) return;
        const charBefore = node.textContent.charAt(offset - 1);
        if(charBefore !== '(') return;

        e.preventDefault();
        node.textContent = node.textContent.slice(0, offset - 1) + node.textContent.slice(offset);
        const newRange = document.createRange();
        newRange.setStart(node, offset - 1);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);

        openModal(editable);
      });
    });
  }

})();
