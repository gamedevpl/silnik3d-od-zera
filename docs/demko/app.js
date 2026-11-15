'use strict';
const $=selector=>document.querySelector(selector);
const canvas=$('canvas'), ctx=canvas.getContext('2d',{alpha:false});
const statusText=$('#status'), pause=$('#pause'),langButton=$('#lang');
const labels=[...document.querySelectorAll('[data-en]')].map(el=>[el,el.textContent]);
let lang='pl';
try{lang=localStorage.getItem('lang')||'pl';}catch{}
if(lang!=='en')lang='pl';
let ready=false,failed=false,paused=matchMedia('(prefers-reduced-motion: reduce)').matches;
function translate(){
    const en=lang==='en';
    labels.forEach(([el,pl])=>{el.textContent=en?el.dataset.en:pl;});
    document.documentElement.lang=lang;langButton.textContent=en?'PL':'EN';
    langButton.setAttribute('aria-label',en?'Polski':'English');
    pause.textContent=paused?(en?'▶ Resume':'▶ Wznów'):(en?'Ⅱ Pause':'Ⅱ Pauza');
    pause.setAttribute('aria-pressed',String(paused));
    statusText.textContent=failed?(en?'Reload to retry loading the demo.':'Odśwież stronę, aby ponowić ładowanie dema.'):(ready?'':(en?'Loading…':'Ładowanie…'));
    document.title=(en?'Neon canal':'Neonowy kanał')+' · gamedev.pl';
}
langButton.onclick=()=>{lang=lang==='pl'?'en':'pl';try{localStorage.setItem('lang',lang);}catch{}translate();};
translate();
const held=new Set(),controls=[...document.querySelectorAll('[data-hold]')];
let t=20,steer=0,shot=-1,rocket=-1,animation=20,rate=1,last=performance.now(),busy=false;
function resetInput(){held.clear();controls.forEach(b=>b.classList.remove('held'));last=performance.now();}
function togglePause(){paused=!paused;resetInput();translate();}
pause.onclick=togglePause;
$('#fire').onclick=()=>{if(!paused)shot=t;};
$('#rocket').onclick=()=>{if(!paused)rocket=t;};
$('#turn').onclick=()=>{t=38.4;shot=-1;rocket=-1;paused=false;resetInput();translate();};
function hold(action,down){
    if(down)held.add(action);else held.delete(action);
    controls.forEach(el=>el.classList.toggle('held',held.has(el.dataset.hold)));
}
controls.forEach(button=>{
    button.onpointerdown=e=>{e.preventDefault();button.setPointerCapture(e.pointerId);hold(button.dataset.hold,true);};
    button.onlostpointercapture=()=>hold(button.dataset.hold,false);
    button.onkeydown=e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();hold(button.dataset.hold,true);}};
    button.onkeyup=()=>hold(button.dataset.hold,false);
});
const keys={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'boost'};
window.addEventListener('keydown',e=>{
    if(e.altKey||e.ctrlKey||e.metaKey||e.defaultPrevented)return;
    if(keys[e.key]){e.preventDefault();hold(keys[e.key],true);}
    else if(e.code==='Space'&&!e.target.closest('button,a')){e.preventDefault();if(!e.repeat&&!paused)shot=t;}
    else if(e.code==='KeyR'&&!e.repeat&&!paused)rocket=t;
    else if(e.code==='KeyP'&&!e.repeat&&ready)togglePause();
});
window.addEventListener('keyup',e=>{if(keys[e.key])hold(keys[e.key],false);});
window.addEventListener('blur',resetInput);
document.addEventListener('visibilitychange',resetInput);
const worker=new Worker('worker.js');
function fail(){failed=true;busy=false;worker.terminate();pause.disabled=true;translate();}
worker.onerror=fail;
worker.onmessage=({data})=>{
    if(data.error){fail();return;}
    ctx.putImageData(new ImageData(data.pixels,480,300),0,0);
    if(!ready){ready=true;$('.screen').classList.add('ready');pause.disabled=false;translate();}
    busy=false;
};
function tick(now){
    if(failed)return;
    const dt=Math.min(.12,Math.max(0,(now-last)/1000));last=now;
    if(!document.hidden&&(!paused||!ready)){
        const direction=Number(held.has('right'))-Number(held.has('left'));
        steer+=(direction*3.2-steer)*(1-Math.exp(-9*dt));
        rate+=((held.has('boost')?2.3:1)-rate)*(1-Math.exp(-3*dt));
        if(!paused&&ready){t+=dt*rate;animation+=dt;}
        if(t>=48){t%=48;shot=-1;rocket=-1;}
        if(!busy){busy=true;worker.postMessage({t,steer,shot,rocket,boost:(rate-1)/1.3,animation});}
    }
    requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
