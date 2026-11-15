// Reuse the canal and ship meshes. The browser keeps the repeating scenery in GPU memory.
#include "raceway.hpp"
#include "scene-cues.hpp"

static std::vector<Vertex> mesh;
static float objects[32][4]; // Lane X, world Z, object kind, animation phase.
static_assert(sizeof(Vertex)==16);

static Frame geometryFrame(double time){
    W=H=0;
    cue=sceneCues;
    Frame f(time,8);
    f.geometry=&mesh;
    f.widthFactor=1;
    return f;
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
    }
    starts[6]=int(mesh.size());
    return starts[6];
}
const Vertex* vertices(){return mesh.data();}
float* objectBuffer(){return &objects[0][0];}

int actors(double time,double distance,double x,double lean,double thrust,int count){
    mesh.clear();
    Frame f=geometryFrame(time);
    f.cz=distance-6.4;f.chaseLag=0;f.pilot=x;f.bank=lean;f.boost=thrust;f.anim=time;
    f.ship(true);
    for(int i=0;i<std::clamp(count,0,32);i++){
        const float xx=objects[i][0],z=objects[i][1],kind=objects[i][2],age=objects[i][3];
        double y=1.85;
        if(kind==0 || kind==4){
            // Hollow checkpoint. Its centre is also the collision target.
            const double r=kind==4?6.5:1.65;
            C c=kind==4?C{255,212,96}:C{54,255,193};
            auto v=[&](int j,double radius,double zz){double a=j*pi/4+pi/8;return V{xx+radius*std::cos(a),y+radius*std::sin(a),z+zz};};
            for(int j=0;j<8;j++){
                f.quad(v(j,r,0),v(j+1,r,0),v(j+1,r-.23,0),v(j,r-.23,0),c);
                f.quad(v(j,r,0),v(j+1,r,0),v(j+1,r,.34),v(j,r,.34),{23,117,107});
            }
            if(kind==0)f.tri({xx-.28,y,z},{xx,y+.39,z},{xx+.28,y,z},{218,255,240});
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
