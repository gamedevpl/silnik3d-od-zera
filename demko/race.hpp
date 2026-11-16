#pragma once
#include <algorithm>
#include <array>
#include <cmath>
#include <vector>
#include "junction.hpp"
#include "buildings.hpp"
#include "wake.hpp"

namespace neon {
inline double bound(double x, double a, double b) { return std::clamp(x, a, b); }
inline double road(double z) {
    double a = tau * z / lapLength;
    return 17 * sin(3 * a) + 10 * sin(2 * a + .8) + 4 * sin(6 * a - .6) + chicane(z);
}
inline double slope(double z) {
    double a = tau * z / lapLength;
    return tau / lapLength * (51 * cos(3 * a) + 20 * cos(2 * a + .8) + 24 * cos(6 * a - .6)) +
           (chicane(z + .1) - chicane(z - .1)) / .2;
}
inline double gap(double a, double b) {
    double d = a - b;
    return d - lapLength * floor(d / lapLength + .5);
}
struct Input {
    int steer = 0;
    bool boost = false, brake = false;
};
enum class Cue { Fire, Rocket, Break, Hit, Pad, Rail, Repair, Lap, Launch, Wreck, Blast, Ricochet, Lock, Overdrive };
enum ContactEffect { Sparks = 15, Fragments = 18, PlayerFragments, RocketImpact, ColdGas, HotGas, IonGas };
constexpr double recoveryTime = 1.15;
struct Sector {
    double x, z, mineX;
    bool mine, used = false, sweeping = false, violet = false;
    double obstacleX(double time) const {
        return sweeping ? 12.*std::sin(time*.53+z*.019) : mineX;
    }
    double radius() const { return sweeping ? 3.0 : 1.55; }
};
inline Sector sector(int i) {
    constexpr int lanes[] = {0, 10, 15, 5, -8, -14, -4, 9, 13, 0, -12, -6};
    double x = lanes[i % 12];
    double z = 56. + i * 96;
    if (islandHalf(z) > 0)
        x = routeSign(x) * std::max(std::abs(x), islandHalf(z) + 3.5);
    double mine = x + (x > 0 ? -7 : 7);
    bool sweep=i%4==2;
    return {x,z,mine,sweep || (i%3!=0 && (islandHalf(z-17)==0 || std::abs(mine)>islandHalf(z-17)+2)),false,sweep,i%3==1};
}
struct Pilot {
    double x, z, speed, lean = 0, stun = 0, boost = 0, hitGlow = 0, kick = 0, recovery = 0;
    int hull = 3;
    double lateral=0,rollRate=0,hitOffset=0,steering=0;
};
struct Shot {
    double x,y,z,vx,vy,vz; // World coordinates, including road curvature and elevation at launch.
    bool rocket, spent=false;
    double age=0, launchLane=0;
    int owner=-1;
};
struct Burst {
    double x, z, age = 0, lift = 0;
    bool rocket=false;
    double drift=0;
};
using Object = std::array<float, 6>;

struct Race {
    double distance = 0, elapsed = 0, x = 0, vx = 0, lean = 0, speed = 44, thrust = 0, energy = 100;
    double cooldown = 0, rocketCooldown = 0, immunity = 0, padBoost = 0, wallLock = 0, lapStart = 0,
           lastLap = 0;
    int laps = 0, shield = 3, rockets = 2, rank = 7, refills = 0, nextSector = 3;
    bool drafting = false, spent = false;
    double wakeCharge = 0, launchTime = 0, chargedLane = 0, steerMemory = 0;
    double scrape = 0, scrapeSide = 1, recovery = 0, contactLock = 0;
    double contactStrength=.5, overdrive=0;
    double lockTime=0, gunRest=2.5, markedLane=0;
    int attacker=-1;
    int damagedSide = 1;
    int wakePilot = -1, forkSide = 0;
    std::array<Pilot, 6> rivals{};
    std::vector<Sector> sectors = {sector(0), sector(1), sector(2)};
    std::vector<Shot> shots;
    std::vector<Burst> bursts;
    std::array<Wake,7> wakes;
    Wake blastGas;
    double rollRate=0;
    std::vector<Cue> cues;
    Race() {
        constexpr double lanes[] = {0, 6, -12, 12, -3, 3};
        constexpr double grid[] = {9, 9, 19, 19, 53, 77};
        for (int i = 0; i < 6; i++)
            rivals[i] = {lanes[i], grid[i], 46. + i * .8};
    }
    static double deckAt(double lane,double z) { return viaductHeight(z)+bridgeHeight(lane,z); }
    double noseSteer() const {return .65*vx/std::max(30.,speed);}
    static double rocketLane(double lane,double z) {
        double island=islandHalf(z);
        return island>0 ? routeSign(lane)*std::max(std::abs(lane),island+1.2*ramp(island)) : lane;
    }
    Shot muzzle(bool rocket) const {
        if(rocket){
            const double z=distance+2.4,lane=rocketLane(x,z);
            return {road(z)+lane,deckAt(lane,z)+1.85,z,153*slope(z),153*viaductGrade(z),153,true,false,0,x};
        }
        const double yaw=slope(distance)+noseSteer();
        const double pitch=(deckAt(x,distance+1)-deckAt(x,distance-1))*.5;
        const double vz=175./std::sqrt(1+yaw*yaw+pitch*pitch);
        return {road(distance)+x+2.4*yaw,1.85+deckAt(x,distance)+2.4*pitch,distance+2.4,
                vz*yaw,vz*pitch,vz,rocket};
    }
    void shoot(bool rocket) {
        if (recovery > 0)
            return;
        if (rocket) {
            if (!rockets || rocketCooldown > 0)
                return;
            rockets--;
            rocketCooldown = .65;
        } else {
            if (cooldown > 0)
                return;
            cooldown = .20;
        }
        shots.push_back(muzzle(rocket));
        cues.push_back(rocket ? Cue::Rocket : Cue::Fire);
    }
    void impact(double strength = 1., int side = 1,bool absorb=true) {
        if (immunity > 0)
            return;
        contactStrength=bound(strength,.15,1.);
        damagedSide = side;
        overdrive = 0;
        immunity = 1.2;
        if(absorb)speed *= 1. - .14 * strength;
        if (--shield == 0) {
            recovery = recoveryTime;
            launchTime = padBoost = wakeCharge = overdrive = 0;
            energy = std::max(25., energy * .5);
            speed = 20;
            immunity = 2;
            cues.push_back(Cue::Wreck);
        } else
            cues.push_back(Cue::Hit);
    }
    void scrapeRail(int inward, double dt) {
        const double normal = std::max(0., -inward * vx);
        speed *= std::exp(-(.095 + .014 * normal) * dt);
        scrape = .24;
        scrapeSide = -inward;
        if (wallLock <= 0 && normal > 2) {
            speed *= 1. - std::min(.10, normal * .004);
            vx = inward * normal * .26;
            contactStrength=bound(normal/25.,.12,.85);
            if (normal > 17 && immunity<=0)
                impact(.32, -inward);
            else
                cues.push_back(Cue::Rail);
            wallLock = .42;
        } else
            vx = inward * std::max(0., inward * vx);
    }
    void movePilots(double dt) {
        drafting = false;
        wakePilot = -1;
        double nearestWake = 28;
        for (int i = 0; i < 6; i++) {
            auto &p = rivals[i];
            double ahead = gap(p.z, distance), phase = tau * p.z / lapLength;
            double bend = slope(p.z + 28) - slope(p.z - 4);
            int index = std::max(0, int(ceil((p.z - 56) / 96)));
            auto pad = sector(index);
            double approach = pad.z - p.z;
            double line =
                bound(8 * sin(phase * 2 + i * 1.6) + 5 * sin(phase * 5 + i) + bend * 19, -15, 15);
            if (approach < 40 && (index + i) % 3)
                line += (pad.x - line) * (1 - approach / 40);
            if (ahead < 2 && ahead > -17 && fabs(p.x - x) < 3.5)
                line = bound(x + (p.x >= x ? 5 : -5), -16, 16);
            for (auto &other : rivals) {
                if (&other == &p)
                    continue;
                double lead = gap(other.z, p.z);
                if (lead > 0 && lead < 9 && fabs(other.x - p.x) < 2.5)
                    line += p.x >= other.x ? 3 : -3;
            }
            if (i == 0 && p.z < 66)
                line *= bound((p.z - 34) / 32, 0, 1);

            // Pick a passing line before committing boost behind another ship.
            if(ahead<0 && ahead>-30 && std::abs(p.x-x)<3.8)
                line=bound(x+(x>12?-5:x < -12?5:(p.x>=x?5:-5)),-16,16);
            for(const auto &s:sectors){
                const double dz=s.z-17-p.z;
                if(!s.sweeping || !s.mine || dz<0 || dz>72)continue;
                double obstacle=s.obstacleX(elapsed+dz/std::max(30.,p.speed));
                if(std::abs(line-obstacle)<5.)line=bound(obstacle+(p.x<obstacle?-6.:6.),-16.,16.);
            }
            // All passing and avoidance decisions must respect the committed fork.
            const int side=routeSign(p.x);
            const double divider=islandHalf(p.z);
            const double upcoming=islandHalf(p.z+std::max(0.,p.speed)*.32);
            if(divider>0 || upcoming>0)
                line=side*std::max(std::max(divider,upcoming)+2.2,side*line);
            const double desired=bound((line-p.x)*1.65,-11.,11.);
            p.steering+=(desired-p.steering)*(1-std::exp(-5*dt));
            p.kick *= std::exp(-4 * dt);
            const double prevX=p.x;
            p.x = bound(p.x + (p.steering + p.kick) * dt, -16.4, 16.4);
            if (divider > 0)
                p.x = side * std::max(divider + 1.35*ramp(divider), side*p.x);
            p.lateral=(p.x-prevX)/dt;
            p.lean+=(-p.lateral*.035-p.lean)*(1-std::exp(-9*dt))+p.rollRate*dt;
            p.rollRate*=std::exp(-6*dt);
            p.hitGlow = std::max(0., p.hitGlow - dt);
            p.stun = std::max(0., p.stun - dt);
            double surge = pow(std::max(0., sin(phase * 4 + i * 1.9)), 6);
            const double deficit=distance-p.z;
            const double cruise=66.+(i-2.5)*1.65;
            const double pursuit=bound(deficit*.08,-8.,4.);
            const double tow=(ahead<0 && ahead>-27 && std::abs(p.x-x)<4.) ? 5. : 0.;
            double target=cruise+pursuit+tow+11*surge+(p.boost>0?12:0)-8*std::abs(bend);
            target += 1.4 * bridgeHeight(p.x, p.z);
            p.boost = std::max(0., p.boost - dt);
            if (approach >= 0 && approach < p.speed * dt && fabs(p.x - pad.x) < 3)
                p.boost = 1.2;
            target-=14*viaductGrade(p.z);
            p.speed += ((p.stun > 0 ? target * .53 : target) - p.speed) * (1 - exp(-2 * dt));
            if (p.recovery > 0) {
                p.recovery = std::max(0., p.recovery - dt);
                p.speed = std::min(20., p.speed);
                if (p.recovery == 0)
                    p.hull = 3;
            }
            const double travel=p.speed*dt;
            for(const auto &s:sectors){
                const double dz=s.z-17-p.z;
                if(!s.sweeping || !s.mine || dz<=0 || dz>travel)continue;
                if(std::abs(p.x-s.obstacleX(elapsed-dt+dz/p.speed))<s.radius())p.stun=std::max(p.stun,.58);
            }
            p.z += travel;
            if ((islandHalf(distance) == 0 || routeSign(p.x) == routeSign(x)) && ahead > 2 &&
                ahead < nearestWake && fabs(p.x - x) < 3) {
                drafting = true;
                wakePilot = i;
                nearestWake = ahead;
            }
        }
    }
    void hullContacts(double dt) {
        struct Body { double x,z,vx,vz,spin; bool active; };
        std::array<Body,7> bodies;
        bodies[0]={x,distance,vx,speed,rollRate,recovery<=0};
        for(int i=0;i<6;++i){
            auto &p=rivals[i];bodies[i+1]={p.x,p.z,p.lateral,p.speed,p.rollRate,p.recovery<=0};
        }
        for(int i=0;i<7;++i)for(int j=i+1;j<7;++j){
            auto &a=bodies[i];auto &b=bodies[j];
            const double dx=b.x-a.x,dz=gap(b.z,a.z);
            constexpr double width=2.7,length=4.0;
            if(!a.active || !b.active || std::abs(dx)>=width || std::abs(dz)>=length ||
               std::abs(deckAt(a.x,a.z)-deckAt(b.x,b.z))>1.2)continue;
            double overlap=1-std::hypot(dx/width,dz/length);
            if(overlap<=0)continue;
            // Gradient of the elliptical hull, with relative velocity as a fallback at coincident centers.
            double nx=dx/(width*width),nz=dz/(length*length);
            if(std::hypot(nx,nz)<1e-6){nx=a.vx-b.vx;nz=a.vz-b.vz;if(std::hypot(nx,nz)<1e-6)nx=1;}
            double norm=std::hypot(nx,nz);nx/=norm;nz/=norm;
            double shift=.5*std::min(18.*dt,overlap/std::hypot(nx/width,nz/length));
            a.x-=nx*shift;b.x+=nx*shift;a.z-=nz*shift;b.z+=nz*shift;
            const double rvx=a.vx-b.vx,rvz=a.vz-b.vz,closing=rvx*nx+rvz*nz;
            if(closing<=0)continue;
            const double impulse=.64*closing;
            const double friction=bound((rvx*nz-rvz*nx)*.5,-.22*impulse,.22*impulse);
            const double ix=nx*impulse+nz*friction,iz=nz*impulse-nx*friction;
            a.vx-=ix;b.vx+=ix;a.vz-=iz;b.vz+=iz;
            a.spin+=ix*.19;b.spin-=ix*.19;
            if(i==0 && contactLock<=0 && closing>1.4){
                const int side=routeSign(dx);
                scrape=.22;scrapeSide=side;contactLock=.19;
                if(closing>9.5 && immunity<=0){
                    impact(bound(closing/30.,.32,1.),side,false);
                    if(recovery>0){a.active=false;a.vz=speed;}
                }else{
                    contactStrength=bound(closing/26.,.10,.7);cues.push_back(Cue::Rail);
                }
            }
        }
        auto lane=[](double current,double resolved,double z,double limit){
            const double edge=islandHalf(z);
            if(edge>0)resolved=routeSign(current)*std::max(edge+1.3*(limit<18?ramp(edge):1.),routeSign(current)*resolved);
            return bound(resolved,-limit,limit);
        };
        const auto &a=bodies[0];
        x=lane(x,a.x,a.z,18);distance=a.z;vx=a.vx;speed=a.vz;rollRate=a.spin*std::exp(-6*dt);
        for(int i=0;i<6;++i){
            auto &p=rivals[i];const auto &b=bodies[i+1];
            p.x=lane(p.x,b.x,b.z,16.4);p.z=b.z;p.kick+=b.vx-p.lateral;
            p.lateral=b.vx;p.speed=b.vz;p.rollRate=b.spin;
        }
    }
    // One visible lock at a time. The marked lane is fixed during the warning.
    void rivalGuns(double dt) {
        auto canAim=[&](const Pilot &p){
            double dz=gap(p.z,distance);
            return recovery<=0 && p.recovery<=0 && p.stun<=0 && std::abs(dz)>8 &&
                   std::abs(dz)<68 && std::abs(deckAt(p.x,p.z)-deckAt(x,distance))<12 &&
                   !(islandHalf(p.z)>0 && islandHalf(distance)>0 && routeSign(x)!=routeSign(p.x));
        };
        if(attacker<0){
            gunRest-=dt;
            if(gunRest>0)return;
            double best=100.;
            for(int i=0;i<int(rivals.size());++i){
                const auto &p=rivals[i];
                double score=std::abs(gap(p.z,distance))+2*std::abs(p.x-x);
                const double dz=gap(p.z,distance), projected=dz+(p.speed-speed)*.82;
                if(dz*projected<=0 || std::abs(projected)<9)continue;
                if(canAim(p) && score<best){best=score;attacker=i;}
            }
            if(attacker>=0){lockTime=.82;markedLane=x;cues.push_back(Cue::Lock);}
            return;
        }
        const auto &p=rivals[attacker];
        lockTime-=dt;
        const bool aimed=canAim(p);
        if(aimed && lockTime>0)return;
        if(aimed){
            // A chasing ship fires its cannon. A ship ahead releases a slower aft pulse.
            double gapZ=gap(p.z,distance);
            double z=distance+gapZ+(gapZ<0?2.5:-2.5);
            double vz=gapZ<0?speed+115.:std::max(4.,speed-64.);
            double flight=(distance-z)/(vz-speed);
            double target=distance+speed*flight;
            double startX=road(z)+p.x,startY=deckAt(p.x,z)+1.85;
            shots.push_back({startX,startY,z,(road(target)+markedLane-startX)/flight,
                (deckAt(markedLane,target)+1.85-startY)/flight,vz,false,false,0,0,attacker});
        }
        attacker=-1;lockTime=0;gunRest=aimed?2.7:.8;
    }
    void stepShots(double dt) {
        for (auto &shot : shots) {
            const double dz=shot.vz*dt;
            auto laneAt=[&](double t){
                const double z=shot.z+dz*t;
                return shot.rocket?rocketLane(shot.launchLane,z):shot.x+t*dt*shot.vx-road(z);
            };
            auto worldX=[&](double t){return shot.rocket?road(shot.z+dz*t)+laneAt(t):shot.x+t*dt*shot.vx;};
            auto height=[&](double t){return shot.rocket?deckAt(laneAt(t),shot.z+dz*t)+1.85:shot.y+t*dt*shot.vy;};
            double first=2.;
            Pilot *pilot=nullptr;Sector *mine=nullptr;
            bool struckPlayer=false;
            for(auto &p:rivals){
                if(p.recovery>0 || (&p-rivals.data())==shot.owner)continue;
                // Both ship and projectile move in this tick; compare at the crossing.
                const double start=p.z-p.speed*dt;
                const double relative=dz-p.speed*dt;
                if(std::abs(relative)<1e-8)continue;
                const double t=gap(start,shot.z)/relative;
                if(t<0 || t>1 || t>=first)continue;
                const double z=shot.z+t*dz;
                if(std::abs(p.x-laneAt(t))<(shot.rocket?1.52:1.25) &&
                   std::abs(height(t)-deckAt(p.x,z)-1.85)<.85){first=t;pilot=&p;}
            }
            if(shot.owner>=0 && recovery<=0){
                const double relative=dz-speed*dt;
                if(std::abs(relative)>1e-8){
                    const double t=gap(distance-speed*dt,shot.z)/relative;
                    if(t>=0 && t<=1 && t<first && std::abs(laneAt(t)-x)<1.55 &&
                       std::abs(height(t)-deckAt(x,shot.z+t*dz)-1.85)<1.1){
                        first=t;pilot=nullptr;struckPlayer=true;
                    }
                }
            }
            for(auto &s:sectors){
                const double z=s.z-17,t=(z-shot.z)/dz;
                if(!s.mine || t<0 || t>1 || t>=first)continue;
                const double lane=s.obstacleX(elapsed-dt+t*dt);
                if(std::abs(laneAt(t)-lane)<s.radius() && std::abs(height(t)-deckAt(lane,z)-1.85)<1.15){
                    first=t;mine=&s;pilot=nullptr;struckPlayer=false;
                }
            }
            auto blocked=[&](double t){
                double z=shot.z+dz*t,lane=laneAt(t),h=height(t)-deckAt(lane,z);
                return (std::abs(lane)<=19 && h<.12) || height(t)<.05 ||
                       (std::abs(lane)<islandHalf(z) && h<4.4);
            };
            bool wall=false;
            if(blocked(1)){
                double lo=0,hi=1;
                for(int j=0;j<6;++j){double mid=(lo+hi)*.5;if(blocked(mid))hi=mid;else lo=mid;}
                if(hi<first){first=hi;wall=true;mine=nullptr;pilot=nullptr;}
            }
            // Each rendered box is sheared by the road offset at its front and back faces.
            if(!shot.rocket && (std::abs(laneAt(0))>22 || std::abs(laneAt(1))>22)){
                auto collide=[&](Building b){
                    if(shot.z+dz<b.z || shot.z>b.z+b.d)return;
                    const double skew=(road(b.z+b.d)-road(b.z))/b.d;
                    double enter=0,leave=1;
                    auto slab=[&](double origin,double delta,double size){
                        if(std::abs(delta)<1e-9)return origin>=0 && origin<=size;
                        double a=-origin/delta,c=(size-origin)/delta;
                        enter=std::max(enter,std::min(a,c));leave=std::min(leave,std::max(a,c));
                        return enter<=leave;
                    };
                    if(slab(shot.z-b.z,dz,b.d) && slab(shot.y-b.y,shot.vy*dt,b.h) &&
                       slab(shot.x-b.x-road(b.z)-(shot.z-b.z)*skew,shot.vx*dt-dz*skew,b.w) && enter<first){
                        first=enter;wall=true;mine=nullptr;pilot=nullptr;
                    }
                };
                for(int k=int(std::floor(shot.z/24));k<=int(std::floor((shot.z+dz)/24));++k)
                    citySolids(k,collide);
            }
            const double t=std::min(1.,first);
            const double endX=worldX(t),endY=height(t);
            if(shot.rocket && t>0){
                shot.vx=(endX-shot.x)/(dt*t);shot.vy=(endY-shot.y)/(dt*t);
            }
            shot.x=endX;shot.y=endY;shot.z+=dz*t;shot.age+=dt;
            const double lane=shot.x-road(shot.z);
            const double skin=pilot?1.5:0.,hitZ=shot.z-skin;
            const double hitLane=shot.x-skin*shot.vx/shot.vz-road(hitZ);
            const double hitY=shot.y-skin*shot.vy/shot.vz;
            const Burst flash{hitLane,hitZ,0,hitY-deckAt(hitLane,hitZ)-1.7,shot.rocket,pilot?.62*pilot->speed:0};
            if(shot.rocket && (pilot || mine || wall)){
                for(int j=0;j<13;j++){
                    const double a=j*2.399963,m=7.+j%5;
                    blastGas.gas.push_back({road(hitZ)+hitLane,hitY,hitZ-.15,
                        m*std::cos(a),3.+m*std::sin(j*1.73),m*std::sin(a)+flash.drift*.5,
                        0,.49+.035*(j%5),.53,2.4,true});
                }
            }
            if(struckPlayer && !wall){
                impact(.38,routeSign(lane-x));shot.spent=true;bursts.push_back(flash);
            }
            if(wall){shot.spent=true;bursts.push_back(flash);cues.push_back(shot.rocket?Cue::Blast:Cue::Ricochet);}
            if (pilot || mine) {
                if (pilot) {
                    pilot->stun = shot.rocket ? 2.4 : 1;
                    pilot->hitGlow = .75;
                    const double side=bound(pilot->x-lane,-1.,1.);
                    pilot->hitOffset=-side;
                    pilot->rollRate+=side*(shot.rocket?4.:1.1);
                    pilot->kick+=side*(shot.rocket?5.:1.5);
                    pilot->hull = std::max(0, pilot->hull - (shot.rocket ? 2 : 1));
                    if (!pilot->hull)
                        pilot->recovery = recoveryTime;
                } else
                    mine->mine = false;
                shot.spent = true;
                bursts.push_back(flash);
                cues.push_back(shot.rocket?Cue::Blast:Cue::Break);
            }
        }
        std::erase_if(shots, [&](auto &s) { return s.spent || s.age>=1.65; });
        for(auto &b:bursts){
            const double world=b.x+road(b.z);
            b.z+=b.drift*dt;b.x=world+b.drift*dt*slope(b.z)-road(b.z);
            b.drift*=std::exp(-4*dt);b.age+=dt;
        }
        std::erase_if(bursts, [](auto &b) { return b.age >= (b.rocket?.78:.32); });
    }
    void advance(double dt, Input in) {
        elapsed += dt;
        for (double *t : {&cooldown, &rocketCooldown, &immunity, &wallLock, &padBoost})
            *t = std::max(0., *t - dt);
        scrape = std::max(0., scrape - dt);
        contactLock = std::max(0., contactLock - dt);
        if (recovery > 0) {
            recovery = std::max(0., recovery - dt);
            in = {0, false, true};
            if (recovery == 0) {
                shield = 3;
                cues.push_back(Cue::Repair);
            }
        }
        overdrive=std::max(0.,overdrive-dt);
        movePilots(dt);
        double bend = slope(distance + 16) - slope(distance - 8);
        double target = in.steer * (in.brake ? 29 : 22) - bend * speed * (in.brake ? .28 : .75);
        vx += (target - vx) * (1 - exp(-(in.brake ? 10. : in.steer ? 6.2 : 3.9) * dt));
        x = bound(x + vx * dt, -18, 18);
        if (fabs(x) >= 18 && vx * x > 0)
            scrapeRail(-routeSign(x), dt);
        lean += (-vx * .027 - bend * .44 - lean) * (1 - exp(-8 * dt))+rollRate*dt;
        launchTime = std::max(0., launchTime - dt);
        steerMemory = in.steer ? 0.5 : std::max(0., steerMemory - dt);
        if (wakeCharge >= 1 && in.boost && steerMemory > 0 && std::abs(x - chargedLane) > 1.25 &&
            !in.brake) {
            launchTime = 1.2;
            wakeCharge = 0;
            immunity = std::max(immunity, .45);
            cues.push_back(Cue::Launch);
        }
        if (drafting && !in.boost && launchTime == 0 && wakeCharge < 1) {
            wakeCharge = std::min(1., wakeCharge + dt / 1.05);
            if (wakeCharge == 1)
                chargedLane = x;
        } else if (!drafting && wakeCharge < 1)
            wakeCharge = std::max(0., wakeCharge - dt * .20);
        bool boost = in.boost && !in.brake && energy > 0 && !spent;
        if (boost && launchTime == 0) {
            energy = std::max(0., energy - 8.3 * dt);
            if (energy == 0)
                spent = true;
        } else {
            energy = std::min(100., energy + (drafting ? 30 : 14) * dt);
            if (!in.boost || energy >= 20)
                spent = false;
        }
        thrust += ((boost || padBoost > 0 || launchTime > 0 || overdrive > 0) - thrust) * (1 - exp(-6 * dt));
        speed -= 18 * viaductGrade(distance) * dt;
        // Keep momentum when the pilot releases boost. The airbrake still bites immediately.
        const double targetSpeed = in.brake ? 30. : 52. + 29. * thrust +
            (forkSide < 0 ? 1.4 * bridgeHeight(x, distance) : 0.) +
            (drafting ? 6. : 0.) + (launchTime > 0 ? 31. : 0.) + (overdrive > 0 ? 54. : 0.);
        const double response = in.brake ? 2.8 : (targetSpeed >= speed ? 2.7 : .53);

        speed += (targetSpeed - speed) * (1 - std::exp(-response * dt));
        double before = distance, travel = speed * dt / bound(1 - bend * x / 24, .87, 1.13);
        if (forkSide > 0)
            energy = std::min(100., energy + 18 * dt);
        distance += travel;
        const double island = islandHalf(distance);
        if (island > 0) {
            if (!forkSide)
                forkSide = routeSign(x);
            double clearance = forkSide * x - island;
            if (clearance < 1.3) {
                x = forkSide * (island + 1.3);
                scrapeRail(forkSide, dt);
            }
        } else
            forkSide = 0;
        while (nextSector * 96 < distance + 210)
            sectors.push_back(sector(nextSector++));
        std::erase_if(sectors, [&](auto &s) { return s.z <= distance - 30; });
        for (auto &s : sectors) {
            if (s.mine && before < s.z - 17 && distance >= s.z - 17) {
                const double obstacle=s.obstacleX(elapsed-dt*(distance-(s.z-17))/travel);
                if (std::abs(obstacle-x)<s.radius()){
                    impact(s.sweeping?.75:1.,routeSign(obstacle-x));
                    s.mine=false;
                }
            }
            if (!s.used && before < s.z && distance >= s.z) {
                s.used = true;
                if (recovery == 0 && fabs(s.x - x) < 2.9) {
                    if(s.violet && in.boost && !in.brake && energy>=35){
                        energy-=35;
                        overdrive=2.35;
                        cues.push_back(Cue::Overdrive);
                        continue;
                    }
                    energy = std::min(100., energy + 24);
                    padBoost = 1.05;
                    if (++refills % 2 == 0)
                        rockets = std::min(3, rockets + 1);
                    shield = std::min(3, shield + 1);
                    cues.push_back(Cue::Pad);
                }
            }
        }
        hullContacts(dt);
        rivalGuns(dt);
        blastGas.drift(dt);stepShots(dt);
        auto emit=[&](int id,double lane,double z,double sideways,double forward,double bank,
                      int damage,int side,double power){
            const double nozzle=z-1.9, grade=(deckAt(lane,z+.5)-deckAt(lane,z-.5));
            wakes[id].engine(dt,road(nozzle)+lane-1.9*.65*sideways/std::max(30.,forward),
                deckAt(lane,nozzle)+1.94,nozzle,sideways+slope(nozzle)*forward,
                grade*forward,forward,bank,damage,side,power);
        };
        emit(0,x,distance,vx,speed,lean,recovery>0?-1:3-shield,damagedSide,thrust);
        for(int i=0;i<6;++i){
            auto &p=rivals[i];
            emit(i+1,p.x,p.z,p.lateral,p.speed,p.lean,p.recovery>0?-1:3-p.hull,i%2?-1:1,
                 bound((p.speed-54)/30,0,1));
        }
        rank = 1;
        for (auto &p : rivals)
            if (p.z > distance)
                rank++;
        if (int(floor(distance / lapLength)) > laps) {
            laps++;
            double at = elapsed - (distance - laps * lapLength) * dt / travel;
            lastLap = at - lapStart;
            lapStart = at;
            cues.push_back(Cue::Lap);
        }
    }
    std::vector<Object> visible() const {
        std::vector<Object> out;
        double offset = laps * lapLength;
        auto add = [&](double xx, double z, int k, double age = 0, double airspeed = 0, double rise = 0) {
            out.push_back({float(xx), float(z - offset), float(k), float(age), float(airspeed), float(rise)});
        };
        if (recovery > 0)
            add(x, distance, PlayerFragments, 1 - recovery / recoveryTime);
        if (scrape > 0)
            add(x + scrapeSide * 1.35, distance, Sparks, scrapeSide * scrape / .24);
        for (int i = 0; i < 6; i++) {
            const auto &p = rivals[i];
            double dz = gap(p.z, distance);
            if (dz <= -10 || dz >= 158)
                continue;
            if (p.recovery > 0)
                add(p.x, distance + dz, Fragments, 1 - p.recovery / recoveryTime);
            else {
                add(p.x, distance + dz, 6 + i, p.lean, p.speed);
            }
        }
        if(recovery<=0){
            const auto aim=muzzle(false);constexpr double sight=31.;
            add(aim.x+sight*aim.vx/aim.vz-road(aim.z+sight),aim.z+sight,13,aim.y+sight*aim.vy/aim.vz);
        }
        for (int i = 0; i < int(rivals.size()); i++) {
            const auto &p = rivals[i];
            double dz = gap(p.z, distance);
            if (p.recovery > 0 || dz < 0 || dz > 100)
                continue;
            if (p.hitGlow > 0)
                add(p.x, distance + dz, 14, p.hitGlow / .75,p.hitOffset);
            if (i == wakePilot)
                add(p.x, distance + dz, 12, wakeCharge);
        }
        if(lockTime>0)add(markedLane,distance+11,-2,lockTime/.82);
        for (auto &s : sectors) {
            if (!s.used && s.z < distance + 153)
                add(s.x, s.z, 0, s.violet?1.:0.);
            if (s.mine && s.z - 17 < distance + 145)
                add(s.obstacleX(elapsed),s.z-17,s.sweeping?4:1, s.sweeping?std::cos(elapsed*.53+s.z*.019):0);
        }
        for (auto &s : shots)
            add(s.x-road(s.z),s.z,s.owner>=0?-1:s.rocket?3:2,s.y,s.vx/s.vz,s.vy/s.vz);
        for (auto &b : bursts)
            add(b.x,b.z,b.rocket?int(RocketImpact):5,b.age,0,b.lift);
        auto addGas=[&](const Wake &wake){for(const auto &g:wake.gas){
            const double dz=gap(g.z,distance);
            if(dz < -8.0 || dz>95)continue;
            const double u=g.age/g.life;
            const double r=g.radius+g.spread*g.age;
            add(g.x-road(g.z),distance+dz,g.hot?HotGas:(g.ion?IonGas:ColdGas),u,r,g.y);
        }};
        addGas(blastGas);for(const auto &wake:wakes)addGas(wake);
        return out;
    }
};
} // namespace neon
