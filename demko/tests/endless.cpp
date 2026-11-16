// Native checks for arrangements that are deliberately not writable via the browser ABI.
#include "../race.hpp"
#include <cassert>
#include "../damage_fx.hpp"
int main() {
    for (double offset : {0., neon::lapLength}) {
        assert(neon::viaductHeight(offset + 480) == 0);
        assert(neon::viaductGrade(offset + 575) > .15);
        assert(neon::viaductHeight(offset + 690) == 27 && neon::viaductHeight(offset + 830) == 27);
        assert(neon::viaductGrade(offset + 940) < -.15);
        assert(neon::viaductHeight(offset + 1060) == 0);
    }
    // Cross the lap seam, then steer the ship away from both launched weapons.
    for(bool rocket:{false,true}){
        neon::Race r;
        r.distance=neon::lapLength-12;r.vx=-5;
        for(auto &p:r.rivals)p.z=r.distance+400;
        r.sectors.clear();r.shoot(rocket);
        auto start=r.shots.front();
        r.vx=20;
        for(int i=0;i<14;i++)r.stepShots(1./90);
        const auto &shot=r.shots.at(0);
        assert(shot.z>neon::lapLength);
        if(rocket){
            assert(std::abs(shot.x-neon::road(shot.z)-start.launchLane)<1e-7);
            assert(std::abs(shot.y-neon::Race::deckAt(start.launchLane,shot.z)-1.85)<1e-7);
        }else{
            assert(std::abs(shot.x-start.x-start.vx*14/90)<1e-7);
            assert(std::abs(shot.y-start.y-start.vy*14/90)<1e-7);
        }
        neon::Race duel;
        for(auto &p:duel.rivals)p.z=400;
        auto &target=duel.rivals[0];target.z=25;target.speed=0;
        duel.shoot(rocket);
        const auto ray=duel.shots.front();
        const double lane=rocket?ray.launchLane:ray.x+(target.z-ray.z)*ray.vx/ray.vz-neon::road(target.z);
        target.x=lane+3.6;
        for(int i=0;i<24;i++)duel.stepShots(1./90);
        assert(target.hull==3);
        target.x=lane;
        duel.rocketCooldown=duel.cooldown=0;duel.shoot(rocket);
        for(int i=0;i<24;i++)duel.stepShots(1./90);
        assert(target.hull==(rocket?1:2));
        assert(duel.bursts.size()==1 && duel.bursts.front().rocket==rocket);
        assert(std::find(duel.cues.begin(),duel.cues.end(),rocket?neon::Cue::Blast:neon::Cue::Break)!=duel.cues.end());
    }
    // Fire through a facade, graze its side, and clear its roof at the next lap.
    for(double offset:{0.,neon::lapLength}){
        auto b=neon::skylineBlock(1,1,0,neon::canalWidthFactor);
        b.z+=offset;
        for(double height:{b.h*.5,b.h+12}){
            neon::Race r;r.sectors.clear();
            for(auto &pilot:r.rivals)pilot.recovery=1;
            double x=b.x+neon::road(b.z)+b.w*.5;
            r.shots.push_back({x,height,b.z-2,0,0,175,false});
            r.stepShots(.05);
            if(height>b.h)assert(r.shots.size()==1 && r.bursts.empty());
            else assert(r.shots.empty() && std::abs(r.bursts.front().z-b.z)<1e-8);
        }
        neon::Race r;r.sectors.clear();
        for(auto &pilot:r.rivals)pilot.recovery=1;
        double z=b.z+1,x=b.x+neon::road(b.z)+(neon::road(b.z+b.d)-neon::road(b.z))/b.d;
        r.shots.push_back({x-.8,2,z,100,0,20,false});r.stepShots(.02);
        assert(r.shots.empty() && r.bursts.front().z>b.z && r.bursts.front().z<b.z+b.d);
    }
    for(double start:{280.,465.,895.})for(double lane:{-2.,3.}){
        neon::Race r;r.distance=start;r.x=lane;r.sectors.clear();
        for(auto &p:r.rivals)p.recovery=1;
        r.shoot(true);
        for(int i=0;i<90;i++){
            r.stepShots(1./90);
            const auto &s=r.shots.at(0);
            double actual=s.x-neon::road(s.z);
            assert(std::abs(actual-r.rocketLane(lane,s.z))<1e-8);
            assert(std::abs(s.y-r.deckAt(actual,s.z)-1.85)<1e-8);
        }
    }
    for(bool avoid:{false,true}){
        neon::Race course;auto obstacle=neon::sector(2);
        assert(obstacle.sweeping);
        course.sectors={obstacle};course.nextSector=12;
        course.distance=obstacle.z-17-.1;
        course.x=obstacle.obstacleX(0)+(avoid?6.:0.);
        for(auto &p:course.rivals)p.z=course.distance+100;
        course.advance(1./90,{});
        assert(course.shield==(avoid?3:2));
    }
    // Holding boost down a central lane should draw challenges throughout multiple laps.
    neon::Race pack;
    int lostLead=0,close=0,previous=7;
    for(int tick=0;tick<90*100;++tick){
        pack.advance(1./90,{int(pack.x<-.5)-int(pack.x>.5),true,false});
        if(tick>900){
            lostLead+=previous==1 && pack.rank>1;
            for(auto &p:pack.rivals)if(std::abs(p.z-pack.distance)<45){++close;break;}
        }
        previous=pack.rank;
    }
    assert(lostLead>=2 && close>90*70);
    neon::Race race;
    for (int i = 0; i < 60 * 95; ++i)
        race.advance(1. / 60, {});
    assert(race.laps >= 3 && race.sectors.size() < 6);
    race.rivals.front().z = race.distance + 13;
    const auto objects = race.visible();
    auto pilot = std::find_if(objects.begin(), objects.end(), [](auto &o) { return o[2] == 6; });
    assert(pilot != objects.end() &&
           std::abs((*pilot)[1] - std::fmod(race.distance, neon::lapLength) - 13) < .0001);

    race = neon::Race{};
    auto &p = race.rivals.front();
    p.x = race.x;
    p.z = 9;
    race.shoot(false);
    for (int i = 0; i < 9; ++i)
        race.advance(1. / 60, {});
    assert(p.stun > 0);
    p.x = race.x;
    p.z = race.distance-1.2;
    p.speed = race.speed + 18;
    race.shield = 1;
    race.immunity = 0;
    race.advance(1. / 90, {});
    assert(race.shield == 0 && race.recovery > 0);
    const auto hasEffect = [&](int kind) {
        auto effects = race.visible();
        return std::any_of(effects.begin(), effects.end(), [&](auto o) { return int(o[2]) == kind; });
    };
    assert(hasEffect(neon::PlayerFragments));
    auto rounds = race.rockets;
    race.shoot(true);
    assert(rounds == race.rockets);
    for (int i = 0; i < 110; i++)
        race.advance(1. / 90, {});
    assert(std::find(race.cues.begin(), race.cues.end(), neon::Cue::Repair) != race.cues.end());
    assert(race.shield == 3);
    race = neon::Race{};
    race.vx = 4;
    race.scrapeRail(-1, 1. / 90);
    assert(race.shield == 3 && race.vx < 0 && hasEffect(neon::Sparks));
    const double glance = race.speed;
    race = neon::Race{};
    race.vx = 22;
    race.scrapeRail(-1, 1. / 90);
    assert(race.shield == 2 && race.speed < glance && race.damagedSide == 1);
    race.immunity = 0;
    race.impact();
    for(int i=0;i<4;++i)race.advance(1./90,{});
    assert(hasEffect(neon::HotGas));
    // Cross the fork twice, deliberately steering into the island on each side.
    for (int lap : {0, 3})
        for (int side : {-1, 1}) {
            neon::Race fork;
            fork.distance = lap * neon::lapLength + neon::forkStart - .1;
            fork.laps = lap;
            fork.x = side * 12;
            fork.energy = 20;
            for (int i = 0; i < 180; i++) {
                fork.advance(1. / 90, {i > 4 ? -side : 0, false, false});
                assert(fork.forkSide == side);
                assert(side * fork.x >= neon::islandHalf(fork.distance) + 1.29);
            }
            assert((neon::bridgeHeight(fork.x, fork.distance) > 4) == (side < 0));
            assert(side < 0 ? fork.energy < 55 : fork.energy > 78);
            while (neon::lapPosition(fork.distance) < neon::forkEnd + .1)
                fork.advance(1. / 90, {});
            assert(fork.forkSide == 0 && neon::bridgeHeight(fork.x, fork.distance) == 0);
        }
    neon::Race sprint;
    sprint.x=-12;
    sprint.nextSector=8;
    sprint.sectors.clear();
    for(auto &pilot:sprint.rivals)pilot.z+=450;
    for(int i=0;i<270;i++)sprint.advance(1./90,{0,true,false});
    assert(sprint.speed>74 && sprint.energy>74 && sprint.energy<76);
    auto braking=sprint;
    for(int i=0;i<45;i++){
        sprint.advance(1./90,{});
        braking.advance(1./90,{0,false,true});
    }
    assert(sprint.speed>65 && braking.speed<50 && sprint.energy>80);
    // A sideswipe exchanges lateral momentum and roll. A rear impact transfers forward speed.
    for(bool side:{false,true}){
        neon::Race r;r.immunity=5;r.x=0;r.distance=neon::lapLength-.5;r.speed=70;r.vx=side?12:0;
        for(auto &p:r.rivals)p.recovery=1;
        auto &other=r.rivals[0];other.recovery=0;other.x=side?2.:0.;other.z=r.distance+(side?0.:2.9);
        other.speed=side?70:48;other.lateral=0;
        r.hullContacts(1./90);
        assert(std::abs(r.speed+other.speed-(side?140:118))<1e-8);
        assert(std::abs(r.vx+other.lateral-(side?12:0))<1e-8);
        if(side)assert(other.lateral>r.vx && r.rollRate*other.rollRate<0 && r.speed==70);
        else assert(r.speed<60 && other.speed>60 && std::abs(r.vx)<1e-8);
        const double v=other.speed,kick=other.lateral;r.hullContacts(1./90);
        assert(other.speed==v && other.lateral==kick);
    }
    neon::Race packHit;packHit.recovery=1;
    auto &left=packHit.rivals[0],&right=packHit.rivals[1];
    left.x=0;right.x=2.2;left.z=right.z=200;left.lateral=10;right.lateral=-4;
    packHit.hullContacts(1./90);assert(left.lateral<right.lateral && left.rollRate*right.rollRate<0);
    // A reversal cannot reposition parcels that left the damaged engine before the turn.
    neon::Wake wake;
    wake.engine(.023,4,2,100,12,0,80,.2,2,1,1);
    auto old=wake.gas.front();wake.engine(.03,-7,2,103,-20,0,31,-.4,2,1,0);
    assert(wake.gas.front().x>old.x && wake.gas.back().x<0);
    assert(wake.gas.front().vz<old.vz && wake.gas.front().vz>wake.gas.back().vz);
    wake.drift(1);assert(wake.gas.empty());
    double before = race.distance;
    race.advance(1. / 60, {});
    assert(race.distance > before);
}
