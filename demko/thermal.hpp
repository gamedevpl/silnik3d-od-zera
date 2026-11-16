#pragma once
#include "race.hpp"

namespace neon {
// A tapered sheet through the gas column bounds sampling of the opaque scene.
struct HeatPoint { double x, y, z, radius; };
template<class Emit> void thermalFields(const Race &race, Emit emit) {
    const double base = race.distance - race.laps * lapLength;
    auto jets = [&](double lane,double z,double bank,double yaw,double power,double speed,int team) {
        const double delta = gap(z,race.distance);
        if (delta < -4 || delta > 82) return;
        const double span = .58 + bound(speed/82,0,1.3)*1.05 + 1.65*power;
        const double grade = (Race::deckAt(lane,z+1)-Race::deckAt(lane,z-1))*.5;
        for(int side : {-1,1}) {
            const double offset = side*(1.06+.06*(team%2));
            auto point = [&](double aft,double rise,double r) {
                return HeatPoint{road(z)+lane+offset*std::cos(bank)-aft*(slope(z)+yaw),
                    Race::deckAt(lane,z)+1.912+offset*std::sin(bank)-aft*grade+rise,
                    base+delta-aft,r};
            };
            emit(point(1.94,0,.32),point(2.45+span*1.18,.16,.63+.25*power),.52+.48*power,false);
        }
    };
    if(race.recovery<=0)jets(race.x,race.distance,race.lean,race.noseSteer(),race.thrust,race.speed,0);
    for(size_t i=0;i<race.rivals.size();++i){
        const auto &p=race.rivals[i];
        if(p.recovery<=0)jets(p.x,p.z,p.lean,0,bound((p.speed-54)/30,0,1),p.speed,int(i)+1);
    }
    auto haze = [&](const Wake &wake) {
        // Use the advected centroid of hot parcels, including after the emitter disappears.
        double weight=0,x=0,y=0,dz=0;
        for(const auto &g:wake.gas){
            if(!g.hot)continue;
            double d=gap(g.z,race.distance),w=1-ramp((g.age/g.life-.12)/.60);
            if(d < -6 || d > 82 || w<=0)continue;
            x+=g.x*w;y+=g.y*w;dz+=d*w;weight+=w;
        }
        if(weight<.04)return;
        x/=weight;y/=weight;dz=base+dz/weight;
        emit({x,y-.20,dz,.48},{x,y+1.55,dz-.35,1.07},weight/(weight+1.8),true);
    };
    for(const auto &w:race.wakes)haze(w);
    haze(race.blastGas);
}
} // namespace neon
