import {renderer} from './renderer.js';
import {newRace,advance,shoot,GOAL} from './race.js';
import {Sound} from './audio.js';

const $=s=>document.querySelector(s),canvas=$('canvas'),screen=$('.screen');
const labels=[...document.querySelectorAll('[data-en]')].map(el=>[el,el.textContent]);
const keys=new Set(),touch=new Set(),sound=new Sound();
const words={
 brief:['Zbierz 11 zielonych bramek i dotrzyj do mety. Pomarańczowe miny zabierają osłonę. Możesz je zestrzelić.','Collect 11 green gates and reach the finish. Orange mines damage your shield. Shoot them or steer clear.'],
 loading:['Ładowanie…','Loading…'],start:['Start','Start'],pause:['Ⅱ Pauza','Ⅱ Pause'],resume:['▶ Wznów','▶ Resume'],
 paused:['Pauza','Paused'],again:['Jeszcze raz','Race again'],win:['Meta!','Finished!'],short:['Za mało bramek','Too few gates'],crash:['Koniec osłony','Shield depleted'],
 sound:['♫ Dźwięk','♫ Sound'],muted:['♫ Wyciszono','♫ Muted'],shield:['Osłona','Shield'],gates:['Bramki','Gates'],rocket:['Rakieta','Rocket'],
 gate:['+1 bramka','+1 gate'],hit:['Uderzenie','Shield hit'],miss:['Minięta bramka','Missed gate'],break:['Mina rozbita','Mine cleared'],
 record:['Rekord','Best'],clock:['Czas','Time'],mines:['Rozbite miny','Mines cleared']
};
const read=k=>{try{return localStorage.getItem(k);}catch{return null;}};
const save=(k,v)=>{try{localStorage.setItem(k,v);}catch{}};
let en=read('lang')==='en',mode='loading',race=newRace(),draw,flash='',flashUntil=0,last=0;
let best=Number(read('neon.time.v1'))||0;const tr=k=>words[k][+en];
sound.setMute(read('neon.mute')==='1');
function time(t){return t.toFixed(1)+' s';}
function updateHUD(){
 const next=race.gates[race.next],delta=next?next.x-race.x:0;
 $('#gates').textContent=tr('gates')+' '+race.collected+(race.collected>=GOAL?'/18 ✓':'/'+GOAL)+(next?(Math.abs(delta)<1.3?'  ◇':delta<0?'  ◀':'  ▶'):'');
 $('#shield').textContent=tr('shield')+' '+Math.max(0,race.shield)+'/3';
 $('#time').textContent=time(race.elapsed);
 $('#meter i').style.transform='scaleX('+race.energy/100+')';
 $('#rocket').textContent=tr('rocket')+' · '+race.rockets;
 $('#flash').textContent=flash&&race.elapsed<flashUntil?tr(flash):'';
}
function panel(){
 labels.forEach(([e,pl])=>e.textContent=en?e.dataset.en:pl);document.documentElement.lang=en?'en':'pl';
 $('#lang').textContent=en?'PL':'EN';$('#lang').setAttribute('aria-label',en?'Polski':'English');
 $('#sound').textContent=tr(sound.muted?'muted':'sound');$('#sound').setAttribute('aria-pressed',String(!sound.muted));
 $('#pause').disabled=!['run','paused'].includes(mode);$('#pause').textContent=tr(mode==='paused'?'resume':'pause');
 $('.overlay').hidden=mode==='run';$('.hud').hidden=$('#meter').hidden=['loading','menu'].includes(mode);
 let heading='Slalom',info=tr('brief'),label=tr('start');
 if(best)info+=' '+tr('record')+' '+time(best)+'.';
 if(mode==='loading')label=tr('loading');
 if(mode==='paused'){heading=tr('paused');label=tr('resume');}
 if(mode==='done'){heading=tr(race.result);label=tr('again');info=tr('gates')+' '+race.collected+'/18 · '+tr('mines')+' '+race.hits+' · '+time(race.elapsed);if(best)info+=' · '+tr('record')+' '+time(best);}
 $('#title').textContent=heading;$('#info').textContent=info;$('#start').textContent=label;$('#start').disabled=mode==='loading';
 updateHUD();
}
function clearInput(){keys.clear();touch.clear();document.querySelectorAll('.held').forEach(b=>b.classList.remove('held'));}
function pause(){if(mode!=='run')return;mode='paused';sound.pause();clearInput();panel();}
function start(){
 if(mode==='loading')return;
 if(mode!=='paused'){race=newRace();flash='';}
 mode='run';last=performance.now();clearInput();sound.play();panel();
 $('#start').blur();
}
$('#start').onclick=start;$('#pause').onclick=()=>mode==='run'?pause():start();
$('#lang').onclick=()=>{en=!en;save('lang',en?'en':'pl');panel();};
$('#sound').onclick=()=>{sound.unlock();sound.setMute(!sound.muted);save('neon.mute',sound.muted?'1':'0');panel();};
function cue(k){
 sound.cue(k);
 if(['gate','miss','hit','break'].includes(k)){flash=k;flashUntil=race.elapsed+.80;}
}
function fire(rocket){if(mode==='run')shoot(race,rocket,cue);}
$('#fire').onclick=()=>fire(false);$('#rocket').onclick=()=>fire(true);
for(const b of document.querySelectorAll('[data-hold]')){
 b.onpointerdown=e=>{if(mode!=='run')return;e.preventDefault();b.setPointerCapture(e.pointerId);touch.add(b.dataset.hold);b.classList.add('held');};
 b.onlostpointercapture=()=>{touch.delete(b.dataset.hold);b.classList.remove('held');};
 b.onkeydown=e=>{if(mode==='run'&&(e.code==='Space'||e.key==='Enter')){e.preventDefault();touch.add(b.dataset.hold);}};
 b.onkeyup=()=>touch.delete(b.dataset.hold);
}
const map={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'boost',KeyW:'boost',Space:'fire'};
window.addEventListener('keydown',e=>{
 if(e.defaultPrevented||e.altKey||e.metaKey||e.ctrlKey)return;
 if(e.code==='KeyP'||e.code==='Escape'){if(!e.repeat){if(mode==='run')pause();else if(mode==='paused')start();}return;}
 if(mode!=='run')return;
 if(e.code==='Space'&&e.target.closest('button,a'))return;
 if(map[e.code]){e.preventDefault();keys.add(e.code);}
 if(e.code==='KeyR'&&!e.repeat)fire(true);
});
window.addEventListener('keyup',e=>keys.delete(e.code));
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
window.addEventListener('blur',pause);
const held=k=>touch.has(k)||[...keys].some(code=>map[code]===k);
let nextHud=0,frameCount=0,windowStart=0;
function tick(now){
 const dt=Math.min(.25,Math.max(0,(now-last)/1000));last=now;
 if(mode==='run'){
  const input={steer:Number(held('right'))-Number(held('left')),boost:held('boost')};
  // Substeps keep collisions continuous even when a frame stalls.
  let remaining=dt;
  while(remaining>.000001&&!race.result){
   const step=Math.min(remaining,1/90);if(held('fire'))fire(false);
   advance(race,step,input,cue);remaining-=step;
  }
  sound.tick(race.thrust);draw(race);
  if(now>=nextHud){updateHUD();nextHud=now+75;}
  if(race.result){
   if(race.result==='win'&&(!best||race.elapsed<best)){best=race.elapsed;save('neon.time.v1',String(best));}
   mode='done';sound.pause();clearInput();panel();
  }
  if(!windowStart)windowStart=now;
  frameCount++;
  if(now-windowStart>=850){
   const ms=(now-windowStart)/frameCount,screenCanvas=$('canvas');
   if(screen.dataset.renderer==='webgl'&&ms>26&&screenCanvas.width>320){
    screenCanvas.width=screenCanvas.width===640?480:320;screenCanvas.height=screenCanvas.width*5/8;
   }
   else if(engine.backend==='webgl'&&ms>31&&screenCanvas.width===320)engine.simplify();
   frameCount=0;windowStart=now;
  }
 }else{windowStart=0;frameCount=0;}
 requestAnimationFrame(tick);
}
panel();
const engine=await renderer(canvas);draw=engine.draw;screen.dataset.renderer=engine.backend;
draw(race);screen.classList.add('ready');mode='menu';panel();requestAnimationFrame(tick);
