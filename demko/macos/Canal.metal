#include <metal_stdlib>
using namespace metal;
struct MeshVertex { packed_float3 p; uchar4 tint; };
struct View { float4 camera, lens, effects, visibility, pilot, terrain; }; // scale X/Y, aspect, framing; clock, pass, moving
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
    float2 p=float2(x-(.48-v.camera.z*1.3),sy-.36);
    float3 sky=mix(float3(.58,.34,.44),float3(.069,.093,.22),smoothstep(0.f,1.f,sy));
    float dist=length(p);sky+=float3(.29,.15,.06)*exp(-8*dist);
    float2 tilt=float2(p.x+.21*p.y,p.y-.21*p.x);
    float ring=abs(length(tilt/float2(.32,.040))-1);
    if(dist<.16)sky=mix(float3(1,.69,.41),float3(1,.91,.65),smoothstep(-.15f,.15f,p.y));
    if(ring<.13&&(tilt.y<0||dist>.16))sky=float3(1,.84,.57);
    float2 star=floor(float2(x,sy)*220);star-=61*floor(star/61);
    if(!water&&sy>.31&&dist>.19&&fract(sin(dot(star,float2(17.7,45.3)))*299)>.996)sky+=.28;
    float ridge=.018+.014*sin(8*(x+v.camera.z))+.009*sin(23*(x+v.camera.z));
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
fragment float4 worldPixel(Varying in [[stage_in]],constant View &v [[buffer(1)]],texture2d<float> steel [[texture(0)]],texture2d<float> glass [[texture(1)]],texture2d<float> cladding [[texture(2)]],texture2d<float> hull [[texture(3)]],texture2d<float> smoke [[texture(4)]],texture2d<float> flame [[texture(5)]],texture2d<float> ember [[texture(6)]],texture2d<float> city [[texture(7)]]){
    if(in.alt<-.04||in.distance>=v.visibility.y)discard_fragment();
    float range=1-smoothstep(v.visibility.x,v.visibility.y,in.distance);
    if(v.effects.y>1.5)return float4(.04,.075,.13,.26*range*(1-smoothstep(152.f,192.f,in.sourceDepth)));
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
  return float4(tint,mix(.69f,.90f,fres)*range);
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
