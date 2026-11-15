// Both backends expose the ABI in demko/web_race.cpp and come from the same C++ build.
import * as wasi from './wasi.js';
export async function loadRace(bytes) {
 let core,backend;
 try {
  if(typeof WebAssembly==='undefined')throw Error('WebAssembly disabled');
  let binary=bytes;
  if(!binary){
   const response=await fetch(new URL('./flight.wasm?v=core1',import.meta.url));
   if(!response.ok)throw Error('HTTP '+response.status);
   binary=await response.arrayBuffer();
  }
  core=(await WebAssembly.instantiate(binary,{wasi_snapshot_preview1:wasi})).instance.exports;
  backend='wasm';
 } catch(error) {
  console.warn('Race WebAssembly unavailable, using compatibility build:',error.message);
  backend='compat';
  core=await import('./race-compat.generated.js?v=core1');
 }
 core._initialize();
 const events=['fire','rocket','break','hit','pad','rail','repair','lap'];
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
 return {backend,geometry:backend==='wasm'?core:null,reset,advance,shoot,visible,road:core.roadX,slope:core.roadSlopeAt,LAP:core.lapLength()};
}
