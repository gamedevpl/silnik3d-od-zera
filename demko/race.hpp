#pragma once
#include <algorithm>
#include <array>
#include <cmath>
#include <vector>
#include "junction.hpp"
#include "buildings.hpp"

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
enum class Cue { Fire, Rocket, Break, Hit, Pad, Rail, Repair, Lap, Launch, Wreck };
enum ContactEffect { Sparks = 15, Smoke, FireTrail, Fragments, PlayerFragments };
constexpr double recoveryTime = 1.15;
struct Sector {
    double x, z, mineX;
    bool mine, used = false, sweeping = false;
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
    return {x,z,mine,sweep || (i%3!=0 && (islandHalf(z-17)==0 || std::abs(mine)>islandHalf(z-17)+2)),false,sweep};
}
struct Pilot {
    double x, z, speed, lean = 0, stun = 0, boost = 0, hitGlow = 0, kick = 0, recovery = 0;
    int hull = 3;
};
struct Shot {
    double x,y,z,vx,vy,vz; // World coordinates, including road curvature and elevation at launch.
    bool rocket, spent=false;
    double age=0, launchLane=0;
};
struct Burst {
    double x, z, age = 0, lift = 0;
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
    double pace=52, contactStrength=.5;
    int damagedSide = 1;
    int wakePilot = -1, forkSide = 0;
    std::array<Pilot, 6> rivals{};
    std::vector<Sector> sectors = {sector(0), sector(1), sector(2)};
    std::vector<Shot> shots;
    std::vector<Burst> bursts;
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
    void impact(double strength = 1., int side = 1) {
        if (immunity > 0)
            return;
        contactStrength=bound(strength,.15,1.);
        damagedSide = side;
        immunity = 1.2;
        speed *= 1. - .14 * strength;
        if (--shield == 0) {
            recovery = recoveryTime;
            launchTime = padBoost = wakeCharge = 0;
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
            double island = islandHalf(p.z);
            if (island > 0)
                line = routeSign(p.x) * std::max(island + 3., routeSign(p.x) * line);
            // Pick a passing line before committing boost behind another ship.
            if(ahead<0 && ahead>-30 && std::abs(p.x-x)<3.8)
                line=bound(x+(x>12?-5:x < -12?5:(p.x>=x?5:-5)),-16,16);
            for(const auto &s:sectors){
                const double dz=s.z-17-p.z;
                if(!s.sweeping || !s.mine || dz<0 || dz>72)continue;
                double obstacle=s.obstacleX(elapsed+dz/std::max(30.,p.speed));
                if(std::abs(line-obstacle)<5.)line=bound(obstacle+(p.x<obstacle?-6.:6.),-16.,16.);
            }
            double dx = bound((line - p.x) * 1.5, -10, 10);
            p.kick *= std::exp(-4 * dt);
            p.x = bound(p.x + (dx + p.kick) * dt, -16.4, 16.4);
            if (island > 0)
                p.x = routeSign(line) * std::max(island + 1.35, std::abs(p.x));
            p.lean = -dx * .035;
            p.hitGlow = std::max(0., p.hitGlow - dt);
            p.stun = std::max(0., p.stun - dt);
            double surge = pow(std::max(0., sin(phase * 4 + i * 1.9)), 6);
            const double deficit=distance-p.z;
            const double cruise=.62*pace+.38*65.+(i-2.5)*1.65;
            const double pursuit=bound(deficit*.18,-18.,21.);
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
            for(auto &p:rivals){
                if(p.recovery>0)continue;
                // Both ship and projectile move in this tick; compare at the crossing.
                const double start=p.z-p.speed*dt;
                const double t=gap(start,shot.z)/std::max(.01,dz-p.speed*dt);
                if(t<0 || t>1 || t>=first)continue;
                const double z=shot.z+t*dz;
                if(std::abs(p.x-laneAt(t))<(shot.rocket?1.52:1.25) &&
                   std::abs(height(t)-deckAt(p.x,z)-1.85)<.85){first=t;pilot=&p;}
            }
            for(auto &s:sectors){
                const double z=s.z-17,t=(z-shot.z)/dz;
                if(!s.mine || t<0 || t>1 || t>=first)continue;
                const double lane=s.obstacleX(elapsed-dt+t*dt);
                if(std::abs(laneAt(t)-lane)<s.radius() && std::abs(height(t)-deckAt(lane,z)-1.85)<1.15){
                    first=t;mine=&s;pilot=nullptr;
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
            const Burst flash{lane,shot.z,0,shot.y-deckAt(lane,shot.z)-1.7};
            if(wall){shot.spent=true;bursts.push_back(flash);}
            if (pilot || mine) {
                if (pilot) {
                    pilot->stun = shot.rocket ? 2.4 : 1;
                    pilot->hitGlow = .75;
                    pilot->hull = std::max(0, pilot->hull - (shot.rocket ? 2 : 1));
                    if (!pilot->hull)
                        pilot->recovery = recoveryTime;
                } else
                    mine->mine = false;
                shot.spent = true;
                bursts.push_back(flash);
                cues.push_back(Cue::Break);
            }
        }
        std::erase_if(shots, [&](auto &s) { return s.spent || s.age>=1.65; });
        for (auto &b : bursts)
            b.age += dt;
        std::erase_if(bursts, [](auto &b) { return b.age >= .45; });
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
        if(recovery<=0)pace+=(speed-pace)*(1-std::exp(-dt/4.));
        movePilots(dt);
        double bend = slope(distance + 16) - slope(distance - 8);
        double target = in.steer * (in.brake ? 29 : 22) - bend * speed * (in.brake ? .28 : .75);
        vx += (target - vx) * (1 - exp(-(in.brake ? 10. : in.steer ? 6.2 : 3.9) * dt));
        x = bound(x + vx * dt, -18, 18);
        if (fabs(x) >= 18 && vx * x > 0)
            scrapeRail(-routeSign(x), dt);
        lean += (-vx * .027 - bend * .44 - lean) * (1 - exp(-8 * dt));
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
        thrust += ((boost || padBoost > 0 || launchTime > 0) - thrust) * (1 - exp(-6 * dt));
        speed -= 18 * viaductGrade(distance) * dt;
        // Keep momentum when the pilot releases boost. The airbrake still bites immediately.
        const double targetSpeed = in.brake ? 30. : 52. + 29. * thrust +
            (forkSide < 0 ? 1.4 * bridgeHeight(x, distance) : 0.) +
            (drafting ? 6. : 0.) + (launchTime > 0 ? 17. : 0.);
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
                    energy = std::min(100., energy + 24);
                    padBoost = 1.05;
                    if (++refills % 2 == 0)
                        rockets = std::min(3, rockets + 1);
                    shield = std::min(3, shield + 1);
                    cues.push_back(Cue::Pad);
                }
            }
        }
        for (auto &p : rivals)
            if (fabs(gap(p.z, distance)) < 1.8 && fabs(x - p.x) < 2 && contactLock == 0 && recovery == 0 &&
                p.recovery == 0) {
                int side = routeSign(x - p.x);
                double closing = std::abs(speed - p.speed), lateral = std::max(0., -side * (vx - p.kick));
                double shove = bound(3. + .65 * lateral + .23 * closing, 3., 17.);
                vx += side * shove;
                p.kick -= side * shove;
                double exchange = (p.speed - speed) * .30;
                speed += exchange;
                p.speed -= exchange;
                if (closing + .8 * lateral > 8)
                    impact(bound((closing + lateral) / 26, .32, 1.), -side);
                else {
                    contactStrength=bound((closing+lateral)/24.,.10,.48);
                    scrape = .20;
                    scrapeSide = -side;
                    cues.push_back(Cue::Rail);
                }
                contactLock = .42;
            }
        stepShots(dt);
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
        else if (shield < 3)
            add(x, distance, shield == 1 ? FireTrail : Smoke, damagedSide, speed, vx);
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
                if (p.hull < 3 && dz < 85)
                    add(p.x, distance + dz, p.hull == 1 ? FireTrail : Smoke, i % 2 ? -1. : 1., p.speed, p.lean*16.);
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
                add(p.x, distance + dz, 14, p.hitGlow / .75);
            if (i == wakePilot)
                add(p.x, distance + dz, 12, wakeCharge);
        }
        for (auto &s : sectors) {
            if (!s.used && s.z < distance + 153)
                add(s.x, s.z, 0);
            if (s.mine && s.z - 17 < distance + 145)
                add(s.obstacleX(elapsed),s.z-17,s.sweeping?4:1, s.sweeping?std::cos(elapsed*.53+s.z*.019):0);
        }
        for (auto &s : shots)
            add(s.x-road(s.z),s.z,s.rocket?3:2,s.y,s.vx/s.vz,s.vy/s.vz);
        for (auto &b : bursts)
            add(b.x,b.z,5,b.age,0,b.lift);
        return out;
    }
};
} // namespace neon
