// Browser bindings for the C++ race, track and draw commands in flight.wasm.
export async function loadRace(bytes) {
 if(typeof WebAssembly==='undefined')throw Error('WebAssembly disabled');
 if(bytes===undefined){
  const response=await fetch(new URL('./flight.wasm?v=bridge1',import.meta.url));
  if(!response.ok)throw Error('flight.wasm HTTP '+response.status);
  bytes=await response.arrayBuffer();
 }
 // The reactor needs neither files nor the host clock. Return WASI BADF / NOSYS.
 const wasi={fd_close:()=>8,fd_seek:()=>8,fd_write:()=>8,clock_time_get:()=>52};
 const {instance}=await WebAssembly.instantiate(bytes,{wasi_snapshot_preview1:wasi});
 const core=instance.exports;
 core._initialize();
 const events=['fire','rocket','break','hit','pad','rail','repair','lap','launch'];
 const fields=['distance','elapsed','x','lean','thrust','energy','rank','shield','laps','lapStart','lastLap','rockets','drafting'];
 const race={rivals:[]};
 function sync(notify) {
  const address=core.raceState(), data=new Float64Array(core.memory.buffer,address);
  fields.forEach((key,i)=>race[key]=data[i]);
  const count=data[fields.length];
  for(let i=0;i<count;i++){
   const pilot=race.rivals[i]??={};
   pilot.x=data[fields.length+1+2*i];pilot.z=data[fields.length+2+2*i];
  }
  const extras=fields.length+1+2*count;
  race.wakeCharge=data[extras];race.launchTime=data[extras+1];race.speed=data[extras+2];race.lock=data[extras+3];race.deck=data[extras+4];race.route=data[extras+5];
  const n=core.raceCueCount();
  for(let i=0;i<n;i++)notify(events[core.raceCue(i)]);
  core.raceClearCues();
 }
 function reset(){core.raceReset();sync();return race;}
 function advance(dt,input,fire,notify){core.raceAdvance(dt,input.steer,input.boost,input.brake,fire);sync(notify);}
 function shoot(rocket,notify){core.raceShoot(rocket);sync(notify);}
 function visible(){
  const n=core.raceVisible(),address=core.raceObjects(),data=new Float32Array(core.memory.buffer,address,4*n);
  return Array.from({length:n},(_,i)=>data.subarray(i*4,i*4+4));
 }
 return {geometry:core,reset,advance,shoot,visible,road:core.roadX,slope:core.roadSlopeAt,LAP:core.lapLength()};
}
