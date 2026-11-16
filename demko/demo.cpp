// Reuse the canal and ship meshes. The browser keeps the repeating scenery in GPU memory.
#include "raceway.hpp"
#include "scene-cues.hpp"
#include "circuit.hpp"
#include "bridge.hpp"
#include "race.hpp"
#include "racer.hpp"
#include "damage_fx.hpp"

static std::vector<Vertex> mesh;
static int firstPuff;
extern "C" int particleStart(){return firstPuff;}
static float objects[64*6]; // Lane X, world Z, object kind, animation phase and emitter speed.
static_assert(sizeof(Vertex)==16);

static Frame geometryFrame(double time){
    W=H=0;
    cue=sceneCues;
    Frame f(time,8);
    f.geometry=&mesh;
    f.widthFactor=3.15;
    return f;
}

static void racer(Frame &f,int team,double x,double z,double bank,int wing,double speed,double thrust,double time){
    const double cs=std::cos(bank),sn=std::sin(bank);
    auto byte=[](float n){return uint8_t(255*std::clamp(n,0.f,1.f));};
    for(const auto &face:neon::racerBody(team)){
        for(auto v:{face.a,face.b,face.c}){
            v=neon::posedVertex(v,cs,sn,wing);
            mesh.push_back({float(x+v.x),float(1.85+v.y),float(z+v.z),byte(v.u),byte(v.v),byte(v.light),uint8_t(face.finish)});
        }
    }
    // A short white core inside a longer turbine plume, anchored in each exhaust throat.
    const double flow=std::clamp(speed/82.,0.,1.3);
    for(int side:{-1,1}){
        double sx=side*(1.06+.06*(team%2)),length=.48+flow*.83+thrust*.89;
        auto jet=[&](int i,double radius,double aft){
            double a=neon::tau*i/10;
            auto p=neon::posedVertex({float(sx+radius*std::cos(a)),float(.062+radius*std::sin(a)),float(-1.94-aft),0,0,0},cs,sn,wing);
            return V{x+p.x,1.85+p.y,z+p.z};
        };
        for(int i=0;i<10;i++){
            double pulse=.97+.03*std::sin(time*31+side);
            f.quad(jet(i,.147,0),jet(i+1,.147,0),jet(i+1,.112,.30),jet(i,.112,.30),{184,255,250});
            f.quad(jet(i,.112,.30),jet(i+1,.112,.30),jet(i+1,.075,.55*length),jet(i,.075,.55*length),{72,213,250});
            f.tri(jet(i,.075,.55*length),jet(i+1,.075,.55*length),jet(i,0,length*pulse),{70,121,224});
        }
    }
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

// Distant blocks share their silhouettes across all detail levels.
static void harborCity(Frame &f,int k,double z){
    if(k<20 || k>46)return;
    for(int side:{-1,1})for(int row=0;row<2;row++){
        int id=k*37+row*13+side*8;
        double x=side*(48+row*37+random01(id)*23),w=5+random01(id+2)*7,h=8+random01(id+1)*25;
        if(k==39 && side<0)h=46;
        C front=mix({45,52,77},{84,65,88},random01(id+3)),shadow=mix(front,{20,32,53},.36);
        f.surface=Frame::FacadeFront;f.box(x,0,z,w,h,10,front,shadow);
        f.box(x+w*.18,h,z+1,w*.66,2+h*.13,7.5,front,shadow);
        f.surface=Frame::Plain;
        if(k==39 && side<0){
            f.box(x+w*.36,h+3,z+3,w*.24,10,3,{96,117,136},shadow);
            f.box(x+w*.43,h+12,z+4,.24,8,.3,{252,193,121},shadow);
        }
        if(k==39 && side<0 && row==0)f.box(x-34,25,z+3,35,2.1,2.8,{112,127,142},shadow);
        if(!f.simple && k%3==row)
            f.box(x+.12,h*.82,z-.07,w-.24,.21,.10,side>0?C{239,158,96}:C{99,205,217},shadow);
    }
}
extern "C" {
int circuitSection(int section,int simple){
    mesh.clear();Frame f=geometryFrame(0);f.block=true;f.simple=simple!=0;
    int k=neon::circuitIndex(section);
    double z=k*24;f.cz=z;
    auto district=neon::district(k);
    f.skyline();
    harborCity(f,k,z);
    if(simple==2)return int(mesh.size());
    size_t trackBegin=mesh.size();
    f.surface=Frame::CladFront;
    f.rings(district==neon::District::Quay && k!=0 && k%2 && neon::viaductHeight(z)<3);if(neon::viaductHeight(z)<4)f.lightBays();
    if(neon::viaductHeight(z)<6)landmark(f,k,z+15);
    f.surface=Frame::Plain;
    auto face=[&](neon::CoursePoint a,neon::CoursePoint b,neon::CoursePoint c,neon::CoursePoint d,int rgb){
        auto saved=f.surface;
        if(saved==Frame::Plain)f.surface=Frame::CladFront;
        f.quad({a.x,a.y,a.z},{b.x,b.y,b.z},{c.x,c.y,c.z},{d.x,d.y,d.z},
               {(rgb>>16)&255,(rgb>>8)&255,rgb&255});
        f.surface=saved;
    };
    auto plate=[&](neon::CoursePoint a,neon::CoursePoint b,neon::CoursePoint c,neon::CoursePoint d,int rgb){
        f.surface=Frame::Deck;face(a,b,c,d,rgb);f.surface=Frame::Plain;
    };
    for(int j=0;j<4;j++)neon::courseSpan(z+6*j,face,plate);
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
        if(neon::islandHalf(zz+2)>0 && (x<0 || x<neon::islandHalf(zz+2)+.2))continue;
        f.quad({x-.10,.08,zz},{x+.10,.08,zz},{x+.10,.08,zz+4},{x-.10,.08,zz+4},
               lane==0?C{190,169,130}:C{104,163,179});
    }
    if(z>=480 && z<1056){
        for(int i=0;i<4;i++){
            double a=z+6*i,b=a+6;
            f.surface=Frame::SkyDeck;
            f.quad({-18.55,-.015,a},{18.55,-.015,a},{18.55,-.015,b},{-18.55,-.015,b},{46,71,86});
            f.surface=Frame::Plain;
            for(int side:{-1,1}){
                double ex=side*18.6;
                f.box(ex-.27,-.85,a,.54,.96,6,{65,82,100},{35,48,67});
                f.box(ex-.20,.15,a+.4,.40,.12,3.2,{121,240,221},{48,146,154});
            }
        }
    }
    for(size_t i=trackBegin;i<mesh.size();i++)mesh[i].y+=neon::viaductHeight(mesh[i].z);
    if(neon::viaductHeight(z+12)>3 && k%2==0){
        for(int side:{-1,1})f.box(side*15-1,0,z+12,2,neon::viaductHeight(z+12)-.15,2.4,{56,66,88},{30,44,62});
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
int actors(double time,double distance,double x,double lean,double thrust,double speed,double noseSteer,int count,int wing){
    mesh.clear();
    Frame f=geometryFrame(time);
    f.cz=distance-6.4;f.chaseLag=0;f.pilot=x;f.bank=lean;f.boost=thrust;f.anim=time;
    static std::vector<neon::Puff> puffs;
    puffs.clear();
    size_t first=0;
    auto place=[&](double x,double z,bool onTrack){
        double origin=neon::road(z),tangent=neon::slope(z);
        double deck=onTrack?neon::bridgeHeight(x,z)+neon::viaductHeight(z):0;
        const double grade=onTrack?(neon::Race::deckAt(x,z+1)-neon::Race::deckAt(x,z-1))*.5:0.;
        for(;first<mesh.size();++first){
            auto &v=mesh[first];
            v.x+=origin+(v.z-z)*tangent;
            v.y+=deck+(v.z-z)*grade;
        }
    };
    lockTurbine(f,distance,time);place(0,7*24+13,false);
    for(double pump:{336.,384.,432.}){
        if(pump<distance-4 || pump>distance+145)continue;
        neon::lockSpray(pump,time,[&](neon::CoursePoint a,neon::CoursePoint b,neon::CoursePoint c,neon::CoursePoint d,int rgb){
            f.quad({a.x,a.y,a.z},{b.x,b.y,b.z},{c.x,c.y,c.z},{d.x,d.y,d.z},{rgb>>16,(rgb>>8)&255,rgb&255});
        });
        place(0,pump,false);
    }
    bool wreck=false;
    for(int i=0;i<std::clamp(count,0,64);i++)wreck|=int(objects[i*6+2])==neon::PlayerFragments;
    if(!wreck){
        size_t start=mesh.size();
        racer(f,0,x,distance,lean,wing,speed,thrust,time);
        for(size_t i=start;i<mesh.size();i++)mesh[i].x+=(mesh[i].z-distance)*noseSteer;
    }
    if(!wreck && (neon::bridgeHeight(x,distance)+neon::viaductHeight(distance))>.1){
        auto shadow=[&](double dx,double dz){return V{x+dx-.35,.16+neon::bridgeHeight(x,distance+dz)-neon::bridgeHeight(x,distance),distance+dz-.4};};
        for(int side:{-1,1})
            f.quad(shadow(0,2.2),shadow(side*.62,.28),shadow(side*1.5,-1.1),shadow(0,-.82),{36,49,60});
    }
    place(x,distance,true);
    for(int i=0;i<std::clamp(count,0,64);i++){
        const float *o=objects+6*i;
        const float xx=o[0],z=o[1],kind=o[2],age=o[3];
        double y=1.85;
        if(int(kind)>=neon::Sparks || kind==5){
            neon::damagePuffs(int(kind),time,age,o[4],[&](neon::Puff puff){
                puff.center.z+=z;puff.center.x+=xx+neon::road(puff.center.z);
                puff.center.y+=neon::bridgeHeight(xx,z)+neon::viaductHeight(z)+(kind==5?o[5]:0);puffs.push_back(puff);
            });
            neon::damageMesh(int(kind),time,age,[&](neon::CoursePoint a,neon::CoursePoint b,neon::CoursePoint c,int rgb){
                f.tri({xx+a.x,a.y,z+a.z},{xx+b.x,b.y,z+b.z},{xx+c.x,c.y,z+c.z},{rgb>>16,(rgb>>8)&255,rgb&255});
            });
        }else if(kind==12){ // A pair of lanes in the active slipstream.
            for(int j=0;j<5;j++)for(int side:{-1,1}){
                double zz=z-4-j*2.6,ox=xx+side*(1.25+j*.13);
                C col=mix({44,119,154},{125,255,230},.32+.48*age+.20*std::sin(time*6-j));
                f.quad({ox,.32,zz+1.4},{ox+side*.18,.32,zz+1.4},{ox+side*.48,.32,zz},{ox+side*.18,.32,zz},col);
            }
        }else if(kind==13){
            f.surface=Frame::Sight;
            for(int side:{-1,1}){
                const double a=xx+side*1.02,b=xx+side*.28;
                f.quad({a,age-.27,z+.025},{b,age-.08,z+.025},{b,age+.25,z+.025},{a,age+.10,z+.025},{15,33,46});
                f.quad({a,age-.18,z},{b,age,z},{b,age+.18,z},{a,age+.02,z},{176,255,228});
            }
            f.quad({xx-.083,age-.09,z},{xx+.083,age-.09,z},{xx+.083,age+.09,z},{xx-.083,age+.09,z},{255,238,173});
            f.surface=Frame::Plain;place(xx,z,false);continue;
        }else if(kind==14){
            for(int j=0;j<12;j++){
                double a=j*pi/6,r=2.1+1.5*(1-age),b=a+.32;
                auto q=[&](double t,double rr){return V{xx+rr*std::cos(t),1.85+.68*rr*std::sin(t),z};};
                f.quad(q(a,r),q(b,r),q(b,r+.28*age),q(a,r+.28*age),mix({224,119,58},{255,253,212},age));
            }
        }else if(kind>=6){
            racer(f,int(kind)-5,xx,z,age,0,o[4],std::clamp((o[4]-54.)/30.,0.,1.),time);
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
        }else if(kind==4){
            const C amber={255,178,65},steel={68,74,98};
            f.box(xx-2.6,1.2,z-.48,5.2,.85,.96,steel,{35,40,52});
            for(int j=-2;j<=2;j++)f.box(xx+j-.24,1.38,z-.52,.42,.46,.09,amber,amber);
            const double nose=xx+(age>=0?2.35:-2.35);
            f.box(nose-.18,1.96,z-.42,.36,.44,.65,{255,108,72},amber);
        }else if(kind==2 || kind==3){
            double width=kind==3?.22:.11, tail=kind==3?2.0:2.7;
            double dx=o[4]-neon::slope(z),dy=o[5];
            V head{xx,age,z},end{xx-tail*dx,age-tail*dy,z-tail};
            f.quad(head+V{-width,0,0},head+V{width,0,0},end+V{width,0,0},end+V{-width,0,0},{255,213,108});
            f.quad(head+V{0,width,0},head-V{0,width,0},end-V{0,width,0},end+V{0,width,0},{252,247,187});
            place(xx,z,false);continue;
        }
        place(xx,z,true);
    }
    firstPuff=int(mesh.size());
    std::stable_sort(puffs.begin(),puffs.end(),[](const auto &a,const auto &b){return a.center.z>b.center.z;});
    for(const auto &p:puffs){
        double c=std::cos(p.angle),s=std::sin(p.angle);
        auto corner=[&](int u,int v){
            double x=(2*u-1)*p.w,y=(1-2*v)*p.h;
            return Vertex{float(p.center.x+c*x-s*y),float(p.center.y+s*x+c*y),float(p.center.z),
                uint8_t(u*255),uint8_t(v*255),uint8_t(255*p.opacity),uint8_t(28+p.tile)};
        };
        mesh.insert(mesh.end(),{corner(0,0),corner(1,0),corner(0,1),corner(0,1),corner(1,0),corner(1,1)});
    }
    return int(mesh.size());
}
}
