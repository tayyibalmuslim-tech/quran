/* ============================================
   firebase-sync.js
   وحدة المصادقة الإجبارية + المزامنة السحابية
   لمصحف التدبر — تُضاف لكل الصفحات (الرئيسية والفرعية)

   طريقة الإضافة في أي صفحة:
   <script type="module" src="[المسار]/assets/firebase-sync.js"></script>

   ماذا تفعل هذه الوحدة؟
   1) تمنع عرض المحتوى قبل تسجيل الدخول (شاشة دخول كاملة)
   2) توفّر واجهة window.TadabburCloud للقراءة/الكتابة من Firestore
   3) تعرض شريحة صغيرة تظهر البريد المسجّل وزر خروج في كل صفحة
   ============================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ---------- إعدادات Firebase (غيّرها لو أنشأت مشروعاً منفصلاً) ---------- */
const firebaseConfig = {
  apiKey: "AIzaSyD8jxpVrvicStETloL8tk5s865dmNatIqE",
  authDomain: "mazen-productivity-bab1c.firebaseapp.com",
  projectId: "mazen-productivity-bab1c",
  storageBucket: "mazen-productivity-bab1c.firebasestorage.app",
  messagingSenderId: "388570583199",
  appId: "1:388570583199:web:34af7ba9a1b050f12252aa",
  measurementId: "G-WYD2VE2JJQ"
};

/* ---------- الواجهة العامة (متاحة فوراً قبل اكتمال الدخول) ---------- */
let _resolveReady;
const _readyPromise = new Promise((r) => { _resolveReady = r; });

window.TadabburCloud = {
  ready: _readyPromise,   // Promise يكتمل بعد نجاح تسجيل الدخول
  user: null,             // كائن المستخدم الحالي
  loadPage,               // تحميل بيانات صفحة (سورة/محور)
  saveField,              // حفظ حقل معيّن (مؤجَّل تلقائياً)
  signOut: doSignOut      // تسجيل الخروج
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ============================================
   1) شاشة تسجيل الدخول الإجبارية
   ============================================ */
const style = document.createElement('style');
style.textContent = `
  #tc-overlay{
    position:fixed; inset:0; z-index:9999;
    display:flex; align-items:center; justify-content:center;
    padding:20px;
    background:#F4EFE4;
    background-image:
      radial-gradient(circle at 20% 10%, rgba(168,134,59,0.06), transparent 40%),
      radial-gradient(circle at 90% 80%, rgba(168,134,59,0.06), transparent 40%);
    font-family:'Tajawal', sans-serif;
    direction:rtl;
  }
  #tc-overlay.tc-hidden{ display:none; }
  .tc-box{
    width:100%; max-width:400px;
    background:#FBF8F1;
    border:1px solid #D9CFB8;
    border-radius:16px;
    padding:34px 28px;
  }
  .tc-head{ text-align:center; margin-bottom:24px; }
  .tc-head h2{
    margin:0;
    font-family:'Amiri', serif;
    font-size:26px; font-weight:700;
    color:#7C6329;
  }
  .tc-sub{ margin:8px 0 0; font-size:13px; color:#6B6355; }
  .tc-tabs{
    display:flex; border:1px solid #D9CFB8; border-radius:10px;
    overflow:hidden; margin-bottom:22px;
  }
  .tc-tab{
    flex:1; text-align:center; padding:10px; cursor:pointer;
    font-size:14px; color:#6B6355; background:#F4EFE4;
    transition:all .15s; border:none; font-family:inherit;
  }
  .tc-tab.active{ background:#A8863B; color:#fff; font-weight:500; }
  .tc-field{ margin-bottom:14px; }
  .tc-field label{ display:block; font-size:13px; color:#6B6355; margin-bottom:6px; }
  .tc-field input{
    width:100%; box-sizing:border-box;
    padding:11px 14px;
    border:1px solid #D9CFB8; border-radius:9px;
    background:#F4EFE4;
    font-family:'Tajawal', sans-serif; font-size:14px; color:#2B2620;
    outline:none; transition:border-color .2s;
  }
  .tc-field input:focus{ border-color:#A8863B; }
  .tc-submit{
    width:100%; padding:12px;
    background:#7C6329; color:#fff;
    border:none; border-radius:9px;
    font-family:'Tajawal', sans-serif; font-size:15px; font-weight:500;
    cursor:pointer; margin-top:6px; transition:background .15s;
  }
  .tc-submit:hover{ background:#A8863B; }
  .tc-submit:disabled{ opacity:.6; cursor:not-allowed; }
  .tc-msg{
    margin-top:12px; padding:10px 14px; border-radius:9px;
    font-size:13px; text-align:center; display:none;
  }
  .tc-msg.error{ display:block; background:rgba(179,65,58,0.1); color:#B3413A; }
  .tc-msg.success{ display:block; background:rgba(62,124,92,0.1); color:#3E7C5C; }
  .tc-note{
    margin-top:16px; text-align:center;
    font-size:12px; color:#6B6355;
  }

  /* شريحة الحساب أسفل الصفحة */
  #tc-chip{
    position:fixed; bottom:14px; left:14px; z-index:9000;
    display:none; align-items:center; gap:10px;
    background:#FBF8F1;
    border:1px solid #D9CFB8;
    border-radius:20px;
    padding:6px 8px 6px 14px;
    font-family:'Tajawal', sans-serif; font-size:12px;
    color:#6B6355;
    direction:rtl;
    box-shadow:0 3px 12px rgba(43,38,32,0.08);
  }
  #tc-chip.show{ display:flex; }
  #tc-chip .tc-chip-email{ color:#7C6329; font-weight:500; }
  #tc-chip button{
    background:transparent; border:1px solid #D9CFB8;
    color:#6B6355; border-radius:14px;
    padding:4px 12px; cursor:pointer;
    font-family:inherit; font-size:12px;
  }
  #tc-chip button:hover{ border-color:#B3413A; color:#B3413A; }
`;
document.head.appendChild(style);

