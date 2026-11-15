import {renderer} from './renderer.js?v=grid2';
import {newRace,advance,shoot,GRID,LAP} from './race.js?v=grid2';
import {Sound} from './audio.js?v=grid2';

const $=s=>document.querySelector(s),canvas=$('canvas'),screen=$('.screen');
const labels=[...document.querySelectorAll('[data-en]')].map(el=>[el,el.textContent]);
const keys=new Set(),touch=new Set(),sound=new Sound();
const words={
 brief:['Sześciu rywali. Jedź w smudze za statkiem, a przed zakrętem wyjdź z niej na dopalaczu. Zielone strzałki dodają prędkości.','Six rivals. Slipstream behind a ship, then boost past it before the bend. Green chevrons give you a burst of speed.'],
 loading:['Ładowanie…','Loading…'],start:['Start','Start'],pause:['Ⅱ Pauza','Ⅱ Pause'],resume:['▶ Wznów','▶ Resume'],
 paused:['Pauza','Paused'],
 sound:['♫ Dźwięk','♫ Sound'],muted:['♫ Wyciszono','♫ Muted'],shield:['Osłona','Shield'],rocket:['Rakieta','Rocket'],
 hit:['Uderzenie','Shield hit'],break:['Trafienie','Direct hit'],
 pad:['Dopalacz toru','Boost pad'],repair:['Osłona odnowiona','Shield restored'],rail:['Kontakt z bandą','Rail contact'],
 position:['Pozycja','Position'],lap:['Okrążenie','Lap'],draft:['W smudze','Slipstream'],record:['Rekord okrążenia','Best lap']
};
const read=k=>{try{return localStorage.getItem(k);}catch{return null;}};
const save=(k,v)=>{try{localStorage.setItem(k,v);}catch{}};
let en=read('lang')==='en',mode='loading',race=newRace(),draw,flash='',flashUntil=0,last=0;
let best=Number(read('neon.lap.v2'))||0;const tr=k=>words[k][+en];
sound.setMute(read('neon.mute')==='1');
function time(t){return t.toFixed(1)+' s';}
function updateHUD(){
 $('#position').textContent=tr('position')+' '+race.rank+'/'+GRID;
 $('#shield').textContent=tr('shield')+' '+race.shield+'/3';
 $('#lap').textContent=tr('lap')+' '+(race.laps+1)+' · '+time(race.elapsed-race.lapStart);
 $('#meter i').style.transform='scaleX('+race.energy/100+')';
 $('#rocket').textContent=tr('rocket')+' · '+race.rockets;
 $('#flash').textContent=flash&&race.elapsed<flashUntil?(flash==='lap'?tr('lap')+' '+race.laps+' · '+time(race.lastLap):tr(flash)):(race.drafting?tr('draft'):'');
 updateRadar();
}
const radar=$('#radar');
const dots=Array.from({length:GRID},(_,i)=>{
 const dot=document.createElement('i');if(!i)dot.className='player';
 radar.append(dot);return dot;
});
function updateRadar(){
 const plot=(dot,x,gap)=>{
  dot.hidden=gap< -23||gap>62;
  if(!dot.hidden){dot.style.left=(50+x*2.3)+'%';dot.style.top=(70-gap*.95)+'%';}
 };
 plot(dots[0],race.x,0);
 race.rivals.forEach((p,i)=>{const dz=p.z-race.distance;plot(dots[i+1],p.x,dz-LAP*Math.round(dz/LAP));});
}
function panel(){
 labels.forEach(([e,pl])=>e.textContent=en?e.dataset.en:pl);document.documentElement.lang=en?'en':'pl';
 $('#lang').textContent=en?'PL':'EN';$('#lang').setAttribute('aria-label',en?'Polski':'English');
 $('#sound').textContent=tr(sound.muted?'muted':'sound');$('#sound').setAttribute('aria-pressed',String(!sound.muted));
 $('#pause').disabled=!['run','paused'].includes(mode);$('#pause').textContent=tr(mode==='paused'?'resume':'pause');
 $('.overlay').hidden=mode==='run';$('.hud').hidden=radar.hidden=$('#meter').hidden=['loading','menu'].includes(mode);
 let heading='Neon Grand Prix',info=tr('brief'),label=tr('start');
 if(best)info+=' '+tr('record')+' '+time(best)+'.';
 if(mode==='loading')label=tr('loading');
 if(mode==='paused'){heading=tr('paused');label=tr('resume');}
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
 if(k==='lap'&&(!best||race.lastLap<best)){best=race.lastLap;save('neon.lap.v2',String(best));}
 if(['pad','hit','break','rail','repair','lap'].includes(k)){flash=k;flashUntil=race.elapsed+(k==='lap'?2:.8);}
}
function fire(rocket){if(mode==='run')shoot(race,rocket,cue);}
$('#fire').onclick=()=>fire(false);$('#rocket').onclick=()=>fire(true);
for(const b of document.querySelectorAll('[data-hold]')){
 b.onpointerdown=e=>{if(mode!=='run')return;e.preventDefault();b.setPointerCapture(e.pointerId);touch.add(b.dataset.hold);b.classList.add('held');};
 b.onlostpointercapture=()=>{touch.delete(b.dataset.hold);b.classList.remove('held');};
 b.onkeydown=e=>{if(mode==='run'&&(e.code==='Space'||e.key==='Enter')){e.preventDefault();touch.add(b.dataset.hold);}};
 b.onkeyup=()=>touch.delete(b.dataset.hold);
}
const map={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'boost',KeyW:'boost',ArrowDown:'brake',KeyS:'brake',Space:'fire'};
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
  const input={steer:Number(held('right'))-Number(held('left')),boost:held('boost'),brake:held('brake')};
  // Substeps keep collisions continuous even when a frame stalls.
  let remaining=dt;
  while(remaining>.000001){
   const step=Math.min(remaining,1/90);if(held('fire'))fire(false);
   advance(race,step,input,cue);remaining-=step;
  }
  sound.tick(race.thrust);draw(race);
  if(now>=nextHud){updateHUD();nextHud=now+75;}
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
