(function(){
const qs=[
 {q:'¿Quién llamó por teléfono?',type:'Quién',need:'una persona',opts:['Mi abuela','A las cinco'],ok:0},
 {q:'¿Dónde dejaste el libro?',type:'Dónde',need:'un lugar',opts:['En mi habitación','Ayer'],ok:0},
 {q:'¿Cuándo comienza la película?',type:'Cuándo',need:'un momento',opts:['A las siete','Con mi hermano'],ok:0},
 {q:'¿Por qué Pedro lleva paraguas?',type:'Por qué',need:'una razón',opts:['Porque está lloviendo','En la escuela'],ok:0},
 {q:'¿Cómo hiciste el dibujo?',type:'Cómo',need:'una manera',opts:['Primero con lápiz y después lo coloreé','Bien'],ok:0}
];
const mismatch=[
 ['¿Dónde está Juan?','Está cansado','Juan está en su habitación'],
 ['¿Por qué María está preocupada?','Está en la escuela','Porque mañana tiene un examen'],
 ['¿Quién hizo la comida?','A las doce','Daniel']
];
const lights=[
 ['¿Dónde está el perro?','En el jardín','Verde'],
 ['¿Por qué lloró?','Estaba triste','Amarillo'],
 ['¿Quién llamó?','Mañana','Rojo']
];
let qi=0,mi5=0,li5=0;
function el(tag,attrs={},html=''){const e=document.createElement(tag);Object.entries(attrs).forEach(([k,v])=>k==='class'?e.className=v:e.setAttribute(k,v));e.innerHTML=html;return e}
function addUI(){
 const daybar=document.querySelector('.daybar'); if(!daybar||document.getElementById('day5Btn')) return;
 const b=el('button',{id:'day5Btn'},'Día 5 · Responder preguntas'); b.onclick=()=>selectDay(5); daybar.appendChild(b);
 const block=el('div',{id:'day5Block',class:'hidden'});
 block.innerHTML=`<div class="nav"><button onclick="showD5('d5intro')">1. Palabras clave</button><button onclick="showD5('d5detective')">2. Detective</button><button onclick="showD5('d5story')">3. Historia</button><button onclick="showD5('d5mismatch')">4. ¿Coincide?</button><button onclick="showD5('d5traffic')">5. Semáforo</button><button onclick="showD5('d5personal')">6. Mi respuesta</button></div>
 <section id="d5intro" class="section"><h2>Día 5 · Responder exactamente lo que me preguntan</h2><p class="small">Primero descubro qué información busca la pregunta. Después respondo eso.</p><div class="three"><div class="stepcard">👤<b>QUIÉN</b><span class="small">Persona</span></div><div class="stepcard">📦<b>QUÉ</b><span class="small">Cosa, acción o información</span></div><div class="stepcard">📍<b>DÓNDE</b><span class="small">Lugar</span></div><div class="stepcard">🕒<b>CUÁNDO</b><span class="small">Momento</span></div><div class="stepcard">💡<b>POR QUÉ</b><span class="small">Razón</span></div><div class="stepcard">🧩<b>CÓMO</b><span class="small">Manera</span></div></div><div class="feedback"><b>Estrategia:</b> ESCUCHO → DESCUBRO → RESPONDO</div></section>
 <section id="d5detective" class="section hidden"><h2>El detective de preguntas</h2><div id="d5QText" class="story"></div><p><b>¿Qué información está buscando?</b></p><div id="d5TypeChoices" class="choices"></div><p><b>Ahora elige la respuesta que sí contesta.</b></p><div id="d5AnswerChoices" class="choices"></div><div id="d5QFb" class="feedback"></div><button class="btn child" onclick="nextD5Q()">Siguiente</button></section>
 <section id="d5story" class="section hidden"><h2>Una historia, preguntas diferentes</h2><div class="story">El domingo, Laura fue con su hermano al zoológico. Llegaron a las diez de la mañana. Laura quería ver los elefantes porque son sus animales favoritos.</div><div class="grid"><button class="choice" onclick="d5Story('¿Quién fue con Laura?','Su hermano',true)">¿Quién fue con Laura?<br><b>Su hermano</b></button><button class="choice" onclick="d5Story('¿Dónde fueron?','Al zoológico',true)">¿Dónde fueron?<br><b>Al zoológico</b></button><button class="choice" onclick="d5Story('¿Cuándo llegaron?','A las diez de la mañana',true)">¿Cuándo llegaron?<br><b>A las diez de la mañana</b></button><button class="choice" onclick="d5Story('¿Por qué quería ver elefantes?','Porque son sus favoritos',true)">¿Por qué quería ver elefantes?<br><b>Porque son sus favoritos</b></button></div><div id="d5StoryFb" class="feedback">Cada pregunta busca una parte distinta de la historia.</div></section>
 <section id="d5mismatch" class="section hidden"><h2>La respuesta que no coincide</h2><div id="d5MisText" class="story"></div><div class="choices"><button class="choice" onclick="d5Mismatch(false)">Sí, contesta la pregunta</button><button class="choice" onclick="d5Mismatch(true)">No, responde otra cosa</button></div><div id="d5MisFb" class="feedback"></div><button class="btn child" onclick="nextD5Mis()">Siguiente</button></section>
 <section id="d5traffic" class="section hidden"><h2>Semáforo de respuestas</h2><p class="small">🟢 contesta exactamente · 🟡 está relacionada pero falta algo · 🔴 no contesta.</p><div id="d5LightText" class="story"></div><div class="three"><button class="choice" onclick="d5Light('Verde')">🟢 Verde</button><button class="choice" onclick="d5Light('Amarillo')">🟡 Amarillo</button><button class="choice" onclick="d5Light('Rojo')">🔴 Rojo</button></div><div id="d5LightFb" class="feedback"></div><button class="btn child" onclick="nextD5Light()">Siguiente</button></section>
 <section id="d5personal" class="section hidden"><h2>Mi respuesta exacta</h2><div class="grid"><div>¿Qué fue lo que más te gustó hoy?<textarea id="d5p1"></textarea></div><div>¿Por qué te gustó?<textarea id="d5p2"></textarea></div><div>¿Dónde ocurrió?<textarea id="d5p3"></textarea></div><div>¿Con quién estabas?<textarea id="d5p4"></textarea></div></div><p><b>Revisión:</b> ¿Mis respuestas contestan exactamente cada pregunta?</p><div class="choices"><button class="choice" onclick="d5Review('Sí')">Sí</button><button class="choice" onclick="d5Review('Necesito revisarlas')">Necesito revisarlas</button></div><button class="btn parent" onclick="sendDay5Personal()">Enviar Día 5</button><div id="d5PersonalFb" class="feedback"></div></section>`;
 const monitor=document.getElementById('monitor'); monitor.parentNode.insertBefore(block,monitor);
 renderD5Q();renderD5Mis();renderD5Light();
}
window.showD5=function(id){['d5intro','d5detective','d5story','d5mismatch','d5traffic','d5personal'].forEach(x=>document.getElementById(x).classList.toggle('hidden',x!==id))};
function record(activity,answer,ok=null){if(typeof send==='function') send('answer',activity,answer,ok)}
function renderD5Q(){if(!document.getElementById('d5QText'))return;let x=qs[qi];d5QText.textContent=x.q;d5TypeChoices.innerHTML=['Quién','Qué','Dónde','Cuándo','Por qué','Cómo'].map(t=>`<button class="choice" onclick="d5Type('${t.replace(/'/g,"\\'")}')">${t}</button>`).join('');d5AnswerChoices.innerHTML=x.opts.map((o,i)=>`<button class="choice" onclick="d5Ans(${i})">${o}</button>`).join('')}
window.d5Type=function(t){let x=qs[qi],ok=t===x.type;d5QFb.textContent=ok?'Correcto: busca '+x.need+'.':'La palabra clave es “'+x.type+'”.';record('Día 5 · Tipo de pregunta',{question:x.q,selected:t,correct:x.type},ok)};
window.d5Ans=function(i){let x=qs[qi],ok=i===x.ok;d5QFb.textContent=ok?'¡Esa respuesta contesta exactamente!':'Está relacionada, pero no responde lo que se preguntó.';record('Día 5 · Respuesta exacta',{question:x.q,selected:x.opts[i],correct:x.opts[x.ok]},ok)};
window.nextD5Q=function(){qi=(qi+1)%qs.length;renderD5Q()};
window.d5Story=function(q,a,ok){d5StoryFb.textContent='Bien: “'+a+'” responde directamente.';record('Día 5 · Historia',{question:q,answer:a},ok)};
function renderD5Mis(){if(!document.getElementById('d5MisText'))return;let x=mismatch[mi5];d5MisText.innerHTML='<b>Pregunta:</b> '+x[0]+'<br><b>Respuesta:</b> '+x[1]}
window.d5Mismatch=function(saysNo){let x=mismatch[mi5],ok=saysNo;d5MisFb.textContent=ok?'Correcto. Una respuesta mejor sería: '+x[2]: 'Esa respuesta no contesta exactamente la pregunta.';record('Día 5 · Coincidencia pregunta-respuesta',{question:x[0],answer:x[1],better:x[2],selected:saysNo?'No coincide':'Sí coincide'},ok)};
window.nextD5Mis=function(){mi5=(mi5+1)%mismatch.length;renderD5Mis()};
function renderD5Light(){if(!document.getElementById('d5LightText'))return;let x=lights[li5];d5LightText.innerHTML='<b>Pregunta:</b> '+x[0]+'<br><b>Respuesta:</b> '+x[1]}
window.d5Light=function(c){let x=lights[li5],ok=c===x[2];d5LightFb.textContent=ok?'¡Correcto! Es '+c+'.':'Revisa: corresponde '+x[2]+'.';record('Día 5 · Semáforo',{question:x[0],answer:x[1],selected:c,correct:x[2]},ok)};
window.nextD5Light=function(){li5=(li5+1)%lights.length;renderD5Light()};
window.d5Review=function(a){record('Día 5 · Revisión',{answer:a});d5PersonalFb.textContent=a==='Sí'?'Muy bien.':'Revisa una por una: qué, por qué, dónde y con quién.'};
window.sendDay5Personal=function(){record('Día 5 · Mi experiencia',{que:d5p1.value,por_que:d5p2.value,donde:d5p3.value,con_quien:d5p4.value});d5PersonalFb.textContent='Respuestas del Día 5 enviadas.'};
const oldSelect=window.selectDay;
window.selectDay=function(n){if(n===5){[1,2,3,4].forEach(x=>{let bl=document.getElementById('day'+x+'Block'),bt=document.getElementById('day'+x+'Btn');if(bl)bl.classList.add('hidden');if(bt)bt.classList.remove('active')});day5Block.classList.remove('hidden');day5Btn.classList.add('active');if(typeof send==='function')send('navigation','Día 5',{day:5});}else{if(document.getElementById('day5Block'))day5Block.classList.add('hidden');if(document.getElementById('day5Btn'))day5Btn.classList.remove('active');oldSelect(n)}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addUI);else addUI();
})();