const overlay = document.createElement('div');
overlay.id = 'tc-overlay';
overlay.innerHTML = `
  <div class="tc-box">
    <div class="tc-head">
      <h2>مصحف التدبر</h2>
      <p class="tc-sub">تسجيل الدخول مطلوب لحفظ تدبراتك ومزامنتها عبر أجهزتك</p>
    </div>
    <div class="tc-tabs">
      <button type="button" class="tc-tab active" data-mode="login">تسجيل الدخول</button>
      <button type="button" class="tc-tab" data-mode="signup">إنشاء حساب</button>
    </div>
    <form id="tc-form">
      <div class="tc-field">
        <label for="tc-email">البريد الإلكتروني</label>
        <input type="email" id="tc-email" required placeholder="example@email.com" autocomplete="email">
      </div>
      <div class="tc-field">
        <label for="tc-password">كلمة المرور</label>
        <input type="password" id="tc-password" required minlength="6" placeholder="6 أحرف على الأقل" autocomplete="current-password">
      </div>
      <button type="submit" class="tc-submit" id="tc-submit">تسجيل الدخول</button>
    </form>
    <div class="tc-msg" id="tc-msg"></div>
    <p class="tc-note">بياناتك محفوظة على حسابك وحدك، ولا يطّلع عليها غيرك</p>
  </div>
`;

const chip = document.createElement('div');
chip.id = 'tc-chip';
chip.innerHTML = `
  <span class="tc-chip-email" id="tc-chip-email"></span>
  <button type="button" id="tc-chip-out">خروج</button>
`;

function mountUI(){
  document.body.appendChild(overlay);
  document.body.appendChild(chip);
  wireUI();
}
if(document.body){ mountUI(); }
else{ document.addEventListener('DOMContentLoaded', mountUI); }

let currentMode = 'login';

function wireUI(){
  const tabs = overlay.querySelectorAll('.tc-tab');
  const form = overlay.querySelector('#tc-form');
  const submitBtn = overlay.querySelector('#tc-submit');
  const msgEl = overlay.querySelector('#tc-msg');
  const passInput = overlay.querySelector('#tc-password');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentMode = tab.dataset.mode;
      submitBtn.textContent = currentMode === 'login' ? 'تسجيل الدخول' : 'إنشاء الحساب';
      passInput.autocomplete = currentMode === 'login' ? 'current-password' : 'new-password';
      msgEl.className = 'tc-msg';
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msgEl.className = 'tc-msg';
    const email = overlay.querySelector('#tc-email').value.trim();
    const password = passInput.value;

    submitBtn.disabled = true;
    submitBtn.textContent = 'جاري التحميل...';
    try{
      if(currentMode === 'login'){
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      msgEl.textContent = 'تم بنجاح، جاري فتح المصحف...';
      msgEl.className = 'tc-msg success';
    }catch(err){
      msgEl.textContent = friendlyError(err.code);
      msgEl.className = 'tc-msg error';
    }finally{
      submitBtn.disabled = false;
      submitBtn.textContent = currentMode === 'login' ? 'تسجيل الدخول' : 'إنشاء الحساب';
    }
  });

  chip.querySelector('#tc-chip-out').addEventListener('click', () => {
    if(confirm('هل تريد تسجيل الخروج؟')) doSignOut();
  });

  // لو الصفحة فيها زر حساب خاص بها (زي الصفحة الرئيسية) نربطه أيضاً
  const pageBtn = document.getElementById('auth-status');
  if(pageBtn){
    pageBtn.addEventListener('click', () => {
      if(window.TadabburCloud.user && confirm('هل تريد تسجيل الخروج؟')) doSignOut();
    });
  }
}

