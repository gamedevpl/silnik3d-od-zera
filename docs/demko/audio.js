// The film score loops independently of the engine, weapons and race cues.
export class Sound{
 constructor(){this.muted=false;this.running=false;this.musicOffset=0;}
 unlock(){
  try{
   if(!this.ctx){
    const Context=window.AudioContext||window.webkitAudioContext;this.ctx=new Context();
    const c=this.ctx;this.volume=c.createGain();this.volume.gain.value=this.muted?0:.48;
    const limiter=c.createDynamicsCompressor();this.volume.connect(limiter);limiter.connect(c.destination);
    this.motor=c.createOscillator();this.motor.type='sawtooth';this.motor.frequency.value=50;
    this.filter=c.createBiquadFilter();this.filter.frequency.value=180;
    this.motorGain=c.createGain();this.motorGain.gain.value=0;
    this.motor.connect(this.filter).connect(this.motorGain).connect(this.volume);this.motor.start();
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
  this.motorGain.gain.setTargetAtTime(0,this.ctx.currentTime,.025);
 }
 tone(freq,end,duration,gain,type,when){
  if(!this.ctx||this.muted)return;
  const c=this.ctx,t=when??c.currentTime,o=c.createOscillator(),env=c.createGain();
  o.type=type;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(end,t+duration);
  env.gain.setValueAtTime(.0001,t);env.gain.exponentialRampToValueAtTime(gain,t+.007);
  env.gain.exponentialRampToValueAtTime(.0001,t+duration);
  o.connect(env).connect(this.volume);o.onended=()=>{o.disconnect();env.disconnect();};
  o.start(t);o.stop(t+duration+.01);
 }
 tick(thrust){
  if(!this.running||!this.ctx||this.ctx.state!=='running')return;
  const now=this.ctx.currentTime;
  this.motor.frequency.setTargetAtTime(48+52*thrust,now,.07);this.filter.frequency.setTargetAtTime(140+400*thrust,now,.09);
  this.motorGain.gain.setTargetAtTime(.049+.028*thrust,now,.09);

 }
 cue(event){
  const cues={launch:[240,1060,.44,.24,'triangle'],fire:[680,150,.115,.24,'triangle'],rocket:[135,650,.36,.19,'sawtooth'],
   break:[210,39,.28,.32,'sawtooth'],hit:[120,34,.36,.40,'square'],
   pad:[640,1180,.17,.22,'sine'],miss:[180,128,.12,.14,'triangle'],
   lap:[440,880,.36,.19,'triangle'],repair:[160,46,.32,.20,'sawtooth'],rail:[160,95,.09,.11,'triangle']};
  if(cues[event])this.tone(...cues[event]);
 }
}
