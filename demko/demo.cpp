// Reuse the canal and ship meshes. The browser keeps the repeating scenery in GPU memory.
#include "raceway.hpp"
#include "scene-cues.hpp"
#include "circuit.hpp"

static std::vector<Vertex> mesh;
static float objects[64*4]; // Lane X, world Z, object kind, animation phase.
static_assert(sizeof(Vertex)==16);

static Frame geometryFrame(double time){
    W=H=0;
    cue=sceneCues;
    Frame f(time,8);
    f.geometry=&mesh;
    f.widthFactor=3.15;
    return f;
}

static void rival(Frame &f,int id,double x,double z,double bank){
    const C colors[]={{52,228,208},{249,97,152},{246,197,71},{125,145,255},{211,114,248},{136,226,107}};
    const C paint=colors[id], trim=mix(paint,{246,248,236},.63);
    const double cs=std::cos(bank),sn=std::sin(bank),wing=1.5+.23*(id%3);
    auto p=[&](double a,double b,double c){return V{x+a*cs-b*sn,1.85+b*cs+a*sn,z+c};};
    V nose=p(0,.05,2.5),canopy=p(0,.60,.05),tail=p(0,.10,-1.4);
    for(int side:{-1,1}){
        V shoulder=p(side*.56,.19,.5),tip=p(side*wing,-.1,-.98),jet=p(side*.8,.12,-1.35);
        f.tri(nose,shoulder,canopy,trim);f.tri(shoulder,tail,canopy,{66,78,98});
        f.tri(shoulder,tip,jet,paint);f.tri(shoulder,jet,tail,paint);
        f.tri(tip,jet,p(side*(wing-.14),.50,-1.36),trim);
        f.tri(jet,p(side*.58,.1,-1.32),p(side*.70,.10,-3.65),paint);
        for(int j=0;j<4;j++){
            auto trail=[&](int k,double edge){
                double u=k/4.;
                return p(side*.70+bank*u*u*.85+edge*.12*(1-u),.07-.30*u,-1.6-5.7*u);
            };
            f.quad(trail(j,-1),trail(j,1),trail(j+1,1),trail(j+1,-1),mix(paint,{87,86,129},j*.18));
        }
        f.tri(jet,p(side*.58,.1,-1.32),p(side*.70,.10,-2.05),{226,251,247});
    }
    f.tri(p(-.23,.40,.2),p(.23,.40,.2),p(0,.29,1.43),{42,86,110});
}

// The open lock bridge and cable cranes give each part of a lap a different skyline.
static void landmark(Frame &f,int k,double z){
    const C steel={70,86,109}, shade={32,39,65}, ice={90,246,229}, gold={255,174,76};
    auto girder=[&](V a,V b,double half,C col){
        V d=b-a; double len=std::hypot(d.x,d.y);
        if(len<.001)return;
        V n{-d.y*half/len,d.x*half/len,0};
        f.quad(a+n,b+n,b-n,a-n,col);
    };
    if(k==0){
        f.box(-21,8.7,z,42,.85,1.6,steel,shade);
        for(int i=0;i<32;i++)for(int j=0;j<2;j++)
            f.box(-12+i*.75,8.72+j*.37,z-.03,.75,.37,.05,(i+j)%2?shade:C{230,236,218},shade);
    }
    if(neon::district(k)==neon::District::Locks && (k==7||k==16)){
        for(int side:{-1,1}){
            double x=side*19.4;
            f.box(x-1,0,z,2,13,4,steel,shade);
            f.box(x-1.5,10.6,z-.6,3,1.7,4.8,shade,steel);
            f.box(x-.6,3,z-.06,1.2,5,.18,ice,ice);
            for(int j=0;j<3;j++){
                double a=side*(19-j*5.8),b=a-side*5.8;
                girder({a,12,z},{b,15.2,z},.24,steel);
                girder({a,15.2,z},{b,12,z},.20,steel);
            }
        }
        f.box(-20,11.5,z,40,.85,4,steel,shade);
        f.box(-20,14.9,z,40,.52,2.1,steel,shade);
        f.box(-19,11.45,z-.15,38,.16,.25,ice,ice);
    }
    if(neon::district(k)==neon::District::Shipyard && k%4==0){
        int side=(k%8==0)?1:-1;
        double x=side*22;
        f.box(x-1,0,z,2,22,3.8,steel,shade);
        girder({x,20,z},{side*6.,15,z},.48,gold);
        girder({x,15,z},{side*6.,15,z},.34,steel);
        girder({x,21.4,z},{side*12.,16.8,z},.08,ice);
        f.box(side*6-.07,10,z,.14,5,.24,gold,gold);
        f.box(side*6-1.3,9.2,z,2.6,1.15,1.5,steel,shade);
    }
}

