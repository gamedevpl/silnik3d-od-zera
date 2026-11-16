#pragma once
#include <algorithm>
#include <cmath>
#include <vector>

namespace neon {
// Positions and velocities are in the unwrapped world, including the course grade.
struct Gas {
    double x,y,z,vx,vy,vz,age,life,radius,spread;
    bool hot;
};
struct Wake {
    std::vector<Gas> gas;
    double emission=0;
    unsigned sequence=0;
    void drift(double dt) {
        for(auto &g:gas){
            const double drag=4.4, damp=std::exp(-drag*dt), step=(1-damp)/drag;
            g.x+=g.vx*step;g.z+=g.vz*step;
            const double rise=g.hot?4.2:2.8;
            g.y+=rise*dt+(g.vy-rise)*step;
            g.vx*=damp;g.vz*=damp;g.vy=rise+(g.vy-rise)*damp;
            g.age+=dt;
        }
        std::erase_if(gas,[](const Gas &g){return g.age>=g.life;});
    }
    void engine(double dt,double x,double y,double z,double vx,double vy,double vz,
                double bank,int damage,int side,double throttle) {
        drift(dt);
        if(damage<0 || (!damage && throttle<.45)){emission=0;return;}
        emission+=dt;
        const double period=damage?.017:.055;
        while(emission>=period){
            emission-=period;
            const double twist=++sequence*2.399963;
            const auto emit=[&](int wing){
                const double life=damage?.69:.24, r=damage?.38:.14;
                const double gasSpeed=damage?.78:.54;
                gas.push_back({x+wing*1.04*std::cos(bank)-vx*emission,
                    y+wing*1.04*std::sin(bank)-vy*emission,
                    z-vz*emission,gasSpeed*vx+1.65*std::cos(twist),
                    gasSpeed*vy+2.1+.95*std::sin(twist),gasSpeed*vz-3.8,0,
                    life,r,damage?1.65:.64,damage>=2});
            };
            if(damage)emit(side);else{emit(-1);emit(1);}
        }
    }
};
} // namespace neon
