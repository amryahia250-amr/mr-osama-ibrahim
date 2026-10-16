/* واجهة تجريبية للعرض فقط.
   لا تخزّن هذه النسخة كلمات المرور أو الرقم القومي محليًا.
   المصادقة والموافقة الحقيقية تحتاج خادمًا وقاعدة بيانات آمنين. */
const $ = (id) => document.getElementById(id);
const welcome = $('welcome'), pendingView = $('pendingView'), studentView = $('studentView'), teacherView = $('teacherView');
const toast = $('toast');
let currentDemoUser = null;
let toastTimer;
function notify(message){ toast.textContent=message; toast.classList.remove('hidden'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>toast.classList.add('hidden'),4200); }
function showOnly(view){[welcome,pendingView,studentView,teacherView].forEach(v=>v.classList.add('hidden'));view.classList.remove('hidden');$('logoutBtn').classList.toggle('hidden',view===welcome);$('profileBtn').classList.toggle('hidden',view===welcome);window.scrollTo({top:0,behavior:'smooth'});}
function setMessage(id,msg,type='error'){const el=$(id);el.textContent=msg;el.className='form-message '+type;}
function phoneValid(v){return /^(01[0125][0-9]{8}|\+?20?1[0125][0-9]{8})$/.test(v.replace(/[\s-]/g,''));}
function digits(v){return v.replace(/\D/g,'');}
$('showLogin').addEventListener('click',()=>{$('loginCard').scrollIntoView({behavior:'smooth',block:'start'});$('loginPhone').focus({preventScroll:true});});
$('showSignup').addEventListener('click',()=>{$('signupCard').scrollIntoView({behavior:'smooth',block:'start'});$('fullName').focus({preventScroll:true});});
$('signupForm').addEventListener('submit',e=>{
 e.preventDefault();
 const name=$('fullName').value.trim(), phone=$('studentPhone').value.trim(), parent=$('parentPhone').value.trim(), nid=digits($('nationalId').value), pass=$('signupPassword').value, confirm=$('confirmPassword').value;
 if(name.split(/\s+/).length<4){setMessage('signupMessage','اكتب الاسم رباعيًّا.');return;}
 if(!phoneValid(phone)||!phoneValid(parent)){setMessage('signupMessage','تأكد من كتابة رقمي الهاتف المصريين بشكل صحيح.');return;}
 if(phone.replace(/\D/g,'')===parent.replace(/\D/g,'')){setMessage('signupMessage','رقم ولي الأمر يجب أن يكون مختلفًا عن رقم الطالب.');return;}
 if(nid.length!==14){setMessage('signupMessage','الرقم القومي يجب أن يتكون من 14 رقمًا.');return;}
 if(pass.length<8){setMessage('signupMessage','كلمة المرور يجب أن تكون 8 أحرف على الأقل.');return;}
 if(pass!==confirm){setMessage('signupMessage','كلمتا المرور غير متطابقتين.');return;}
 if(!$('dataConsent').checked){setMessage('signupMessage','يرجى الموافقة على استخدام البيانات لإدارة الحساب.');return;}
 // لا يتم إرسال أو تخزين البيانات الحساسة في هذه النسخة؛ لا توهم المستخدم بإنشاء حساب فعلي.
 setMessage('signupMessage','واجهة التسجيل جاهزة، لكن لم يتم إنشاء حساب حقيقي بعد. يلزم ربط خادم آمن لحماية الرقم القومي وكلمات المرور.','error');
 notify('لم يتم حفظ بياناتك. يلزم إعداد نظام الحسابات الآمن أولًا.');
});
$('loginForm').addEventListener('submit',e=>{
 e.preventDefault();
 const phone=$('loginPhone').value.trim(), pass=$('loginPassword').value;
 if(!phoneValid(phone)){setMessage('loginMessage','اكتب رقم هاتف مصريًا صحيحًا.');return;}
 if(!pass){setMessage('loginMessage','اكتب كلمة المرور.');return;}
 setMessage('loginMessage','تسجيل الدخول الحقيقي غير مفعّل بعد؛ لم يتم إرسال أو حفظ كلمة المرور. يلزم ربط نظام مصادقة آمن.','error');
});
function signOut(){currentDemoUser=null;showOnly(welcome);notify('تم الرجوع إلى واجهة الدخول.');}
$('logoutBtn').addEventListener('click',signOut);$('pendingLogout').addEventListener('click',signOut);$('teacherLogout').addEventListener('click',signOut);
$('profileBtn').addEventListener('click',()=>renderStudent('account'));
const content=$('studentContent');
const courseData=[
 {icon:'⚛',title:'الفيزياء',desc:'شرح المفاهيم والقوانين والمسائل خطوة بخطوة.',tag:'فيزياء'},
 {icon:'🧪',title:'العلوم المتكاملة',desc:'فهم الأنظمة والظواهر العلمية وربطها بالحياة اليومية.',tag:'علوم متكاملة'},
 {icon:'✎',title:'التدريبات والاختبارات',desc:'اختبر فهمك وتدرّب على أسئلة متنوعة.',tag:'تدريب'},
 {icon:'📚',title:'الملخصات والمراجعات',desc:'مراجعات منظمة تساعدك على تثبيت المعلومات.',tag:'مراجعة'}
];
function renderStudent(view='home'){
 if(view==='home'){
  content.innerHTML=`<div class="course-grid">${courseData.slice(0,2).map(c=>`<article class="course-card"><div class="course-icon">${c.icon}</div><h3>${c.title}</h3><p>${c.desc}</p><span class="tag">${c.tag}</span></article>`).join('')}</div>`;
 }else if(view==='courses'){
  content.innerHTML=`<h2>الكورسات</h2><p class="muted">محتوى الفيزياء والعلوم المتكاملة المخصص لصفك سيظهر هنا بعد ربط المنصة بقاعدة البيانات.</p><div class="course-grid">${courseData.map(c=>`<article class="course-card"><div class="course-icon">${c.icon}</div><h3>${c.title}</h3><p>${c.desc}</p><span class="tag">${c.tag}</span></article>`).join('')}</div>`;
 }else if(view==='stages'){
  content.innerHTML=`<h2>المراحل الدراسية</h2><div class="course-grid">${['أولى ثانوي','تانية ثانوي','تالتة ثانوي'].map(g=>`<article class="course-card"><div class="course-icon">🎓</div><h3>${g}</h3><p>يتم عرض المحتوى المطابق للصف الذي سجّلت به بعد تفعيل الحساب.</p></article>`).join('')}</div>`;
 }else if(view==='practice'||view==='assignments'){
  content.innerHTML=`<div class="panel"><h2>${view==='practice'?'التمارين والاختبارات':'الواجبات'}</h2><p class="muted">سيظهر المحتوى المخصص لصفك هنا بعد تفعيل قاعدة البيانات واعتماد حسابك.</p><div class="empty-state">لا توجد بيانات تعليمية متصلة في هذه النسخة حتى الآن.</div></div>`;
 }else{
  content.innerHTML=`<div class="panel"><h2>حسابي</h2><p class="muted">بيانات الحساب والصف الدراسي ستظهر هنا بعد تسجيل الدخول الآمن.</p><div class="empty-state">لا توجد جلسة طالب مسجلة حاليًا.</div></div>`;
 }
 document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
}
document.querySelectorAll('[data-view]').forEach(btn=>btn.addEventListener('click',()=>renderStudent(btn.dataset.view)));
// Deliberately no hard-coded teacher credentials. Admin login must be verified server-side.
