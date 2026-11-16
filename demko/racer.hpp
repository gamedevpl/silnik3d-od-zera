#pragma once
#include "junction.hpp"
#include <array>
#include <cstdint>
#include <vector>

namespace neon {
// Vertices carry ship-local UVs and a smooth baked key light in the three color channels.
enum Finish { TeamPaint=40, Alloy=47, Canopy, Carbon, HotCore, Identification };
struct BodyVertex { float x,y,z,u,v,light; };
struct BodyFace { BodyVertex a,b,c; int finish; };
struct Section { double z, width, height, center; };
constexpr std::array<int,12> bodyColors={0xf48b3e,0x35d8bb,0xf56799,0xffca4f,0x778efa,0xc879fe,0x8dd772,
                                          0xbac6ce,0x438697,0x414955,0x8af4ff,0xffdf9e};
inline std::vector<BodyFace> makeBody(int team,bool coarse) {
    std::vector<BodyFace> mesh;
    const int paint=TeamPaint+team;
    auto vertex=[](double x,double y,double z,double u,double v,double l){
        return BodyVertex{float(x),float(y),float(z),float(u),float(v),float(l)};
    };
    auto quad=[&](BodyVertex a,BodyVertex b,BodyVertex c,BodyVertex d,int material){
        mesh.push_back({a,b,c,material});mesh.push_back({a,c,d,material});
    };
    auto shell=[&](double x, std::initializer_list<Section> sections,int segments,int material){
        const Section *prev=nullptr;
        for(const auto &s:sections){
            if(prev){
                auto at=[&](const Section &r,int i){
                    double a=tau*i/segments, nx=std::cos(a),ny=std::sin(a);
                    return vertex(x+nx*r.width,r.center+ny*r.height,r.z,double(i)/segments,
                                  (r.z+2.25)/5.5,.56+.30*ny-.13*nx);
                };
                for(int i=0;i<segments;i++)quad(at(*prev,i),at(*prev,i+1),at(s,i+1),at(s,i),material);
            }
            prev=&s;
        }
    };
    const int rings=coarse?8:16;
    const double nose=2.7+.12*(team%3);
    shell(0,{{-1.56,.001,.001,.13},{-1.54,.14,.14,.13},{-1.39,.51,.29,.16},{-.71,.66,.36,.22},
             {.18,.60,.36,.25},{1.13,.43,.24,.26},{2.08,.22,.14,.20},{nose,.018,.035,.15}},
          rings,Alloy);
    shell(0,{{-.80,.24,.08,.50},{-.65,.43,.20,.50},{-.26,.45,.33,.51},{.23,.40,.36,.50},
             {.85,.31,.28,.46},{1.43,.15,.16,.39},{1.70,.012,.025,.35}},rings,Canopy);
    // A raised service panel behind the cockpit catches light along its chamfer.
    shell(0,{{-1.48,.02,.03,.30},{-1.31,.25,.09,.37},{-1.03,.30,.10,.43},
             {-.77,.25,.07,.48},{-.70,.05,.03,.49}},rings,Carbon);
    for(int side:{-1,1}){
        const double span=2.05+.09*(team%3),engineX=side*(1.06+.06*(team%2));
        auto point=[&](double x,double h,double z,double light=.8){
            return vertex(side*x,h,z,.5+side*x/5.,(z+2.25)/5.5,light);
        };
        auto panel=[&](BodyVertex a,BodyVertex b,BodyVertex c,BodyVertex d,int mat){quad(a,b,c,d,mat);};
        auto root=point(.38,.20,1.22),lead=point(span,.00,-.55),tip=point(span-.07,-.04,-1.35),rear=point(.46,.14,-1.26);
        panel(root,lead,tip,rear,paint);
        panel(lead,point(span,-.13,-.55,.42),point(span-.07,-.17,-1.35,.42),tip,Carbon);
        panel(root,point(.38,.11,1.22,.62),point(span,-.13,-.55,.52),lead,Alloy);
        panel(point(span-.05,.02,-.61),point(span+.12,.45,-1.02),point(span+.02,.48,-1.53),tip,paint);
        panel(point(span+.11,.445,-1.01),point(span+.12,.46,-1.02),
              point(span+.02,.49,-1.53),point(span+.01,.455,-1.49),Identification);
        // Ceramic nacelle fairing, machined throat, glowing ring and recessed hot core.
        shell(engineX,{{-1.83,.32,.29,.062},{-1.58,.37,.32,.075},{-.88,.38,.34,.09},
                       {.07,.30,.27,.12},{.78,.17,.18,.10},{1.02,.025,.05,.08}},rings,paint);
        shell(engineX,{{-1.90,.27,.24,.062},{-1.84,.34,.30,.062},{-1.74,.33,.295,.062}},rings,Carbon);
        shell(engineX,{{-1.92,.22,.19,.062},{-1.91,.265,.235,.062}},rings,Alloy);
        shell(engineX,{{-1.925,.183,.156,.062},{-1.925,.211,.183,.062}},rings,HotCore);
        shell(engineX,{{-1.82,.003,.003,.062},{-1.89,.18,.155,.062}},rings,Carbon);
        shell(engineX,{{-1.898,.005,.005,.062},{-1.90,.085,.08,.062}},rings,HotCore);
        for(int j=0;j<(coarse?2:4);j++){
            double z=-1.35+.17*j;
            panel(point(std::abs(engineX)-.15,.419,z),point(std::abs(engineX)+.15,.419,z),
                  point(std::abs(engineX)+.14,.416,z+.09),point(std::abs(engineX)-.14,.416,z+.09),Carbon);
        }
        for(int j=0;j<3;j++){
            double z=-1.29+.13*j,h=.474+.019*j;
            panel(point(.065,h,z),point(.20,h-.014,z),point(.19,h-.004,z+.045),point(.065,h+.01,z+.045),Alloy);
        }
        panel(point(.44,.295,1.03),point(.55,.255,.82),point(1.85,.075,-.65),
              point(1.70,.077,-.61),Identification);
    }
    return mesh;
}
inline const auto &racerBody(int team,bool coarse=false){
    using Fleet=std::array<std::vector<BodyFace>,7>;
    auto build=[](bool low){Fleet fleet;for(int i=0;i<7;i++)fleet[i]=makeBody(i,low);return fleet;};
    if(coarse){static const auto fleet=build(true);return fleet[team];}
    static const auto fleet=build(false);return fleet[team];
}
inline BodyVertex posedVertex(BodyVertex p,double cs,double sn,int wing){
    if(wing*p.x>0 && std::abs(p.x)>.95){
        double crease=(std::abs(p.x)-.95)*std::abs(wing);
        p.x-=std::copysign(.22*crease,p.x);p.y-=.19*crease;p.z-=.16*crease;
    }
    double x=p.x;p.x=x*cs-p.y*sn;p.y=p.y*cs+x*sn;return p;
}
} // namespace neon