extern "C" {
int circuitSection(int section,int simple){
    mesh.clear();Frame f=geometryFrame(0);f.block=true;f.simple=simple!=0;
    int k=neon::circuitIndex(section);
    double z=k*24;f.cz=z;
    auto district=neon::district(k);
    f.skyline();f.rings(district==neon::District::Quay && k!=0 && k%2);f.lightBays();
    landmark(f,k,z+15);
    C edge=district==neon::District::Locks?C{80,229,210}:district==neon::District::Shipyard?C{255,178,79}:C{111,159,241};
    for(int side:{-1,1}){
        double x=side*18.4;
        f.quad({x-.13,.09,z},{x+.13,.09,z},{x+.13,.09,z+24},{x-.13,.09,z+24},edge);
        if(k%2==0){
            for(int j=0;j<3;j++)
                f.box(side*18.9-.09,.2,z+j*2,.18,.65,.62,edge,edge);
        }
    }
    for(int lane=-2;lane<=2;lane++)for(int j=0;j<2;j++){
        double x=lane*7.0,zz=z+j*12.;
        f.quad({x-.10,.08,zz},{x+.10,.08,zz},{x+.10,.08,zz+4},{x-.10,.08,zz+4},
               lane==0?C{190,169,130}:C{104,163,179});
    }
    return int(mesh.size());
}
const Vertex* vertices(){return mesh.data();}
float* objectBuffer(){return objects;}

// An impeller on the lock wall breaks the bridge silhouette on approach.
static void lockTurbine(Frame &f,double distance,double time){
    constexpr double z=7*24+13,x=-20.6,y=11.7;
    if(z<distance-14 || z>distance+156)return;
    auto point=[&](double a,double r){return V{x+r*std::cos(a),y+r*std::sin(a),z};};
    for(int i=0;i<24;i++){
        double a=2*pi*i/24,b=2*pi*(i+1)/24;
        f.quad(point(a,4.4),point(b,4.4),point(b,4.05),point(a,4.05),i%6?C{83,124,137}:C{150,252,221});
    }
    for(int i=0;i<6;i++){
        double a=i*pi/3+time*.85;
        f.quad(point(a,.52),point(a+.34,.52),point(a+.72,3.9),point(a+.43,4.0),{230,157,86});
        f.tri(point(a+.43,4),point(a+.72,3.9),point(a+.66,3.1),{255,215,139});
    }
    f.box(x-.55,y-.55,z-.12,1.1,1.1,.3,{93,236,214},{60,85,103});
}
int actors(double time,double distance,double x,double lean,double thrust,int count){
    mesh.clear();
    Frame f=geometryFrame(time);
    f.cz=distance-6.4;f.chaseLag=0;f.pilot=x;f.bank=lean;f.boost=thrust;f.anim=time;
    lockTurbine(f,distance,time);
    f.ship(true);
    for(int i=0;i<std::clamp(count,0,64);i++){
        const float *o=objects+4*i;
        const float xx=o[0],z=o[1],kind=o[2],age=o[3];
        double y=1.85;
        if(kind==12){ // A pair of lanes in the active slipstream.
            for(int j=0;j<5;j++)for(int side:{-1,1}){
                double zz=z-4-j*2.6,ox=xx+side*(1.25+j*.13);
                C col=mix({44,119,154},{125,255,230},.32+.48*age+.20*std::sin(time*6-j));
                f.quad({ox,.32,zz+1.4},{ox+side*.18,.32,zz+1.4},{ox+side*.48,.32,zz},{ox+side*.18,.32,zz},col);
            }
        }else if(kind==13){
            for(int side:{-1,1}){
                f.box(xx+side*2.25-.07,1.8,z,.14,1.25,.10,{255,204,112},{255,204,112});
                f.box(xx+side*2.0-.28,2.92,z,.56,.13,.10,{255,223,145},{255,223,145});
            }
        }else if(kind==14){
            for(int j=0;j<12;j++){
                double a=j*pi/6,r=2.1+1.5*(1-age),b=a+.32;
                auto q=[&](double t,double rr){return V{xx+rr*std::cos(t),1.85+.68*rr*std::sin(t),z};};
                f.quad(q(a,r),q(b,r),q(b,r+.28*age),q(a,r+.28*age),mix({224,119,58},{255,253,212},age));
            }
        }else if(kind>=6){
            rival(f,int(kind)-6,xx,z,age);
        }else if(kind==0){
            for(int j=0;j<3;j++)for(int side:{-1,1}){
                const double zz=z+j*1.9-2;
                f.quad({xx,.14,zz+1.8},{xx+side*2.9,.14,zz},{xx+side*2.9,.14,zz-.65},{xx,.14,zz+1.1},
                       j==2?C{180,255,222}:C{42,236,174});
            }
        }else if(kind==1){
            V top{xx,y+1.15,z},bottom{xx,y-.89,z};
            for(int j=0;j<4;j++){
                auto v=[&](int k){double a=k*pi/2+time*.9;return V{xx+1.3*std::cos(a),y,z+1.3*std::sin(a)};};
                f.tri(top,v(j),v(j+1),j%2?C{255,103,65}:C{209,58,55});
                f.tri(bottom,v(j+1),v(j),{123,46,62});
            }
            f.box(xx-.82,y-.10,z-.73,1.64,.20,.18,{255,202,105},{199,91,61});
        }else if(kind==2 || kind==3){
            double width=kind==3?.28:.11;
            f.box(xx-width,y-.06,z,2*width,.14,kind==3?2.4:1.6,{255,226,118},{84,234,255});
        }else if(kind==5){
            for(int j=0;j<12;j++){
                double a=j*2*pi/12,spread=.2+age*5;
                V p{xx+spread*std::cos(a),y+spread*std::sin(a),z};
                f.tri(p,p+V{.2,.1,.2},p+V{.1,.45,.16},j%2?C{255,191,86}:C{255,91,68});
            }
        }
    }
    return int(mesh.size());
}
}
