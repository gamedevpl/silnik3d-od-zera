#pragma once
#include "junction.hpp"
#include <algorithm>
#include <array>
#include <cmath>

namespace neon {
struct RelayShip { double x,z; bool flying; };
using RelayFleet=std::array<RelayShip,7>;

struct Relay {
    static constexpr int goal=5;
    int carrier=1, cargo=1, gate=0, winner=-1, lastBank=-1, lastPayout=0;
    std::array<int,7> scores{};
    double safeTime=0, victoryTime=0, payoutTime=0;

    double gateZ() const {constexpr double positions[]{396.,1032.,1624.,2112.};return positions[gate];}
    double gateX() const {constexpr double lanes[]{12.,-10.,10.,-9.};return lanes[gate];}
    double gateAhead(double z) const {return lapPosition(gateZ()-z);}

    void take(int from,int to) {
        if(carrier==from && from!=to && safeTime<=0){
            carrier=to;
            safeTime=.75;
        }
    }
    void deal(const RelayFleet &fleet){
        int nearest=-1;
        double best=lapLength;
        for(int i=0;i<int(fleet.size());i++){
            if(i==carrier || !fleet[i].flying)continue;
            double dz=std::abs(std::remainder(fleet[i].z-fleet[carrier].z,lapLength));
            if(dz<best){best=dz;nearest=i;}
        }
        if(nearest>=0){carrier=nearest;safeTime=.9;}
    }
    void advance(double dt,const RelayFleet &before,const RelayFleet &after){
        safeTime=std::max(0.,safeTime-dt);
        victoryTime=std::max(0.,victoryTime-dt);
        payoutTime=std::max(0.,payoutTime-dt);
        if(!after[carrier].flying){deal(after);return;}
        auto gateFraction=[&](int id){
            const double dz=gateAhead(before[id].z),travel=after[id].z-before[id].z;
            return dz>0 && dz<=travel?dz/travel:2.;
        };
        double crossing=gateFraction(carrier);
        int overtaker=-1;
        double firstPass=crossing;
        // A clean pass can take the cargo even when the cannon is cooling down.
        const auto &old=before[carrier],&now=after[carrier];
        if(safeTime==0)for(int i=0;i<int(after.size());i++){
            const double behind=std::remainder(old.z-before[i].z,lapLength);
            const double gain=(after[i].z-before[i].z)-(now.z-old.z);
            if(!after[i].flying || behind<=0 || gain<behind)continue;
            const double u=behind/gain;
            const double lateral=std::lerp(before[i].x-old.x,after[i].x-now.x,u);
            if(u>=firstPass || std::abs(lateral)>4.8)continue;
            if(std::abs(bridgeHeight(now.x,now.z)-bridgeHeight(after[i].x,after[i].z))>=1.2)continue;
            firstPass=u;
            overtaker=i;
        }
        if(overtaker>=0){
            take(carrier,overtaker);
            crossing=gateFraction(carrier);
            if(crossing<firstPass)return;
        }
        if(crossing>1.)return;
        const double lane=std::lerp(before[carrier].x,after[carrier].x,crossing);
        const double gateLane=gateX();
        gate=(gate+1)%4;
        if(std::abs(lane-gateLane)>3.3){
            if(cargo<3)++cargo;
            else{
                lastBank=carrier;lastPayout=0;payoutTime=2.;
                cargo=1;
                deal(after);
            }
            return;
        }
        lastBank=carrier;lastPayout=cargo;payoutTime=2.;
        scores[carrier]+=cargo;
        cargo=1;
        if(scores[carrier]>=goal){
            winner=carrier;victoryTime=3.;
            scores.fill(0);
        }
        deal(after);
    }
};
} // namespace neon
