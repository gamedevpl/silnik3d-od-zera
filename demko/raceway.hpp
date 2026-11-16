// A small perspective rasterizer for the fly-through on the mascot's CRT.
#include <algorithm>
#include <array>
#include <cmath>
#include <cstdint>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <vector>
using std::array;
int W=480,H=300;
constexpr double pi=3.141592653589793;
struct V{double x,y,z;};
V operator+(V a,V b){return {a.x+b.x,a.y+b.y,a.z+b.z};}
V operator-(V a,V b){return {a.x-b.x,a.y-b.y,a.z-b.z};}
V operator*(V a,double f){return {a.x*f,a.y*f,a.z*f};}
using C=array<int,3>;
C mix(C a,C b,double f){f=std::clamp(f,0.,1.);for(int i=0;i<3;i++)a[i]=int(a[i]*(1-f)+b[i]*f);return a;}
double random01(int n){uint32_t h=uint32_t(n)*2654435761u;h^=h>>16;h*=2246822519u;return (h^(h>>13))/4294967296.;}
double ease(double f){f=std::clamp(f,0.,1.);return f*f*(3-2*f);}
struct Timing {
    double duration, end[18], bolts[3], launch, impact, pass, room;
} cue;
double integratedRamp(double t,double start,double span){
    double u=std::clamp((t-start)/span,0.,1.);
    return span*(u*u*u-.5*u*u*u*u)+std::max(0.,t-start-span);
}
double distanceAt(double t){
    // Distance is the integral of cruise, spool-up, boost and the loop recovery.
    return 13*t+7*integratedRamp(t,7,3)+10*integratedRamp(t,16,4)
        +9*integratedRamp(t,24,3)+75*integratedRamp(t,cue.end[10],.60)
        +42*integratedRamp(t,cue.end[15],.55)+62*integratedRamp(t,cue.end[16],.42)
        +76*integratedRamp(t,cue.end[17],.30)-281*integratedRamp(t,cue.room,.95);
}
double route(double t){return 2736*distanceAt(t)/distanceAt(cue.duration);}
// Two connected arcs shift the canal to the next valley. The camera follows its tangent.
double road(double z){
    const double start=route(38.5),span=route(43.4)-start;
    return span*.66*ease((z-start)/span);
}
double roadSlope(double z){
    const double start=route(38.5),span=route(43.4)-start;
    double u=std::clamp((z-start)/span,0.,1.);
    return 3.96*u*(1-u);
}
double dodge(double t){return ease((t-cue.pass+.66)/.64)*(1-ease((t-cue.pass-.28)/1.23));}
#include "lighting.h"
#include "geometry_api.hpp"
struct Point{double x,y,iz;};
struct Frame{
    double t,cz,cx,cy,roll,focus,chaseLag,roadX,heading,turnBank,anim,bank,bankSin,bankCos,widthFactor,pilot,boost;int stage;bool mirror=false,casting=false;
    V toKey{};
    std::vector<uint8_t> shadow;
    std::vector<uint8_t> rgb=std::vector<uint8_t>(W*H*3);
    std::vector<float> depths=std::vector<float>(W*H);
    Frame(double time,int s,double steering=0,double thrust=-1,double animation=-1):t(time),stage(s){
        pilot=steering;anim=animation<0?t:animation;
        widthFactor=1+.85*reveal(11,.32);
        double phase=t/cue.duration*2*pi;
        boost=thrust<0?ease((t-cue.end[10])/.60)*(1-ease((t-cue.room)/1.4)):thrust;
        chaseLag=.56*boost;
        cz=route(t)-chaseLag;roadX=road(cz);heading=roadSlope(cz);
        turnBank=std::clamp((roadSlope(cz+38)-roadSlope(cz-38))*2.9,-.73,.73);
        cx=.48*pilot+2.15*std::sin(phase*3)-1.2*dodge(t);
        cy=3.95+.22*std::sin(phase*2);roll=.036*std::cos(phase*3);
        bank=.24*std::cos(t*pi/4)+.82*dodge(t)-turnBank-.12*pilot;
        bankSin=std::sin(bank);bankCos=std::cos(bank);
        focus=257-17*boost-8*std::sin(phase)-45*dodge(t);roll-=.17*dodge(t)+.20*turnBank;focus*=H/300.;
    }
    double reveal(int index,double span)const{
        if(stage<=index)return 0;
        return t<.72?1:ease((t-cue.end[index])/span);
    }
    double bend(double z)const{return road(z)-roadX-(z-cz)*heading;}
    Point project(V p)const{
        double z=p.z-cz,y=(mirror?-p.y:p.y)-cy,x=p.x-cx+bend(p.z);
        return {W*.5+focus*(x+roll*y)/z,H*.43-focus*(y-roll*x)/z,1/z};
    }
    void pixel(int i,C c){for(int j=0;j<3;j++)rgb[3*i+j]=std::clamp(c[j],0,255);}
    std::vector<Vertex>* geometry=nullptr;
    bool block=false, simple=false;
    void tri(V a,V b,V c,C color){
        if(geometry){
            for(V p:{a,b,c})geometry->push_back({float(p.x),float(p.y),float(p.z),uint8_t(color[0]),uint8_t(color[1]),uint8_t(color[2]),255});
            return;
        }
        if(casting){
            // Clip submerged faces before projecting them onto the receiver.
            V in[3]={a,b,c},out[4];int n=0;
            for(int i=0;i<3;i++){
                V u=in[i],v=in[(i+1)%3];
                if(u.y>0)out[n++]=u;
                if((u.y>0)!=(v.y>0))out[n++]=u+(v-u)*(u.y/(u.y-v.y));
            }
            for(int i=0;i<n;i++){
                V &p=out[i];
                double receiverZ=p.z-toKey.z*p.y;
                p={p.x+bend(p.z)-toKey.x*p.y-bend(receiverZ),0,receiverZ};
            }
            for(int j=1;j+1<n;j++)clipTriangle(out[0],out[j],out[j+1],color);
            return;
        }
        clipTriangle(a,b,c,color);
    }
    void clipTriangle(V a,V b,V c,C color){
        // Clip in camera space, including towers passing beside the camera.
        V in[3]={a,b,c},out[4];int n=0;
        for(int i=0;i<3;i++){
            V p=in[i],q=in[(i+1)%3];bool v=p.z>=cz+.8,w=q.z>=cz+.8;
            if(v)out[n++]=p;
            if(v!=w)out[n++]=p+(q-p)*((cz+.8-p.z)/(q.z-p.z));
        }
        for(int j=1;j+1<n;j++)raster(project(out[0]),project(out[j]),project(out[j+1]),color);
    }
    void raster(Point a,Point b,Point c,C color){
        auto edge=[](Point u,Point v,double x,double y){return (x-u.x)*(v.y-u.y)-(y-u.y)*(v.x-u.x);};
        double area=edge(b,c,a.x,a.y);if(std::abs(area)<.001)return;
        int x0=std::max(0,(int)std::floor(std::min({a.x,b.x,c.x}))),x1=std::min(W-1,(int)std::ceil(std::max({a.x,b.x,c.x})));
        int y0=std::max(0,(int)std::floor(std::min({a.y,b.y,c.y}))),y1=std::min(H-1,(int)std::ceil(std::max({a.y,b.y,c.y})));
        for(int y=y0;y<=y1;y++)for(int x=x0;x<=x1;x++){
            double p=edge(b,c,x+.5,y+.5)/area,q=edge(c,a,x+.5,y+.5)/area,r=1-p-q;
            if(p<0||q<0||r<0)continue;
            double iz=p*a.iz+q*b.iz+r*c.iz;int i=y*W+x;
            if(casting){shadow[i]=255;continue;}
            if(iz<=depths[i])continue;
            depths[i]=iz;pixel(i,color);
        }
    }
    void quad(V a,V b,V c,V d,C col){tri(a,b,c,col);tri(a,c,d,col);}
    C haze(C col,double z){
        (void)z; return col;
    }
    void box(double x,double y,double z,double dx,double dy,double dz,C lit,C shade){
        V a{x,y,z},b{x+dx,y,z},c{x+dx,y+dy,z},d{x,y+dy,z},back{0,0,dz};
        quad(a,b,c,d,haze(lit,z));quad(b,b+back,c+back,c,haze(shade,z));
        quad(a,a+back,d+back,d,haze(shade,z));quad(d,c,c+back,d+back,haze(mix(lit,{200,178,190},.23),z));
    }
    void skyline(){
        if(stage<2)return;
        int first=int(cz/8)-(block?0:2);
        for(int k=first;k<first+(block?3:23);k++)for(int side:{-1,1})for(int lane=0;lane<2;lane++){
            int id=((k%18+18)%18)*23+side*93+lane*43;
            double z=k*8+random01(id)*2.5, x=side*(12+8*(widthFactor-1)+lane*12+random01(id+7)*5);
            double w=2+random01(id+3)*3.8,h=4+random01(id+2)*(lane?28:16);
            C dark=mix({26,33,66},{63,53,91},random01(id+14));
            C light=(id%3==0)?C{255,137,102}:C{83,208,229};
            box(x,0,z,w,h,4,dark,mix(dark,{17,21,48},.48));
            if(block && (id%5==0 || id%5==1)){
                double crown=h*.22;
                box(x+.22*w,h,z+.6,w*.60,crown,2.8,mix(dark,{94,87,109},.28),dark);
                if(!simple){
                    box(x+w*.32,h+crown,z+1,.10,1.8,.13,light,light);
                    for(int band=0;band<3;band++)
                        box(x+.23*w,h+.35+band*crown*.26,z+.54,w*.56,.11,.12,light,dark);
                }
            }
            if(simple)continue;
            box(x+.3,h,z+.35,w*.66,1.2,2.6,{67,63,90},{37,43,71});
            if(id%4==0)box(x+w*.5,h+1,z+1,.08,2.5,.1,light,light);
            for(int row=1;row<h-1;row+=2){
                if((row+id)%7==0)continue;
                for(double xx=.35;xx<w-.3;xx+=1.15){
                    if(random01(id*11+row*17+(int)(xx*10))<.37)continue;
                    quad({x+xx,(double)row,z-.02},{x+xx+.51,(double)row,z-.02},
                         {x+xx+.51,row+.27,z-.02},{x+xx,row+.27,z-.02},haze(light,z));
                }
            }
            if(lane==0 && id%3==0){
                double xx=x+(side<0?w:0);
                box(xx-.09,h*.82,z+.35,.18,.22,3.8,light,light);
                box(xx-.06,h*.24,z+.35,.12,h*.58,.12,light,light);
            }
            if(id%5==0)box(x+.15,h*.55,z-.08,.14,h*.43,.05,light,light);
        }
    }
    void rings(bool overhead=true){
        int first=int(cz/24);
        for(int k=first;k<first+(block?1:7);k++){
            double z=24*k+15,gateX=1.6*std::sin(k*pi/3);
            C metal={64,62,91},hot=stage<2?C{112,180,182}:C{255,135,67};
            auto v=[&](int j,double radius,double depth){
                double angle=j*pi/6+pi/12;
                return V{gateX+widthFactor*radius*std::cos(angle),4.1+radius*std::sin(angle),z+depth};
            };
            if(overhead)for(int j=0;j<12;j++){
                quad(v(j,7,0),v(j+1,7,0),v(j+1,6.45,0),v(j,6.45,0),haze(metal,z));
                quad(v(j,6.45,0),v(j+1,6.45,0),v(j+1,6.45,1),v(j,6.45,1),haze({34,36,67},z));
                quad(v(j,6.8,-.015),v(j+1,6.8,-.015),v(j+1,6.68,-.015),v(j,6.68,-.015),haze(hot,z));
                if(stage>=5){
                    // Alternating race beacons travel along the physical arch and its mirror.
                    double phase=std::fmod(j+12*std::fmod(anim*1.25+k*.1666667,1.),12.);
                    C beacon=mix({67,71,116},{157,255,236},std::exp(-phase*.66));
                    quad(v(j,7.34,.2),v(j+1,7.34,.2),v(j+1,7.12,.2),v(j,7.12,.2),haze(beacon,z));
                }
                if(j%3==1)quad(v(j,7.1,-.03),v(j+1,7.1,-.03),v(j+1,6.92,-.03),v(j,6.92,-.03),haze({92,230,238},z));
            }
            // Short floating lane markers let the viewer follow individual lengths of canal.
            for(int j=0;j<3;j++){
                int side=(k+j)%2==0?1:-1;
                double x=side*widthFactor*(3.15+.22*std::sin(k*pi/3)),zz=z-8+j*8;
                box(x-.16,.04,zz,.32,.15,1.9,{67,86,102},{36,55,67});
                box(x-.12,.19,zz+.12,.24,.04,.76,j==0?C{233,174,102}:C{132,212,209},{65,107,118});
            }
            if(stage>=12){
                double spread=(widthFactor-1)*2.95;
                for(int sign:{-1,1})for(int mark=0;mark<3;mark++){
                    double xx=gateX+sign*spread,zz=z+mark*8-4;
                    quad({xx-.08,.07,zz},{xx+.08,.07,zz},{xx+.08,.07,zz+3.8},{xx-.08,.07,zz+3.8},{107,211,194});
                }
            }
            for(int side:{-1,1}){
                box(gateX+side*6.75*widthFactor-.28,0,z,.56,4.9,1.1,metal,{30,36,60});
                if(stage>=2){
                    box(side*(block?19.3:8.8*widthFactor),.36,z-8,.28,.27,24,{67,83,100},{41,46,70});
                    for(int j=0;j<4;j++)box(side*(block?19.3:8.8*widthFactor),.64,z-8+j*6,.19,.06,2.8,{77,221,226},{52,124,146});
                }
            }
        }
    }
    void lockGate(){
        if(stage<11 || t<cue.pass-2.2 || t>cue.pass+2.2)return;
        const double z=route(cue.pass)+6.4;
        // One half of a port lock slides across the right lane, just past the starboard wing.
        const double edge=6.8-7.05*ease((t-cue.pass+.66)/.59);
        box(edge,0,z,9.5,6.4,.6,{69,53,83},{39,33,58});
        box(edge-.09,0,z-.05,.2,6.4,.45,{255,91,49},{244,130,69});
        for(int i=0;i<5;i++){
            double x=edge+.35+i*1.7;
            quad({x+.44,.7,z-.035},{x+.94,.7,z-.035},{x+.51,4.9,z-.035},{x,4.9,z-.035},{193,117,76});
        }
        box(edge,5.65,z-.08,9.5,.11,.12,{255,187,109},{215,126,78});
        if(casting)return;
        // Hot particles shed by the moving track, viewed directly and in the canal.
        for(int j=0;j<36;j++){
            double life=std::fmod(std::max(0.,t-cue.pass+.69)*1.9+random01(45+j),1.);
            double x=edge+.12-life*(.3+random01(j+184)*1.9);
            double y=5.65+life*(1.3+random01(j+128)) - 4.5*life*life;
            double zz=z-.18-life*.8;
            tri({x,y,zz},{x+.05,y+.02,zz},{x+.22*life,y+.27*life,zz},{255,198,107});
        }
    }
    #include "race_fx.inc"
    void wake(double x,double y,double bank){
        if(boost<.01)return;
        for(int side:{-1,1}){
            for(int i=0;i<16;i++){
                auto ribbon=[&](int step,double flank){
                    double u=step/16.,reach=1+2.35*boost+.6*dodge(t);
                    double sx=side*(.57+.08*u)+u*u*.29*std::sin(9*anim-u*5)+flank*(.087+.1*std::sin(u*pi))*(1-u);
                    return V{x+sx*std::cos(bank)+u*u*.8*dodge(t),y+sx*std::sin(bank)-.10-.28*u+.10*u*std::sin(12*anim-u*6),cz+chaseLag+5.20-reach*u};
                };
                auto color=mix({181,255,249},{80,87,224},i/16.);
                quad(ribbon(i,-1),ribbon(i,1),ribbon(i+1,1),ribbon(i+1,-1),color);
            }
        }
    }
    void ship(bool manual=false){
        double x=cx+.52*pilot+.65*std::sin(t*pi/4)-1.85*dodge(t),y=1.95+.18*std::sin(t*pi/2);
        if(manual){x=pilot;y=1.85+.06*std::sin(anim*4);}
        auto p=[&](double sx,double sy,double sz){return V{x+sx*std::cos(bank)-sy*std::sin(bank),y+sy*std::cos(bank)+sx*std::sin(bank),cz+chaseLag+6.4+sz};};
        if(!casting)wake(x,y,bank);
        V nose=p(0,.29,2.35),base=p(0,.10,-1.15),spine=p(0,.53,.25);
        for(int side:{-1,1}){
            V wing=p(side*1.55,-.09,-.91),mid=p(side*.53,.07,.54),tail=p(side*.56,.08,-1.12);
            tri(nose,mid,spine,{212,216,216});tri(mid,base,spine,side<0?C{115,134,157}:C{196,203,209});
            tri(mid,wing,tail,side<0?C{231,97,60}:C{245,156,84});tri(spine,tail,base,{97,102,127});
            for(int j=0;j<3;j++){
                double f=.43+j*.12;
                tri(p(side*(f+.13),.09,-.68),p(side*(f+.23),.08,-.71),p(side*(f+.03),.115,-.23),{244,228,179});
            }
            tri(wing,p(side*1.24,.0,-.62),p(side*.7,.12,.16),{254,209,121});
            tri(tail,p(side*.8,.07,-1.35),p(side*.74,.53,-1.44),{194,87,65});
            if(casting)continue;
            V a=p(side*.57-.15,.0,-1.19),b=p(side*.57+.15,.0,-1.19);
            tri(a,b,p(side*.57,-.01,-(1.85+.62*boost)-.13*std::sin(anim*5*pi)),{62,214,255});
            tri(a,b,p(side*.57,.03,-1.55),{231,255,252});
        }
        if(manual){
            // Split exhaust housings and a raised glazed canopy mark the player's stern.
            for(int side:{-1,1}){
                double sx=side*.74;
                quad(p(sx-.28,-.02,-1.33),p(sx+.28,-.02,-1.33),p(sx+.23,.32,-1.23),p(sx-.23,.32,-1.23),{32,53,71});
                quad(p(sx-.20,.03,-1.35),p(sx+.20,.03,-1.35),p(sx+.16,.18,-1.35),p(sx-.16,.18,-1.35),{160,255,243});
                quad(p(side*.92,.07,-1.22),p(side*1.56,-.04,-.92),p(side*1.48,.03,-.8),p(side*.92,.16,-1.03),{255,240,170});
                tri(p(0,.69,.03),p(side*.38,.39,-.48),p(side*.26,.46,.76),side<0?C{39,109,148}:C{113,214,228});
                tri(p(0,.69,.03),p(side*.26,.46,.76),p(0,.34,1.44),{67,144,180});
            }
        }
        tri(p(-.26,.38,-.14),p(.26,.38,-.14),p(0,.46,.95),{16,82,110});
        tri(p(-.2,.41,-.03),p(-.02,.45,.62),p(.05,.45,.68),{122,234,238});
    }
    void depthFog(){
        if(stage<4)return;
        for(int i=0;i<W*H;i++){
            if(depths[i]<=0)continue;
            double f=.58*ease((1./depths[i]-22)/106);
            if(f<=0)continue;
            C fog{117,89,131};
            for(int j=0;j<3;j++)rgb[3*i+j]=int(rgb[3*i+j]*(1-f)+fog[j]*f);
        }
    }
    void fadeHorizon(const std::vector<uint8_t>& backdrop){
        for(int i=0;i<W*H;i++){
            if(depths[i]<=0 || depths[i]>=1./70)continue;
            double fade=ease((1./depths[i]-70)/60);
            for(int j=0;j<3;j++)rgb[3*i+j]=std::lround(rgb[3*i+j]*(1-fade)+backdrop[3*i+j]*fade);
        }
    }
    std::vector<uint8_t> draw(){
        double sunX=305-cx*.6-126*heading,sunY=77;
        auto skyAt=[&](double x,double y){
            double dx=(x-W*.5)*300/H+240-sunX,dy=y*300./H-sunY,dist=std::sqrt(dx*dx+dy*dy);
            C color=mix({17,27,62},{174,101,121},(double)y/(145*H/300.));
            color=mix(color,{255,192,118},.34*std::exp(-dist/54));
            if(dist<25)color=mix({255,226,164},{237,143,117},(dy+25)/50);
            double ring=std::abs(std::sqrt(std::pow((dx+.46*dy)/49,2)+std::pow((dy-.25*dx)/5.8,2))-1);
            if(ring<.14 && (dy>0||dist>25))color={241,205,155};
            if(y<96*H/300. && random01(int(x)*3811+int(y)*1993)>.999)color={207,213,227};
            return color;
        };
        if(stage==0){for(int i=0;i<W*H;i++)pixel(i,{17,24,37});return rgb;}
        for(int y=0;y<H;y++)for(int x=0;x<W;x++)pixel(y*W+x,skyAt(x,y));
        auto sky=rgb;
        const double normalSq=1+roll*roll;
        if(stage>=3){
            // Reflect view rays about the rolled water horizon before adding mirrored meshes.
            for(int y=0;y<H;y++)for(int x=0;x<W;x++){
                double drop=y-H*.43-roll*(x-W*.5);
                if(drop< -10)continue;
                int xx=std::lround(x+2*roll*drop/normalSq),yy=std::lround(y-2*drop/normalSq);
                if(xx>=0 && xx<W && yy>=0 && yy<H)
                    std::copy_n(&sky[3*(yy*W+xx)],3,&rgb[3*(y*W+x)]);
                else pixel(y*W+x,skyAt(xx,yy));
            }
            auto mirrorSky=rgb;
            mirror=true;skyline();rings();lightBays();lockGate();boltTrails();pulseTarget();warpTube();fleet();ship();depthFog();fadeHorizon(mirrorSky);mirror=false;
        }
        if(stage>=6){
            // Unproject the centre of the bright disk to set one key direction for every caster.
            double u=(sunX-240)*H/300./focus, v=(.43*H-sunY*H/300.)/focus;
            double elevation=(v+roll*u)/normalSq;
            toKey={(u-roll*v)/(normalSq*elevation),1,1/elevation};
            shadow.assign(W*H,0);
            casting=true;skyline();rings();lightBays();lockGate();fleet();ship();casting=false;
        }
        auto reflected=rgb;rgb=sky;
        std::fill(depths.begin(),depths.end(),0);
        for(int y=0;y<H;y++)for(int x=0;x<W;x++){
            double below=(y-H*.43)-roll*(x-W*.5);
            if(below<=0)continue;
            double z=cy*focus*normalSq/below;
            double phase=(cz+z)*.73+t*pi+4*std::sin(x*.027+t*pi/12);
            int ripple=std::clamp(int(std::round(std::sin(phase)*below*.075)), -7,7);
            int i=y*W+x,j=(y*W+std::clamp(x+ripple,0,W-1))*3;
            C sample={reflected[j],reflected[j+1],reflected[j+2]};
            C water=mix({24,47,70},sample,stage>=3?.65:.08);
            if(stage>=3){
                double wave=std::sin((cz+z)*2.1+t*pi+x*.022+.54*std::sin(x*.11+(cz+z)*.4));
                double crest=std::max(0.,wave-.73)*std::min(.48,below*.0045);
                water=mix(water,{132,168,192},crest);
            }
            if(stage==1 && (std::fmod(cz+z,3)<std::min(.42,.07*z/8) || std::fmod(std::abs(cx+(x-W*.5)*z/focus),3)<.06))water={79,145,161};
            if(stage>=6){
                int left=std::max(0,x-1),right=std::min(W-1,x+1);
                int above=std::max(0,y-1),under=std::min(H-1,y+1);
                double shade=(4*shadow[i]+shadow[y*W+left]+shadow[y*W+right]+shadow[above*W+x]+shadow[under*W+x])/(8.*255);
                // The shadow removes direct illumination. Reflected sky still reaches the eye.
                water=mix(water,{133,159,162},.19*(1-shade));
                water=mix(water,{9,18,41},.24*shade);
            }
            pixel(i,water);depths[i]=1/z;
        }
        auto background=rgb;
        skyline();rings();lightBays();lockGate();boltTrails();pulseTarget();warpTube();fleet(true);depthFog();fadeHorizon(background);canalMist();atmosphere();motionBlur();fleet();ship();return rgb;
    }
};
