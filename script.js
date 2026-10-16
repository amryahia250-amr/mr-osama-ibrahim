/* Mr.Osama Ibrahim - educational demo
   Data is stored locally in this browser. This is not production authentication. */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const STORE = "mrOsamaEduV1";
const starterLessons = [
  {id:"l1",title:"التمثيل الضوئي",subject:"علوم",level:"مقدمة",body:"التمثيل الضوئي عملية تصنع بها النباتات غذاءها باستخدام ضوء الشمس والماء وثاني أكسيد الكربون. تحدث هذه العملية أساسًا في الأوراق داخل أجزاء صغيرة تسمى البلاستيدات الخضراء، وتنتج سكرًا يساعد النبات على النمو، وينطلق الأكسجين إلى الهواء.",example:"تخيّل الورقة مطبخًا صغيرًا: ضوء الشمس هو الطاقة، والماء وثاني أكسيد الكربون هما المكونات، والنبات يصنع غذاءه."},
  {id:"l2",title:"مساحة المستطيل",subject:"رياضيات",level:"مبتدئ",body:"مساحة المستطيل هي مقدار السطح الموجود داخله. لحسابها نضرب طول المستطيل في عرضه، ونكتب الناتج بوحدات مربعة مثل سم² أو م².",example:"إذا كان الطول 6 سم والعرض 3 سم، فالمساحة = 6 × 3 = 18 سم²."},
  {id:"l3",title:"الاسم والفعل",subject:"لغة عربية",level:"مقدمة",body:"الاسم كلمة تدل على إنسان أو حيوان أو شيء أو معنى، مثل: طالب، قطة، كتاب، شجاعة. أما الفعل فيدل على حدث مرتبط بزمن، مثل: كتبَ (ماضٍ)، يكتبُ (مضارع)، اكتبْ (أمر).",example:"في جملة «قرأ الطالب الدرس»: كلمة الطالب اسم، وكلمة قرأ فعل ماضٍ."}
];
const starterQuestions = [
 {id:"q1",subject:"علوم",question:"ما المصدر الأساسي للطاقة في عملية التمثيل الضوئي؟",options:["ضوء الشمس","التربة فقط","صوت الرياح"],answer:"ضوء الشمس",explain:"تستخدم النباتات طاقة ضوء الشمس لصنع الغذاء."},
 {id:"q2",subject:"رياضيات",question:"مستطيل طوله 6 سم وعرضه 3 سم. ما مساحته؟",options:["9 سم²","18 سم²","18 سم"],answer:"18 سم²",explain:"المساحة = الطول × العرض = 6 × 3 = 18 سم²."},
 {id:"q3",subject:"لغة عربية",question:"أي كلمة مما يلي فعل؟",options:["مدرسة","جميل","يكتب"],answer:"يكتب",explain:"«يكتب» فعل مضارع يدل على حدث يحدث في الزمن الحاضر أو المستقبل."}
];
function loadState(){
  try { const saved=JSON.parse(localStorage.getItem(STORE)||"{}"); return {
    name: typeof saved.name==="string"?saved.name:"",
    lessons:Array.isArray(saved.lessons)?saved.lessons:starterLessons,
    questions:Array.isArray(saved.questions)?saved.questions:starterQuestions,
    completed:Array.isArray(saved.completed)?saved.completed:[],
    scores:Array.isArray(saved.scores)?saved.scores:[]
  }; } catch { return {name:"",lessons:starterLessons,questions:starterQuestions,completed:[],scores:[]}; }
}
let state=loadState();
function saveState(){try{localStorage.setItem(STORE,JSON.stringify(state));}catch{notify("تعذّر الحفظ في المتصفح. قد تكون مساحة التخزين ممتلئة.");}}
function escapeHTML(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function notify(message){const el=$("#toast");el.textContent=message;el.classList.add("show");clearTimeout(notify.timer);notify.timer=setTimeout(()=>el.classList.remove("show"),2600);}
function showPage(page){
  const pages=["home","lessons","quiz","tutor","teacher"];
  pages.forEach(p=>$("#"+p+"Page")?.classList.toggle("hidden",p!==page));
  $("#homeHero").classList.toggle("hidden",page!=="home");
  $$(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
  $("#mainNav").classList.remove("open");
  if(page==="lessons") renderLessons();
  if(page==="quiz") renderQuiz();
  if(page==="teacher") renderTeacherContent();
  window.scrollTo({top:0,behavior:"smooth"});
}
$$("[data-page]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));
$$("[data-goto]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.goto)));
$("#menuToggle").addEventListener("click",()=>$("#mainNav").classList.toggle("open"));
$("#profileButton").addEventListener("click",()=>{$("#studentName").value=state.name;$("#profileDialog").showModal();});
$("#profileForm").addEventListener("submit",e=>{e.preventDefault();state.name=$("#studentName").value.trim();saveState();$("#profileDialog").close();updateDashboard();notify(state.name?`أهلًا يا ${state.name}!`:"تم تحديث الملف");});
function updateDashboard(){
  $("#profileLabel").textContent=state.name?state.name:"ملفي";
  $("#lessonCount").textContent=state.lessons.length;
  $("#quizCount").textContent=state.scores.length;
  const best=state.scores.length?Math.max(...state.scores.map(s=>s.percent)):null;
  $("#bestScore").textContent=best===null?"—":best+"%";
  $("#homeProgress").textContent=Math.round((state.completed.length/Math.max(state.lessons.length,1))*100)+"%";
}
function renderLessons(){
 const filter=$("#subjectFilter").value;
 const lessons=state.lessons.filter(l=>filter==="all"||l.subject===filter);
 $("#lessonList").innerHTML=lessons.length?lessons.map(l=>`<button class="lesson-item" data-lesson="${escapeHTML(l.id)}"><span class="lesson-symbol">▤</span><span><strong>${escapeHTML(l.title)}</strong><small>${escapeHTML(l.subject)} · ${escapeHTML(l.level||"درس")}</small></span></button>`).join(""):`<div class="panel">لا توجد دروس في هذه المادة بعد.</div>`;
 $$(".lesson-item").forEach(b=>b.addEventListener("click",()=>openLesson(b.dataset.lesson)));
}
function openLesson(id){
 const l=state.lessons.find(x=>x.id===id);if(!l)return;
 $$(".lesson-item").forEach(b=>b.classList.toggle("selected",b.dataset.lesson===id));
 $("#lessonReader").innerHTML=`<span class="lesson-meta">${escapeHTML(l.subject)} · ${escapeHTML(l.level||"درس")}</span><h3>${escapeHTML(l.title)}</h3><p>${escapeHTML(l.body)}</p><div class="example-box"><strong>💡 مثال مبسّط</strong><br>${escapeHTML(l.example||"حاول تلخيص الفكرة بكلماتك.")}</div><button class="btn btn-primary" id="markComplete">${state.completed.includes(id)?"✓ أكملت هذا الدرس":"تحديد الدرس كمكتمل"}</button> <button class="btn btn-light" id="lessonPractice">جرّب اختبارًا</button>`;
 $("#markComplete").addEventListener("click",()=>{if(!state.completed.includes(id))state.completed.push(id);saveState();updateDashboard();openLesson(id);notify("أحسنت! تم تسجيل إكمال الدرس على هذا الجهاز.");});
 $("#lessonPractice").addEventListener("click",()=>showPage("quiz"));
}
$("#subjectFilter").addEventListener("change",renderLessons);
let quizOrder=[],quizIndex=0,quizScore=0,answered=false;
function renderQuiz(){
 quizOrder=[...state.questions].sort(()=>Math.random()-.5).slice(0,Math.min(5,state.questions.length));
 quizIndex=0;quizScore=0;answered=false;showQuestion();
}
function showQuestion(){
 const card=$("#quizCard");
 if(!quizOrder.length){card.innerHTML="<div class='quiz-result'><h3>لا توجد أسئلة بعد</h3><p>يمكن للمدرّس إضافة أسئلة من لوحة المدرّس.</p></div>";return;}
 if(quizIndex>=quizOrder.length){const percent=Math.round(quizScore/quizOrder.length*100);state.scores.push({date:new Date().toISOString(),percent,score:quizScore,total:quizOrder.length});state.scores=state.scores.slice(-50);saveState();updateDashboard();card.innerHTML=`<div class="quiz-result"><span class="eyebrow">اكتمل الاختبار</span><div class="score-ring">${percent}%</div><h2>${percent>=80?"عمل رائع!":percent>=50?"أحسنت، واصل التدرّب!":"لا تستسلم، المحاولة القادمة أفضل!"}</h2><p>أجبت إجابة صحيحة عن ${quizScore} من ${quizOrder.length} أسئلة.</p><button class="btn btn-primary" id="retryQuiz">إعادة الاختبار</button></div>`;$("#retryQuiz").addEventListener("click",renderQuiz);return;}
 const q=quizOrder[quizIndex];answered=false;
 const options=[...q.options].sort(()=>Math.random()-.5);
 card.innerHTML=`<div class="quiz-top"><span>السؤال ${quizIndex+1} من ${quizOrder.length}</span><span>${escapeHTML(q.subject)}</span></div><div class="quiz-progress"><span style="width:${quizIndex/quizOrder.length*100}%"></span></div><h3>${escapeHTML(q.question)}</h3><div class="answers">${options.map(o=>`<button class="answer-option" data-answer="${escapeHTML(o)}">${escapeHTML(o)}</button>`).join("")}</div><div id="quizFeedback"></div><div class="quiz-next"></div>`;
 $$(".answer-option",card).forEach(b=>b.addEventListener("click",()=>chooseAnswer(b,q)));
}
function chooseAnswer(button,q){
 if(answered)return;answered=true;
 const isCorrect=button.dataset.answer===q.answer;if(isCorrect)quizScore++;
 $$(".answer-option").forEach(b=>{b.disabled=true;if(b.dataset.answer===q.answer)b.classList.add("correct");});
 if(!isCorrect)button.classList.add("incorrect");
 $("#quizFeedback").innerHTML=`<div class="quiz-feedback"><strong>${isCorrect?"إجابة صحيحة! ✓":"ليست الإجابة الصحيحة هذه المرة."}</strong><br>${escapeHTML(q.explain||"راجع الدرس وحاول مرة أخرى.")}</div>`;
 $(".quiz-next").innerHTML=`<button class="btn btn-primary" id="nextQuestion">${quizIndex===quizOrder.length-1?"عرض النتيجة":"السؤال التالي ←"}</button>`;
 $("#nextQuestion").addEventListener("click",()=>{quizIndex++;showQuestion();});
}
const tutorRules=[
 {keys:["تمثيل ضوئي","ضوئي","النبات"],answer:"التمثيل الضوئي هو الطريقة التي يصنع بها النبات غذاءه. يحتاج إلى ضوء الشمس والماء وثاني أكسيد الكربون، وينتج السكر والأكسجين.\n\nتخيّل الورقة مثل مطبخ صغير: الشمس تمدّها بالطاقة، والنبات يستخدم هذه الطاقة لصنع غذائه. هل تريد مثالًا أو سؤال تدريب؟"},
 {keys:["مساحة","مستطيل"],answer:"لحساب مساحة المستطيل نستخدم القاعدة:\nالمساحة = الطول × العرض.\n\nمثال: إذا كان الطول 5 سم والعرض 4 سم، فالمساحة = 5 × 4 = 20 سم².\n\nتذكّر أن وحدة المساحة تكون مربعة مثل سم². جرّب حساب مساحة مستطيل طوله 7 سم وعرضه 2 سم!"},
 {keys:["اسم","فعل","نحو"],answer:"الاسم يدل على إنسان أو شيء أو معنى، مثل: طالب، كتاب، أمل. أما الفعل فيدل على حدث مرتبط بزمن، مثل: كتبَ (ماضٍ)، يكتبُ (مضارع)، اكتبْ (أمر).\n\nمثال: «قرأ الطالب الدرس». كلمة «قرأ» فعل، وكلمة «الطالب» اسم."},
 {keys:["جمع","الكسور"],answer:"عند جمع كسرين لهما المقام نفسه، نجمع البسطين ونترك المقام كما هو.\nمثال: 2/7 + 3/7 = 5/7.\nإذا اختلف المقامان، نحتاج أولًا إلى توحيد المقامين."},
 {keys:["جاذبية","الجاذبية"],answer:"الجاذبية قوة تجذب الأجسام بعضها إلى بعض. جاذبية الأرض هي ما يجعل الأشياء تسقط نحو الأرض ويساعدنا على البقاء على سطحها.\nتخيّل أنك تركت كرة من يدك؛ تسحبها جاذبية الأرض إلى الأسفل."}
];
function tutorReply(input){
 const normalized=input.toLowerCase();
 const found=tutorRules.find(r=>r.keys.some(k=>normalized.includes(k)));
 if(found)return found.answer;
 if(normalized.includes("مرحبا")||normalized.includes("أهلا")||normalized.includes("السلام"))return "أهلًا بك! أنا مساعد تجريبي. اكتب اسم الموضوع الذي تريد فهمه، مثل مساحة المستطيل أو التمثيل الضوئي أو الاسم والفعل. هذه النسخة لا تستخدم ذكاءً اصطناعيًا متصلًا بالإنترنت.";
 if(normalized.includes("اشرح")||normalized.includes("كيف")||normalized.includes("ما هو")||normalized.includes("ما هي"))return "خلّينا نفهم السؤال خطوة بخطوة. حدّد المادة والصف الدراسي، ثم اكتب اسم الدرس أو انسخ الجزء الذي لم تفهمه. ملاحظة: أنا في هذه النسخة أستخدم أمثلة محلية محدودة، لذلك قد لا أملك إجابة دقيقة لكل سؤال.";
 return "شكرًا على سؤالك! هذه النسخة التجريبية لم تُربط بعد بنموذج ذكاء اصطناعي حقيقي. جرّب السؤال عن «التمثيل الضوئي» أو «مساحة المستطيل» أو «الاسم والفعل»، أو اطلب من المدرّس إضافة شرح لهذا الموضوع.";
}
function addChatBubble(text,role){const el=document.createElement("div");el.className=`chat-bubble ${role}`;const title=document.createElement("strong");title.textContent=role==="user"?(state.name||"أنت"):"المساعد";const p=document.createElement("p");p.textContent=text;el.append(title,p);$("#chatMessages").append(el);$("#chatMessages").scrollTop=$("#chatMessages").scrollHeight;}
$("#chatForm").addEventListener("submit",e=>{e.preventDefault();const input=$("#chatInput");const value=input.value.trim();if(!value)return;addChatBubble(value,"user");input.value="";setTimeout(()=>addChatBubble(tutorReply(value),"assistant"),180);});
$$("[data-prompt]").forEach(b=>b.addEventListener("click",()=>{$("#chatInput").value=b.dataset.prompt;$("#chatForm").requestSubmit();}));
$("#addLessonForm").addEventListener("submit",e=>{
 e.preventDefault();const f=new FormData(e.currentTarget);
 state.lessons.push({id:"custom-"+Date.now(),title:f.get("title").trim(),subject:f.get("subject"),level:"درس أضافه المدرّس",body:f.get("body").trim(),example:"اكتب مثالًا من حياتك اليومية يوضّح الفكرة، ثم حاول شرحها بكلماتك."});
 saveState();e.currentTarget.reset();updateDashboard();renderTeacherContent();notify("تمت إضافة الدرس إلى هذا المتصفح.");
});
$("#addQuestionForm").addEventListener("submit",e=>{
 e.preventDefault();const f=new FormData(e.currentTarget);const answer=f.get("answer").trim(),wrong=f.get("wrong").trim();
 state.questions.push({id:"custom-q-"+Date.now(),subject:f.get("subject"),question:f.get("question").trim(),options:[answer,wrong],answer,explain:"راجع إجابتك وتأكد من فهم الفكرة الأساسية."});
 saveState();e.currentTarget.reset();renderTeacherContent();notify("تمت إضافة السؤال إلى الاختبارات.");
});
function renderTeacherContent(){
 const lessons=state.lessons.filter(l=>!["l1","l2","l3"].includes(l.id));
 const questions=state.questions.filter(q=>!["q1","q2","q3"].includes(q.id));
 const rows=[...lessons.map(l=>({id:l.id,title:l.title,kind:"درس"})),...questions.map(q=>({id:q.id,title:q.question,kind:"سؤال"}))];
 $("#teacherContent").innerHTML=rows.length?rows.map(r=>`<div class="content-row"><span><strong>${escapeHTML(r.title)}</strong><br><small>${r.kind} · محفوظ محليًا</small></span><button class="delete-button" data-delete="${escapeHTML(r.id)}">حذف</button></div>`).join(""):"<p style='color:#718096;font-size:13px'>لم تضف محتوى بعد. استخدم النموذج أعلاه لإضافة أول درس أو سؤال.</p>";
 $$("[data-delete]").forEach(b=>b.addEventListener("click",()=>{const id=b.dataset.delete;state.lessons=state.lessons.filter(l=>l.id!==id);state.questions=state.questions.filter(q=>q.id!==id);state.completed=state.completed.filter(x=>x!==id);saveState();updateDashboard();renderTeacherContent();notify("تم حذف المحتوى.");}));
}
$("#year").textContent=new Date().getFullYear();
updateDashboard();
