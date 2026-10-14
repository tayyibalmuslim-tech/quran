/* Shared note paste cleanup and user-defined text shortcuts. */
(function () {
  'use strict';
  if (window.__tadabburNoteTools) return;
  window.__tadabburNoteTools = true;
  const KEY = 'quran-tadabbur-shortcuts-v1';
  let shortcuts = [];
  let busy = false;
  function read() {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || '[]');
      shortcuts = Array.isArray(value) ? value.filter(valid) : [];
    } catch (_) { shortcuts = []; }
  }
  function valid(s) {
    return s && typeof s.key === 'string' && /^\S{1,40}$/u.test(s.key) &&
      typeof s.text === 'string' && s.text.trim() && s.text.length <= 5000;
  }
  function normalStyle(editable) {
    const computed = getComputedStyle(editable);
    return 'font-size:16px;font-weight:normal;font-style:normal;text-decoration:none;' +
      'background-color:transparent;color:' + computed.color + ';';
  }
  function applyFormat(node, s) {
    node.style.color = /^#[0-9a-f]{6}$/i.test(s.color) ? s.color : '#2b2620';
    node.style.fontSize = ({small: '13px', normal: '16px', large: '20px', larger: '24px'})[s.size] || '16px';
    node.style.fontWeight = s.bold ? 'bold' : 'normal';
    node.style.fontStyle = s.italic ? 'italic' : 'normal';
    node.style.textDecoration = s.underline ? 'underline' : 'none';
  }
  // Rebuild inert clipboard HTML from safe text/style elements. Never import event handlers,
  // images, external CSS, background colours, font sizes, or executable content.
  function cleanPaste(html, plain, editable) {
    const output = document.createElement('div');
    const source = new DOMParser().parseFromString(html || '', 'text/html');
    const blocked = new Set(['SCRIPT','STYLE','IFRAME','OBJECT','EMBED','SVG','MATH','HEAD','META','LINK','TEMPLATE']);
    const blocks = new Set(['P','DIV','LI','UL','OL','BLOCKQUOTE','PRE','H1','H2','H3','H4','H5','H6','TR']);
    function copy(node, target) {
      if (node.nodeType === 3) { target.appendChild(document.createTextNode(node.data)); return; }
      if (node.nodeType !== 1 || blocked.has(node.tagName)) return;
      if (node.tagName === 'BR') { target.appendChild(document.createElement('br')); return; }
      const span = document.createElement(blocks.has(node.tagName) ? 'div' : 'span');
      const color = node.style.color || (node.tagName === 'FONT' ? node.getAttribute('color') : '');
      if (color && !/var\(|url\(|inherit|currentcolor/i.test(color)) span.style.color = color;
      if (['B','STRONG'].includes(node.tagName) || /^(bold|[6-9]00)$/.test(node.style.fontWeight)) span.style.fontWeight = 'bold';
      if (['I','EM'].includes(node.tagName) || node.style.fontStyle === 'italic') span.style.fontStyle = 'italic';
      if (node.tagName === 'U' || /underline/.test(node.style.textDecoration)) span.style.textDecoration = 'underline';
      if (['S','STRIKE','DEL'].includes(node.tagName) || /line-through/.test(node.style.textDecoration)) span.style.textDecoration = 'line-through';
      for (const child of node.childNodes) copy(child, span);
      target.appendChild(span);
    }
    const wrapper = document.createElement('div');
    wrapper.style.cssText = normalStyle(editable);
    if (html) for (const node of source.body.childNodes) copy(node, wrapper);
    if (!html || (!wrapper.textContent && plain)) {
      wrapper.replaceChildren();
      plain.split(/\r\n|\r|\n/).forEach((line, i) => {
        if (i) wrapper.appendChild(document.createElement('br'));
        wrapper.appendChild(document.createTextNode(line));
      });
    }
    output.appendChild(wrapper);
    return output.innerHTML;
  }
  function selectionInside(editable) {
    const s = window.getSelection();
    return s && s.rangeCount && editable.contains(s.getRangeAt(0).commonAncestorContainer) ? s : null;
  }
  function insert(editable, html) {
    const selection = selectionInside(editable);
    if (!selection) return false;
    // A neutral continuation explicitly keeps the next characters outside the expansion.
    const id = 'note-caret-' + Math.random().toString(36).slice(2);
    const tail = document.createElement('span');
    tail.id = id;
    tail.style.cssText = normalStyle(editable);
    tail.textContent = '\u200B';
    const content = '<span id="' + id + '-bundle">' + html + tail.outerHTML + '</span>';
    busy = true;
    try {
      let ok = false;
      try { ok = document.execCommand('insertHTML', false, content); } catch (_) {}
      if (!ok) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(range.createContextualFragment(content));
      }
      const bundle = editable.querySelector('#' + id + '-bundle');
      if (bundle) {
        // Split surrounding inline formatting so the continuation is not inside a
        // copied bold/underline/highlight element. Keep content on either side intact.
        while (bundle.parentElement !== editable && /^(SPAN|FONT|B|STRONG|I|EM|U|S|STRIKE|MARK|A)$/.test(bundle.parentElement.tagName)) {
          const parent = bundle.parentElement;
          const before = parent.cloneNode(false), after = parent.cloneNode(false);
          before.removeAttribute('id'); after.removeAttribute('id');
          while (parent.firstChild && parent.firstChild !== bundle) before.appendChild(parent.firstChild);
          while (bundle.nextSibling) after.appendChild(bundle.nextSibling);
          if (before.hasChildNodes()) parent.before(before);
          parent.before(bundle);
          if (after.hasChildNodes()) parent.before(after);
          parent.remove();
        }
        bundle.replaceWith(...bundle.childNodes);
      }
      const end = editable.querySelector('#' + id);
      if (end) {
        end.removeAttribute('id');
        const caret = document.createRange();
        caret.setStart(end.firstChild, end.firstChild.length); caret.collapse(true);
        selection.removeAllRanges(); selection.addRange(caret);
      }
      editable.dispatchEvent(new Event('input', {bubbles: true}));
      return true;
    } finally { busy = false; }
  }
  function expand(editable) {
    if (busy || !shortcuts.length) return;
    const selection = selectionInside(editable);
    if (!selection || !selection.isCollapsed) return;
    const caret = selection.getRangeAt(0);
    let block = caret.startContainer.nodeType === 1 ? caret.startContainer : caret.startContainer.parentElement;
    while (block !== editable && !/^(DIV|P|LI|BLOCKQUOTE)$/.test(block.tagName)) block = block.parentElement;
    const before = document.createRange(); before.selectNodeContents(block); before.setEnd(caret.startContainer, caret.startOffset);
    const match = before.toString().match(/[^\s\u200B]+$/u);
    if (!match) return;
    const item = shortcuts.find(s => s.key === match[0]);
    if (!item) return;
    // Locate the start even if a browser split the abbreviation across styled text nodes.
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    let node, offset = before.toString().length - item.key.length, start = null;
    while ((node = walker.nextNode())) {
      if (offset < node.length) { start = node; break; }
      offset -= node.length;
    }
    if (!start) return;
    const replace = caret.cloneRange(); replace.setStart(start, offset);
    selection.removeAllRanges(); selection.addRange(replace);
    const phrase = document.createElement('span');
    applyFormat(phrase, item);
    item.text.split('\n').forEach((line, i) => {
      if (i) phrase.appendChild(document.createElement('br'));
      phrase.appendChild(document.createTextNode(line));
    });
    insert(editable, phrase.outerHTML);
  }
  function init() {
    read();
    const style = document.createElement('style');
    style.textContent = '.nt-dialog{direction:rtl;width:min(540px,92vw);max-height:85vh;overflow:auto;box-sizing:border-box;border:1px solid var(--line,#ccc);border-radius:14px;background:var(--card,#fff);color:var(--ink,#222);padding:20px;font:15px Tajawal,sans-serif}.nt-dialog::backdrop{background:#0008}.nt-dialog label{display:block;margin:12px 0 5px}.nt-dialog input[type=text],.nt-dialog textarea,.nt-dialog select{box-sizing:border-box;max-width:100%;font:inherit;padding:8px;border:1px solid #bbb;border-radius:6px;background:var(--paper,#fff);color:inherit}.nt-dialog input[type=text],.nt-dialog textarea{width:100%}.nt-dialog textarea{min-height:90px}.nt-dialog button{font:inherit;padding:7px 10px;margin:4px;border:1px solid var(--line,#ccc);border-radius:7px;background:var(--paper,#eee);color:inherit;cursor:pointer}.nt-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}.nt-row label{display:inline-flex;gap:5px;align-items:center}.nt-preview{padding:12px;border:1px dashed var(--line,#bbb);border-radius:8px;white-space:pre-wrap;margin-top:12px}.nt-entry{display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--line,#ccc);padding:6px 0}.nt-entry span{flex:1;overflow-wrap:anywhere}.nt-status{color:#a33;min-height:1.5em}.nt-help{font-size:13px;line-height:1.7;color:var(--ink-soft,#555)}';
    document.head.appendChild(style);
    const dialog = document.createElement('dialog'); dialog.className = 'nt-dialog';
    dialog.setAttribute('aria-labelledby', 'nt-title');
    dialog.innerHTML = '<h2 id="nt-title">اختصارات الملاحظات</h2><p class="nt-help">يتحول الاختصار فور اكتمال كتابته ككلمة مستقلة. اختر رمزاً مميزاً مثل :صل لتجنب استبدال الكلمات العادية. تُحفظ الاختصارات في هذا المتصفح لجميع السور.</p><div class="nt-list"></div><form><label>الاختصار<input name="key" type="text" maxlength="40" required autocomplete="off" placeholder=":صل"></label><label>الجملة<textarea name="text" maxlength="5000" required></textarea></label><div class="nt-row"><label>اللون<input type="color" name="color" value="#2b2620"></label><label>الحجم<select name="size"><option value="small">صغير</option><option value="normal" selected>عادي</option><option value="large">كبير</option><option value="larger">كبير جداً</option></select></label><label><input type="checkbox" name="bold">غامق</label><label><input type="checkbox" name="italic">مائل</label><label><input type="checkbox" name="underline">تسطير</label></div><div class="nt-preview" aria-label="معاينة التنسيق"></div><p class="nt-status" role="status"></p><button type="submit">حفظ الاختصار</button><button type="button" class="nt-new">اختصار جديد</button><button type="button" class="nt-close">إغلاق</button></form>';
    document.body.appendChild(dialog);
    const form = dialog.querySelector('form'), status = dialog.querySelector('.nt-status');
    let editing = null, returnFocus = null;
    function values() {
      const f = form.elements;
      return {key: f.key.value.trim(), text: f.text.value, color: f.color.value, size: f.size.value, bold: f.bold.checked, italic: f.italic.checked, underline: f.underline.checked};
    }
    function preview() { const v = values(), p = dialog.querySelector('.nt-preview'); p.textContent = v.text || 'معاينة الجملة'; applyFormat(p, v); }
    function reset() { editing = null; form.reset(); status.textContent = ''; preview(); }
    function save(items) {
      try { localStorage.setItem(KEY, JSON.stringify(items)); shortcuts = items; return true; }
      catch (_) { status.textContent = 'تعذر حفظ الاختصارات في المتصفح. لم يتم تغيير القائمة.'; return false; }
    }
    function render() {
      const list = dialog.querySelector('.nt-list'); list.replaceChildren();
      for (const s of shortcuts) {
        const row = document.createElement('div'); row.className = 'nt-entry';
        const text = document.createElement('span'); text.textContent = s.key + ' ← ' + s.text;
        const edit = document.createElement('button'); edit.type = 'button'; edit.textContent = 'تعديل';
        edit.onclick = () => { editing = s.key; for (const k of ['key','text','color','size']) form.elements[k].value = s[k] || ''; for (const k of ['bold','italic','underline']) form.elements[k].checked = !!s[k]; status.textContent = ''; preview(); };
        const del = document.createElement('button'); del.type = 'button'; del.textContent = 'حذف';
        del.onclick = () => { if (save(shortcuts.filter(x => x.key !== s.key))) { if (editing === s.key) reset(); render(); } };
        row.append(text, edit, del); list.appendChild(row);
      }
    }
    form.addEventListener('input', preview);
    form.addEventListener('submit', e => {
      e.preventDefault(); const v = values();
      if (!valid(v)) { status.textContent = 'اكتب اختصاراً دون مسافات وجملة غير فارغة.'; return; }
      if (shortcuts.some(s => s.key !== editing && (s.key.startsWith(v.key) || v.key.startsWith(s.key)))) {
        status.textContent = 'هذا الاختصار موجود أو يبدأ باختصار آخر. اختر رمزاً مختلفاً حتى يعمل الاستبدال الفوري.'; return;
      }
      const next = shortcuts.filter(s => s.key !== editing); next.push(v);
      if (save(next)) { reset(); render(); status.textContent = 'تم حفظ الاختصار.'; }
    });
    dialog.querySelector('.nt-new').onclick = reset;
    dialog.querySelector('.nt-close').onclick = () => dialog.close();
    dialog.addEventListener('close', () => { if (returnFocus) returnFocus.focus(); });
    window.addEventListener('storage', e => { if (e.key === KEY) { read(); render(); } });
    document.querySelectorAll('.note-editor').forEach(editor => {
      const editable = editor.querySelector('.note-editable'), toolbar = editor.querySelector('.note-toolbar');
      if (!editable || !toolbar) return;
      const button = document.createElement('button'); button.type = 'button'; button.textContent = '⚡ اختصارات'; button.title = 'إضافة وتعديل اختصارات الكتابة';
      button.onclick = () => { returnFocus = editable; read(); reset(); render(); dialog.showModal(); form.elements.key.focus(); };
      toolbar.appendChild(button);
      editable.addEventListener('paste', e => {
        if (!e.clipboardData) return;
        const html = e.clipboardData.getData('text/html'), text = e.clipboardData.getData('text/plain');
        if (!html && !text) return;
        if (!selectionInside(editable)) return;
        e.preventDefault(); insert(editable, cleanPaste(html, text, editable));
      });
      editable.addEventListener('input', e => {
        if (!e.isComposing && (!e.inputType || e.inputType === 'insertText' || e.inputType === 'insertCompositionText')) expand(editable);
      });
      editable.addEventListener('compositionend', () => expand(editable));
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once: true}); else init();
})();
