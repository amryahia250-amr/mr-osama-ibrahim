// إعداد الاتصال بـ Supabase
// استبدل القيمتين التاليتين ببيانات مشروعك العامة.
const SUPABASE_URL = 'https://wxredoodfydiujletyse.supabase.co/rest/v1/';
const SUPABASE_KEY = 'sb_secret_qoi1vc5a0lJ4gewFjzGubw_EHRhW8Nh';

const configured =
  SUPABASE_URL.startsWith('https://wxredoodfydiujletyse.supabase.co/rest/v1/') &&
  !SUPABASE_URL.includes('https://wxredoodfydiujletyse.supabase.co/rest/v1/') &&
  !SUPABASE_KEY.includes('sb_secret_qoi1vc5a0lJ4gewFjzGubw_EHRhW8Nh');

const db = configured && window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

const $ = id => document.getElementById(id);

const welcome = $('welcome');
const pendingView = $('pendingView');
const studentView = $('studentView');
const teacherView = $('teacherView');
const toast = $('toast');

let currentUser = null;
let toastTimer;

function notify(message) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 4500);
}

function setMessage(id, message, type = 'error') {
  const el = $(id);
  el.textContent = message;
  el.className = 'form-message ' + type;
}

function showOnly(view) {
  [welcome, pendingView, studentView, teacherView]
    .forEach(section => section.classList.add('hidden'));

  view.classList.remove('hidden');

  $('logoutBtn').classList.toggle('hidden', view === welcome);
  $('profileBtn').classList.toggle('hidden', view === welcome);

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function needConnection() {
  if (!db) {
    notify('لازم تضيف رابط Supabase والمفتاح العام في script.js أولًا.');
    return false;
  }
  return true;
}

function validEgyptianPhone(value) {
  return /^(01[0125][0-9]{8}|\+?20?1[0125][0-9]{8})$/
    .test(value.replace(/[\s-]/g, ''));
}

function getProfileData() {
  return {
    id: currentUser.id,
    full_name: currentUser.user_metadata?.full_name || '',
    student_phone: currentUser.user_metadata?.student_phone || '',
    parent_phone: currentUser.user_metadata?.parent_phone || '',
    governorate: currentUser.user_metadata?.governorate || '',
    city: currentUser.user_metadata?.city || '',
    grade: currentUser.user_metadata?.grade || ''
  };
}

// إنشاء ملف الطالب بعد تسجيل الدخول.
// يتطلب وجود سياسة INSERT آمنة تسمح للمستخدم بإنشاء ملفه بنفسه.
async function ensureStudentProfile() {
  const profile = getProfileData();

  const { data, error } = await db
    .from('student_profiles')
    .select('id, full_name, student_phone, parent_phone, governorate, city, grade, account_status')
    .eq('id', currentUser.id)
    .maybeSingle();

  if (error) {
    throw new Error(
      'تعذر قراءة ملف الطالب. راجع صلاحيات جدول student_profiles في Supabase.'
    );
  }

  if (data) return data;

  const { error: insertError } = await db
    .from('student_profiles')
    .insert(profile);

  if (insertError) {
    throw new Error(
      'تم تسجيل الدخول، لكن لم نستطع إنشاء ملف الطالب. يلزم ضبط صلاحيات INSERT في Supabase.'
    );
  }

  const { data: created, error: readError } = await db
    .from('student_profiles')
    .select('id, full_name, student_phone, parent_phone, governorate, city, grade, account_status')
    .eq('id', currentUser.id)
    .single();

  if (readError || !created) {
    throw new Error('تم إنشاء الحساب، لكن تعذر قراءة بياناته.');
  }

  return created;
}

async function enterAccount(user) {
  currentUser = user;

  // لا نعرض أي محتوى قبل التأكد من حالة الحساب.
  const { data: profile, error } = await db
    .from('student_profiles')
    .select('id, full_name, grade, account_status')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    showOnly(welcome);
    notify('تعذر التحقق من حالة الحساب. راجع صلاحيات قاعدة البيانات.');
    return;
  }

  if (!profile) {
    try {
      const created = await ensureStudentProfile();
      await showProfileState(created);
    } catch (err) {
      showOnly(welcome);
      notify(err.message);
    }
    return;
  }

  await showProfileState(profile);
}

