import {renderer} from './renderer.js?v=display2';
import {loadRace} from './race.js?v=relay1';
import {Sound} from './audio.js?v=relay1';

const $=s=>document.querySelector(s),canvas=$('canvas'),screen=$('.screen');
const labels=[...document.querySelectorAll('[data-pl]')].map(el=>[el,el.textContent]);
const englishTitle=document.title;
const keys=new Set(),pointers=new Map(),buttonKeys=new Set();
const words={
 fork:['← Most · Kanał →','← Bridge · Canal →'],bridge:['Most · wiatr w plecy','Bridge · tailwind'],channel:['Kanał · ładowanie','Canal · recharge'],
 course:['Tor','Race course'],left:['Skręć w lewo','Steer left'],right:['Skręć w prawo','Steer right'],
 maxCargo:['ostatnia szansa','last chance'],lostCargo:['traci rdzeń','lost core'],bestRival:['Najlepszy rywal','Best rival'],
 pitTip:['Fioletowe pole: puść dopalacz, by się naprawić, albo przytrzymaj go i wydaj 35 energii na wyrzut.','Violet pad: coast to repair, or hold Boost to spend 35 energy on overdrive.'],you:['Ty','You'],rival:['Rywal','Rival'],bank:['Bramka','Bank'],
 take:['Przejmij rdzeń','Take core'],won:['wygrywa rundę','wins the heat'],yourWin:['Wygrywasz rundę','You win the heat'],
 brief:['Zdobądź 5 punktów. Traf statek ze złotym rdzeniem lub wyprzedź go tuż obok. Przeleć przez złotą bramkę po punkty. Omiń ją, by podbić stawkę.','First to 5 points. Hit the ship carrying the gold core or pass close alongside it. Fly through the gold gate to score. Skip it to raise the stakes.'],
 boost:['Dopalacz','Boost'],launch:['Wyrzut ze smugi','Slingshot'],ready:['Zapas smugi · skręć + dopalacz','Wake stored · steer + boost'],
 lock:['Namierzony · zmień pas','Incoming · change lane'],overdrive:['Wyrzut · −35 energii','Overdrive · −35 energy'],
 empty:['Brak rakiet · zbierz zielone pola','Out of rockets · collect boost pads'],fired:['Rakieta odpalona','Rocket away'],
 loading:['Ładowanie…','Loading…'],start:['Graj · spacja lub kliknięcie','Race · Space or click'],tapStart:['Dotknij, aby zagrać','Tap to race'],resumeKey:['Wznów · spacja lub kliknięcie','Resume · Space or click'],tapResume:['Dotknij, aby wznowić','Tap to resume'],pause:['Ⅱ Pauza','Ⅱ Pause'],resume:['▶ Wznów','▶ Resume'],
 paused:['Pauza','Paused'],
 sound:['♫ Dźwięk','♫ Sound'],muted:['♫ Wyciszono','♫ Muted'],shield:['Osłona','Shield'],rocket:['Rakieta','Rocket'],
 wreck:['Awaria · restart','Hull lost · restarting'],hit:['Uderzenie','Shield hit'],break:['Trafienie','Direct hit'],
 pad:['Dopalacz toru','Boost pad'],repair:['Osłona odnowiona','Shield restored'],rail:['Kontakt z bandą','Rail contact'],
 position:['Pozycja','Position'],lap:['Okrążenie','Lap'],draft:['W smudze','Slipstream'],record:['Rekord okrążenia','Best lap']
};
const read=k=>{try{return localStorage.getItem(k);}catch{return null;}};
const save=(k,v)=>{try{localStorage.setItem(k,v);}catch{}};
const simulation=await loadRace().catch(error=>{
 console.error('Neon Canal:',error);
 return null;
});
const {reset,advance,shoot,LAP}=simulation??{};
const sound=new Sound(simulation?.geometry);
screen.dataset.simulation=simulation?'wasm':'unavailable';
let en=read('neon.lang')!=='pl',mode=simulation?'loading':'unavailable',race=simulation?reset():null,draw,flash='',flashUntil=0,last=0;
let best=Number(read('neon.lap.v7'))||0;const tr=k=>words[k][+en];
sound.setMute(read('neon.mute')==='1');
function time(t){return t.toFixed(1)+' s';}
function updateHUD(){
 $('#position').textContent=tr('position')+' '+race.rank+'/'+(race.rivals.length+1);
 $('#shield').textContent=tr('shield')+' '+race.shield+'/3';
 $('#lap').textContent=tr('lap')+' '+(race.laps+1)+' · '+time(race.elapsed-race.lapStart);
 $('#meter i').style.transform='scaleX('+race.energy/100+')';
 const rocketLabel=tr('rocket')+' · '+race.rockets;
 if($('#rocket').textContent!==rocketLabel)$('#rocket').textContent=rocketLabel;
 $('#speed').textContent=Math.round(race.speed*3.6)+' km/h';
 $('#reserve').textContent=tr('boost')+' '+Math.round(race.energy)+'%';
 $('#wake').textContent=race.overdrive>0?tr('overdrive'):race.launchTime>0?tr('launch'):race.wakeCharge>=1?tr('ready'):race.drafting?tr('draft')+' '+Math.floor(race.wakeCharge*100)+'%':'';
 $('#route').textContent=race.route?tr(['','fork','bridge','channel'][race.route]):'';
 $('#drivehud').classList.toggle('charged',race.wakeCharge>=1||race.launchTime>0||race.overdrive>0);
 $('#flash').textContent=race.lockTime>0?tr('lock'):flash&&race.elapsed<flashUntil?(flash==='lap'?tr('lap')+' '+race.laps+' · '+time(race.lastLap):tr(flash)):'';
 const who=id=>id===0?tr('you'):tr('rival')+' '+id;
 const direction=race.carrierGap>=0?'↑':'↓';
 const objective=race.carrier===0
  ? tr('bank')+' '+race.cargo+' pt · '+(race.gateX<0?'←':'→')+' '+Math.round(race.gateAhead)+' m'+(race.cargo===3?' · '+tr('maxCargo'):'')
  : tr('take')+' ◆'+race.cargo+' · '+who(race.carrier)+' '+direction+' '+Math.round(Math.abs(race.carrierGap))+' m';
 $('#objective').textContent=objective;
 const score=tr('you')+' '+race.score+'/'+race.goal+' · '+tr('bestRival')+' '+race.rivalScore+'/'+race.goal;
 $('#score').textContent=race.winner>=0?(race.winner===0?tr('yourWin'):who(race.winner)+' '+tr('won')):
  ((race.banker>=0?(race.payout?who(race.banker)+' +'+race.payout:race.banker===0?(en?'You lost the core':'Tracisz rdzeń'):who(race.banker)+' '+tr('lostCargo'))+' · ':'')+score);
 updateRadar();
}
const radar=$('#radar');
const dots=Array.from({length:race?race.rivals.length+1:0},(_,i)=>{
 const dot=document.createElement('i');if(!i)dot.className='player';
 radar.append(dot);return dot;
});
function updateRadar(){
 const plot=(dot,x,gap)=>{
  dot.hidden=gap< -23||gap>62;
  if(!dot.hidden){dot.style.left=(50+x*2.3)+'%';dot.style.top=(70-gap*.95)+'%';}
 };
 dots.forEach((dot,i)=>dot.classList.toggle("courier",i===race.carrier));
 plot(dots[0],race.x,0);
 race.rivals.forEach((p,i)=>{const dz=p.z-race.distance;plot(dots[i+1],p.x,dz-LAP*Math.round(dz/LAP));});
}
function panel(){
 labels.forEach(([el,english])=>el.textContent=en?english:el.dataset.pl);
 $('canvas').setAttribute('aria-label',tr('course'));
 for(const dir of ['left','right'])$(`[data-hold="${dir}"]`).setAttribute('aria-label',tr(dir));
 document.documentElement.lang=en?'en':'pl';
 document.title=en?englishTitle:'Neonowy kanał · Silnik 3D od zera';
 $('#lang').textContent=en?'PL':'EN';$('#lang').setAttribute('aria-label',en?'Polski':'English');
 $('#sound').textContent=tr(sound.muted?'muted':'sound');$('#sound').setAttribute('aria-pressed',String(!sound.muted));
 $('#pause').disabled=!['run','paused'].includes(mode);$('#pause').textContent=tr(mode==='paused'?'resume':'pause');
 if(mode==='unavailable'){
  $('#start').hidden=true;$('#sound').disabled=true;
  for(const selector of ['.gesture','.keys'])$(selector).hidden=true;
  $('#info').setAttribute('role','status');
  $('#info').textContent=typeof WebAssembly==='undefined'
   ? (en?'Enable WebAssembly in your browser and reload to race.':'Włącz WebAssembly w przeglądarce i odśwież stronę, aby zagrać.')
   : (en?'Could not load the WebAssembly game. Reload the page to try again.':'Nie udało się wczytać gry WebAssembly. Odśwież stronę, aby spróbować ponownie.');
  return;
 }
 $('.controls').hidden=mode!=='run';
 $('.overlay').hidden=mode==='run';$('.hud').hidden=radar.hidden=$('#drivehud').hidden=['loading','menu'].includes(mode);
 const coarse=matchMedia('(pointer: coarse)').matches;
 let heading='Neon Grand Prix',info=tr('brief'),label=tr(coarse?'tapStart':'start');
 if(best)info+=' '+tr('record')+' '+time(best)+'.';
 if(mode==='loading')label=tr('loading');
 if(mode==='paused'){heading=tr('paused');info+=' '+tr('pitTip');label=tr(coarse?'tapResume':'resumeKey');}
 $('#title').textContent=heading;$('#info').textContent=info;$('#start').setAttribute('aria-label',label);$('#start').title=label;$('#start').disabled=mode==='loading';
 updateHUD();
}
const play=$('.play');
let drag=null, wheelUntil=0, targetX=0;
function clearInput(){
 keys.clear();pointers.clear();buttonKeys.clear();drag=null;wheelUntil=0;
 play.classList.remove('dragging');
 document.querySelectorAll('.held').forEach(b=>b.classList.remove('held'));
}
function pause(){if(mode!=='run')return;mode='paused';play.classList.remove('driving');sound.pause();clearInput();panel();}
function start(){
 if(mode!=='menu'&&mode!=='paused')return;
 if(mode!=='paused'){race=reset();flash='';}
 mode='run';last=performance.now();clearInput();sound.play();panel();
 play.classList.add('driving');play.focus({preventScroll:true});
}
// Keep the native button keyboard-accessible while the whole race view accepts a click or tap.
$('.overlay').onclick=start;
$('#pause').onclick=()=>mode==='run'?pause():start();
$('#lang').onclick=()=>{en=!en;save('neon.lang',en?'en':'pl');panel();};
$('#sound').onclick=()=>{sound.unlock();sound.setMute(!sound.muted);save('neon.mute',sound.muted?'1':'0');panel();};
function cue(k){
 sound.cue(k,race.contactStrength);
 if(k==='blast')k='break';
 if(k==='lap'&&(!best||race.lastLap<best)){best=race.lastLap;save('neon.lap.v7',String(best));}
 if(['pad','hit','break','rail','repair','wreck','lap','rocket'].includes(k)){flash=k==='rocket'?'fired':k;flashUntil=race.elapsed+(k==='lap'?2:.8);}
}
function fire(rocket){
 if(mode!=='run')return;
 if(rocket&&!race.rockets){flash='empty';flashUntil=race.elapsed+.95;}
 else shoot(rocket,cue);
 if(rocket)updateHUD();
}
$('#fire').onclick=()=>fire(false);$('#rocket').onclick=()=>fire(true);
for(const b of document.querySelectorAll('[data-hold]')){
 const action=b.dataset.hold;
 function paint(){b.classList.toggle('held',buttonKeys.has(action)||[...pointers.values()].includes(action));}
 b.onpointerdown=e=>{
  if(mode!=='run'||e.button!==0)return;
  e.preventDefault();b.setPointerCapture(e.pointerId);pointers.set(e.pointerId,action);paint();
 };
 b.onlostpointercapture=e=>{pointers.delete(e.pointerId);paint();};
 b.onkeydown=e=>{if(mode==='run'&&(e.code==='Space'||e.key==='Enter')){e.preventDefault();buttonKeys.add(action);paint();}};
 b.onkeyup=b.onblur=()=>{buttonKeys.delete(action);paint();};
}
// A full-width gesture spans the track. Keep a short drag proportional on larger displays.
const laneScale=()=>36/Math.min(560,play.clientWidth*.8);
const lane=x=>Math.max(-18,Math.min(18,x));
play.onpointerdown=e=>{
 if(mode!=='run'||drag||e.button!==0)return;
 play.setPointerCapture(e.pointerId);
 drag={id:e.pointerId,start:e.clientX,lane:race.x};targetX=race.x;wheelUntil=0;
 play.classList.add('dragging');
};
play.onpointermove=e=>{
 if(drag?.id===e.pointerId)targetX=lane(drag.lane+(e.clientX-drag.start)*laneScale());
};
play.onlostpointercapture=e=>{
 if(drag?.id===e.pointerId){drag=null;play.classList.remove('dragging');}
};
play.addEventListener('wheel',e=>{
 if(mode!=='run'||e.ctrlKey||drag||!e.deltaX||Math.abs(e.deltaX)<Math.abs(e.deltaY))return;
 e.preventDefault();
 const now=performance.now(),unit=e.deltaMode===1?16:e.deltaMode===2?play.clientWidth:1;
 targetX=lane((now<wheelUntil?targetX:race.x)+e.deltaX*unit*laneScale());wheelUntil=now+550;
},{passive:false});
const map={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'boost',KeyW:'boost',ArrowDown:'brake',KeyS:'brake',Space:'fire'};
window.addEventListener('keydown',e=>{
 if(e.defaultPrevented||e.altKey||e.metaKey||e.ctrlKey)return;
 if(e.code==='KeyP'||e.code==='Escape'){if(!e.repeat){if(mode==='run')pause();else if(mode==='paused')start();}return;}
 if(e.code==='Space'){
  if(e.target.closest('button,a')&&e.target!==$('#start'))return;
  if(mode==='menu'||mode==='paused'){e.preventDefault();if(!e.repeat)start();return;}
  if(e.repeat&&!keys.has('Space'))return;
 }
 if(mode!=='run')return;
 if(map[e.code]){e.preventDefault();keys.add(e.code);}
 if(e.code==='KeyR'&&!e.repeat)fire(true);
});
window.addEventListener('keyup',e=>keys.delete(e.code));
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
window.addEventListener('blur',pause);
const held=k=>buttonKeys.has(k)||[...pointers.values()].includes(k)||[...keys].some(code=>map[code]===k);
let nextHud=0,frameCount=0,windowStart=0;
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let previewTime=0,lastPreview=0;
function tick(now){
 const dt=Math.min(.25,Math.max(0,(now-last)/1000));last=now;
 if(mode==='run'){
  let steer=Number(held('right'))-Number(held('left'));
  if(!steer&&(drag||now<wheelUntil)){
   const delta=targetX-race.x;
   if(Math.abs(delta)>.65)steer=Math.sign(delta);
  }
  const input={steer,boost:held('boost'),brake:held('brake')};
  advance(dt,input,held('fire'),cue);
  sound.tick(race.thrust);draw(race);
  if(now>=nextHud){updateHUD();nextHud=now+75;}
  if(!windowStart)windowStart=now;
  frameCount++;
  if(now-windowStart>=850){
   const ms=(now-windowStart)/frameCount;
   engine.sampleFrameTime(ms);
   frameCount=0;windowStart=now;
  }
 }else{
  windowStart=0;frameCount=0;
  if(mode==='menu'&&!document.hidden){
   if(reducedMotion.matches){
    if(previewTime){draw(race);previewTime=0;}
    lastPreview=0;
   }else if(now-lastPreview>=50){
    previewTime+=lastPreview?Math.min(.1,(now-lastPreview)/1000):0;
    lastPreview=now;
    draw({...race,elapsed:previewTime,previewPan:.65*Math.sin(previewTime*.32)});
   }
  }
 }
 requestAnimationFrame(tick);
}
panel();
let engine;
if(simulation){
 engine=await renderer(canvas,simulation);draw=engine.draw;screen.dataset.renderer=engine.backend;
draw(race);screen.classList.add('ready');mode='menu';panel();requestAnimationFrame(tick);
}
