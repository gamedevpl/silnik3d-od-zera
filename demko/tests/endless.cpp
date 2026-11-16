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
    // Check both weapons over the lap seam. Steering after launch cannot bend their path.
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
        assert(std::abs(shot.x-start.x-start.vx*14/90)<1e-7);
        assert(std::abs(shot.y-start.y-start.vy*14/90)<1e-7);
        neon::Race duel;
        for(auto &p:duel.rivals)p.z=400;
        auto &target=duel.rivals[0];target.z=25;target.speed=0;
        duel.shoot(rocket);
        const auto ray=duel.shots.front();
        const double lane=ray.x+(target.z-ray.z)*ray.vx/ray.vz-neon::road(target.z);
        target.x=lane+3.6;
        for(int i=0;i<24;i++)duel.stepShots(1./90);
        assert(target.hull==3);
        target.x=lane;
        duel.rocketCooldown=duel.cooldown=0;duel.shoot(rocket);
        for(int i=0;i<24;i++)duel.stepShots(1./90);
        assert(target.hull==(rocket?1:2));
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
    p.z = race.distance;
    p.speed = race.speed + 18;
    race.shield = 1;
    race.immunity = 0;
    race.advance(1. / 90, {});
    assert(race.shield == 0 && race.recovery > 0 && race.vx * p.kick < 0);
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
    assert(race.shield == 2 && race.speed < glance && hasEffect(neon::Smoke) && race.damagedSide == 1);
    race.immunity = 0;
    race.impact();
    assert(hasEffect(neon::FireTrail));
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
    // The same damaged engine at the same instant lifts its plume at low speed and trails it at high speed.
    for(int fx:{neon::Smoke,neon::FireTrail}){
        auto limits=[&](double speed){
            std::array<double,2> extent{};
            neon::damagePuffs(fx,.51,1,speed,[&](neon::Puff p){
                if(p.tile!=(fx==neon::Smoke?4:5))return;
                extent[0]=std::max(extent[0],-p.center.z);extent[1]=std::max(extent[1],p.center.y);
            });
            return extent;
        };
        auto slow=limits(25),fast=limits(85);
        assert(fast[0]>slow[0]*1.4 && fast[1]<slow[1]);
    }
    double before = race.distance;
    race.advance(1. / 60, {});
    assert(race.distance > before);
}
