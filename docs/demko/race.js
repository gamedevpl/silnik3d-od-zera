// Longitudinal distances measure race order. Rendering uses a lap-local origin.
export const LAP=1152, EDGE=18, GRID=7;
const tau=2*Math.PI;
export function road(z){const a=tau*z/LAP;return 17*Math.sin(3*a)+10*Math.sin(2*a+.8)+4*Math.sin(6*a-.6);}
export function slope(z){const a=tau*z/LAP;return tau/LAP*(51*Math.cos(3*a)+20*Math.cos(2*a+.8)+24*Math.cos(6*a-.6));}
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const separation=(a,b)=>{const d=a-b;return d-LAP*Math.round(d/LAP);};
const padLanes=[0,10,15,5,-8,-14,-4,9,13,0,-12,-6];
function sector(i){
 const x=padLanes[i%padLanes.length],z=56+i*96;
 return {x,z,mineX:x>0?x-7:x+7,mineActive:i%3!==0,used:false};
}
export function newRace(){
 return {distance:0,elapsed:0,x:0,vx:0,lean:0,speed:36,thrust:0,energy:100,
  shield:3,rockets:2,cooldown:0,rocketCooldown:0,immunity:0,padBoost:0,wallLock:0,
  laps:0,lapStart:0,lastLap:0,rank:GRID,drafting:false,refills:0,
  sectors:[0,1,2].map(sector),nextSector:3,shots:[],bursts:[],
  rivals:[-6,6,-12,12,-3,3].map((x,id)=>({id,x,z:9+Math.floor(id/2)*10,speed:37+id*.8,lean:0,stun:0,boost:0}))};
}
export function shoot(s,rocket,notify){
 if(rocket){if(!s.rockets||s.rocketCooldown>0)return;s.rockets--;s.rocketCooldown=.65;}
 else {if(s.cooldown>0)return;s.cooldown=.20;}
 s.shots.push({x:s.x,z:s.distance+2,rocket});notify(rocket?'rocket':'fire');
}
function impact(s,notify){
 if(s.immunity>0)return;
 s.immunity=1.2;s.shield--;s.speed*=.75;
 if(!s.shield){s.shield=3;s.energy=Math.max(25,s.energy*.5);s.speed=20;s.immunity=2;notify('repair');}
 else notify('hit');
}
function pilots(s,dt){
 s.drafting=false;
 for(const p of s.rivals){
  const gap=separation(p.z,s.distance),phase=tau*p.z/LAP;
  const bend=slope(p.z+28)-slope(p.z-4);
  const sectorIndex=Math.max(0,Math.ceil((p.z-56)/96));
  const pad=sector(sectorIndex),approach=pad.z-p.z;
  let line=clamp(8*Math.sin(phase*2+p.id*1.6)+5*Math.sin(phase*5+p.id)+bend*19,-15,15);
  if(approach<40&&(sectorIndex+p.id)%3!==0)line+=(pad.x-line)*(1-approach/40);
  if(gap<2&&gap>-17&&Math.abs(p.x-s.x)<3.5)line=clamp(s.x+(p.x>=s.x?5:-5),-16,16);
  for(const other of s.rivals){
   if(other===p)continue;
   const lead=separation(other.z,p.z);
   if(lead>0&&lead<9&&Math.abs(other.x-p.x)<2.5)line+=p.x>=other.x?3:-3;
  }
  const dx=clamp((line-p.x)*1.5,-10,10);
  p.x=clamp(p.x+dx*dt,-16.4,16.4);p.lean=-dx*.035;
  p.stun=Math.max(0,p.stun-dt);
  const burst=Math.max(0,Math.sin(phase*4+p.id*1.9))**6;
  // Pilots coast in clear air and spend their reserve when chasing the pack.
  const chase=clamp((s.distance-p.z)*.19,-14,16);
  const target=46+p.id*1.1+8*burst+(p.boost>0?12:0)-8*Math.abs(bend)+chase;
  p.boost=Math.max(0,p.boost-dt);
  if(approach>=0&&approach<p.speed*dt&&Math.abs(p.x-pad.x)<3)p.boost=1.2;
  p.speed+=((p.stun>0?target*.53:target)-p.speed)*(1-Math.exp(-2*dt));p.z+=p.speed*dt;
  if(gap>3&&gap<22&&Math.abs(p.x-s.x)<2.3)s.drafting=true;
 }
}
export function advance(s,dt,input,notify){
 s.elapsed+=dt;
 for(const key of ['cooldown','rocketCooldown','immunity','wallLock','padBoost'])s[key]=Math.max(0,s[key]-dt);
 pilots(s,dt);
 const bend=slope(s.distance+16)-slope(s.distance-8);
 const brake=Boolean(input.brake);
 const target=input.steer*(brake?29:22)-bend*s.speed*(brake?.28:.75);
 s.vx+=(target-s.vx)*(1-Math.exp(-7*dt));
 s.x=clamp(s.x+s.vx*dt,-EDGE,EDGE);
 if(Math.abs(s.x)>=EDGE&&s.vx*s.x>0&&s.wallLock===0){s.speed*=.82;s.vx*=.15;s.wallLock=.9;notify('rail');}
 s.lean+=(-s.vx*.027-bend*.44-s.lean)*(1-Math.exp(-8*dt));
 const boost=input.boost&&!brake&&s.energy>0&&!s.spent;
 if(boost){s.energy=Math.max(0,s.energy-22*dt);if(s.energy===0)s.spent=true;}
 else {s.energy=Math.min(100,s.energy+(s.drafting?24:10)*dt);if(!input.boost||s.energy>30)s.spent=false;}
 s.thrust+=(Number(boost||s.padBoost>0)-s.thrust)*(1-Math.exp(-6*dt));
 s.speed+=((brake?29:39+24*s.thrust+(s.drafting?6:0))-s.speed)*(1-Math.exp(-2.4*dt));
 const before=s.distance;
 const travel=s.speed*dt/clamp(1-bend*s.x/24,.87,1.13);
 s.distance+=travel;
 while(s.nextSector*96<s.distance+210)s.sectors.push(sector(s.nextSector++));
 s.sectors=s.sectors.filter(q=>q.z>s.distance-30);
 for(const q of s.sectors){
  if(q.mineActive&&before<q.z-17&&s.distance>=q.z-17){
   q.mineActive=false;if(Math.abs(q.mineX-s.x)<1.55)impact(s,notify);
  }
  if(!q.used&&before<q.z&&s.distance>=q.z){
   q.used=true;
   if(Math.abs(q.x-s.x)<2.9){s.energy=Math.min(100,s.energy+24);s.padBoost=1.05;
    if(++s.refills%2===0)s.rockets=Math.min(3,s.rockets+1);
    s.shield=Math.min(3,s.shield+1);notify('pad');}
  }
 }
 for(const p of s.rivals){
  if(Math.abs(separation(p.z,s.distance))<1.8&&Math.abs(s.x-p.x)<2.0&&s.immunity===0){
   impact(s,notify);p.stun=.7;s.vx+=(s.x>=p.x?1:-1)*7;
  }
 }
 for(const shot of s.shots){
  const prev=shot.z;shot.z+=dt*(shot.rocket?126:116);
  const reach=shot.rocket?4:1.55;
  const inPath=(x,z)=>z>=prev-1&&z<=shot.z+1&&Math.abs(x-shot.x)<reach;
  let hit=null;
  for(const p of s.rivals){
   const z=prev+separation(p.z,prev);
   if(inPath(p.x,z)&&(!hit||z<hit.z))hit={x:p.x,z,p};
  }
  for(const q of s.sectors)if(q.mineActive&&inPath(q.mineX,q.z-17)&&(!hit||q.z-17<hit.z))hit={x:q.mineX,z:q.z-17,q};
  if(hit){if(hit.p)hit.p.stun=shot.rocket?2.4:1;else hit.q.mineActive=false;
   shot.spent=true;s.bursts.push({x:hit.x,z:hit.z,age:0});notify('break');}
 }
 s.shots=s.shots.filter(v=>!v.spent&&v.z<s.distance+143);
 for(const b of s.bursts)b.age+=dt;
 s.bursts=s.bursts.filter(b=>b.age<.45);
 s.rank=1+s.rivals.filter(p=>p.z>s.distance).length;
 if(Math.floor(s.distance/LAP)>s.laps){s.laps++;const at=s.elapsed-(s.distance-s.laps*LAP)*dt/travel;
  s.lastLap=at-s.lapStart;s.lapStart=at;notify('lap');}
}
export function visible(s){
 const offset=s.laps*LAP,objects=[];
 for(const p of s.rivals){const gap=separation(p.z,s.distance);if(gap> -10&&gap<158)objects.push([p.x,s.distance-offset+gap,6+p.id,p.lean]);}
 for(const q of s.sectors){
  if(!q.used&&q.z<s.distance+153)objects.push([q.x,q.z-offset,0,0]);
  if(q.mineActive&&q.z-17<s.distance+145)objects.push([q.mineX,q.z-17-offset,1,0]);
 }
 for(const v of s.shots)objects.push([v.x,v.z-offset,v.rocket?3:2,0]);
 for(const b of s.bursts)objects.push([b.x,b.z-offset,5,b.age]);
 return objects;
}
