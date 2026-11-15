const horizon=.43, eye=3.65;
const road=z=>4.5*Math.sin(z*.019)+3*Math.sin(z*.032+.8);
const slope=z=>.0855*Math.cos(z*.019)+.096*Math.cos(z*.032+.8);
function camera(s){
    const z=s.distance-6.4;
    return [s.x*.53+road(z),z,slope(z),s.lean*.12];
}
const vertex=`
attribute vec3 pos;attribute vec4 tint;
uniform vec4 cam;uniform vec2 scale;uniform float moving,pass;
varying vec3 color;varying float depth,alt;
float road(float z){return 4.5*sin(z*.019)+3.*sin(z*.032+.8);}
void main(){
 float z=pos.z;float y=pos.y;alt=y;
 float x=pos.x-cam.x-(z-cam.y)*cam.z;
 if(moving>.5)x+=road(z);
 if(pass>1.5){x-=y*.94;z-=y*3.5;y=.014;}else if(pass>.5){y=-y;}
 float d=z-cam.y; depth=d;
 float h=y-3.65;float px=x+cam.w*h;float py=h-cam.w*x;
 gl_Position=vec4(px*scale.x,py*scale.y+.14*d,1.009*d-1.61,d);
 color=tint.rgb;
}`;
const fragment=`
precision highp float; varying vec3 color;varying float depth,alt;
uniform float pass;uniform float shadowOpacity;
void main(){
 if(alt<-.04||depth>169.)discard;
 if(pass>1.5){gl_FragColor=vec4(.04,.075,.13,shadowOpacity);return;}
 float haze=smoothstep(35.,159.,depth)*.75;
 vec3 c=mix(color,vec3(.40,.30,.43),haze);
 if(pass>.5)c=mix(vec3(.065,.14,.21),c,.48);
 gl_FragColor=vec4(c,1.);
}`;
const skyVertex='attribute vec2 point;varying vec2 uv;void main(){uv=point;gl_Position=vec4(point,0.,1.);}';
const skyFragment=`
precision highp float;varying vec2 uv;uniform vec4 cam;uniform float aspect,time;
void main(){
 float x=uv.x*aspect,y=uv.y-.14+cam.w*x;
 bool water=y<0.;float sy=abs(y);
 if(water)x+=.010*sin(y*75.+time*2.)*min(1.,-y*3.);
 vec2 p=vec2(x-(.48-cam.z*1.3),sy-.36);
 vec3 sky=mix(vec3(.58,.34,.44),vec3(.069,.093,.22),smoothstep(0.,1.,sy));
 float dist=length(p);sky+=vec3(.29,.15,.06)*exp(-8.*dist);
 vec2 tilt=vec2(p.x+.21*p.y,p.y-.21*p.x);
 float ring=abs(length(tilt/vec2(.32,.040))-1.);
 if(dist<.16)sky=mix(vec3(1.,.69,.41),vec3(1.,.91,.65),smoothstep(-.15,.15,p.y));
 if(ring<.13&&(tilt.y<0.||dist>.16))sky=vec3(1.,.84,.57);
 vec2 star=floor(vec2(x,sy)*220.);
 if(sy>.31 && dist>.19 && fract(sin(dot(mod(star,61.),vec2(17.7,45.3)))*299.)>.996)sky+=.28;
 if(water)sky=mix(vec3(.045,.11,.16),sky,.46)+.012*sin(y*118.+time*2.);
 gl_FragColor=vec4(sky,1.);
}`;
function program(gl,vs,fs){
 const p=gl.createProgram();
 for(const [type,source] of [[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){
  const sh=gl.createShader(type);gl.shaderSource(sh,source);gl.compileShader(sh);
  if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(sh));
  gl.attachShader(p,sh);gl.deleteShader(sh);
 }
 gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));
 return p;
}
async function gpu(canvas){
 const gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:true,powerPreference:'high-performance'});
 if(!gl)throw Error('WebGL unavailable');
 const bin=await fetch('flight.wasm?v=run1');
 if(!bin.ok)throw Error('WASM '+bin.status);
 const {instance}=await WebAssembly.instantiate(await bin.arrayBuffer(),{wasi_snapshot_preview1:{fd_close:()=>8,fd_write:()=>8,fd_seek:()=>8,clock_time_get:()=>0}});
 const engine=instance.exports;engine._initialize();
 const world=program(gl,vertex,fragment),sky=program(gl,skyVertex,skyFragment);
 const locs=(p,names)=>Object.fromEntries(names.map(n=>[n,gl.getUniformLocation(p,n)]));
 const u=locs(world,['cam','scale','moving','pass','shadowOpacity']),v=locs(sky,['cam','aspect','time']);
 const pos=gl.getAttribLocation(world,'pos'),tint=gl.getAttribLocation(world,'tint'),point=gl.getAttribLocation(sky,'point');
 const bg=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,bg);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
 const dynamic=gl.createBuffer();
 function upload(buf,n,usage){
  gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.bufferData(gl.ARRAY_BUFFER,new Uint8Array(engine.memory.buffer,engine.vertices(),n*16),usage);
 }
 // Contiguous sections let all visible scenery share one draw call per pass.
 const scenery=[0,1].map(simple=>{
  const count=engine.sceneBlock(simple),raw=new Uint8Array(engine.memory.buffer,engine.vertices(),count*16);
  const starts=Array.from({length:7},(_,i)=>engine.sectionStart(i));
  const end=Math.ceil((FINISH+168)/24),data=new Uint8Array((Math.ceil((end+2)/6)+1)*count*16);
  const dst=new DataView(data.buffer),sections=[];
  let cursor=0;
  for(let sector=-1;sector<=end;sector++){
   const k=((sector%6)+6)%6,base=(sector-k)*24,n=starts[k+1]-starts[k];
   sections.push(cursor);
   data.set(raw.subarray(16*starts[k],16*starts[k+1]),16*cursor);
   for(let j=cursor;j<cursor+n;j++){
    const i=j*16,z=base+dst.getFloat32(i+8,true);
    dst.setFloat32(i,dst.getFloat32(i,true)+road(z),true);dst.setFloat32(i+8,z,true);
   }
   cursor+=n;
  }
  sections.push(cursor);
  const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,data.subarray(0,cursor*16),gl.STATIC_DRAW);
  return {buf,sections};
 });
 function bind(buf){
  gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,3,gl.FLOAT,false,16,0);
  gl.enableVertexAttribArray(tint);gl.vertexAttribPointer(tint,4,gl.UNSIGNED_BYTE,true,16,12);
 }
 return s=>{
  const cam=camera(s);
  gl.viewport(0,0,canvas.width,canvas.height);gl.disable(gl.DEPTH_TEST);gl.useProgram(sky);
  gl.disableVertexAttribArray(tint);gl.disableVertexAttribArray(pos);
  gl.bindBuffer(gl.ARRAY_BUFFER,bg);gl.enableVertexAttribArray(point);gl.vertexAttribPointer(point,2,gl.FLOAT,false,0,0);
  gl.uniform4fv(v.cam,cam);gl.uniform1f(v.aspect,canvas.width/canvas.height);gl.uniform1f(v.time,s.elapsed%180);
  gl.drawArrays(gl.TRIANGLES,0,3);gl.disableVertexAttribArray(point);
  const list=visible(s);
  const data=new Float32Array(engine.memory.buffer,engine.objectBuffer(),128);
  list.forEach((o,i)=>data.set(o,4*i));
  const n=engine.actors(s.elapsed,s.distance,s.x,s.lean,s.thrust,list.length);upload(dynamic,n,gl.DYNAMIC_DRAW);
  gl.useProgram(world);gl.uniform4fv(u.cam,cam);
  gl.uniform2f(u.scale,1.66*canvas.height/canvas.width,1.66);
  gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
  for(const pass of [1,2,0]){
   if(pass!==0)gl.clear(gl.DEPTH_BUFFER_BIT);
   if(pass===2){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthFunc(gl.LESS);}
   else {gl.disable(gl.BLEND);gl.depthFunc(gl.LEQUAL);}
   gl.uniform1f(u.pass,pass);gl.uniform1f(u.shadowOpacity,.26);
   const {buf,sections}=scenery[pass===0?0:1],near=cam[1]-8,far=cam[1]+(pass===2?58:150);
   const first=sections[Math.max(0,Math.floor(near/24)+1)];
   const stop=sections[Math.min(sections.length-1,Math.ceil(far/24)+1)];
   gl.uniform1f(u.moving,0);bind(buf);gl.drawArrays(gl.TRIANGLES,first,stop-first);
   gl.uniform1f(u.moving,1);bind(dynamic);gl.drawArrays(gl.TRIANGLES,0,n);
  }
 };
}

