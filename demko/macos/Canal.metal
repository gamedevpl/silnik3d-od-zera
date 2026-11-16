#include <metal_stdlib>
using namespace metal;
struct MeshVertex { packed_float3 p; uchar4 tint; };
struct View { float4 camera, lens, effects, visibility, pilot, terrain; float4 lamps[16]; }; // scale X/Y, aspect, framing; clock, pass, moving
struct Varying { float4 pos [[position]]; float3 color,world; float mat; float distance,alt,sourceDepth; };
constexpr sampler repeatMap(coord::normalized,address::repeat,filter::linear,mip_filter::linear);
struct Sky { float4 pos [[position]]; float2 uv; };
vertex Sky skyVertex(uint id [[vertex_id]]){
    float2 p=id==0?float2(-1,-1):id==1?float2(3,-1):float2(-1,3);
    return {float4(p,0,1),p};
}
fragment float4 skyPixel(Sky in [[stage_in]],constant View &v [[buffer(1)]]){
    float x=in.uv.x*v.lens.z/v.lens.w,y=(in.uv.y-.14)/v.lens.w+v.camera.w*x+v.terrain.x*v.lens.y/v.lens.w;
    bool water=y<0;float sy=abs(y);
    if(water)x+=.010*sin(y*75+v.effects.x*2)*min(1.f,-y*3);
    float longitude=v.terrain.y+atan(x/1.55);
    float delta=longitude-.34;
    float2 p=float2(1.55*atan2(sin(delta),cos(delta)),sy-.36);
    float3 sky=mix(float3(.58,.34,.44),float3(.069,.093,.22),smoothstep(0.f,1.f,sy));
    float dist=length(p);sky+=float3(.29,.15,.06)*exp(-8*dist);
    float2 tilt=float2(p.x+.21*p.y,p.y-.21*p.x);
    float ring=abs(length(tilt/float2(.32,.040))-1);
    if(dist<.16)sky=mix(float3(1,.69,.41),float3(1,.91,.65),smoothstep(-.15f,.15f,p.y));
    if(ring<.13&&(tilt.y<0||dist>.16))sky=float3(1,.84,.57);
    float2 star=floor(float2(fract(longitude/6.2831853)*2074.,sy*220.));star-=61*floor(star/61);
    if(!water&&sy>.31&&dist>.19&&fract(sin(dot(star,float2(17.7,45.3)))*299)>.996)sky+=.28;
    float ridge=.018+.014*sin(8.*longitude)+.009*sin(23.*longitude);
    float3 mist=float3(.38,.27,.38);
    if(!water && sy<ridge)sky=mix(mist,float3(.48,.34,.43),sy/ridge);
    if(water){
        float waves=sin(5/(.075+sy)+x*2+v.effects.x*.9);
        sky=mix(mist,mix(float3(.045,.11,.16),sky,.39+.065*waves)+.007*waves,smoothstep(0.f,.11f,sy));
    }
    return float4(sky,1);
}
vertex Varying worldVertex(uint id [[vertex_id]], const device MeshVertex *vertices [[buffer(0)]],constant View &v [[buffer(1)]]){
    MeshVertex vert=vertices[id];float3 p=vert.p;float z=p.z,y=p.y;
    float x=p.x-v.camera.x-(z-v.camera.y)*v.camera.z;
    if(v.effects.y>1.5){x-=y*.94;z-=y*3.5;y=.014;}
    else if(v.effects.y>.5){x+=.065*sin(z*1.83+v.effects.x*1.8+p.y);y=-y;}
    float d=z-v.camera.y,h=y-4.15-v.effects.w;
    return {float4((x+v.camera.w*h)*v.lens.x,(h-v.camera.w*x-d*v.terrain.x)*v.lens.y+.14*d,1.0022*d-.805,d),float3(vert.tint.rgb)/255,p,float(vert.tint.a),d,p.y,p.z-v.camera.y};
}
float3 incidentLight(float3 p,float3 n,float3 eye,float polish,constant View &v){
 float3 sum=float3(0.f);
 for(int i=0;i<16;i++){
  float4 source=v.lamps[i];
  if(source.w==0.f)break;
  float3 delta=source.xyz-p;
  float d2=dot(delta,delta);
  if(d2>=144.f)continue;
  float3 light=delta*rsqrt(max(.001f,d2));
  float facing=max(0.f,dot(n,light));
  float3 halfDir=light+eye;
  float spec=max(0.f,dot(n,halfDir)*rsqrt(max(.001f,dot(halfDir,halfDir))));
  float falloff=1.f-d2/144.f;
  float energy=abs(source.w)*falloff*falloff/(1.f+.42f*d2);
  float3 tint=source.w>0.f?float3(.075f,.60f,1.f):float3(1.f,.24f,.032f);
  sum+=tint*energy*(.12f+.64f*facing+polish*facing*pow(spec,22.f));
 }
 return sum;
}
fragment float4 worldPixel(Varying in [[stage_in]],constant View &v [[buffer(1)]],texture2d<float> steel [[texture(0)]],texture2d<float> glass [[texture(1)]],texture2d<float> cladding [[texture(2)]],texture2d<float> hull [[texture(3)]],texture2d<float> smoke [[texture(4)]],texture2d<float> flame [[texture(5)]],texture2d<float> ember [[texture(6)]],texture2d<float> city [[texture(7)]]){
    if(in.alt<-.04||in.distance>=v.visibility.y)discard_fragment();
    float range=1-smoothstep(v.visibility.x,v.visibility.y,in.distance);
    if(in.mat>23.5f && in.mat<24.5f){if(v.effects.y>.5f)discard_fragment();return float4(in.color,.88f);}
    if(v.effects.y>1.5)return float4(.04,.075,.13,.26*range*(1-smoothstep(152.f,192.f,in.sourceDepth)));
 float3 viewDir=normalize(float3(v.camera.x,4.15+v.effects.w,v.camera.y)-in.world);
 if(in.mat>52.5 && in.mat<53.5){
  float3 normal=normalize(float3(.035*sin(in.world.z*1.7+v.effects.x),1.,.05*sin(in.world.x*2.-v.effects.x)));
  float3 spill=incidentLight(in.world,normal,viewDir,1.6,v)*.76;
  return float4(spill/(1.+.52*spill),0.);
 }
 if(in.mat>51.5 && in.mat<52.5){
  float3 emission=mix(float3(.98,.19,.025),float3(1.,.96,.68),in.color.r*in.color.r);
  float flicker=sin(in.world.z*3.-v.effects.x*11.+2.*sin(in.world.y*6.+in.world.x*2.));
  float veil=smoothstep(.08,.82,in.color.g+.34*flicker);
  return float4(emission,.46*veil*in.color.g*range);
 }
 if(in.mat>79.5){
  float hot=step(143.5,in.mat);
  float ion=step(207.5,in.mat);
  float age=clamp((floor(in.mat+.5)-80.-64.*(hot+ion))/(63.-16.*ion),0.,1.);
  float3 p=in.color*2.-1.;
  float3 ray=in.world-float3(v.camera.x,4.15+v.effects.w,v.camera.y);
  ray=normalize(ray*float3(1.,1.,1./1.7));
  float along=dot(p,ray),disc=along*along-dot(p,p)+1.;
  if(disc<=0.)discard_fragment();
  float chord=2.*sqrt(disc),stride=chord/6.;
  p+=ray*(-along-.5*chord+.5*stride);
  float opacity=0.;float3 light=float3(0.);
  float heat=hot*(1.-smoothstep(.15,.52,age));
  for(int j=0;j<6;j++){
   float3 q=p*4.+float3(age*2.,-3.*age,age);
   float eddy=sin(q.x+1.5*sin(q.z))*cos(q.y+.8*sin(q.x+q.z));
   float folds=.12*eddy+.055*sin(2.7*q.y+1.8*q.z+2.*eddy);
   float mass=smoothstep(0.,.70,1.-dot(p,p)+folds-.23);
   float cover=mass*stride*(.90+.16*eddy)*(1.-smoothstep(.38,1.,age));
   float shade=clamp(.40+.22*p.y-.16*p.x+.23*eddy,0.,1.);
   float3 soot=mix(float3(.075,.087,.115),float3(.63,.63,.65),shade);
   float core=clamp(mass*.82+.16*eddy+.10,0.,1.);
   float3 fire=mix(float3(.96,.18,.035),float3(1.,.94,.66),core*core);
   float3 plasma=mix(float3(.10,.36,1.),float3(.45,1.,1.),core);
   float3 emission=mix(fire,plasma,ion);
   float3 scatter=mix(soot,emission,heat*core);
   light+=(1.-opacity)*cover*(scatter+emission*heat*(.38+.62*core));
   opacity+=(1.-opacity)*cover;
   p+=ray*stride;
  }
  return (float4(light/max(.001,opacity),opacity*range));
 }
    if(in.mat>7.5 && in.mat<8.5){
        if(v.effects.y>.5)discard_fragment();
  float lane=(in.color.r-.5f)*37.1f;
  float2 uv=float2(lane,in.world.z);
  float2 panel=abs(fract(uv/float2(6.f,12.f))-.5f);
  float nearDetail=1.f-smoothstep(16.f,52.f,in.distance);
  float seam=smoothstep(.485f,.499f,max(panel.x,panel.y));
  float4 metal=steel.sample(repeatMap,uv/float2(3.f,5.f));
  float service=1.f-smoothstep(.62f,.72f,abs(abs(lane)-15.8f));
  float hatch=1.f-smoothstep(.12f,.20f,abs(fract((abs(lane)+uv.y)*.48f)-.5f));
  float strip=1.f-smoothstep(.045f,.085f,abs(abs(lane)-14.85f));
  float fres=smoothstep(4.f,75.f,in.distance);
  float3 tint=mix(float3(.075f,.13f,.18f),float3(.21f,.28f,.35f),fres);
  tint+=nearDetail*(float3(.14f,.18f,.19f)*(metal.b-.55f)+seam*.09f);
  float3 shoulder=mix(float3(.15f,.19f,.21f),float3(.65f,.46f,.24f),hatch*.66f);
  tint=mix(tint,shoulder,service*(.25f+.75f*nearDetail));
  tint+=strip*float3(.12f,.26f,.27f)*nearDetail;
  tint+=incidentLight(in.world,float3(0.,1.,0.),viewDir,.65,v)*(.46+.54*tint);
  return float4(tint,mix(.69f,.90f,fres)*range);
    }
 if(in.mat>39.5f){
  float3 base=in.mat<40.5f?float3(.96f,.48f,.19f):in.mat<41.5f?float3(.16f,.83f,.69f):in.mat<42.5f?float3(.97f,.32f,.56f):
    in.mat<43.5f?float3(.98f,.70f,.20f):in.mat<44.5f?float3(.43f,.54f,.96f):in.mat<45.5f?float3(.73f,.43f,.92f):
    in.mat<46.5f?float3(.48f,.79f,.35f):in.mat<47.5f?float3(.71f,.77f,.79f):in.mat<48.5f?float3(.12f,.31f,.40f):
    in.mat<49.5f?float3(.16f,.20f,.24f):in.mat<50.5f?float3(.39f,.91f,1.f):float3(.99f,.88f,.63f);
  float2 uv=in.color.rg;
  float4 skin=hull.sample(repeatMap,uv*float2(2.f,2.f));
  float l=in.color.b;
  float highlight=pow(max(0.f,1.f-abs(l-.79f)*6.f),3.f);
  float2 bump=skin.rg*2.f-1.f;
  float light=clamp(l+.20f*bump.y-.14f*bump.x,0.f,1.f);
  float polish=1.f-skin.a;
  float3 shaded=base*(.36f+.77f*light+.53f*(skin.b-.53f)) + highlight*float3(.22f,.20f,.17f)*(.58f+.85f*polish);
  if(in.mat<47.5f){
   // Circumferential joints and the access stencil stay fixed to the local hull.
   float joint=1.f-smoothstep(.013f,.050f,abs(fract(uv.y*5.f+.18f)-.5f));
   shaded*=1.f-.34f*joint;
   float band=1.f-smoothstep(.036f,.048f,abs(uv.x-.25f));
   float warning=step(.52f,fract(uv.y*22.f+uv.x*9.f))*band*smoothstep(.12f,.16f,uv.y)*(1.f-smoothstep(.28f,.32f,uv.y));
   shaded=mix(shaded,float3(.97f,.69f,.27f)*(.65f+.4f*l),warning*.82f);
  }
  if(in.mat<46.5f){
   float stripe=smoothstep(.21f,.24f,uv.y)*(1.f-smoothstep(.26f,.29f,uv.y));
   shaded=mix(shaded,float3(.90f,.86f,.72f)*(.45f+.55f*l),stripe*.88f);
  }else if(in.mat>47.5f && in.mat<48.5f){
   float horizon=smoothstep(.65f,.78f,l);
   shaded=mix(float3(.025f,.095f,.15f),float3(.28f,.54f,.61f),horizon)+
          float3(.85f,.68f,.48f)*pow(max(0.f,1.f-abs(l-.76f)*15.f),3.f);
   shaded*=1.f-.55f*(1.f-smoothstep(.008f,.025f,abs(uv.y-.36f)));
  }else if(in.mat>49.5f && in.mat<50.5f)shaded=base*(.86f+.14f*l);
  float3 face=cross(dfdx(in.world),dfdy(in.world));
  float3 n=face*rsqrt(max(.00000001f,dot(face,face)));
  if(dot(n,viewDir)<0.)n=-n;
  shaded+=incidentLight(in.world,n,viewDir,polish,v)*(.25+.55*shaded);
  if(v.effects.y>.5f)shaded=mix(float3(.045f,.082f,.125f),shaded,.47f);
  float opacity=v.effects.y>.5f ? .065f+.355f*smoothstep(6.f,22.f,in.distance) : 1.f;
  return float4(mix(shaded,float3(.40f,.30f,.43f),.65f*smoothstep(36.f,155.f,in.distance)),opacity*range);
 }
    if(in.mat>31.5){
        constexpr sampler spriteMap(coord::normalized,address::clamp_to_edge,filter::linear,mip_filter::linear);
        float4 s=in.mat<32.5?smoke.sample(spriteMap,in.color.rg):in.mat<33.5?flame.sample(spriteMap,in.color.rg):ember.sample(spriteMap,in.color.rg);
        return float4(s.rgb,s.a*in.color.b*range);
    }
    float3 c=mix(in.color,float3(.40,.30,.43),.75*smoothstep(35.f,159.f,in.distance));
    float mat=in.mat,pass=v.effects.y,lift=v.effects.w,haze=.75f*smoothstep(35.f,159.f,in.distance);
    float3 world=in.world,color=in.color;float4 cam=v.camera;
    if(mat>.5f && (pass<.5f || (mat>1.5f && mat<3.5f))){
  bool deck=mat<1.5f;
  float2 uv=deck?world.xz/6.f:(mat<2.5f?world.xy:world.zy)/5.f;
  float4 tex;
  if(mat<3.5)tex=deck?steel.sample(repeatMap,uv):glass.sample(repeatMap,uv);
  else if(mat<6.5){
   uv=(mat<4.5?world.xy:mat<5.5?world.zy:world.xz)/5;
   tex=cladding.sample(repeatMap,uv);
  }else{
   float dz=world.z-v.pilot.y;
   uv=float2((world.x-v.pilot.x-dz*v.pilot.z)*cos(v.pilot.w)+(world.y-lift-1.85)*sin(v.pilot.w),dz)/2.8+float2(.5,.55);
   tex=hull.sample(repeatMap,uv);
  }
  float2 bump=tex.rg*2.f-1.f;
  float3 n=normalize((deck || mat>5.5)?float3(bump.x,1.f,bump.y):((mat<2.5 || (mat>3.5 && mat<4.5))?float3(bump.x,bump.y,-1.f):float3(sign(cam.x-world.x),bump.y,bump.x)));
  float3 eye=normalize(float3(cam.x,4.15f+lift,cam.y)-world);
  float3 light=normalize(float3(.42f,.36f,.94f));
  float gloss=pow(max(dot(n,normalize(eye+light)),0.f),mix(64.f,9.f,tex.a));
  float fres=pow(1.f-clamp(abs(dot(n,eye)),0.f,1.f),3.f);
  float3 shaded=color*(.66f+.48f*tex.b+.19f*dot(n,light))+
      float3(.86f,.56f,.35f)*gloss*(1.f-tex.a)*.52f+
      float3(.27f,.43f,.55f)*fres*(deck?.14f:.25f);
  if(mat>1.5 && mat<3.5){
   float2 wall=mat<2.5?world.xy:world.zy;
   float4 rooms=city.sample(repeatMap,wall/float2(13,17));
   shaded=shaded*.54+rooms.rgb*(.31+.53*rooms.a);
  }
  if(mat>3.5 && mat<6.5){
   float2 p=fract(uv);float inset=step(.12f,p.x)*step(p.x,.71f)*step(.37f,p.y)*step(p.y,.65f);
   float stripe=smoothstep(.45f,.52f,fract((p.x+p.y)*6))*inset;
   shaded=mix(shaded,float3(.79,.51,.19),.53f*stripe*(1-smoothstep(15.f,43.f,in.distance)));
  }
  shaded+=incidentLight(world,n,eye,1.-tex.a,v)*(.32+.6*shaded);
  c=mix(shaded,float3(.40f,.30f,.43f),haze);
 }
    if(v.effects.y>.5){
        float grazing=smoothstep(5.f,65.f,in.distance);
        float light=smoothstep(.50f,.90f,max(in.color.r,max(in.color.g,in.color.b)));
        c=mix(float3(.045,.082,.125),c,mix(.38f,.62f,grazing)+.13f*light);
    }
    float alpha=v.effects.y>.5 && v.effects.z>.5 ? (.065+.355*smoothstep(6.f,22.f,in.distance)) : 1;
    return float4(c,alpha*range);
}

