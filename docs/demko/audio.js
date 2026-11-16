// The film score loops independently of the engine, weapons and race cues.
export class Sound{
 constructor(bank){this.bank=bank;this.clips=[];this.muted=false;this.running=false;this.musicOffset=0;}
 unlock(){
  try{
   if(!this.ctx){
    const Context=window.AudioContext||window.webkitAudioContext;this.ctx=new Context();
    const c=this.ctx;this.volume=c.createGain();this.volume.gain.value=this.muted?0:.48;
    const limiter=c.createDynamicsCompressor();this.volume.connect(limiter);limiter.connect(c.destination);
    this.motor=this.loop(10);this.wind=this.loop(11);
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
 play(){this.unlock();this.running=true;if(this.ctx)this.loadScore();}
 pause(){
  this.running=false;
  if(!this.ctx)return;
  if(this.music){
   this.musicOffset+=this.ctx.currentTime-this.musicSince;
   const end=this.music.loopEnd;
   if(this.musicOffset>=end)this.musicOffset=16+(this.musicOffset-end)%(end-16);
   this.music.stop();this.music=null;
  }
  for(const layer of [this.motor,this.wind])layer.gain.gain.setTargetAtTime(0,this.ctx.currentTime,.025);
 }
 clip(id){
  if(this.clips[id])return this.clips[id];
  const ptr=this.bank.soundClip(id),n=this.bank.soundLength(id);
  const b=this.ctx.createBuffer(1,n,this.bank.soundRate());
  b.copyToChannel(new Float32Array(this.bank.memory.buffer,ptr,n),0);
  this.clips[id]=b;return b;
 }
 loop(id){
  const src=this.ctx.createBufferSource(),gain=this.ctx.createGain();
  src.buffer=this.clip(id);src.loop=true;gain.gain.value=0;
  src.connect(gain).connect(this.volume);src.start();return {src,gain};
 }
 tick(speed,thrust){
  if(!this.running||!this.ctx||this.ctx.state!=='running')return;
  const flow=Math.min(1.25,speed/82),now=this.ctx.currentTime;
  this.motor.src.playbackRate.setTargetAtTime(.63+.83*flow+.17*thrust,now,.08);
  this.wind.src.playbackRate.setTargetAtTime(.68+.55*flow,now,.11);
  this.motor.gain.gain.setTargetAtTime(.12+.13*thrust,now,.09);
  this.wind.gain.gain.setTargetAtTime(.016+.19*flow*flow,now,.11);
 }
 cue(event){
  const id=['fire','rocket','break','hit','pad','rail','repair','lap','launch','wreck'].indexOf(event);
  if(id<0||!this.ctx||this.muted||!this.running)return;
  const src=this.ctx.createBufferSource(),gain=this.ctx.createGain();
  src.buffer=this.clip(id);gain.gain.value=id===0?.42:id===5?.39:.72;
  src.connect(gain).connect(this.volume);src.onended=()=>{src.disconnect();gain.disconnect();};src.start();
 }
}
