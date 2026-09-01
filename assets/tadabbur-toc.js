/* ============================================
   tadabbur-toc.js
   فهرس السورة المنبثق: محاور ← فقرات ← آيات
   - زر معلّق ثابت لفتح الفهرس
   - كل محور وكل فقرة قابلة للطي
   - انتقال للصفحة الرئيسية أو لصفحة السورة
   - يقرأ info.json تلقائياً، فلا يحتاج أي تعديل داخل صفحات المحاور
   مشترك بين كل صفحات المحاور في كل السور
   ============================================ */
(function () {
  'use strict';
  if (window.__tadabburToc) return;
  window.__tadabburToc = true;

  var body = document.body;
  if (!body) return;
  var surahId = body.getAttribute('data-surah');
  var currentFile = (body.getAttribute('data-mahwar') || '') + '.html';
  if (!surahId) return;

  /* ---------- أدوات أرقام ---------- */
  var AR = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  function toAr(n) {
    return String(n).replace(/[0-9]/g, function (d) { return AR[+d]; });
  }
  function toEn(s) {
    return String(s).replace(/[٠-٩]/g, function (d) { return String(AR.indexOf(d)); });
  }
  function parseRange(r) {
    var s = toEn(String(r || '')).replace(/[^\d\-]/g, '');
    var m = s.match(/^(\d+)(?:-(\d+))?$/);
    if (!m) return [];
    var a = +m[1], b = m[2] ? +m[2] : a, out = [];
    if (b < a) { var t = a; a = b; b = t; }
    for (var i = a; i <= b && out.length < 400; i++) out.push(i);
    return out;
  }

  /* ---------- الستايل ---------- */
  var css = ''
    + '.tocFab{position:fixed;left:18px;bottom:18px;z-index:450;display:flex;align-items:center;gap:7px;'
    + 'background:var(--ink,#2B2620);color:var(--card,#FBF8F1);border:1px solid var(--gold,#A8863B);'
    + 'font-family:"Tajawal",system-ui,sans-serif;font-size:14px;font-weight:500;cursor:pointer;'
    + 'padding:11px 16px;border-radius:30px;box-shadow:0 6px 22px rgba(0,0,0,.28);transition:transform .15s ease,box-shadow .15s ease}'
    + '.tocFab:hover{transform:translateY(-2px);box-shadow:0 10px 26px rgba(0,0,0,.34)}'
    + '.tocFab:active{transform:translateY(0)}'
    + '.tocOv{position:fixed;inset:0;background:rgba(20,16,10,.5);z-index:700;opacity:0;visibility:hidden;transition:opacity .2s ease}'
    + '.tocOv.open{opacity:1;visibility:visible}'
    + '.tocPanel{position:fixed;top:0;right:0;height:100%;width:min(390px,90vw);z-index:701;'
    + 'background:var(--paper,#F4EFE4);border-left:1px solid var(--line,#D9CFB8);'
    + 'box-shadow:-10px 0 34px rgba(0,0,0,.22);display:flex;flex-direction:column;'
    + 'font-family:"Tajawal",system-ui,sans-serif;transform:translateX(103%);transition:transform .24s ease;direction:rtl}'
    + '.tocPanel.open{transform:translateX(0)}'
    + '.tocHead{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:15px 16px;'
    + 'border-bottom:1px solid var(--line,#D9CFB8);background:var(--card,#FBF8F1)}'
    + '.tocHead b{font-family:"Amiri",serif;font-size:19px;color:var(--gold-deep,#7C6329);font-weight:700}'
    + '.tocHead small{display:block;font-size:11.5px;color:var(--ink-soft,#6B6355);font-weight:400;font-family:"Tajawal",sans-serif}'
    + '.tocX{background:none;border:1px solid var(--line,#D9CFB8);color:var(--ink-soft,#6B6355);border-radius:9px;'
    + 'width:32px;height:32px;font-size:15px;cursor:pointer;flex:none}'
    + '.tocX:hover{background:rgba(168,134,59,.12)}'
    + '.tocQuick{display:flex;gap:8px;padding:11px 14px;border-bottom:1px solid var(--line,#D9CFB8)}'
    + '.tocQuick a{flex:1;text-align:center;text-decoration:none;font-size:12.5px;padding:9px 6px;border-radius:10px;'
    + 'background:var(--card,#FBF8F1);border:1px solid var(--line,#D9CFB8);color:var(--gold-deep,#7C6329)}'
    + '.tocQuick a:hover{background:rgba(168,134,59,.14)}'
    + '.tocTools{display:flex;gap:8px;align-items:center;padding:10px 14px;border-bottom:1px solid var(--line,#D9CFB8)}'
    + '.tocTools input{flex:1;min-width:0;font-family:inherit;font-size:12.5px;padding:8px 10px;border-radius:9px;'
    + 'border:1px solid var(--line,#D9CFB8);background:var(--card,#FBF8F1);color:var(--ink,#2B2620)}'
    + '.tocTools input:focus{outline:none;border-color:var(--gold,#A8863B)}'
    + '.tocTools button{font-family:inherit;font-size:11.5px;padding:8px 9px;border-radius:9px;cursor:pointer;flex:none;'
    + 'border:1px solid var(--line,#D9CFB8);background:var(--card,#FBF8F1);color:var(--ink-soft,#6B6355)}'
    + '.tocTools button:hover{background:rgba(168,134,59,.14)}'
    + '.tocBody{flex:1;overflow-y:auto;padding:10px 12px 40px;-webkit-overflow-scrolling:touch}'
    + '.tocM{border:1px solid var(--line,#D9CFB8);border-radius:12px;background:var(--card,#FBF8F1);margin-bottom:9px;overflow:hidden}'
    + '.tocM.cur{border-color:var(--gold,#A8863B);box-shadow:0 0 0 1px rgba(168,134,59,.35)}'
    + '.tocMh{display:flex;align-items:center;gap:9px;padding:11px 12px;cursor:pointer}'
    + '.tocMh:hover{background:rgba(168,134,59,.09)}'
    + '.tocCar{flex:none;width:20px;height:20px;line-height:20px;text-align:center;border:none;background:none;cursor:pointer;'
    + 'color:var(--ink-soft,#6B6355);font-size:11px;transition:transform .18s ease;padding:0}'
    + '.tocM.open>.tocMh>.tocCar,.tocP.open>.tocPh>.tocCar{transform:rotate(90deg)}'
    + '.tocNum{flex:none;width:24px;height:24px;line-height:24px;text-align:center;border-radius:7px;font-size:12px;font-weight:700;'
    + 'background:var(--mahwar-bg,#EEEDFE);color:var(--mahwar-text,#3C3489)}'
    + '.tocTtl{flex:1;min-width:0;font-size:13.5px;font-weight:500;color:var(--ink,#2B2620);text-align:start;'
    + 'background:none;border:none;cursor:pointer;font-family:inherit;padding:0;line-height:1.6}'
    + '.tocTtl:hover{color:var(--gold-deep,#7C6329);text-decoration:underline}'
    + '.tocRng{flex:none;font-size:10.5px;color:var(--gold-deep,#7C6329);background:rgba(168,134,59,.14);padding:3px 7px;border-radius:20px;white-space:nowrap}'
    + '.tocMb,.tocPb{display:none}'
    + '.tocM.open>.tocMb,.tocP.open>.tocPb{display:block}'
    + '.tocMb{padding:2px 10px 10px;border-top:1px dashed var(--line,#D9CFB8)}'
    + '.tocP{border-bottom:1px dashed var(--line,#D9CFB8)}'
    + '.tocP:last-child{border-bottom:none}'
    + '.tocPh{display:flex;align-items:center;gap:8px;padding:9px 2px;cursor:pointer}'
    + '.tocPh:hover{background:rgba(168,134,59,.07)}'
    + '.tocPh .tocTtl{font-size:12.5px;font-weight:400;color:var(--ink-soft,#6B6355)}'
    + '.tocPb{display:none;flex-wrap:wrap;gap:5px;padding:2px 26px 11px}'
    + '.tocP.open>.tocPb{display:flex}'
    + '.tocA{font-family:"Amiri",serif;font-size:13px;min-width:30px;padding:4px 7px;border-radius:8px;cursor:pointer;'
    + 'border:1px solid var(--line,#D9CFB8);background:var(--paper,#F4EFE4);color:var(--verse-green,#2E7D4F)}'
    + '.tocA:hover{background:var(--verse-green,#2E7D4F);color:#fff;border-color:var(--verse-green,#2E7D4F)}'
    + '.tocEmpty{padding:20px;text-align:center;font-size:12.5px;color:var(--ink-soft,#6B6355)}'
    + '.tocHide{display:none!important}'
    + '.tocRing{position:absolute;z-index:399;pointer-events:none;border:2px solid var(--gold,#A8863B);border-radius:12px;'
    + 'background:rgba(168,134,59,.12);animation:tocRingFade 1.8s ease forwards}'
    + '@keyframes tocRingFade{0%{opacity:0}12%{opacity:1}70%{opacity:1}100%{opacity:0}}'
    + '@media (max-width:520px){.tocFab{padding:10px 14px;font-size:13px}.tocPanel{width:92vw}}'
    + '@media print{.tocFab,.tocPanel,.tocOv{display:none!important}}';

  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  /* ---------- بناء الهيكل ---------- */
  var fab = document.createElement('button');
  fab.className = 'tocFab tocHide';
  fab.type = 'button';
  fab.setAttribute('aria-label', 'فتح فهرس السورة');
  fab.innerHTML = '<span aria-hidden="true">📑</span><span>الفهرس</span>';

  var ov = document.createElement('div');
  ov.className = 'tocOv';

  var panel = document.createElement('aside');
  panel.className = 'tocPanel';
  panel.setAttribute('aria-hidden', 'true');
  panel.innerHTML =
    '<div class="tocHead"><div><b class="tocSurahName">الفهرس</b><small class="tocSurahMeta"></small></div>'
    + '<button class="tocX" type="button" aria-label="إغلاق">✕</button></div>'
    + '<div class="tocQuick"><a class="tocHome" href="#">🏠 كل السور</a><a class="tocSurah" href="#">📖 صفحة السورة</a></div>'
    + '<div class="tocTools"><input type="search" class="tocSearch" placeholder="ابحث بعنوان أو برقم آية…">'
    + '<button type="button" class="tocAll">توسيع الكل</button><button type="button" class="tocNone">طي الكل</button></div>'
    + '<div class="tocBody"><div class="tocEmpty">…جارٍ تحميل الفهرس</div></div>';

  body.appendChild(fab);
  body.appendChild(ov);
  body.appendChild(panel);

  var bodyEl = panel.querySelector('.tocBody');

  function open() {
    ov.classList.add('open');
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    var cur = bodyEl.querySelector('.tocM.cur');
    if (cur) cur.scrollIntoView({ block: 'nearest' });
  }
  function close() {
    ov.classList.remove('open');
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
  }
  fab.addEventListener('click', open);
  ov.addEventListener('click', close);
  panel.querySelector('.tocX').addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.classList.contains('open')) close();
  });

  /* ---------- تحديد مكان الآية داخل الصفحة الحالية ---------- */
  function ayahEl(n) {
    var blocks = document.querySelectorAll('.ayah-note-block');
    for (var i = 0; i < blocks.length; i++) {
      var t = blocks[i].querySelector('.tafsir-ayah');
      if (!t) continue;
      var nums = (t.textContent || '').match(/\(([٠-٩0-9]+)\)/g) || [];
      for (var j = 0; j < nums.length; j++) {
        if (+toEn(nums[j].replace(/[()]/g, '')) === n) return blocks[i];
      }
    }
    return null;
  }
  function subBlockEl(i) {
    var s = document.querySelectorAll('main .sub-block');
    return s[i] || null;
  }
  function flash(el) {
    var r = el.getBoundingClientRect();
    var ring = document.createElement('div');
    ring.className = 'tocRing';
    ring.style.top = (r.top + window.scrollY - 6) + 'px';
    ring.style.left = (r.left + window.scrollX - 6) + 'px';
    ring.style.width = (r.width + 12) + 'px';
    ring.style.height = (r.height + 12) + 'px';
    document.body.appendChild(ring);
    setTimeout(function () { ring.remove(); }, 1900);
  }
  function goTo(el) {
    if (!el) return false;
    close();
    setTimeout(function () {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(function () { flash(el); }, 420);
    }, 210);
    return true;
  }

  /* ---------- تحميل info.json ---------- */
  fetch('../info.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw 0; return r.json(); })
    .then(build)
    .catch(function () { fab.remove(); ov.remove(); panel.remove(); });

  function build(info) {
    var mahawir = info.mahawir || [];
    panel.querySelector('.tocSurahName').textContent = 'فهرس سورة ' + (info.name_ar || '');
    panel.querySelector('.tocSurahMeta').textContent =
      (info.type || '') + ' · ' + (info.total_verses || '?') + ' آية · ' + mahawir.length + ' محاور';
    panel.querySelector('.tocHome').href = '../../../index.html';
    panel.querySelector('.tocSurah').href = '../../../surah.html?id=' + surahId;
    panel.querySelector('.tocSurah').textContent = '📖 سورة ' + (info.name_ar || '');

    var frag = document.createDocumentFragment();

    /* مقدمة السورة */
    if (info.muqaddimah && info.muqaddimah.file) {
      var mq = document.createElement('div');
      mq.className = 'tocM' + (info.muqaddimah.file === currentFile ? ' cur' : '');
      mq.innerHTML = '<div class="tocMh"><span class="tocCar" style="visibility:hidden">▶</span>'
        + '<span class="tocNum">✦</span>'
        + '<button class="tocTtl" type="button"></button></div>';
      mq.querySelector('.tocTtl').textContent = info.muqaddimah.title || 'مقدمة السورة';
      mq.querySelector('.tocTtl').addEventListener('click', function () {
        if (info.muqaddimah.file === currentFile) { close(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
        else location.href = info.muqaddimah.file;
      });
      frag.appendChild(mq);
    }

    mahawir.forEach(function (m, mi) {
      var isCur = (m.file === currentFile);
      var mEl = document.createElement('div');
      mEl.className = 'tocM' + (isCur ? ' cur open' : '');

      var mh = document.createElement('div');
      mh.className = 'tocMh';
      mh.innerHTML = '<button class="tocCar" type="button" aria-label="طي/فتح">▶</button>'
        + '<span class="tocNum"></span><button class="tocTtl" type="button"></button>'
        + '<span class="tocRng"></span>';
      mh.querySelector('.tocNum').textContent = toAr(mi + 1);
      mh.querySelector('.tocTtl').textContent = m.title || ('المحور ' + (mi + 1));
      mh.querySelector('.tocRng').textContent = 'آيات ' + (m.range || '');
      mh.querySelector('.tocCar').addEventListener('click', function (e) {
        e.stopPropagation(); mEl.classList.toggle('open');
      });
      mh.addEventListener('click', function (e) {
        if (e.target.closest('.tocTtl')) return;
        mEl.classList.toggle('open');
      });
      mh.querySelector('.tocTtl').addEventListener('click', function (e) {
        e.stopPropagation();
        if (isCur) { close(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
        else location.href = m.file;
      });
      mEl.appendChild(mh);

      var mb = document.createElement('div');
      mb.className = 'tocMb';
      var subs = m.subsections || [];
      if (!subs.length) mb.innerHTML = '<div class="tocEmpty">لا توجد فقرات مسجّلة</div>';

      subs.forEach(function (s, si) {
        var pEl = document.createElement('div');
        pEl.className = 'tocP';
        var ph = document.createElement('div');
        ph.className = 'tocPh';
        ph.innerHTML = '<button class="tocCar" type="button" aria-label="طي/فتح">▶</button>'
          + '<button class="tocTtl" type="button"></button><span class="tocRng"></span>';
        ph.querySelector('.tocTtl').textContent = s.title || ('فقرة ' + (si + 1));
        ph.querySelector('.tocRng').textContent = s.range || '';
        ph.querySelector('.tocCar').addEventListener('click', function (e) {
          e.stopPropagation(); pEl.classList.toggle('open');
        });
        ph.addEventListener('click', function (e) {
          if (e.target.closest('.tocTtl')) return;
          pEl.classList.toggle('open');
        });
        ph.querySelector('.tocTtl').addEventListener('click', function (e) {
          e.stopPropagation();
          if (isCur) { if (!goTo(subBlockEl(si))) { close(); } }
          else location.href = m.file + '#p' + (si + 1);
        });
        pEl.appendChild(ph);

        var pb = document.createElement('div');
        pb.className = 'tocPb';
        parseRange(s.range).forEach(function (n) {
          var b = document.createElement('button');
          b.className = 'tocA';
          b.type = 'button';
          b.textContent = toAr(n);
          b.title = 'الآية ' + n;
          b.setAttribute('data-n', n);
          b.addEventListener('click', function () {
            if (isCur) { if (!goTo(ayahEl(n))) goTo(subBlockEl(si)); }
            else location.href = m.file + '#a' + n;
          });
          pb.appendChild(b);
        });
        pEl.appendChild(pb);
        mb.appendChild(pEl);
      });

      mEl.appendChild(mb);
      frag.appendChild(mEl);
    });

    bodyEl.innerHTML = '';
    bodyEl.appendChild(frag);
    fab.classList.remove('tocHide');

    /* ---------- البحث ---------- */
    var search = panel.querySelector('.tocSearch');
    search.addEventListener('input', function () {
      var q = search.value.trim();
      var mList = bodyEl.querySelectorAll('.tocM');
      if (!q) {
        mList.forEach(function (x) {
          x.classList.remove('tocHide');
          x.querySelectorAll('.tocP').forEach(function (p) { p.classList.remove('tocHide'); });
          x.classList.toggle('open', x.classList.contains('cur'));
        });
        return;
      }
      var num = /^[\d٠-٩]+$/.test(q) ? +toEn(q) : null;
      mList.forEach(function (x) {
        var anyP = false;
        var ps = x.querySelectorAll('.tocP');
        ps.forEach(function (p) {
          var txt = p.textContent || '';
          var hit = num
            ? !!p.querySelector('.tocA[data-n="' + num + '"]')
            : txt.indexOf(q) > -1;
          p.classList.toggle('tocHide', !hit);
          p.classList.toggle('open', hit);
          if (hit) anyP = true;
        });
        var headHit = !num && (x.querySelector('.tocMh') || {}).textContent &&
          x.querySelector('.tocMh').textContent.indexOf(q) > -1;
        if (headHit) { ps.forEach(function (p) { p.classList.remove('tocHide'); }); anyP = true; }
        x.classList.toggle('tocHide', !anyP);
        x.classList.toggle('open', anyP);
      });
    });

    panel.querySelector('.tocAll').addEventListener('click', function () {
      bodyEl.querySelectorAll('.tocM,.tocP').forEach(function (x) { x.classList.add('open'); });
    });
    panel.querySelector('.tocNone').addEventListener('click', function () {
      bodyEl.querySelectorAll('.tocM,.tocP').forEach(function (x) { x.classList.remove('open'); });
    });

    /* ---------- الانتقال حسب الـ hash عند فتح الصفحة ---------- */
    var h = location.hash || '';
    var ma = h.match(/^#a(\d+)$/), mp = h.match(/^#p(\d+)$/);
    if (ma || mp) {
      var run = function () {
        var el = ma ? ayahEl(+ma[1]) : subBlockEl(+mp[1] - 1);
        if (!el && ma) el = subBlockEl(0);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setTimeout(function () { flash(el); }, 500);
        }
      };
      if (document.readyState === 'complete') setTimeout(run, 420);
      else window.addEventListener('load', function () { setTimeout(run, 420); });
    }
  }
})();
