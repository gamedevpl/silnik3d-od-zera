// Run with node --test demko/tests/endless.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import {LAP,newRace,advance,shoot,visible} from '../../docs/demko/race.js';

const coast={steer:0,boost:false,brake:false};
const quiet=()=>{};
test('the lap seam preserves a rival ahead and keeps the course bounded',()=>{
 const s=newRace();
 for(let i=0;i<60*95;i++)advance(s,1/60,coast,quiet);
 assert(s.laps>=3);
 assert(s.sectors.length<6);
 const p=s.rivals[0];p.z=s.distance+13;
 const rendered=visible(s).find(o=>o[2]===6);
 assert(Math.abs(rendered[1]-(s.distance%LAP+13))<1e-7);
 assert(s.lastLap>0);
});
test('a shot slows a rival and depleted shields recover during the race',()=>{
 const s=newRace(),p=s.rivals[0];p.x=s.x;p.z=9;
 shoot(s,false,quiet);
 for(let i=0;i<9;i++)advance(s,1/60,coast,quiet);
 assert(p.stun>0);
 p.x=s.x;p.z=s.distance;s.immunity=0;s.shield=1;
 const events=[];advance(s,1/90,coast,k=>events.push(k));
 assert(events.includes('repair'));assert.equal(s.shield,3);
 const at=s.distance;advance(s,1/60,coast,quiet);assert(s.distance>at);
});
