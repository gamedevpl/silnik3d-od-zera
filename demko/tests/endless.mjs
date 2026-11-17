// Replay inputs against checkpoints produced by an independent native C++ replay (-ffp-contract=off) of the current race rules.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {loadRace} from '../../docs/demko/race.js';

const binary=readFileSync(new URL('../../docs/demko/flight.wasm',import.meta.url));
test('the WebAssembly build matches a seven-lap native race replay',async()=>{
  assert(WebAssembly.validate(binary));
  const sim=await loadRace(binary),s=sim.reset(),counts={};
  const cue=k=>counts[k]=(counts[k]||0)+1;
  const checkpoints=[[4276.212201,1,6],[8456.882666,3,6],[12690.598963,5,7],[16891.205986,7,6]];
  for(let i=0;i<22320;i++){
   const lanes=s.rivals.map(p=>p.x);
   if(i%821===0)sim.shoot(true,cue);
   sim.advance(1/90,{steer:Math.floor(i/57)%3-1,boost:i%890<570,brake:i%341<19},i%4===0,cue);
   assert(s.rivals.every((p,j)=>Math.abs(p.x-lanes[j])<.6), "rival jumped sideways in one tick");
   if((i+1)%5580===0){
    const [distance,lap,rank]=checkpoints[(i+1)/5580-1];
    assert(Math.abs(s.distance-distance)<.0001);
    assert.equal(s.laps,lap);assert.equal(s.rank,rank);
    for(const [x,z,kind] of sim.visible().filter(o=>o[2]>=6&&o[2]<12)){
     const rival=s.rivals[kind-6],gap=rival.z-s.distance;
     assert(Math.abs(rival.x-x)<.0001);
     assert(Math.abs(z-(s.distance%sim.LAP+gap-sim.LAP*Math.round(gap/sim.LAP)))<.0001);
    }
   }
  }
  assert(Math.abs(s.lastLap-34.435832555)<.0001);
  assert.equal(s.rockets,1);assert.equal(s.shield,3);
  assert.deepEqual(counts,{fire:1040,rocket:11,break:113,hit:45,pad:20,rail:46,repair:16,lap:7,launch:2,wreck:16,blast:5,ricochet:602,lock:72,overdrive:4,coreGain:8,coreLost:7,coreBank:2});
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

test('boost produces luminous ion gas and a separate bounded refraction pass',async()=>{
 const sim=await loadRace(binary),s=sim.reset(),gpu=sim.geometry;
 for(let i=0;i<25;i++)sim.advance(1/90,{steer:0,boost:true,brake:false},false,()=>{});
 const n=gpu.raceActors(s.elapsed),puffs=gpu.particleStart(),heat=gpu.heatStart();
 assert(puffs+6<heat && heat<n);
 const data=new Uint8Array(gpu.memory.buffer,gpu.vertices(),n*16);
 const materials=(from,to)=>Array.from({length:to-from},(_,i)=>data[(from+i)*16+15]);
 assert(materials(puffs,puffs+6).every(m=>m===53));
 assert(materials(puffs+6,heat).some(m=>m>=208));
 assert(materials(heat,n).every(m=>m===55 || m===56));
 assert.equal((n-heat)%6,0);
});

test('a courier can steal and win a heat using normal controls',async()=>{
 const sim=await loadRace(binary),s=sim.reset();
 let prevX=s.x,won=false,captured=false,banked=false;
 const cue=id=>{captured ||=id==='coreGain';banked ||=id==='coreBank';};
 for(let tick=0;tick<21600&&!won;tick++){
  const vx=(s.x-prevX)*90;prevX=s.x;
  const carrying=s.carrier===0;
  let target=carrying?s.gateX:s.rivals[s.carrier-1].x;
  const z=s.distance%sim.LAP;
  if(carrying && s.gateAhead>200){
   if(z>1370 && z<1548)target=-7;
   if(z>1790 && z<1968)target=7;
  }
  if(s.route===2 && target>0)target=-10;
  if(s.route===3 && target<0)target=10;
  const error=target-s.x-.15*vx;
  if(tick%60===0)sim.shoot(true,cue);
  sim.advance(1/90,{steer:Number(error>.35)-Number(error<-.35),
   boost:carrying||s.carrierGap>0,brake:!carrying&&s.carrierGap< -4},true,cue);
  won=s.winner===0;
 }
 assert(captured&&banked&&won);
 assert.equal(s.score,0);
 assert(s.laps>0);
});
