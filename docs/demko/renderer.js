function camera(s,{LAP,road,slope}){
 const z=s.distance-s.laps*LAP-9.2;
 const pan=s.previewPan??0;
 return [s.x*.87+road(z)+pan,z,slope(z)-pan/48,s.lean*.15];
}
const vertex=`
attribute vec3 pos;attribute vec4 tint;
uniform vec4 cam;uniform vec2 scale;uniform float moving,pass,clock,lift,pitch;
varying vec3 world,color;varying float mat;varying float depth,alt,sourceDepth;

void main(){
 mat=tint.a*255.;world=pos;float z=pos.z;float y=pos.y;alt=y;sourceDepth=z-cam.y;
 float x=pos.x-cam.x-(z-cam.y)*cam.z;

 if(pass>1.5){x-=y*.94;z-=y*3.5;y=.014;}else if(pass>.5){x+=.065*sin(z*1.83+clock*1.8+pos.y);y=-y;}
 float d=z-cam.y; depth=d;
 float h=y-4.15-lift;float px=x+cam.w*h;float py=h-cam.w*x-d*pitch;
 gl_Position=vec4(px*scale.x,py*scale.y+.14*d,1.0044*d-1.61,d);
 color=tint.rgb;
}`;
const fragment=`
precision highp float; varying vec3 world,color;varying float mat;varying float depth,alt,sourceDepth;
uniform float pass,moving,clock;uniform sampler2D steel,glass,cladding,hull,smoke,flame,ember,city;uniform vec4 pilot;uniform vec4 cam;uniform float lift;uniform float shadowOpacity;uniform vec2 visibility;
void main(){
 if(alt<-.04||depth>=visibility.y)discard;
 float range=1.-smoothstep(visibility.x,visibility.y,depth);
 if(pass>1.5){gl_FragColor=vec4(.04,.075,.13,shadowOpacity*range*(1.-smoothstep(152.,192.,sourceDepth)));return;}
 if(mat>7.5 && mat<8.5){
  if(pass>.5)discard;
  float lane=(color.r-.5)*37.1;
  vec2 uv=vec2(lane,world.z);
  vec2 panel=abs(fract(uv/vec2(6.,12.))-.5);
  float nearDetail=1.-smoothstep(16.,52.,depth);
  float seam=smoothstep(.485,.499,max(panel.x,panel.y));
  vec4 metal=texture2D(steel,uv/vec2(3.,5.));
  float service=1.-smoothstep(.62,.72,abs(abs(lane)-15.8));
  float hatch=1.-smoothstep(.12,.20,abs(fract((abs(lane)+uv.y)*.48)-.5));
  float strip=1.-smoothstep(.045,.085,abs(abs(lane)-14.85));
  float fres=smoothstep(4.,75.,depth);
  vec3 tint=mix(vec3(.075,.13,.18),vec3(.21,.28,.35),fres);
  tint+=nearDetail*(vec3(.14,.18,.19)*(metal.b-.55)+seam*.09);
  vec3 shoulder=mix(vec3(.15,.19,.21),vec3(.65,.46,.24),hatch*.66);
  tint=mix(tint,shoulder,service*(.25+.75*nearDetail));
  tint+=strip*vec3(.12,.26,.27)*nearDetail;
  gl_FragColor=vec4(tint,mix(.69,.90,fres)*range);return;
 }
 if(mat>39.5){
  vec3 base=mat<40.5?vec3(.96,.48,.19):mat<41.5?vec3(.16,.83,.69):mat<42.5?vec3(.97,.32,.56):
    mat<43.5?vec3(.98,.70,.20):mat<44.5?vec3(.43,.54,.96):mat<45.5?vec3(.73,.43,.92):
    mat<46.5?vec3(.48,.79,.35):mat<47.5?vec3(.71,.77,.79):mat<48.5?vec3(.12,.31,.40):
    mat<49.5?vec3(.16,.20,.24):mat<50.5?vec3(.39,.91,1.):vec3(.99,.88,.63);
  vec2 uv=color.rg;
  vec4 skin=texture2D(hull,uv*vec2(2.,2.));
  float l=color.b;
  float highlight=pow(max(0.,1.-abs(l-.79)*6.),3.);
  vec2 bump=skin.rg*2.-1.;
  float light=clamp(l+.20*bump.y-.14*bump.x,0.,1.);
  float polish=1.-skin.a;
  vec3 shaded=base*(.36+.77*light+.53*(skin.b-.53)) + highlight*vec3(.22,.20,.17)*(.58+.85*polish);
  if(mat<47.5){
   // Circumferential joints and the access stencil stay fixed to the local hull.
   float joint=1.-smoothstep(.013,.050,abs(fract(uv.y*5.+.18)-.5));
   shaded*=1.-.34*joint;
   float band=1.-smoothstep(.036,.048,abs(uv.x-.25));
   float warning=step(.52,fract(uv.y*22.+uv.x*9.))*band*smoothstep(.12,.16,uv.y)*(1.-smoothstep(.28,.32,uv.y));
   shaded=mix(shaded,vec3(.97,.69,.27)*(.65+.4*l),warning*.82);
  }
  if(mat<46.5){
   float stripe=smoothstep(.21,.24,uv.y)*(1.-smoothstep(.26,.29,uv.y));
   shaded=mix(shaded,vec3(.90,.86,.72)*(.45+.55*l),stripe*.88);
  }else if(mat>47.5 && mat<48.5){
   float horizon=smoothstep(.65,.78,l);
   shaded=mix(vec3(.025,.095,.15),vec3(.28,.54,.61),horizon)+
          vec3(.85,.68,.48)*pow(max(0.,1.-abs(l-.76)*15.),3.);
   shaded*=1.-.55*(1.-smoothstep(.008,.025,abs(uv.y-.36)));
  }else if(mat>49.5 && mat<50.5)shaded=base*(.86+.14*l);
  if(pass>.5)shaded=mix(vec3(.045,.082,.125),shaded,.47);
  float opacity=pass>.5 ? .065+.355*smoothstep(6.,22.,depth) : 1.;
  gl_FragColor=vec4(mix(shaded,vec3(.40,.30,.43),.65*smoothstep(36.,155.,depth)),opacity*range);return;
 }
 if(mat>31.5){
  vec4 sprite=mat<32.5?texture2D(smoke,color.rg):mat<33.5?texture2D(flame,color.rg):texture2D(ember,color.rg);
  gl_FragColor=vec4(sprite.rgb,sprite.a*color.b*range);return;
 }
 float haze=smoothstep(35.,159.,depth)*.75;
 vec3 c=mix(color,vec3(.40,.30,.43),haze);
 if(mat>.5 && (pass<.5 || (mat>1.5 && mat<3.5))){
  bool deck=mat<1.5;
  vec2 uv=deck?world.xz/6.:(mat<2.5?world.xy:world.zy)/5.;
  vec4 tex;
  if(mat<3.5)tex=deck?texture2D(steel,uv):texture2D(glass,uv);
  else if(mat<6.5){
   uv=(mat<4.5?world.xy:mat<5.5?world.zy:world.xz)/5.;
   tex=texture2D(cladding,uv);
  }else{
   float dz=world.z-pilot.y;
   uv=vec2((world.x-pilot.x-dz*pilot.z)*cos(pilot.w)+(world.y-lift-1.85)*sin(pilot.w),dz)/2.8+vec2(.5,.55);
   tex=texture2D(hull,uv);
  }
  vec2 bump=tex.rg*2.-1.;
  vec3 n=normalize((deck || mat>5.5)?vec3(bump.x,1.,bump.y):((mat<2.5 || (mat>3.5 && mat<4.5))?vec3(bump.x,bump.y,-1.):vec3(sign(cam.x-world.x),bump.y,bump.x)));
  vec3 eye=normalize(vec3(cam.x,4.15+lift,cam.y)-world);
  vec3 light=normalize(vec3(.42,.36,.94));
  float gloss=pow(max(dot(n,normalize(eye+light)),0.),mix(64.,9.,tex.a));
  float fres=pow(1.-clamp(abs(dot(n,eye)),0.,1.),3.);
  vec3 shaded=color*(.66+.48*tex.b+.19*dot(n,light))+
      vec3(.86,.56,.35)*gloss*(1.-tex.a)*.52+
      vec3(.27,.43,.55)*fres*(deck?.14:.25);
  if(mat>1.5 && mat<3.5){
   vec2 wall=mat<2.5?world.xy:world.zy;
   vec4 rooms=texture2D(city,wall/vec2(13.,17.));
   shaded=shaded*.54+rooms.rgb*(.31+.53*rooms.a);
  }
  if(mat>3.5 && mat<6.5){
   vec2 p=fract(uv);float inset=step(.12,p.x)*step(p.x,.71)*step(.37,p.y)*step(p.y,.65);
   float stripe=smoothstep(.45,.52,fract((p.x+p.y)*6.))*inset;
   float fade=1.-smoothstep(15.,43.,depth);
   shaded=mix(shaded,vec3(.79,.51,.19),.53*stripe*fade);
  }
  c=mix(shaded,vec3(.40,.30,.43),haze);
 }
 if(pass>.5){
  float grazing=smoothstep(5.,65.,depth);
  float light=smoothstep(.50,.90,max(color.r,max(color.g,color.b)));
  float reflectance=mix(.38,.62,grazing)+.13*light;
  c=mix(vec3(.045,.082,.125),c,reflectance);
 }
 float alpha=(pass>.5 && moving>.5) ? (.065+.355*smoothstep(6.,22.,depth)) : 1.;
 gl_FragColor=vec4(c,alpha*range);
}`;
const skyVertex='attribute vec2 point;varying vec2 uv;void main(){uv=point;gl_Position=vec4(point,0.,1.);}';
const skyFragment=`
precision highp float;varying vec2 uv;uniform vec4 cam;uniform float aspect,time,framing,skyPitch;
void main(){
 float x=uv.x*aspect/framing,y=(uv.y-.14)/framing+cam.w*x+skyPitch;
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
 if(!water && sy>.31 && dist>.19 && fract(sin(dot(mod(star,61.),vec2(17.7,45.3)))*299.)>.996)sky+=.28;
 float ridge=.018+.014*sin(8.*(x+cam.z))+.009*sin(23.*(x+cam.z));
 vec3 mist=vec3(.38,.27,.38);
 if(!water && sy<ridge)sky=mix(mist,vec3(.48,.34,.43),sy/ridge);
 if(water){
  float waves=sin(5./(.075+sy)+x*2.+time*.9);
  vec3 surface=mix(vec3(.045,.11,.16),sky,.39+.065*waves)+.007*waves;
  sky=mix(mist,surface,smoothstep(0.,.11,sy));
 }
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
 const u=locs(world,['cam','scale','pilot','moving','pass','clock','shadowOpacity','lift','visibility','pitch']),v=locs(sky,['cam','aspect','time','framing','skyPitch']);
 const pos=gl.getAttribLocation(world,'pos'),tint=gl.getAttribLocation(world,'tint'),point=gl.getAttribLocation(sky,'point');
 const bg=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,bg);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
 // C++ bakes the same material and particle textures for both GPUs.
 for(const [unit,name] of ['steel','glass','cladding','hull','smoke','flame','ember','city'].entries()){
  const tex=gl.createTexture();gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,tex);
  const ptr=engine.surfaceMap(unit);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,64,64,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array(engine.memory.buffer,ptr,64*64*4));
  gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
  if(unit>=4 && unit<=6){gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);}
  gl.useProgram(world);gl.uniform1i(gl.getUniformLocation(world,name),unit);
 }
 const dynamic=gl.createBuffer();
 function upload(buf,n,usage){
  gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.bufferData(gl.ARRAY_BUFFER,new Uint8Array(engine.memory.buffer,engine.vertices(),n*16),usage);
 }
 // Contiguous sections let all visible scenery share one draw call per pass.
 const scenery=[0,1,2].map(simple=>{
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
  const grade=engine.cameraPitch(cam[1]);gl.uniform1f(v.skyPitch,grade*(1.55-.12*s.thrust));
  gl.uniform1f(v.framing,framing);gl.uniform4fv(v.cam,cam);gl.uniform1f(v.aspect,canvas.width/canvas.height);gl.uniform1f(v.time,s.elapsed%180);
  gl.drawArrays(gl.TRIANGLES,0,3);gl.disableVertexAttribArray(point);
  const n=engine.raceActors(s.elapsed);upload(dynamic,n,gl.DYNAMIC_DRAW);
  const local=s.distance-s.laps*simulation.LAP;
  gl.useProgram(world);gl.uniform4f(u.pilot,s.x+simulation.road(local),local,simulation.slope(local),s.lean);gl.uniform4fv(u.cam,cam);gl.uniform1f(u.lift,s.deck+engine.elevation(cam[1]));gl.uniform1f(u.pitch,grade);gl.uniform1f(u.clock,s.elapsed%180);
  const focus=framing*(1.55-.12*s.thrust);gl.uniform2f(u.scale,focus*canvas.height/canvas.width,focus);
  gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
  for(const pass of [1,2,0]){
   if(pass!==0)gl.clear(gl.DEPTH_BUFFER_BIT);
   if(pass!==0){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthFunc(pass===2?gl.LESS:gl.LEQUAL);}
   else {gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthFunc(gl.LEQUAL);}
   gl.uniform1f(u.pass,pass);gl.uniform1f(u.shadowOpacity,.26);
   const strip=(kind,near,fade,far)=>{
    const {buf,sections}=scenery[kind];
    const first=sections[Math.max(0,Math.floor((cam[1]+near)/24)+1)];
    const stop=sections[Math.min(sections.length-1,Math.ceil((cam[1]+far)/24)+1)];
    gl.uniform2f(u.visibility,fade,far);bind(buf);gl.drawArrays(gl.TRIANGLES,first,stop-first);
   };
   gl.uniform1f(u.moving,0);
   if(pass===0)strip(2,96,236,336);
   if(pass===2)strip(1,-12,80,198);
   else strip(0,-12,112,174);
   gl.uniform1f(u.moving,1);bind(dynamic);gl.drawArrays(gl.TRIANGLES,0,engine.particleStart());
  }
  const start=engine.particleStart();
  if(n>start){gl.depthMask(false);gl.drawArrays(gl.TRIANGLES,start,n-start);gl.depthMask(true);}
 };
}

// A lightweight chase view also keeps the course playable when a browser disables WebGL.
function canvasFlight(canvas,simulation){
 const core=simulation.geometry,ctx=canvas.getContext('2d',{alpha:false}),w=canvas.width,h=canvas.height;
 const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#161b3d');sky.addColorStop(.43,'#9c6177');sky.addColorStop(.44,'#333448');sky.addColorStop(1,'#101e32');
 const sprites=[4,5,6].map(tile=>{
  const img=document.createElement('canvas');img.width=img.height=64;
  const ptr=core.surfaceMap(tile),pixels=new Uint8ClampedArray(core.memory.buffer,ptr,64*64*4);
  img.getContext('2d').putImageData(new ImageData(pixels.slice(),64,64),0,0);return img;
 });
 const palette=new Map();
 function color(rgb){
  if(!palette.has(rgb))palette.set(rgb,'#'+rgb.toString(16).padStart(6,'0'));
  return palette.get(rgb);
 }
 return s=>{
  const size=core.canvasFrame(w,h,s.previewPan??0),data=new Float32Array(core.memory.buffer,core.canvasData(),size);
  const cameraZ=s.distance-s.laps*simulation.LAP-9.2;
  const horizonShift=Math.min(w,h)*.76*core.cameraPitch(cameraZ);
  ctx.save();ctx.translate(0,horizonShift);
  ctx.fillStyle=sky;ctx.fillRect(0,-horizonShift,w,h);ctx.restore();
  // See CanvasScene::Op. Positions and painter order come from C++.
  for(let i=0;i<size;){
   const op=data[i++];
   if(op===-6){
    const tile=data[i++],x=data[i++],y=data[i++],rx=data[i++],ry=data[i++],angle=data[i++],alpha=data[i++];
    ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.rotate(angle);ctx.drawImage(sprites[tile-4],-rx,-ry,2*rx,2*ry);ctx.restore();continue;
   }
   if(op===-5){ctx.globalAlpha=data[i++];continue;}
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
 // Brief stalls should not drop a hardware renderer mid-race.
 let slow=0,fast=0;
 function sampleFrameTime(ms){
  if(backend!=='webgl')return;
  slow=ms>(tier===budgets.length-1?58:26)?slow+1:0;
  fast=ms<19?fast+1:0;
  if(tier<budgets.length-1 && slow>=2){tier++;slow=fast=0;resize();}
  else if(tier>0 && fast>=14){tier--;slow=fast=0;resize();}
  else if(tier===budgets.length-1 && slow>=7)simplify();
 }
 return {draw:s=>{lastScene=s;draw(s);},sampleFrameTime,get backend(){return backend;}};
}
