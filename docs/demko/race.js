export const COUNT=18, GOAL=11, FINISH=52+COUNT*46;
const lanes=[0,-4,0,4,4,0,-4,0,-4,4,0,4,-4,-4,0,4,0,-4];
export function newRace(){
 const gates=lanes.map((x,i)=>({x,z:52+i*46,passed:false}));
 const mines=gates.slice(1).map((g,i)=>({x:g.x===0?(i%2?4:-4):0,z:g.z-14,active:true}));
 return {distance:6.4,elapsed:0,x:0,vx:0,lean:0,speed:24,thrust:0,energy:100,
         gates,mines,next:0,hits:0,collected:0,shield:3,rockets:2,cooldown:0,rocketCooldown:0,
         shots:[],bursts:[],result:null};
}
export function shoot(s,rocket,notify){
 if(s.result)return;
 if(rocket){if(!s.rockets||s.rocketCooldown>0)return;s.rockets--;s.rocketCooldown=.60;}
 else {if(s.cooldown>0)return;s.cooldown=.19;}
 s.shots.push({x:s.x,z:s.distance+2,rocket,active:true});
 notify(rocket?'rocket':'fire');
}
export function advance(s,dt,input,notify){
 if(s.result)return;
 s.elapsed+=dt;
 s.cooldown=Math.max(0,s.cooldown-dt);
 s.rocketCooldown=Math.max(0,s.rocketCooldown-dt);
 const target=input.steer*10;
 s.vx+=(target-s.vx)*(1-Math.exp(-12*dt));
 s.x=Math.max(-5.1,Math.min(5.1,s.x+s.vx*dt));
 s.lean+=(-s.vx*.047-s.lean)*(1-Math.exp(-10*dt));
 const boosting=input.boost&&s.energy>0&&!s.spent;
 if(boosting){s.energy=Math.max(0,s.energy-24*dt);if(s.energy===0)s.spent=true;}
 else {s.energy=Math.min(100,s.energy+13*dt);if(!input.boost||s.energy>28)s.spent=false;}
 s.thrust+=(Number(boosting)-s.thrust)*(1-Math.exp(-6*dt));
 s.speed+=((24+23*s.thrust)-s.speed)*(1-Math.exp(-3.6*dt));
 s.distance+=s.speed*dt;
 for(const shot of s.shots){
  const prev=shot.z;shot.z+=dt*(shot.rocket?105:92);
  for(const m of s.mines){
   if(!m.active||prev>m.z+1||shot.z<m.z-1||Math.abs(shot.x-m.x)>(shot.rocket?5.1:1.6))continue;
   m.active=false;shot.active=false;s.bursts.push({x:m.x,z:m.z,age:0});s.hits++;notify('break');break;
  }
 }
 s.shots=s.shots.filter(v=>v.active&&v.z<s.distance+142);
 for(const m of s.mines){
  if(!m.active||m.z>s.distance)continue;
  m.active=false;
  if(Math.abs(m.x-s.x)<1.45){s.shield--;s.speed*=.64;s.bursts.push({x:m.x,z:m.z,age:0});notify('hit');}
 }
 while(s.next<COUNT&&s.gates[s.next].z<=s.distance){
  const g=s.gates[s.next++];g.passed=true;
  if(Math.abs(s.x-g.x)<1.65){
   s.collected++;s.energy=Math.min(100,s.energy+12);
   if(s.collected%4===0)s.rockets=Math.min(3,s.rockets+1);
   notify('gate');
  }else notify('miss');
 }
 for(const burst of s.bursts)burst.age+=dt;
 s.bursts=s.bursts.filter(b=>b.age<.5);
 if(s.shield<=0)s.result='crash';
 else if(s.distance>=FINISH)s.result=s.collected>=GOAL?'win':'short';
 if(s.result)notify(s.result);
}
export function visible(s){
 const objects=[];
 for(const g of s.gates)if(!g.passed&&g.z<s.distance+153)objects.push([g.x,g.z,0,0]);
 for(const m of s.mines)if(m.active&&m.z<s.distance+146)objects.push([m.x,m.z,1,0]);
 for(const v of s.shots)objects.push([v.x,v.z,v.rocket?3:2,0]);
 for(const b of s.bursts)objects.push([b.x,b.z,5,b.age]);
 if(s.distance>FINISH-145)objects.push([0,FINISH,4,0]);
 return objects;
}
