function camera(s,{LAP,road,slope}){
 const z=s.distance-s.laps*LAP-9.2;
 const pan=s.previewPan??0;
 return [s.x*.87+road(z)+pan,z,slope(z)-pan/48,s.lean*.15];
}
const vertex=`
attribute vec3 pos;attribute vec4 tint;
uniform vec4 cam;uniform vec2 scale;uniform float moving,pass;
varying vec3 color;varying float depth,alt;
float road(float z){float a=z*.00545415391;return 17.*sin(3.*a)+10.*sin(2.*a+.8)+4.*sin(6.*a-.6);}
void main(){
 float z=pos.z;float y=pos.y;alt=y;
 float x=pos.x-cam.x-(z-cam.y)*cam.z;
 if(moving>.5)x+=road(z);
 if(pass>1.5){x-=y*.94;z-=y*3.5;y=.014;}else if(pass>.5){y=-y;}
 float d=z-cam.y; depth=d;
 float h=y-4.15;float px=x+cam.w*h;float py=h-cam.w*x;
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
precision highp float;varying vec2 uv;uniform vec4 cam;uniform float aspect,time,framing;
void main(){
 float x=uv.x*aspect/framing,y=(uv.y-.14)/framing+cam.w*x;
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
function gpu(canvas,simulation){
 const gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:true,powerPreference:'high-performance'});
 if(!gl)throw Error('WebGL unavailable');
 const engine=simulation.geometry;
 const world=program(gl,vertex,fragment),sky=program(gl,skyVertex,skyFragment);
 const locs=(p,names)=>Object.fromEntries(names.map(n=>[n,gl.getUniformLocation(p,n)]));
 const u=locs(world,['cam','scale','moving','pass','shadowOpacity']),v=locs(sky,['cam','aspect','time','framing']);
 const pos=gl.getAttribLocation(world,'pos'),tint=gl.getAttribLocation(world,'tint'),point=gl.getAttribLocation(sky,'point');
 const bg=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,bg);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
 const dynamic=gl.createBuffer();
 function upload(buf,n,usage){
  gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.bufferData(gl.ARRAY_BUFFER,new Uint8Array(engine.memory.buffer,engine.vertices(),n*16),usage);
 }
 // Contiguous sections let all visible scenery share one draw call per pass.
 const scenery=[0,1].map(simple=>{
  const count=engine.buildTrack(simple);
  const sections=new Int32Array(engine.memory.buffer,engine.trackSections(),count).slice();
  const data=new Uint8Array(engine.memory.buffer,engine.trackVertices(),16*sections[count-1]);
  const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
  engine.releaseTrack();
  return {buf,sections};
 });
 function bind(buf){
  gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,3,gl.FLOAT,false,16,0);
  gl.enableVertexAttribArray(tint);gl.vertexAttribPointer(tint,4,gl.UNSIGNED_BYTE,true,16,12);
 }
 return s=>{
  const cam=camera(s,simulation);
  gl.viewport(0,0,canvas.width,canvas.height);gl.disable(gl.DEPTH_TEST);gl.useProgram(sky);
  gl.disableVertexAttribArray(tint);gl.disableVertexAttribArray(pos);
  gl.bindBuffer(gl.ARRAY_BUFFER,bg);gl.enableVertexAttribArray(point);gl.vertexAttribPointer(point,2,gl.FLOAT,false,0,0);
  const framing=Math.min(1,canvas.width/canvas.height);
  gl.uniform1f(v.framing,framing);gl.uniform4fv(v.cam,cam);gl.uniform1f(v.aspect,canvas.width/canvas.height);gl.uniform1f(v.time,s.elapsed%180);
  gl.drawArrays(gl.TRIANGLES,0,3);gl.disableVertexAttribArray(point);
  const n=engine.raceActors(s.elapsed);upload(dynamic,n,gl.DYNAMIC_DRAW);
  gl.useProgram(world);gl.uniform4fv(u.cam,cam);
  const focus=framing*(1.55-.12*s.thrust);gl.uniform2f(u.scale,focus*canvas.height/canvas.width,focus);
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
function canvasFlight(canvas,simulation){
 const core=simulation.geometry,ctx=canvas.getContext('2d',{alpha:false}),w=canvas.width,h=canvas.height;
 const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#161b3d');sky.addColorStop(.43,'#9c6177');sky.addColorStop(.44,'#333448');sky.addColorStop(1,'#101e32');
 const palette=new Map();
 function color(rgb){
  if(!palette.has(rgb))palette.set(rgb,'#'+rgb.toString(16).padStart(6,'0'));
  return palette.get(rgb);
 }
 return s=>{
  const size=core.canvasFrame(w,h,s.previewPan??0),data=new Float32Array(core.memory.buffer,core.canvasData(),size);
  ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
  // See CanvasScene::Op. Positions and painter order come from C++.
  for(let i=0;i<size;){
   const op=data[i++];
   if(op===-3){const y=data[i++];ctx.save();ctx.beginPath();ctx.rect(0,y,w,h-y);ctx.clip();continue;}
   if(op===-4){ctx.restore();continue;}
   const paint=color(data[i++]);
   if(op===-2){ctx.fillStyle=paint;ctx.fillRect(data[i++],data[i++],data[i++],data[i++]);continue;}
   const stroke=data[i++];ctx.beginPath();
   if(op===-1)ctx.ellipse(data[i++],data[i++],data[i++],data[i++],data[i++],0,Math.PI*2);
   else{
    ctx.moveTo(data[i++],data[i++]);
    for(let j=1;j<op;j++)ctx.lineTo(data[i++],data[i++]);
    ctx.closePath();
   }
   if(stroke){ctx.lineWidth=stroke;ctx.strokeStyle=paint;ctx.stroke();}
   else{ctx.fillStyle=paint;ctx.fill();}
  }
 };
}
export async function renderer(canvas,simulation){
 const screen=canvas.parentElement;
 const budgets=[640*400,480*300,320*200];
 let tier=0,draw,lastScene,backend='webgl';
 function resize(){
  const {width,height}=screen.getBoundingClientRect();
  if(!width||!height)return;
  const scale=Math.min(window.devicePixelRatio||1,Math.sqrt(budgets[tier]/(width*height)));
  const w=Math.max(1,Math.round(width*scale)),h=Math.max(1,Math.round(height*scale));
  if(w===canvas.width&&h===canvas.height)return;
  canvas.width=w;canvas.height=h;
  if(backend==='canvas')draw=canvasFlight(canvas,simulation);
  if(lastScene)draw(lastScene);
 }
 function simplify(){
  if(backend==='canvas')return;
  const fresh=canvas.cloneNode(false);
  canvas.replaceWith(fresh);canvas=fresh;backend='canvas';tier=0;
  draw=canvasFlight(canvas,simulation);resize();
  screen.dataset.renderer=backend;
  if(lastScene)draw(lastScene);
 }
 try{draw=gpu(canvas,simulation);canvas.addEventListener('webglcontextlost',simplify);}
 catch(e){console.warn('Canal renderer:',e.message);simplify();}
 const observer=new ResizeObserver(resize);
 observer.observe(screen);resize();
 function reduceLoad(ms){
  if(backend!=='webgl')return;
  if(tier<budgets.length-1){tier++;resize();}
  else if(ms>31)simplify();
 }
 return {draw:s=>{lastScene=s;draw(s);},reduceLoad,get backend(){return backend;}};
}
