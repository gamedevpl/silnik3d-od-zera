// Native checks for arrangements that are deliberately not writable via the browser ABI.
#include "../race.hpp"
#include "../race_lights.hpp"
#include <cassert>
#include <tuple>
#include "../damage_fx.hpp"
int main() {
    {
        neon::Race r;
        for(auto &p:r.rivals)p.z=400;
        r.distance=neon::lapLength+710;
        r.laps=1;
        auto idle=neon::raceLights(r);
        assert(idle[0][3]>0 && idle[1][3]>0 && idle[0][0]<idle[1][0]);
        assert(idle[0][1]>28 && std::abs(idle[0][2]-708)<1);
        r.thrust=1;
        assert(neon::raceLights(r)[0][3]>2*idle[0][3]);
        r.recovery=1;
        for(auto &p:r.rivals)p.recovery=1;
        r.wakes[0].gas.push_back({7,30,r.distance-4,0,0,0,.05,.69,1,0,true});
        auto burning=neon::raceLights(r);
        assert(burning[0][3]<0 && burning[0][0]==7 && burning[0][2]==706);
        r.wakes[0].gas[0].hot=false;
        assert(neon::raceLights(r)[0][3]==0);
        r.wakes[0].gas[0].ion=true;
        assert(neon::raceLights(r)[0][3]>0);
        r.wakes[0].gas[0].age=.65;
        assert(neon::raceLights(r)[0][3]==0);
    }
    for (double offset : {0., neon::lapLength}) {
        assert(neon::viaductHeight(offset + 480) == 0);
        assert(neon::viaductGrade(offset + 575) > .15);
        assert(neon::viaductHeight(offset + 690) > 27 && neon::viaductHeight(offset + 830) > 27);
        assert(neon::viaductGrade(offset + 940) < -.15);
        assert(neon::viaductHeight(offset + 1060) == 0);
    }
    // The warning commits to a lane. A real shot must hit or miss on either side of the lap seam.
    for(double gap:{-33.,35.})for(bool dodge:{false,true})for(double offset:{0.,neon::lapLength}){
        neon::Race r;r.speed=72;r.distance=offset+11;r.gunRest=0;r.sectors.clear();
        for(auto &p:r.rivals)p.recovery=5;
        auto &p=r.rivals[0];p.recovery=0;p.z=r.distance+gap;p.x=0;p.speed=72;
        r.rivalGuns(1./90);
        assert(r.attacker==0 && r.lockTime>0);
        if(dodge)r.x=5;
        for(int i=0;i<75;i++){
            r.distance+=r.speed/90;p.z+=p.speed/90;
            r.rivalGuns(1./90);
        }
        assert(r.shots.size()==1 && r.shots[0].owner==0);
        for(int i=0;i<150 && !r.shots.empty();i++){
            r.distance+=r.speed/90;p.z+=p.speed/90;r.stepShots(1./90);
        }
        assert(r.shield==(dodge?3:2));
    }
    // A crossing pays out exactly once. A depleted cell receives the normal repair.
    for(double energy:{20.,60.})for(bool boost:{false,true}){
        neon::Race r;r.distance=150;r.x=10;r.speed=75;r.shield=2;r.energy=energy;
        for(auto &p:r.rivals)p.z=r.distance-45;
        for(int i=0;i<4;i++)r.advance(1./90,{0,boost,false});
        const bool buy=boost && energy>=35;
        assert(r.shield==(buy?2:3) && (r.overdrive>2)==buy);
        assert(std::abs(r.energy-(energy+(buy?-35:24)))<1);
        auto cue=buy?neon::Cue::Overdrive:neon::Cue::Pad;
        assert(std::count(r.cues.begin(),r.cues.end(),cue)==1);
        if(buy){
            for(int i=0;i<120;i++)r.advance(1./90,{});
            assert(r.speed>125);
            for(const auto &p:r.rivals)assert(r.distance-p.z>90);
            r.impact();assert(r.overdrive==0);
        }
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
    // Same approach to the downhill right-hander; only pilot inputs differ.
    enum class Entry { Early, LateBrake, NoTurn };
    auto cornerExit=[](Entry entry){
        neon::Race turn;
        turn.distance=911;turn.x=-14;turn.speed=100;turn.energy=90;turn.thrust=1;
        turn.sectors.clear();turn.nextSector=100;
        for(auto& rival:turn.rivals){rival.z=1711;rival.recovery=40;}
        bool touchedRail=false;
        double finish=0;
        while(turn.distance<1019){
            const double u=(turn.distance-911)/108.;
            neon::Input input{0,true,false};
            if(entry==Entry::Early){
                const double line=-14+24*neon::ramp(u/.67)-9*neon::ramp((u-.67)/.33);
                const double error=line-turn.x-.25*turn.vx;
                input.steer=int(error>.65)-int(error<-.65);
            }else if(entry==Entry::LateBrake && u>.58){
                input.steer=1;input.brake=u<.85;
            }
            const double before=turn.distance;
            turn.advance(1./90,input);
            touchedRail |= turn.scrape>0;
            if(turn.distance>=1019)finish=turn.elapsed-(turn.distance-1019)/(turn.distance-before)/90;
        }
        return std::tuple{finish,turn.speed,touchedRail};
    };
    const auto [cleanTime,cleanSpeed,cleanRail]=cornerExit(Entry::Early);
    for(auto entry:{Entry::NoTurn,Entry::LateBrake}){
        const auto [time,speed,rail]=cornerExit(entry);
        assert(!cleanRail && rail && time>cleanTime+.05 && speed<cleanSpeed-7.);
    }
    // Holding boost down a central lane should draw challenges throughout multiple laps.
    neon::Race pack;
    int close=0;
    for(int tick=0;tick<90*100;++tick){
        pack.advance(1./90,{int(pack.x<-.5)-int(pack.x>.5),true,false});
        if(tick>900){
            for(auto &p:pack.rivals)if(std::abs(p.z-pack.distance)<45){++close;break;}
        }
    }
    assert(close>90*70);
    // A pilot farming pads still has to race the pack more than a dozen laps later.
    neon::Race chase;
    for(int tick=0;chase.laps<14;tick++){
        auto pad=neon::sector(std::max(0,int(std::ceil((chase.distance-56)/96))));
        double aim=pad.x;
        if(chase.forkSide && neon::islandHalf(pad.z)>0 && chase.forkSide*aim<0)aim=chase.forkSide*10.;
        double error=aim-chase.x-chase.vx*.15;
        chase.shoot(false);
        if(tick%60==0)chase.shoot(true);
        chase.advance(1./90,{int(error>.38)-int(error<-.38),true,false});
        chase.cues.clear();
        for(const auto &p:chase.rivals)assert(chase.distance-p.z<neon::lapLength);
    }
    // Banking is independent of track position. A missed gate raises the stake for the next carrier.
    for(double lip:neon::launchLips){
        const double lane=neon::landingLane(lip),end=lip+neon::jumpSpan+neon::lapLength;
        assert(neon::shippingGap(end-1) && !neon::shippingGap(end+1));
        assert(neon::viaductHeight(lip+30)>neon::viaductHeight(lip)+(lip==neon::cityLip?2.5:4.9));
        for(double error:{0.,5.}){
            neon::Race jump;jump.distance=end-.1;jump.laps=1;jump.x=lane+error;
            jump.energy=25;jump.speed=60;
            for(auto &p:jump.rivals)p.z=jump.distance+100;
            jump.advance(1./90,{});
            assert((jump.padBoost>1)==(error==0));
            assert((jump.energy>36)==(error==0));
        }
    }
    // Two ships leave the same point with different lateral momentum. Late steering
    // cannot erase their choice of takeoff line before they reach the lower circuit.
    for(double offset:{0.,neon::lapLength}){
        neon::Race left,right;
        for(auto* r:{&left,&right}){
            r->distance=offset+neon::cityLip;r->speed=80;
            for(auto& pilot:r->rivals)pilot.z=r->distance+150;
        }
        left.vx=-11;right.vx=11;
        for(int i=0;i<25;++i){
            left.advance(1./90,{1,true,false});
            right.advance(1./90,{-1,true,false});
        }
        assert(left.x < -1.8 && right.x > 1.8);
    }
    neon::Relay relay;
    neon::RelayFleet previousShips{},now{};
    for(int i=0;i<7;++i)previousShips[i]=now[i]={0.,double(10*i),true};
    auto cross=[&](int id,double lane){
        previousShips=now;previousShips[id]={lane,relay.gateZ()-1,true};now[id]={lane,relay.gateZ()+1,true};
        relay.advance(1./90,previousShips,now);
    };
    cross(1,0);assert(relay.cargo==2 && relay.gate==1);
    relay.take(1,0);
    assert(relay.carrier==0 && relay.cargo==2);
    cross(0,relay.gateX());assert(relay.scores[0]==2 && relay.cargo==1 && relay.carrier!=0);
    int owner=relay.carrier;
    cross(owner,0);cross(owner,0);cross(owner,0);
    assert(relay.lastPayout==0 && relay.scores[owner]==0 && relay.carrier!=owner);
    relay.safeTime=0;relay.take(relay.carrier,0);
    cross(0,0);cross(0,0);cross(0,relay.gateX());
    assert(relay.winner==0 && relay.victoryTime>0 && relay.scores[0]==0);
    // An alongside pass works at the seam, a pass in a distant lane cannot steal the cargo.
    for(double lane:{3.5,9.}){
        neon::Relay duel;
        previousShips[0]={lane,neon::lapLength-.4,true};now[0]={lane,neon::lapLength+.8,true};
        previousShips[1]={0.,0.,true};now[1]={0.,.55,true};
        duel.advance(1./90,previousShips,now);
        assert(duel.carrier==(lane<4.8?0:1));
    }
    neon::Race race;
    for (int i = 0; i < 60 * 190; ++i)
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