async function showProfileState(profile) {
  const status = String(profile.account_status || '').trim().toLowerCase();

  // لا نعتبر أي حالة أخرى موافقة.
  const approvedValues = ['approved', 'مقبول', 'معتمد', 'تمت الموافقة'];

  if (!approvedValues.includes(status)) {
    showOnly(pendingView);
    return;
  }

  $('studentGreeting').textContent =
    'أهلًا بيك يا ' + (profile.full_name || 'طالبنا') + ' 👋';

  $('gradeBadge').textContent = profile.grade || '';
  showOnly(studentView);
  renderStudent('home');
}

$('showLogin').addEventListener('click', () => {
  $('loginCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  $('loginEmail').focus({ preventScroll: true });
});

$('showSignup').addEventListener('click', () => {
  $('signupCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  $('fullName').focus({ preventScroll: true });
});

// التسجيل بالبريد الإلكتروني
$('signupForm').addEventListener('submit', async event => {
  event.preventDefault();

  if (!needConnection()) return;

  const name = $('fullName').value.trim();
  const email = $('signupEmail').value.trim().toLowerCase();
  const phone = $('studentPhone').value.trim();
  const parent = $('parentPhone').value.trim();
  const governorate = $('governorate').value;
  const city = $('city').value.trim();
  const grade = $('grade').value;
  const password = $('signupPassword').value;
  const confirm = $('confirmPassword').value;

  if (name.split(/\s+/).length < 4) {
    setMessage('signupMessage', 'اكتب الاسم رباعيًّا.');
    return;
  }

  if (!validEgyptianPhone(phone) || !validEgyptianPhone(parent)) {
    setMessage('signupMessage', 'تأكد من كتابة رقمي الهاتف المصريين بشكل صحيح.');
    return;
  }

  if (phone.replace(/\D/g, '') === parent.replace(/\D/g, '')) {
    setMessage('signupMessage', 'رقم ولي الأمر يجب أن يكون مختلفًا عن رقم الطالب.');
    return;
  }

  if (password.length < 8) {
    setMessage('signupMessage', 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.');
    return;
  }

  if (password !== confirm) {
    setMessage('signupMessage', 'كلمتا المرور غير متطابقتين.');
    return;
  }

  if (!$('dataConsent').checked) {
    setMessage('signupMessage', 'يرجى الموافقة على استخدام البيانات.');
    return;
  }

  const button = $('signupForm').querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = 'جارٍ إنشاء الحساب...';

  try {
    const { data, error } = await db.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + window.location.pathname,
        data: {
          full_name: name,
          student_phone: phone,
          parent_phone: parent,
          governorate,
          city,
          grade
        }
      }
    });

    if (error) throw error;

    if (data.session && data.user) {
      currentUser = data.user;

      const profile = await ensureStudentProfile();
      setMessage(
        'signupMessage',
        'تم إنشاء الحساب. حسابك في انتظار موافقة المدرّس.',
        'success'
      );
      await showProfileState(profile);
    } else {
      setMessage(
        'signupMessage',
        'تم إرسال طلب التسجيل. افتح بريدك الإلكتروني واضغط رابط التأكيد، ثم سجّل الدخول.',
        'success'
      );
    }

    $('signupForm').reset();
  } catch (error) {
    setMessage(
      'signupMessage',
      error.message || 'تعذر إنشاء الحساب. راجع إعدادات Supabase.',
      'error'
    );
  } finally {
    button.disabled = false;
    button.textContent = 'إنشاء الحساب';
  }
});

// تسجيل الدخول بالبريد الإلكتروني
$('loginForm').addEventListener('submit', async event => {
  event.preventDefault();

  if (!needConnection()) return;

  const email = $('loginEmail').value.trim().toLowerCase();
  const password = $('loginPassword').value;

  const button = $('loginForm').querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = 'جارٍ تسجيل الدخول...';

  try {
    const { data, error } = await db.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    if (!data.user) throw new Error('تعذر التحقق من الحساب.');

    await enterAccount(data.user);
  } catch (error) {
    setMessage(
      'loginMessage',
      error.message || 'تعذر تسجيل الدخول. تأكد من البريد وكلمة المرور.',
      'error'
    );
  } finally {
    button.disabled = false;
    button.textContent = 'دخول إلى حسابي';
  }
});

