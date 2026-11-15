#include <metal_stdlib>
using namespace metal;
struct MeshVertex { packed_float3 p; uchar4 tint; };
struct View { float4 camera, lens, effects; }; // scale X/Y, aspect, framing; clock, pass, moving
struct Varying { float4 pos [[position]]; float3 color; float distance,alt; };
struct Sky { float4 pos [[position]]; float2 uv; };
vertex Sky skyVertex(uint id [[vertex_id]]){
    float2 p=id==0?float2(-1,-1):id==1?float2(3,-1):float2(-1,3);
    return {float4(p,0,1),p};
}
fragment float4 skyPixel(Sky in [[stage_in]],constant View &v [[buffer(1)]]){
    float x=in.uv.x*v.lens.z/v.lens.w,y=(in.uv.y-.14)/v.lens.w+v.camera.w*x;
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
    if(sy>.31&&dist>.19&&fract(sin(dot(star,float2(17.7,45.3)))*299)>.996)sky+=.28;
    if(water)sky=mix(float3(.045,.11,.16),sky,.46)+.012*sin(y*118+v.effects.x*2);
    return float4(sky,1);
}
vertex Varying worldVertex(uint id [[vertex_id]], const device MeshVertex *vertices [[buffer(0)]],constant View &v [[buffer(1)]]){
    MeshVertex vert=vertices[id];float3 p=vert.p;float z=p.z,y=p.y;
    float x=p.x-v.camera.x-(z-v.camera.y)*v.camera.z;
    if(v.effects.z>.5){
        float a=z*.00545415391;x+=17*sin(3*a)+10*sin(2*a+.8)+4*sin(6*a-.6);
    }
    if(v.effects.y>1.5){x-=y*.94;z-=y*3.5;y=.014;}
    else if(v.effects.y>.5)y=-y;
    float d=z-v.camera.y,h=y-4.15;
    return {float4((x+v.camera.w*h)*v.lens.x,(h-v.camera.w*x)*v.lens.y+.14*d,1.0045*d-.805,d),float3(vert.tint.rgb)/255,d,p.y};
}
fragment float4 worldPixel(Varying in [[stage_in]],constant View &v [[buffer(1)]]){
    if(in.alt<-.04||in.distance>169)discard_fragment();
    if(v.effects.y>1.5)return float4(.04,.075,.13,.26);
    float3 c=mix(in.color,float3(.40,.30,.43),.75*smoothstep(35.f,159.f,in.distance));
    if(v.effects.y>.5)c=mix(float3(.065,.14,.21),c,.48);
    return float4(c,1);
}
