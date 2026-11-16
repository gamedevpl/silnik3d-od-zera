// Replay inputs against checkpoints produced by an independent native C++ replay of the current race rules.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadRace} from '../../docs/demko/race.js';

const binary=readFileSync(new URL('../../docs/demko/flight.wasm',import.meta.url));
test('the WebAssembly build matches a seven-lap native race replay',async()=>{
  assert(WebAssembly.validate(binary));
  const sim=await loadRace(binary),s=sim.reset(),counts={};
  const cue=k=>counts[k]=(counts[k]||0)+1;
  const checkpoints=[[2067.188920943,1,5],[3977.055279064,3,7],[6130.510165690,5,3],[8353.421707133,7,3]];
  for(let i=0;i<11160;i++){
   if(i%821===0)sim.shoot(true,cue);
   sim.advance(1/90,{steer:Math.floor(i/57)%3-1,boost:i%890<570,brake:i%341<19},i%4===0,cue);
   if((i+1)%2790===0){
    const [distance,lap,rank]=checkpoints[(i+1)/2790-1];
    assert(Math.abs(s.distance-distance)<.0001);
    assert.equal(s.laps,lap);assert.equal(s.rank,rank);
    for(const [x,z,kind] of sim.visible().filter(o=>o[2]>=6&&o[2]<12)){
     const rival=s.rivals[kind-6],gap=rival.z-s.distance;
     assert(Math.abs(rival.x-x)<.0001);
     assert(Math.abs(z-(s.distance%sim.LAP+gap-sim.LAP*Math.round(gap/sim.LAP)))<.0001);
    }
   }
  }
  assert(Math.abs(s.lastLap-16.500868313)<.0001);
  assert.equal(s.rockets,0);assert.equal(s.shield,0);
  assert.deepEqual(counts,{fire:519,rocket:6,break:66,hit:25,pad:9,rail:44,repair:8,lap:7,launch:3,wreck:9,blast:2,ricochet:350});
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

test('damaged ships emit depth-tested bounds with three-dimensional gas coordinates',async()=>{
 const sim=await loadRace(binary),race=sim.reset(),gpu=sim.geometry;
 for(let i=0;i<2200;i++){
  sim.advance(1/90,{steer:Math.floor(i/57)%3-1,boost:false,brake:false},false,()=>{});
  if(race.shield>=3)continue;
  const n=gpu.raceActors(race.elapsed),first=gpu.particleStart();
  const data=new Uint8Array(gpu.memory.buffer,gpu.vertices()+first*16,(n-first)*16);
  const corners=new Set();
  for(let j=12;j<data.length;j+=16)if(data[j+3]>=80)
   corners.add(data[j]+','+data[j+1]+','+data[j+2]);
  if(corners.size>=6)return;
 }
 assert.fail('no three-dimensional damage plume in replay');
});

test('cannon follows the sight ray and rocket holds its launch lane',async()=>{
 const sim=await loadRace(binary);
 for(const rocket of [false,true]){
  sim.reset();
  for(let i=0;i<30;i++)sim.advance(1/90,{steer:1,boost:true,brake:false},false,()=>{});
  const sight=Array.from(sim.visible().find(o=>o[2]===13));
  sim.shoot(rocket,()=>{});
  const kind=rocket?3:2;
  const [x,z,,y,yaw,pitch]=sim.visible().find(o=>o[2]===kind);
  const world=x+sim.road(z);
  if(!rocket){
   assert(Math.abs(sight[0]+sim.road(sight[1])-world-(sight[1]-z)*yaw)<.0001);
  assert(Math.abs(sight[3]-y-(sight[1]-z)*pitch)<.0001);
  }
  sim.advance(.035,{steer:-1,boost:false,brake:false},false,()=>{});
  const next=sim.visible().find(o=>o[2]===kind);
  if(rocket)assert(Math.abs(next[0]-x)<.0001);
  else assert(Math.abs(next[0]+sim.road(next[1])-world-(next[1]-z)*yaw)<.0001);
 }
});