// A lightweight chase view also keeps the course playable when a browser disables WebGL.
function canvasFlight(canvas){
 const ctx=canvas.getContext('2d',{alpha:false}),w=canvas.width,h=canvas.height,f=h*.83;
 const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#161b3d');sky.addColorStop(.43,'#9c6177');sky.addColorStop(.44,'#333448');sky.addColorStop(1,'#101e32');
 return s=>{
  const cam=camera(s);
  const pt=(x,y,z)=>{const d=Math.max(.4,z-cam[1]);return [w/2+f*(x+road(z)-cam[0]-d*cam[2])/d,h*horizon-f*(y-eye)/d];};
  function poly(points,color,stroke=false){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();if(stroke){ctx.strokeStyle=color;ctx.stroke();}else{ctx.fillStyle=color;ctx.fill();}}
  ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
  const sunX=w*.66-cam[2]*f;
  ctx.fillStyle='#ffdc9f';ctx.beginPath();ctx.arc(sunX,h*.26,h*.065,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#ffcd96';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(sunX,h*.26,h*.13,h*.018,-.2,0,Math.PI*2);ctx.stroke();
  // Paint distant reflections under the track before its near structures.
  ctx.save();ctx.beginPath();ctx.rect(0,h*horizon,w,h*(1-horizon));ctx.clip();
  ctx.fillStyle='#87726d';ctx.beginPath();ctx.ellipse(sunX,h*(2*horizon-.26),h*.063,h*.061,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#b39370';ctx.beginPath();ctx.ellipse(sunX,h*(2*horizon-.26),h*.128,h*.014,.2,0,Math.PI*2);ctx.stroke();
  for(let k=Math.floor((cam[1]+144)/12);k*12>cam[1]+1;k--){
   const z=k*12;
   for(const side of [-1,1]){
    const x=side*(11+Math.abs(k%4)),top=8+Math.abs(Math.sin(k*21+side))*15;
    poly([pt(x,0,z),pt(x,-top,z),pt(x+side*5,-top,z),pt(x+side*5,0,z)],'#252c40');
   }
   if(k%2===0){ctx.lineWidth=Math.max(1,f*.12/(z-cam[1]));poly(Array.from({length:12},(_,i)=>pt(7*Math.cos(i*Math.PI/6),-4-7*Math.sin(i*Math.PI/6),z)),'#645265',true);}
  }
  ctx.restore();
  for(let k=Math.floor((cam[1]+156)/12);k*12>cam[1]+1;k--){
   const z=k*12;
   for(const side of [-1,1]){
    const x=side*(11+Math.abs(k%4)),top=8+Math.abs(Math.sin(k*21+side))*15;
    poly([pt(x,0,z),pt(x,top,z),pt(x+side*5,top,z),pt(x+side*5,0,z)],'#272840');
    poly([pt(x,top*.7,z),pt(x+side*4,top*.7,z),pt(x+side*4,top*.68,z),pt(x,top*.68,z)],'#ab8294');
    poly([pt(side*8,0,z),pt(side*8.22,0,z),pt(side*8.22,0,z+11),pt(side*8,0,z+11)],'#68c8d3');
   }
   if(k%2===0){ctx.lineWidth=Math.max(1,f*.17/(z-cam[1]));poly(Array.from({length:12},(_,i)=>pt(7*Math.cos(i*Math.PI/6),4+7*Math.sin(i*Math.PI/6),z)),'#e7aa87',true);}
  }
  for(const [x,z,kind,age] of visible(s).sort((a,b)=>b[1]-a[1])){
   if(z<=cam[1]+1)continue;
   const [cx,cy]=pt(x,1.85,z),r=f/(z-cam[1]);
   if(kind===0||kind===4){ctx.strokeStyle=kind===4?'#ffe188':'#45ffcb';ctx.lineWidth=Math.max(2,r*.22);ctx.beginPath();ctx.arc(cx,cy,r*(kind===4?6.5:1.65),0,Math.PI*2);ctx.stroke();}
   else if(kind===1)poly([[cx,cy-r],[cx+r,cy],[cx,cy+r],[cx-r,cy]],'#ff664e');
   else if(kind===5){ctx.fillStyle='#ffc36c';ctx.fillRect(cx-r,cy-r,r*(1+age),r);}
   else {ctx.fillStyle='#ffc875';ctx.fillRect(cx,cy,Math.max(2,r*.19),Math.max(3,r));}
  }
  const p=(x,y,z)=>pt(s.x+x,1.85+y+x*s.lean,s.distance+z);
  for(const side of [-1,1]){
   poly([p(0,.3,2.35),p(side*.55,.1,.54),p(0,.4,-1)],'#d4d9dd');
   poly([p(side*.55,.1,.54),p(side*1.55,-.09,-.91),p(side*.56,.08,-1.12)],'#f19b55');
   poly([p(side*.49,0,-1.16),p(side*.66,0,-1.16),p(side*.57,0,-1.7-s.thrust*.8)],'#59e6ff');
  }
 };
}
export async function renderer(canvas){
 let draw,lastScene,backend='webgl';
 function simplify(){
  if(backend==='canvas')return;
  backend='canvas';
  const fresh=canvas.cloneNode(false);fresh.width=640;fresh.height=400;
  canvas.replaceWith(fresh);draw=canvasFlight(fresh);
  fresh.parentElement.dataset.renderer=backend;
  if(lastScene)draw(lastScene);
 }
 try{draw=await gpu(canvas);canvas.addEventListener('webglcontextlost',simplify);}
 catch(e){console.warn('Canal renderer:',e.message);simplify();}
 return {draw:s=>{lastScene=s;draw(s);},simplify,get backend(){return backend;}};
}
import {visible,FINISH} from './race.js';
