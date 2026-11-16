// The film score loops independently of the engine, weapons and race cues.
export class Sound{
 constructor(bank){this.bank=bank;this.clips=[];this.muted=false;this.running=false;this.musicOffset=0;}
 unlock(){
  try{
   if(!this.ctx){
    const Context=window.AudioContext||window.webkitAudioContext;this.ctx=new Context();
    const c=this.ctx;this.volume=c.createGain();this.volume.gain.value=this.muted?0:.48;
    const limiter=c.createDynamicsCompressor();this.volume.connect(limiter);limiter.connect(c.destination);
    this.driveBus=c.createGain();this.driveBus.connect(this.volume);
   }
   if(this.ctx.state!=='running')this.ctx.resume().catch(()=>{});
  }catch{return;}
 }
 setMute(on){this.muted=on;if(this.ctx)this.volume.gain.setTargetAtTime(on?0:.48,this.ctx.currentTime,.012);}
 async loadScore(){
  if(!this.scoreLoad){
   this.scoreLoad=(async()=>{
    const response=await fetch('vibe-score.mp3');
    if(!response.ok)throw Error('Score '+response.status);
    this.score=await this.ctx.decodeAudioData(await response.arrayBuffer());
   })().catch(error=>{this.scoreLoad=null;console.warn(error);});
  }
  await this.scoreLoad;
  if(!this.running||!this.score||this.music)return;
  const source=this.ctx.createBufferSource();source.buffer=this.score;
  source.loop=true;source.loopStart=16;source.loopEnd=Math.min(48,this.score.duration);
  const level=this.ctx.createGain();level.gain.value=.78;
  source.connect(level).connect(this.volume);
  source.onended=()=>{source.disconnect();level.disconnect();};
  this.music=source;this.musicSince=this.ctx.currentTime;source.start(0,this.musicOffset);
 }
 play(){this.unlock();this.running=true;if(this.ctx){this.loadScore();this.startDrive();}}
 pause(){
  this.running=false;
  if(!this.ctx)return;
  if(this.music){
   this.musicOffset+=this.ctx.currentTime-this.musicSince;
   const end=this.music.loopEnd;
   if(this.musicOffset>=end)this.musicOffset=16+(this.musicOffset-end)%(end-16);
   this.music.stop();this.music=null;
  }
  if(this.layers){
   this.driveBus.gain.setTargetAtTime(0,this.ctx.currentTime,.008);
   for(const layer of this.layers)layer.src.stop(this.ctx.currentTime+.04);
   this.layers=null;
  }
  this.transition?.stop();this.transition=null;this.boosting=false;
 }
 clip(id){
  if(this.clips[id])return this.clips[id];
  const ptr=this.bank.soundClip(id),n=this.bank.soundLength(id);
  const b=this.ctx.createBuffer(1,n,this.bank.soundRate());
  b.copyToChannel(new Float32Array(this.bank.memory.buffer,ptr,n),0);
  this.clips[id]=b;return b;
 }
 async startDrive(){
  if(!this.driveLoad){
   this.driveLoad=fetch('ion-drive.flac').then(response=>{
    if(!response.ok)throw Error('Drive '+response.status);
    return response.arrayBuffer();
   }).then(bytes=>this.ctx.decodeAudioData(bytes)).catch(error=>{this.driveLoad=null;console.warn(error);return null;});
  }
  this.drive=await this.driveLoad;
  if(!this.running||!this.drive||this.layers)return;
  const now=this.ctx.currentTime;
  this.driveBus.gain.cancelScheduledValues(now);this.driveBus.gain.setValueAtTime(1,now);
  this.layers=[0,4].map((start)=>{
   const src=this.ctx.createBufferSource(),gain=this.ctx.createGain();
   src.buffer=this.drive;src.loop=true;src.loopStart=start;src.loopEnd=start+4;
   gain.gain.value=0;src.connect(gain).connect(this.driveBus);
   src.onended=()=>{src.disconnect();gain.disconnect();};src.start(now,start);
   return {src,gain};
  });
 }
 driveAccent(boost){
  this.transition?.stop();
  const src=this.ctx.createBufferSource(),gain=this.ctx.createGain();
  src.buffer=this.drive;gain.gain.value=boost?.63:.47;src.connect(gain).connect(this.driveBus);
  src.onended=()=>{src.disconnect();gain.disconnect();if(this.transition===src)this.transition=null;};
  this.transition=src;src.start(0,boost?8:8.95,boost?.95:1.10);
 }
 tick(speed,thrust){
  if(!this.running||!this.layers||this.ctx.state!=='running')return;
  const flow=Math.min(1.25,speed/82),now=this.ctx.currentTime;
  const [field,beam]=this.layers;
  field.src.playbackRate.setTargetAtTime(.92+.14*flow,now,.24);
  beam.src.playbackRate.setTargetAtTime(.90+.13*flow+.09*thrust,now,.20);
  field.gain.gain.setTargetAtTime(.63-.39*thrust,now,.10);
  beam.gain.gain.setTargetAtTime(.72*thrust*thrust,now,.11);
  if(!this.boosting && thrust>.43){this.boosting=true;this.driveAccent(true);}
  else if(this.boosting && thrust<.20){this.boosting=false;this.driveAccent(false);}
 }
 cue(event,strength=.5){
  const id=['fire','rocket','break','hit','pad','rail','repair','lap','launch','wreck'].indexOf(event);
  if(id<0||!this.ctx||this.muted||!this.running)return;
  const src=this.ctx.createBufferSource(),gain=this.ctx.createGain();
  src.buffer=this.clip(id);
  gain.gain.value=id===0?.42:id===5?.22+.32*strength:id===3?.36+.55*strength:.72;
  src.connect(gain).connect(this.volume);src.onended=()=>{src.disconnect();gain.disconnect();};src.start();
 }
}