fragment float4 heatPixel(Varying in [[stage_in]],constant View &v [[buffer(1)]],texture2d<float> scene [[texture(0)]]){
 constexpr sampler screenMap(coord::normalized,address::clamp_to_edge,filter::linear);
 float2 texel=1./float2(scene.get_width(),scene.get_height());
 float2 p=in.color.rg;
 float edge=1.-smoothstep(.24,1.,abs(2.*p.x-1.));
 float envelope=edge*smoothstep(0.,.15,p.y)*(1.-smoothstep(.57,1.,p.y));
 float fire=step(55.5,in.mat);
 float phase=v.effects.x*(9.+fire*2.)+in.world.x*1.4;
 float waves=sin(12.*p.y-phase+1.2*sin(6.*p.x+.47*phase));
 float curls=sin(9.*p.x+5.*p.y+.85*phase+waves);
 float strength=envelope*in.color.b;
 float2 bend=float2(waves,curls*.60)*strength*min(4.f,23.f/max(in.distance,1.f));
 float3 behind=scene.sample(screenMap,clamp((in.pos.xy+bend*float2(1,-1))*texel,texel*.5,1.-texel*.5)).rgb;
 float3 tint=mix(float3(.05,.48,1.),float3(1.,.28,.035),fire);
 float3 glow=tint*in.color.b*(.12+.16*(.5+.5*waves))*edge;
 return float4(behind+glow,strength*.88);
}