function friendlyError(code){
  const map = {
    'auth/invalid-email': 'صيغة البريد الإلكتروني غير صحيحة',
    'auth/user-not-found': 'لا يوجد حساب بهذا البريد',
    'auth/wrong-password': 'كلمة المرور غير صحيحة',
    'auth/invalid-credential': 'البريد أو كلمة المرور غير صحيحة',
    'auth/email-already-in-use': 'هذا البريد مسجّل بالفعل، جرّب تسجيل الدخول',
    'auth/weak-password': 'كلمة المرور ضعيفة، استخدم 6 أحرف على الأقل',
    'auth/too-many-requests': 'محاولات كثيرة، حاول لاحقاً',
    'auth/network-request-failed': 'تعذر الاتصال بالإنترنت، تأكد من الشبكة'
  };
  return map[code] || 'حدث خطأ، حاول مرة أخرى';
}

/* ---------- مراقبة حالة الدخول ---------- */
let wasLoggedIn = false;

onAuthStateChanged(auth, (user) => {
  window.TadabburCloud.user = user;

  if(user){
    wasLoggedIn = true;
    overlay.classList.add('tc-hidden');
    chip.classList.add('show');
    chip.querySelector('#tc-chip-email').textContent = user.email;

    const pageBtn = document.getElementById('auth-status');
    if(pageBtn){
      pageBtn.textContent = user.email;
      pageBtn.classList.add('logged-in');
      chip.classList.remove('show'); // الصفحة عندها زرها الخاص، لا داعي للتكرار
    }
    _resolveReady(user);
  } else {
    overlay.classList.remove('tc-hidden');
    chip.classList.remove('show');
    // لو خرج بعد ما كان داخلاً: نعيد تحميل الصفحة لتصفير البيانات من الذاكرة
    if(wasLoggedIn) location.reload();
  }
});

async function doSignOut(){
  try{ await signOut(auth); }catch(e){}
  location.reload();
}

/* ============================================
   2) القراءة والكتابة من Firestore
   البنية: users/{uid}/pages/{surahId}_{mahwarId}
   كل مستند فيه:
     highlights   (نص JSON)   + highlightsTs (رقم)
     notes        (نص JSON)   + notesTs      (رقم)
   ============================================ */

async function loadPage(surahId, mahwarId){
  const user = window.TadabburCloud.user;
  if(!user) return null;
  try{
    const snap = await getDoc(doc(db, 'users', user.uid, 'pages', `${surahId}_${mahwarId}`));
    return snap.exists() ? snap.data() : null;
  }catch(e){
    console.error('فشل تحميل البيانات السحابية:', e);
    return null;
  }
}

/* الكتابة مؤجَّلة (debounce) حتى لا نرسل طلباً مع كل حرف */
const _pending = {};
const _timers = {};

function saveField(surahId, mahwarId, field, jsonString, ts){
  const user = window.TadabburCloud.user;
  if(!user) return;
  const key = `${surahId}_${mahwarId}`;
  if(!_pending[key]) _pending[key] = {};
  _pending[key][field] = jsonString;
  _pending[key][field + 'Ts'] = ts || Date.now();

  clearTimeout(_timers[key]);
  _timers[key] = setTimeout(() => flushKey(key), 800);
}

async function flushKey(key){
  const user = window.TadabburCloud.user;
  if(!user) return;
  const data = _pending[key];
  if(!data) return;
  delete _pending[key];
  try{
    await setDoc(doc(db, 'users', user.uid, 'pages', key), data, { merge:true });
  }catch(e){
    console.error('فشل الحفظ السحابي:', e);
    // نعيد البيانات للطابور لمحاولة لاحقة
    _pending[key] = Object.assign(data, _pending[key] || {});
  }
}

/* محاولة أخيرة للحفظ عند مغادرة الصفحة */
document.addEventListener('visibilitychange', () => {
  if(document.visibilityState === 'hidden'){
    Object.keys(_pending).forEach(flushKey);
  }
});
window.addEventListener('pagehide', () => {
  Object.keys(_pending).forEach(flushKey);
});
