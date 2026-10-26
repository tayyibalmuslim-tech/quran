// NODE_PATH=/path/to/node_modules node scripts/test-note-hashtags.cjs
const {JSDOM,ResourceLoader,VirtualConsole}=require('jsdom');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
class Resources extends ResourceLoader {
 fetch(url){const u=new URL(url);if(u.hostname!=='quran.test'||u.pathname.endsWith('firebase-sync.js'))return Promise.resolve(Buffer.from(''));return Promise.resolve(fs.readFileSync(path.join(root,u.pathname)));}
}
async function fixture(file,saved={},cloud){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(fs.readFileSync(path.join(root,file),'utf8'),{url:'https://quran.test/'+file,runScripts:'dangerously',resources:new Resources(),virtualConsole:vc,pretendToBeVisual:true,beforeParse(w){
  Object.entries(saved).forEach(([k,v])=>w.localStorage.setItem(k,v));
  w.fetch=async url=>{const file=path.join(root,new URL(url,w.location.href).pathname);return {ok:fs.existsSync(file),text:async()=>fs.readFileSync(file,'utf8'),json:async()=>JSON.parse(fs.readFileSync(file,'utf8'))};};
  if(cloud)w.TadabburCloud=cloud;
  w.scrollTo=()=>{};w.document.execCommand=()=>false;w.document.queryCommandState=()=>false;w.document.queryCommandSupported=()=>false;
 }});
 await new Promise(r=>dom.window.addEventListener('load',r));
 await new Promise(r=>setTimeout(r,80));
 assert.deepEqual(errors,[]);return dom;
}
const data=w=>Object.fromEntries(Object.keys(w.localStorage).map(k=>[k,w.localStorage.getItem(k)]));
(async()=>{
 const file='surahs/020-taha/mahawir-pages/01-quran-tadhkirah.html';
 let dom=await fixture(file),w=dom.window,d=w.document;
 let wrap=d.querySelector('.ayah-note-block');wrap.querySelector('.note-add-btn').click();
 wrap.querySelector('.note-editable').textContent='تدبر للاختبار';
 wrap.querySelector('.note-tags-input').value='#الصبر #الصلاة #الصبر';wrap.querySelector('.note-save-btn').click();
 assert.equal(wrap.querySelectorAll('.note-item a').length,2);
 let saved=data(w);w.close();dom=await fixture(file,saved);w=dom.window;d=w.document;wrap=d.querySelector('.ayah-note-block');
 wrap.querySelector('.note-edit-btn').click();assert.equal(wrap.querySelector('.note-tags-input').value,'#الصبر #الصلاة');
 wrap.querySelector('.note-tags-input').value='#الصبر';wrap.querySelector('.note-save-btn').click();saved=data(w);w.close();
 saved['quran-tadabbur-notes-2-01-muqaddimah']=JSON.stringify({'tafsir-1-1-3':[{html:'ملاحظة البقرة<img src=x onerror="alert(1)">',tags:['الصبر']}]});
 saved['quran-tadabbur-notes-20-02-musa-risalah']=JSON.stringify({ts:10,data:{'tafsir-20-10':[{html:'ملاحظة متأخرة',tags:['الصبر']}]}});
 dom=await fixture('hashtags.html',saved);w=dom.window;d=w.document;
 assert.deepEqual([...d.querySelectorAll('.card .meta')].map(e=>e.textContent),['سورة البقرة — الآيات 3','سورة طه — الآيات 1','سورة طه — الآيات 10']);
 assert.equal(d.querySelectorAll('.note img').length,0);assert(d.querySelector('.verse').textContent.includes('ٱلَّذِينَ'));
 d.querySelector('#search').value='الصبر';d.querySelector('#search').dispatchEvent(new w.Event('input'));assert.equal(d.querySelectorAll('#tags button').length,1);
 w.location.hash=encodeURIComponent('غير_موجود');await new Promise(r=>setTimeout(r,10));assert.equal(d.querySelectorAll('.card').length,0);w.close();
 // Newer cloud data wins, including tag removal; notes from another device are included.
 const cloud={ready:Promise.resolve(),loadAllNotes:async()=>[{id:'20_01-quran-tadhkirah',notesTs:Date.now()+10000,notes:JSON.stringify({'tafsir-20-1':[{html:'بدون تصنيف',tags:[]}]})},{id:'2_01-muqaddimah',notesTs:100,notes:JSON.stringify({'tadabbur-sub1':[{html:'تدبر الفقرة',tags:['تدبر']}]})}]};
 dom=await fixture('hashtags.html',saved,cloud);d=dom.window.document;assert.equal(d.querySelectorAll('.card').length,2);assert(d.querySelector('.card .meta').textContent.includes('1، 2، 3، 4، 5'));dom.window.close();
 dom=await fixture(file,saved);wrap=dom.window.document.querySelector('.ayah-note-block');wrap.querySelector('.note-edit-btn').click();wrap.querySelector('.note-tags-input').value='';wrap.querySelector('.note-save-btn').click();assert.equal(wrap.querySelectorAll('.note-item a').length,0);dom.window.close();
 console.log('PASS: tag CRUD/reload/deduplication; old/new storage; Quran order/text; filtering; safe HTML; newest cloud data; paragraph verses.');
})().catch(e=>{console.error(e);process.exitCode=1;});
