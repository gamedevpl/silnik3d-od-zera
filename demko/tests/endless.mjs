// Replay inputs against checkpoints produced by an independent native C++ replay of the current race rules.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadRace} from '../../docs/demko/race.js';

const binary=readFileSync(new URL('../../docs/demko/flight.wasm',import.meta.url));
test('the WebAssembly build matches a five-lap native race replay',async()=>{
  assert(WebAssembly.validate(binary));
  const sim=await loadRace(binary),s=sim.reset(),counts={};
  const cue=k=>counts[k]=(counts[k]||0)+1;
  const checkpoints=[[1483.503982738,1,7],[2990.305071503,2,3],[4373.242196685,3,6],[5794.088355658,5,6]];
  for(let i=0;i<10800;i++){
   if(i%821===0)sim.shoot(true,cue);
   sim.advance(1/90,{steer:Math.floor(i/57)%3-1,boost:i%890<570,brake:i%341<19},i%4===0,cue);
   if((i+1)%2700===0){
    const [distance,lap,rank]=checkpoints[(i+1)/2700-1];
    assert(Math.abs(s.distance-distance)<.0001);
    assert.equal(s.laps,lap);assert.equal(s.rank,rank);
    for(const [x,z,kind] of sim.visible().filter(o=>o[2]>=6&&o[2]<12)){
     const rival=s.rivals[kind-6],gap=rival.z-s.distance;
     assert(Math.abs(rival.x-x)<.0001);
     assert(Math.abs(z-(s.distance%sim.LAP+gap-sim.LAP*Math.round(gap/sim.LAP)))<.0001);
    }
   }
  }
  assert(Math.abs(s.lastLap-24.016607466)<.0001);
  assert.equal(s.rockets,0);assert.equal(s.shield,3);
  assert.deepEqual(counts,{rocket:7,fire:491,break:102,hit:25,repair:10,pad:11,rail:35,lap:5,launch:4,wreck:10});
  assert.equal(sim.reset().distance,0);
 });

test('an invalid WebAssembly module fails to load',async()=>{
 await assert.rejects(loadRace(new Uint8Array()),WebAssembly.CompileError);
});

test('leaving a charged wake with boost releases one slingshot',async()=>{
 const sim=await loadRace(binary),s=sim.reset(),events=[];
 const step=(steer,boost,frames)=>{for(let i=0;i<frames;i++)sim.advance(1/90,{steer,boost,brake:false},false,e=>events.push(e));};
 step(0,false,135);assert.equal(s.wakeCharge,1);
 step(0,true,30);assert.equal(s.launchTime,0);
 step(-1,true,32);assert(s.launchTime>0);assert.equal(s.wakeCharge,0);
 assert.equal(events.filter(e=>e==='launch').length,1);
});
