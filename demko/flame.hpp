#pragma once
#include "race.hpp"
#include "geometry_api.hpp"

namespace neon {
template<class Emit> void flameSkin(const Race &race,double time,Emit emit){
    const double distance=race.distance-race.laps*lapLength;
    // Join successive hot parcels along their actual trajectory into a tapered, rolling flame.
    for(const auto &wake:race.wakes){
        for(size_t j=1;j<wake.gas.size();j++){
            const auto &tail=wake.gas[j-1],&head=wake.gas[j];
            if(!head.hot || !tail.hot || tail.age>.25 || tail.age-head.age>.04)continue;
            const double dz=neon::gap(head.z,race.distance);
            if(dz < -7 || dz>90)continue;
            auto ring=[&](const neon::Gas &g,int k,int tongue){
                double u=g.age/.25,a=k*neon::tau/8;
                double phase=g.age*23+time*9+tongue*2.8;
                double radius=(.19+.24*std::sin(tau*.5*u))*(1-u)*(tongue?.48:1.);
                radius*=1+.18*std::sin(3*a+phase);
                double ox=tongue*.52*u*std::cos(phase),oy=tongue*.48*u;
                const double local=distance+neon::gap(g.z,race.distance);
                return Vertex{float(g.x+ox+radius*std::cos(a)),float(g.y+oy+radius*std::sin(a)),float(local),
                    uint8_t(255*std::clamp(1.-u*.94-.16*std::cos(a+phase),0.,1.)),uint8_t(255*(1-u)),0,52};
            };
            for(int tongue=0;tongue<2;tongue++){
                auto a=ring(tail,0,tongue),d=ring(head,0,tongue);
                for(int k=1;k<=8;k++){
                    auto b=ring(tail,k,tongue),c=ring(head,k,tongue);
                    emit(a,b,c,d);a=b;d=c;
                }
            }
        }
    }
}
} // namespace neon
