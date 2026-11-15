// All instruments and cues are synthesized locally. Audio starts in the race button gesture.
export class Sound{
 constructor(){this.muted=false;this.running=false;this.step=0;}
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
 play(){this.unlock();this.running=true;this.step=0;if(this.ctx)this.next=this.ctx.currentTime+.025;}
 pause(){this.running=false;if(this.ctx)this.motorGain.gain.setTargetAtTime(0,this.ctx.currentTime,.025);}
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
  if(this.next<now-.12)this.next=now+.015;
  while(this.next<now+.09){
   const t=this.next,k=this.step++,base=[130.81,103.83,116.54,155.56][Math.floor(k/16)%4];
   if(k%4===0)this.tone(125,43,.19,.45,'sine',t);
   if(k%4===2)this.tone(base/2,base/2,.12,.16,'triangle',t);
   const f=base*[1,1.5,2,2.38,1.5,1.78,2,1.5][k%8];
   this.tone(f,f,.083,.066,'sawtooth',t);this.next+=.10;
  }
 }
 cue(event){
  const cues={fire:[680,150,.115,.24,'triangle'],rocket:[135,650,.36,.19,'sawtooth'],
   break:[210,39,.28,.32,'sawtooth'],hit:[120,34,.36,.40,'square'],
   gate:[640,1180,.17,.22,'sine'],miss:[180,128,.12,.14,'triangle'],
   win:[440,880,.6,.25,'triangle'],crash:[180,39,.51,.24,'sawtooth'],short:[270,135,.46,.22,'triangle']};
  if(cues[event])this.tone(...cues[event]);
 }
}
