(function(){
const SESSION_MARK='emociones-kids-session-v3';
const COUNTS={d1scenario:4,d1cause:4,d2literal:4,d2meaning:2,d3story:2,d3class:5,d4kb:4,d5q:5,d5mis:3,d5light:3,d6story:10,d6infer:2,d7class:6,d7help:4};
const progress={};

function clearProgramProgress(){
  try{
    Object.keys(localStorage).filter(k=>k.startsWith('program:')).forEach(k=>localStorage.removeItem(k));
  }catch(e){}
}
function newBrowserSession(){
  try{
    if(!sessionStorage.getItem(SESSION_MARK)){
      clearProgramProgress();
      sessionStorage.setItem(SESSION_MARK,'1');
    }
  }catch(e){clearProgramProgress()}
}
newBrowserSession();

function injectStyles(){
 const s=document.createElement('style');
 s.textContent=`
 body{font-family:"Trebuchet MS","Segoe UI",system-ui,sans-serif;background:linear-gradient(180deg,#eaf8ff 0%,#fff9e8 52%,#f4efff 100%);}
 .wrap{max-width:1080px}.card{border-radius:28px;border:2px solid #e8e5f2;box-shadow:0 12px 30px rgba(65,72,115,.10)}
 h1{font-size:clamp(1.8rem,4vw,2.45rem);letter-spacing:-.02em}h2{font-size:clamp(1.45rem,3vw,1.9rem)}
 .btn,.choice,.nav button,.day-card-v2,.back-days,.finish-day{min-height:48px;font-size:1rem}
 .choice{border-radius:18px;padding:16px;line-height:1.35}.story,.feedback{border-radius:18px;font-size:1.03rem}
 .day-card-v2{border-width:2px;border-radius:25px;background:linear-gradient(145deg,#fff,#fbfcff);position:relative;overflow:hidden}
 .day-card-v2:after{content:'★';position:absolute;right:14px;top:10px;font-size:1.2rem;color:#ffd76a;opacity:.85}
 .day-card-v2:nth-child(2n):after{content:'☁️'}.day-card-v2:nth-child(3n):after{content:'🌈'}.day-card-v2:nth-child(4n):after{content:'⭐'}
 .day-card-v2 .ico{font-size:2.7rem}.home-title:before{content:'🚀  🧩  🌟';display:block;font-size:2rem;margin-bottom:8px}
 .day-context{background:#fffdf7;border:2px solid #eee8d9;border-radius:22px;padding:14px 16px;margin-top:16px}
 .kid-banner{display:flex;gap:12px;align-items:center;background:linear-gradient(90deg,#fff7cf,#eef9ff);border:2px solid #f0e6a9;border-radius:20px;padding:13px 15px;margin:12px 0 16px}
 .kid-banner .mascot{font-size:2.3rem}.kid-banner b{display:block;font-size:1.08rem;margin-bottom:2px}
 .nav-simple-kids{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:18px 0 4px}.nav-simple-kids .stepbubble{background:#f0edff;color:#5148b8;padding:9px 13px;border-radius:999px;font-weight:900;text-align:center;flex:1}
 .kid-exit{border:0;background:#fff1f0;color:#a23a31;border-radius:13px;padding:10px 13px;font-weight:900;cursor:pointer}
 .choice:focus-visible,.btn:focus-visible,.day-card-v2:focus-visible{outline:4px solid #ffd76a;outline-offset:3px}
 textarea,input{font-size:1rem;border-radius:15px;border-width:2px}.small{line-height:1.45}
 .celebrate-mini{animation:bounceKid .35s ease}@keyframes bounceKid{50%{transform:scale(1.03)}}
 @media(max-width:760px){.kid-banner{align-items:flex-start}.nav-simple-kids{flex-wrap:wrap}.nav-simple-kids .stepbubble{order:-1;flex-basis:100%}}
 `;
 document.head.appendChild(s);
}

function addKidChrome(){
 const app=document.getElementById('app'); if(!app||document.getElementById('kidExitBtn')) return;
 const top=app.querySelector('.row');
 if(top){
   const b=document.createElement('button');b.id='kidExitBtn';b.className='kid-exit';b.textContent='🚪 Salir y reiniciar';b.onclick=resetAndExit;top.appendChild(b);
 }
 const home=document.getElementById('programHome');
 if(home){
   const banner=document.createElement('div');banner.className='kid-banner';banner.innerHTML='<div class="mascot">🦖</div><div><b>¡Hola, explorador!</b><span class="small">Elige un día. Trabajaremos una actividad a la vez y cuando termines podrás volver a empezar otro día.</span></div>';
   const title=home.querySelector('.home-title'); if(title) title.insertAdjacentElement('afterend',banner);
 }
}

function resetAndExit(){
 clearProgramProgress();
 try{sessionStorage.removeItem(SESSION_MARK)}catch(e){}
 try{if(typeof poller!=='undefined'&&poller)clearInterval(poller)}catch(e){}
 location.reload();
}
window.resetAndExit=resetAndExit;

function goSection(day,id){
 const fn=window['showD'+day];
 if(typeof fn==='function') fn(id);
 setTimeout(()=>{
   const block=document.getElementById('day'+day+'Block');
   const sec=document.getElementById(id);
   if(sec){sec.classList.add('celebrate-mini');setTimeout(()=>sec.classList.remove('celebrate-mini'),400)}
   if(block) updateKidStep(block);
 },20);
}
function updateKidStep(block){
 if(!block)return;
 const nav=block.querySelector('.nav');
 const buttons=nav?Array.from(nav.querySelectorAll('button')):[];
 const visible=Array.from(block.querySelectorAll('section')).find(s=>!s.classList.contains('hidden'));
 if(!buttons.length||!visible)return;
 const idx=Math.max(0,buttons.findIndex(b=>(b.getAttribute('onclick')||'').includes(`'${visible.id}'`)));
 let bar=block.querySelector('.nav-simple-kids .stepbubble');
 if(!bar){
   const kid=document.createElement('div');kid.className='nav-simple-kids';kid.innerHTML='<div class="stepbubble"></div>';
   nav.insertAdjacentElement('afterend',kid);bar=kid.querySelector('.stepbubble');
 }
 bar.textContent=`🌟 Actividad ${idx+1} de ${buttons.length}`;
}

function wrapNext(name,key,total,next){
 const old=window[name]; if(typeof old!=='function'||old.__kidWrapped)return;
 const f=function(){
   old.apply(this,arguments);
   progress[key]=(progress[key]||0)+1;
   if(progress[key]>=total){progress[key]=0; setTimeout(()=>next(),120)}
 };
 f.__kidWrapped=true;window[name]=f;
}
function wrapClickAdvance(name,key,total,next){wrapNext(name,key,total,next)}

function installFiniteFlow(){
 wrapNext('nextScenario','d1scenario',4,()=>goSection(1,'cause'));
 wrapNext('nextCause','d1cause',4,()=>goSection(1,'me'));
 wrapNext('nextLiteral','d2literal',4,()=>goSection(2,'d2meaning'));
 wrapNext('nextMeaning','d2meaning',2,()=>goSection(2,'d2personal'));
 wrapNext('nextD3Story','d3story',2,()=>goSection(3,'d3change'));
 wrapNext('nextD3Class','d3class',5,()=>goSection(3,'d3alternatives'));
 wrapNext('nextD4KB','d4kb',4,()=>goSection(4,'d4alternatives'));
 wrapNext('nextD5Q','d5q',5,()=>goSection(5,'d5story'));
 wrapNext('nextD5Mis','d5mis',3,()=>goSection(5,'d5traffic'));
 wrapNext('nextD5Light','d5light',3,()=>goSection(5,'d5personal'));
 // Día 6: 2 historias x 5 preguntas. Al terminar 10 preguntas pasa a causa/intención.
 wrapNext('nextD6Question','d6story',10,()=>goSection(6,'d6cause'));
 wrapNext('nextD6Infer','d6infer',2,()=>goSection(6,'d6order'));
 wrapNext('nextD7Class','d7class',6,()=>goSection(7,'d7help'));
 wrapNext('nextD7Help','d7help',4,()=>goSection(7,'d7intention'));
}

function autoAdvanceOnCompletedSimpleSections(){
 // Día 3: tras elegir en cambiar pensamiento dos veces, avanza.
 let d3c=0; const oldD3=window.d3Change;if(typeof oldD3==='function'&&!oldD3.__kidWrapped){window.d3Change=function(){oldD3.apply(this,arguments);d3c++;if(d3c>=2){d3c=0;setTimeout(()=>goSection(3,'d3classify'),450)}};window.d3Change.__kidWrapped=true}
 // Día 4: dos respuestas introductorias y luego película llevan a qué sabe cada uno.
 let d4p=0; const oldP=window.d4Perspective;if(typeof oldP==='function'&&!oldP.__kidWrapped){window.d4Perspective=function(){oldP.apply(this,arguments);d4p++};window.d4Perspective.__kidWrapped=true}
 const oldM=window.d4Movie;if(typeof oldM==='function'&&!oldM.__kidWrapped){window.d4Movie=function(){oldM.apply(this,arguments);if(arguments[1]===true)setTimeout(()=>goSection(4,'d4knowledge'),450)};window.d4Movie.__kidWrapped=true}
 // Día 6 causa + intención: cuando responde ambas correctamente, avanzar a inferencias.
 let d6ok={cause:false,intent:false};const oc=window.d6Cause,oi=window.d6Intent;
 if(typeof oc==='function'){window.d6Cause=function(a,ok){oc.apply(this,arguments);if(ok)d6ok.cause=true;if(d6ok.cause&&d6ok.intent){d6ok={cause:false,intent:false};setTimeout(()=>goSection(6,'d6infer'),450)}}}
 if(typeof oi==='function'){window.d6Intent=function(a,ok){oi.apply(this,arguments);if(ok)d6ok.intent=true;if(d6ok.cause&&d6ok.intent){d6ok={cause:false,intent:false};setTimeout(()=>goSection(6,'d6infer'),450)}}}
 // Día 6 ordenar: al completar 3 elecciones correctas o no, pasa a problema/solución después de feedback.
 const oo=window.chooseD6Order;if(typeof oo==='function'&&!oo.__kidWrapped){let picks=0;window.chooseD6Order=function(){oo.apply(this,arguments);picks++;if(picks>=3){picks=0;setTimeout(()=>goSection(6,'d6problem'),900)}};window.chooseD6Order.__kidWrapped=true}
 // Día 6 tema: cualquier elección da feedback y luego va a historia personal.
 const or=window.d6Relevant;if(typeof or==='function'&&!or.__kidWrapped){window.d6Relevant=function(){or.apply(this,arguments);setTimeout(()=>goSection(6,'d6personal'),700)};window.d6Relevant.__kidWrapped=true}
 // Día 7 intención: dos situaciones, después emoción+necesidad.
 const o7=window.d7Intent;if(typeof o7==='function'&&!o7.__kidWrapped){let c=0;window.d7Intent=function(){o7.apply(this,arguments);c++;if(c>=2){c=0;setTimeout(()=>goSection(7,'d7emotion'),600)}};window.d7Intent.__kidWrapped=true}
}

function improveLabels(){
 const replacements={
  'Siguiente':'Siguiente ➜','Siguiente historia':'Otra historia ➜','Siguiente pregunta':'Siguiente ➜','Siguiente situación':'Siguiente ➜','Reiniciar':'Intentar otra historia','Enviar respuestas':'Guardar mi respuesta','Enviar Día 1':'Guardar mi respuesta','Enviar Día 2':'Guardar mi respuesta','Enviar Día 3':'Guardar mi respuesta','Enviar Día 4':'Guardar mi respuesta','Enviar Día 5':'Guardar mi respuesta','Enviar Día 6':'Guardar mi historia','Enviar Día 7':'Guardar mi mensaje'
 };
 document.querySelectorAll('button').forEach(b=>{const t=b.textContent.trim();if(replacements[t])b.textContent=replacements[t]});
 document.querySelectorAll('.story').forEach(x=>{if(!x.querySelector('.story-icon'))x.insertAdjacentHTML('afterbegin','<span class="story-icon" aria-hidden="true">📚 </span>')});
}

function observer(){
 const obs=new MutationObserver(()=>{addKidChrome();improveLabels();installFiniteFlow();autoAdvanceOnCompletedSimpleSections();if(typeof currentDay!=='undefined'&&currentDay){const b=document.getElementById('day'+currentDay+'Block');updateKidStep(b)}});
 obs.observe(document.body,{childList:true,subtree:true});
}

function init(){injectStyles();addKidChrome();improveLabels();installFiniteFlow();autoAdvanceOnCompletedSimpleSections();observer();
 document.addEventListener('click',e=>{const btn=e.target.closest('.day-card-v2');if(btn)setTimeout(()=>{const visible=Array.from(document.querySelectorAll('[id^="day"][id$="Block"]')).find(b=>!b.classList.contains('hidden'));if(visible)updateKidStep(visible)},100)});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,0));else setTimeout(init,0);
})();