async function signOut() {
  if (db) {
    await db.auth.signOut();
  }

  currentUser = null;
  showOnly(welcome);
  notify('تم تسجيل الخروج.');
}

$('logoutBtn').addEventListener('click', signOut);
$('pendingLogout').addEventListener('click', signOut);
$('teacherLogout').addEventListener('click', signOut);

$('profileBtn').addEventListener('click', () => renderStudent('account'));

const content = $('studentContent');

const courseData = [
  {
    icon: '⚛',
    title: 'الفيزياء',
    desc: 'شرح المفاهيم والقوانين والمسائل خطوة بخطوة.',
    tag: 'فيزياء'
  },
  {
    icon: '🧪',
    title: 'العلوم المتكاملة',
    desc: 'فهم الأنظمة والظواهر العلمية وربطها بالحياة اليومية.',
    tag: 'علوم متكاملة'
  },
  {
    icon: '✎',
    title: 'التدريبات والاختبارات',
    desc: 'اختبر فهمك وتدرّب على أسئلة متنوعة.',
    tag: 'تدريب'
  },
  {
    icon: '📚',
    title: 'الملخصات والمراجعات',
    desc: 'مراجعات منظمة تساعدك على تثبيت المعلومات.',
    tag: 'مراجعة'
  }
];

function renderStudent(view = 'home') {
  if (view === 'home') {
    content.innerHTML =
      `<div class="course-grid">${
        courseData.slice(0, 2).map(c =>
          `<article class="course-card">
            <div class="course-icon">${c.icon}</div>
            <h3>${c.title}</h3><p>${c.desc}</p>
            <span class="tag">${c.tag}</span>
          </article>`
        ).join('')
      }</div>`;
  } else if (view === 'courses') {
    content.innerHTML =
      `<h2>الكورسات</h2>
       <p class="muted">الكورسات الفعلية ستُضاف بعد إعداد إدارة المحتوى.</p>
       <div class="course-grid">${
         courseData.map(c =>
           `<article class="course-card">
             <div class="course-icon">${c.icon}</div>
             <h3>${c.title}</h3><p>${c.desc}</p>
             <span class="tag">${c.tag}</span>
           </article>`
         ).join('')
       }</div>`;
  } else if (view === 'stages') {
    content.innerHTML =
      `<h2>المراحل الدراسية</h2>
       <div class="course-grid">${
         ['أولى ثانوي', 'تانية ثانوي', 'تالتة ثانوي'].map(g =>
           `<article class="course-card">
             <div class="course-icon">🎓</div>
             <h3>${g}</h3>
             <p>المحتوى الفعلي الخاص بالصف يحتاج إلى إضافته للمنصة.</p>
           </article>`
         ).join('')
       }</div>`;
  } else if (view === 'practice' || view === 'assignments') {
    content.innerHTML =
      `<div class="panel">
        <h2>${view === 'practice' ? 'التمارين والاختبارات' : 'الواجبات'}</h2>
        <p class="muted">لم تتم إضافة محتوى فعلي لهذا القسم حتى الآن.</p>
       </div>`;
  } else {
    content.innerHTML =
      `<div class="panel">
        <h2>حسابي</h2>
        <p class="muted">البريد الإلكتروني: ${
          currentUser?.email || ''
        }</p>
       </div>`;
  }

  document.querySelectorAll('.nav-item').forEach(button => {
    button.classList.toggle('active', button.dataset.view === view);
  });
}

document.querySelectorAll('[data-view]').forEach(button => {
  button.addEventListener('click', () => renderStudent(button.dataset.view));
});

// استعادة الجلسة عند إعادة فتح الموقع
async function restoreSession() {
  if (!db) return;

  const { data, error } = await db.auth.getSession();

  if (!error && data.session?.user) {
    await enterAccount(data.session.user);
  }
}

if (db) restoreSession();
