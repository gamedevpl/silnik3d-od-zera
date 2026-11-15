// Replay inputs against checkpoints captured before migrating the web simulation to C++.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadRace} from '../../docs/demko/race.js';

const binary=readFileSync(new URL('../../docs/demko/flight.wasm',import.meta.url));
for(const [name,bytes] of [['WebAssembly',binary],['compatibility build',new Uint8Array()]]){
 test(name+' reproduces five laps of the original browser race',async()=>{
  if(name==='WebAssembly') assert(WebAssembly.validate(bytes));
  const sim=await loadRace(bytes),s=sim.reset(),counts={};
  assert.equal(sim.backend,name==='WebAssembly'?'wasm':'compat');
  const cue=k=>counts[k]=(counts[k]||0)+1;
  const checkpoints=[[1451.179305,1,6],[2888.378654,2,4],[4362.021990,3,6],[5791.485178,5,4]];
  for(let i=0;i<10800;i++){
   if(i%821===0)sim.shoot(true,cue);
   sim.advance(1/90,{steer:Math.floor(i/57)%3-1,boost:i%890<570,brake:i%341<19},i%4===0,cue);
   if((i+1)%2700===0){
    const [distance,lap,rank]=checkpoints[(i+1)/2700-1];
    assert(Math.abs(s.distance-distance)<.0001);
    assert.equal(s.laps,lap);assert.equal(s.rank,rank);
    for(const [x,z,kind] of sim.visible().filter(o=>o[2]>=6)){
     const rival=s.rivals[kind-6],gap=rival.z-s.distance;
     assert(Math.abs(rival.x-x)<.0001);
     assert(Math.abs(z-(s.distance%sim.LAP+gap-sim.LAP*Math.round(gap/sim.LAP)))<.0001);
    }
   }
  }
  assert(Math.abs(s.lastLap-23.960288)<.0001);
  assert.equal(s.rockets,1);assert.equal(s.shield,3);
  assert.deepEqual(counts,{rocket:6,fire:540,break:152,hit:20,repair:8,pad:10,rail:6,lap:5});
  assert.equal(sim.reset().distance,0);
 });
}
