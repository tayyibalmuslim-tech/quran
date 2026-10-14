// Run with jsdom available: NODE_PATH=/path/to/node_modules node scripts/test-note-tools.cjs
const { JSDOM } = require('jsdom');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const code = fs.readFileSync(path.join(__dirname, '../assets/note-tools.js'), 'utf8');
const KEY = 'quran-tadabbur-shortcuts-v1';
const saved = [{key: ':صل', text: 'صلى الله عليه وسلم', color: '#c00000', size: 'large', bold: true, italic: true, underline: true}];
async function fixture(data = saved) {
  const dom = new JSDOM('<!doctype html><body><div class="note-editor"><div class="note-toolbar"></div><div class="note-editable" contenteditable="true" style="color:rgb(43,38,32)"></div></div></body>', {url: 'https://example.test/surah', runScripts: 'outside-only'});
  const w = dom.window;
  w.localStorage.setItem(KEY, JSON.stringify(data));
  w.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  w.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new w.Event('close')); };
  w.document.execCommand = () => false; // Exercise the Range fallback; no browser formatting emulation.
  await new Promise(r => w.addEventListener('load', r));
  w.eval(code);
  return {w, d: w.document, e: w.document.querySelector('.note-editable')};
}
function caret(w, node, offset) {
  const r = w.document.createRange(); r.setStart(node, offset); r.collapse(true);
  const s = w.getSelection(); s.removeAllRanges(); s.addRange(r);
}
function input(w, e, composing = false) {
  e.dispatchEvent(new w.InputEvent('input', {bubbles: true, inputType: 'insertText', data: 'ل', isComposing: composing}));
}
function paste(w, e, html, plain = '') {
  const event = new w.Event('paste', {bubbles: true, cancelable: true});
  Object.defineProperty(event, 'clipboardData', {value: {getData: type => type === 'text/html' ? html : plain}});
  e.dispatchEvent(event); assert.equal(event.defaultPrevented, true);
}
(async () => {
  const {w,d,e} = await fixture();
  e.innerHTML = '<span style="color:blue;font-weight:bold;background-color:yellow">قبل :صل</span>';
  caret(w, e.firstChild.firstChild, e.textContent.length); input(w,e);
  assert.equal(e.textContent.replace(/\u200B/g,''), 'قبل صلى الله عليه وسلم');
  const phrase = [...e.children].find(x => x.textContent === saved[0].text);
  assert(phrase); assert.equal(phrase.style.color, 'rgb(192, 0, 0)'); assert.equal(phrase.style.fontWeight, 'bold');
  let tail = w.getSelection().anchorNode.parentElement;
  assert.equal(tail.parentElement,e); assert.equal(tail.style.fontSize,'16px'); assert.equal(tail.style.fontWeight,'normal'); assert.equal(tail.style.textDecoration,'none');
  w.getSelection().anchorNode.appendData(' كلام تالٍ');
  assert(!phrase.textContent.includes('كلام')); assert.equal(tail.style.color,'rgb(43, 38, 32)');
  e.innerHTML = 'ضمن:صل'; caret(w,e.firstChild,e.textContent.length);input(w,e);assert.equal(e.textContent,'ضمن:صل');
  e.innerHTML = '<b>:ص</b><i>ل</i>';caret(w,e.lastChild.firstChild,1);input(w,e);assert(e.textContent.includes(saved[0].text));
  e.textContent=':صل';caret(w,e.firstChild,3);input(w,e,true);assert.equal(e.textContent,':صل');
  e.dispatchEvent(new w.CompositionEvent('compositionend'));assert(e.textContent.includes(saved[0].text));
  e.replaceChildren();caret(w,e,0);
  paste(w,e,'<div style="font-size:40px;background:yellow;color:red"><b>أحمر</b><font color="#008000" size="7">أخضر</font><mark>بدون تظليل</mark><script>alert(1)</script><img src="x" onerror="alert(2)"></div>');
  assert(!e.querySelector('script,img,mark,font'));
  assert(!e.innerHTML.includes('40px'));assert(!e.innerHTML.includes('yellow'));assert(!e.innerHTML.includes('onerror'));
  assert([...e.querySelectorAll('span,div')].some(x=>x.style.color==='red'));
  assert([...e.querySelectorAll('span,div')].some(x=>x.style.color==='rgb(0, 128, 0)'));
  assert.equal(e.firstElementChild.style.fontSize,'16px');
  e.replaceChildren();caret(w,e,0);paste(w,e,'','سطر أول\nسطر ثانٍ');assert(e.querySelector('br'));assert(e.textContent.includes('سطر ثانٍ'));
  e.textContent='أبج';const r=d.createRange();r.setStart(e.firstChild,1);r.setEnd(e.firstChild,2);w.getSelection().removeAllRanges();w.getSelection().addRange(r);paste(w,e,'','جديد');assert.equal(e.textContent.replace(/\u200B/g,''),'أجديدج');
  // Shortcut management: create, conflict rejection, edit, reload persistence, delete.
  d.querySelector('.note-toolbar button').click();const dialog=d.querySelector('dialog'),f=dialog.querySelector('form');
  f.elements.key.value=':دعاء';f.elements.text.value='اللهم اغفر لي';f.elements.color.value='#008000';f.elements.bold.checked=true;
  f.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));assert.equal(JSON.parse(w.localStorage.getItem(KEY)).length,2);
  f.elements.key.value=':ص';f.elements.text.value='متعارض';f.dispatchEvent(new w.Event('submit',{cancelable:true}));assert.equal(JSON.parse(w.localStorage.getItem(KEY)).length,2);assert(dialog.querySelector('.nt-status').textContent.includes('موجود'));
  const row=[...dialog.querySelectorAll('.nt-entry')].find(x=>x.textContent.includes(':دعاء'));row.querySelector('button').click();f.elements.text.value='اللهم اهدني';f.dispatchEvent(new w.Event('submit',{cancelable:true}));
  const stored=JSON.parse(w.localStorage.getItem(KEY));assert.equal(stored.find(x=>x.key===':دعاء').text,'اللهم اهدني');
  const other=await fixture(stored);other.e.textContent=':دعاء';caret(other.w,other.e.firstChild,5);input(other.w,other.e);assert(other.e.textContent.includes('اللهم اهدني'));other.w.close();
  const updated=[...dialog.querySelectorAll('.nt-entry')].find(x=>x.textContent.includes(':دعاء'));updated.querySelectorAll('button')[1].click();assert.equal(JSON.parse(w.localStorage.getItem(KEY)).length,1);
  // Running module again must not duplicate controls.
  w.eval(code);assert.equal(d.querySelectorAll('dialog.nt-dialog').length,1);assert.equal(d.querySelectorAll('.note-toolbar button').length,1);
  w.close();
  console.log('PASS: paste cleanup/colors, plain text/selection replacement, shortcut boundaries/split nodes/IME, neutral continuation, CRUD/conflicts/persistence, duplicate-init guard.');
})().catch(error=>{console.error(error);process.exitCode=1;});
