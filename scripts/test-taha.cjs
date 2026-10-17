// DOM integration tests; jsdom does not verify visual browser layout or Firebase.
// NODE_PATH=/path/to/node_modules node scripts/test-taha.cjs
const {JSDOM, ResourceLoader, VirtualConsole}=require('jsdom');
const fs=require('node:fs'), path=require('node:path'), assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const info=JSON.parse(fs.readFileSync(path.join(root,'surahs/020-taha/info.json')));
class LocalResources extends ResourceLoader {
  fetch(url) {
    const u=new URL(url);
    if(u.hostname!=='taha.test') return Promise.resolve(Buffer.from(''));
    const file=path.join(root,decodeURIComponent(u.pathname));
    return Promise.resolve(fs.readFileSync(file));
  }
}
async function fixture(file,saved={}){
  const errors=[];
  const console=new VirtualConsole();console.on('jsdomError',e=>errors.push(e.message));
  const relative='surahs/020-taha/mahawir-pages/'+file;
  const dom=new JSDOM(fs.readFileSync(path.join(root,relative),'utf8'),{
    url:'https://taha.test/'+relative,runScripts:'dangerously',resources:new LocalResources(),pretendToBeVisual:true,virtualConsole:console,
    beforeParse(w){
      for(const [key,value] of Object.entries(saved))w.localStorage.setItem(key,value);
      w.fetch=async url=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(root,new URL(url,w.location.href).pathname),'utf8'))});
      w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=function(){w.lastScrolled=this;};
      w.document.execCommand=()=>false;w.document.queryCommandState=()=>false;w.document.queryCommandSupported=()=>false;
    }
  });
  await new Promise(r=>dom.window.addEventListener('load',r));
  await new Promise(r=>setTimeout(r,30));
  assert.deepEqual(errors,[],file+': script errors');
  return dom;
}
(async()=>{
  let count=0;
  for(const m of [info.muqaddimah,...info.mahawir]){
    const dom=await fixture(m.file),w=dom.window,d=w.document;
    assert.equal(d.querySelectorAll('.tocM').length,8);
    assert.equal(d.querySelectorAll('.tocP').length,21);
    assert.equal(d.querySelectorAll('.tocA').length,135);
    assert.equal(d.querySelector('.tocSurahName').textContent,'فهرس سورة طه');
    d.querySelector('.tocFab').click();assert(d.querySelector('.tocPanel').classList.contains('open'));
    d.querySelector('.tocX').click();assert(!d.querySelector('.tocPanel').classList.contains('open'));
    for(const b of d.querySelectorAll('.note-add-btn')){
      b.click();
      const wrap=b.closest('.ayah-note-block')||b.closest('.field-value');
      assert(wrap.querySelector('.note-editor').classList.contains('open'));
      wrap.querySelector('.note-cancel-btn').click();
      assert(!wrap.querySelector('.note-editor').classList.contains('open'));
      count++;
    }
    const first=d.querySelector('.note-add-btn');first.click();
    const wrap=first.closest('.field-value');
    wrap.querySelector('.note-editable').textContent='ملاحظة اختبار سورة طه';
    wrap.querySelector('.note-save-btn').click();
    assert(wrap.querySelector('.notes-list').textContent.includes('ملاحظة اختبار سورة طه'));
    const saved=Object.fromEntries(Object.keys(w.localStorage).map(k=>[k,w.localStorage.getItem(k)]));
    assert(Object.keys(saved).some(k=>k.startsWith('quran-tadabbur-notes-20-')));
    assert(!Object.keys(saved).some(k=>k.startsWith('quran-tadabbur-notes-19-')));
    dom.window.close();
    const reloaded=await fixture(m.file,saved);
    assert(reloaded.window.document.querySelector('.notes-list').textContent.includes('ملاحظة اختبار سورة طه'));
    reloaded.window.close();
    console.log(m.file+': TOC, all editor buttons, save and reload OK');
  }
  assert.equal(count,157);
  console.log('PASS: 8 pages; 157 editors open/cancel; 135 TOC entries; isolated Taha note storage persists.');
})().catch(e=>{console.error(e);process.exitCode=1});
