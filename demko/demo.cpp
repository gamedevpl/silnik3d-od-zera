// Reuse the canal and ship meshes. The browser keeps the repeating scenery in GPU memory.
#include "raceway.hpp"
#include "scene-cues.hpp"

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

extern "C" {
static int starts[7];
int sectionStart(int index){return starts[index];}
int sceneBlock(int simple){
    mesh.clear();
    Frame f=geometryFrame(0);
    f.block=true;f.simple=simple!=0;
    for(int z=0;z<144;z+=24){
        starts[z/24]=int(mesh.size());f.cz=z;f.skyline();f.rings();f.lightBays();
        // Short dash groups divide the broad deck into passing lanes.
        for(int lane=-2;lane<=2;lane++)for(int j=0;j<2;j++){
            double x=lane*7.0, zz=z+j*12.;
            f.quad({x-.10,.08,zz},{x+.10,.08,zz},{x+.10,.08,zz+4},{x-.10,.08,zz+4},
                   lane==0?C{190,169,130}:C{104,163,179});
        }
    }
    starts[6]=int(mesh.size());
    return starts[6];
}
const Vertex* vertices(){return mesh.data();}
float* objectBuffer(){return objects;}

int actors(double time,double distance,double x,double lean,double thrust,int count){
    mesh.clear();
    Frame f=geometryFrame(time);
    f.cz=distance-6.4;f.chaseLag=0;f.pilot=x;f.bank=lean;f.boost=thrust;f.anim=time;
    f.ship(true);
    for(int i=0;i<std::clamp(count,0,64);i++){
        const float *o=objects+4*i;
        const float xx=o[0],z=o[1],kind=o[2],age=o[3];
        double y=1.85;
        if(kind>=6){
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
