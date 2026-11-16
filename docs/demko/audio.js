// The film score loops independently of the engine, weapons and race cues.
export class Sound{
 constructor(bank){this.bank=bank;this.clips=[];this.muted=false;this.running=false;this.musicOffset=0;}
 unlock(){
  try{
   if(!this.ctx){
    const Context=window.AudioContext||window.webkitAudioContext;this.ctx=new Context();
    const c=this.ctx;this.volume=c.createGain();this.volume.gain.value=this.muted?0:.48;
    const limiter=c.createDynamicsCompressor();this.volume.connect(limiter);limiter.connect(c.destination);
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
  this.musicLevel=level;this.music=source;this.musicSince=this.ctx.currentTime;source.start(0,this.musicOffset);
 }
 play(){this.unlock();this.running=true;if(this.ctx){this.loadScore();this.startDrive();}}
 pause(){
  this.running=false;
  if(!this.ctx)return;
  if(this.music){
   this.musicOffset+=this.ctx.currentTime-this.musicSince;
   const end=this.music.loopEnd;
   if(this.musicOffset>=end)this.musicOffset=16+(this.musicOffset-end)%(end-16);
   this.music.stop();this.music=null;this.musicLevel=null;
  }
  if(this.driveVoice){
   const {field,fade}=this.driveVoice,now=this.ctx.currentTime;
   fade.gain.cancelScheduledValues(now);
   fade.gain.setTargetAtTime(0,now,.006);
   field.stop(now+.04);this.driveVoice=null;
  }
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
  const buffer=await this.driveLoad;
  if(!this.running||!buffer||this.driveVoice)return;
  const c=this.ctx,now=c.currentTime;
  const field=c.createBufferSource(),fade=c.createGain(),tone=c.createBiquadFilter();
  field.buffer=buffer;field.loop=true;field.loopEnd=4;
  tone.type='highshelf';tone.frequency.value=800;
  field.connect(tone).connect(fade).connect(this.volume);
  fade.gain.setValueAtTime(0,now);fade.gain.setTargetAtTime(.63,now,.012);
  field.onended=()=>{field.disconnect();tone.disconnect();fade.disconnect();};
  this.driveVoice={field,tone,fade};
  field.start(now);
 }
 tick(thrust){
  if(!this.running||!this.driveVoice)return;
  const {field,tone}=this.driveVoice,now=this.ctx.currentTime;
  this.musicLevel?.gain.setTargetAtTime(.78-.27*thrust,now,.10);
  // The flutter is in the recording. Advance the recording itself under thrust.
  field.playbackRate.setTargetAtTime(1+1.1*thrust,now,.65);
  tone.gain.setTargetAtTime(-5*thrust,now,.18);
 }
 cue(event,strength=.5){
  const id=['fire','rocket','break','hit','pad','rail','repair','lap','launch','wreck','blast','ricochet'].indexOf(event);
  if(id<0||!this.ctx||this.muted||!this.running)return;
  const src=this.ctx.createBufferSource(),gain=this.ctx.createGain();
  src.buffer=this.clip(id);
  gain.gain.value=id===0?.42:id===11?.27:id===5?.22+.32*strength:id===3?.36+.55*strength:.72;
  src.connect(gain).connect(this.volume);src.onended=()=>{src.disconnect();gain.disconnect();};src.start();
 }
}
