#pragma once
#include "race.hpp"
#include <cstdint>

namespace neon::audio {
constexpr int rate=24000, count=10;
inline std::vector<float> synthesize(int id){
    // Real seconds, including a short tail for the shipyard's metal and concrete.
    constexpr double duration[]={.22,.66,.52,.38,.42,.18,.62,.70,.81,.95};
    std::vector<float> pcm(size_t(rate*duration[id]));
    uint32_t rng=uint32_t(971+id);
    double low=0,dark=0,phase=0;
    for(size_t i=0;i<pcm.size();i++){
        double t=double(i)/rate,u=t/duration[id];
        rng=rng*1664525u+1013904223u;
        double n=double(rng)/2147483648.-1.;
        low+=.19*(n-low);dark+=.029*(n-dark);
        auto wave=[&](double hz){return std::sin(tau*hz*t);};
        auto sweep=[&](double hz){phase+=tau*hz/rate;return std::sin(phase);};
        auto ring=[&](double hz,double decay){return wave(hz)*std::exp(-decay*t);};
        auto chord=[&](double hz){return .48*ring(hz,7)+.20*ring(hz*1.5,6)+.11*ring(hz*2.01,9);};
        double v=0;
        switch(static_cast<Cue>(id)){
            case Cue::Fire:
                v=.54*sweep(108+1120*std::exp(-32*t))*std::exp(-21*t)+
                  .68*(n-low)*std::exp(-82*t)+.15*ring(93,14);break;
            case Cue::Rocket:
                v=.60*ring(71,10)+3.1*(low-dark)*std::sin(3.14159*u)*std::exp(-2.7*u)+
                  .18*sweep(140+320*u)*std::exp(-4*u);break;
            case Cue::Hit:{
                // Brief hull contact followed by the shield flexing and ringing out.
                v=.20*ring(96,27)+.23*ring(356,16)+.14*ring(547,22)+.09*ring(873,30)+
                  .46*(low-dark)*std::exp(-48*t)+.11*sweep(218+165*std::exp(-18*t))*std::exp(-10*t);
                break;}
            case Cue::Break: case Cue::Wreck:{
                bool wreck=id==int(Cue::Wreck);
                double hz=wreck?51.:76.;
                v=.57*sweep(hz*(1.5-.84*u))*std::exp(-(wreck?4.:10.)*t)+
                  (wreck?3.1:2.0)*low*std::exp(-(wreck?4.:12.)*t)+
                  .28*ring(hz*3.71,13)+.18*ring(hz*6.19,16)+.5*(n-low)*std::exp(-65*t);
                if(wreck && t>.12)v+=1.5*(low-dark)*std::exp(-7*(t-.12));
                break;}
            case Cue::Rail:
                v=.64*(low-dark)*std::exp(-20*t)+.11*ring(791,33)+.065*ring(1223,40)
                  +.19*(n-low)*std::exp(-75*t);break;
            case Cue::Launch:
                v=1.8*(low-dark)*std::sin(3.14159*u)*std::exp(-1.6*u)+
                  .40*sweep(91+550*u*u)*std::exp(-2.1*u)+.15*ring(79,5);break;
            case Cue::Pad: case Cue::Lap: case Cue::Repair:{
                double root=id==int(Cue::Pad)?440.:id==int(Cue::Lap)?330.:277.;
                v=.58*chord(root);
                if(t>.09)v+=.28*std::sin(tau*root*1.5*(t-.09))*std::exp(-7*(t-.09));
                if(id!=int(Cue::Pad) && t>.23)v+=.27*std::sin(tau*2*root*(t-.23))*std::exp(-6*(t-.23));
                break;}
        }
        v*=std::min(1.,t/.0025)*std::min(1.,(1-u)*24);
        pcm[i]=float(v/(1.+.58*std::abs(v)));
    }
    return pcm;
}
inline const auto &clip(int id){
    static const auto bank=[]{
        std::array<std::vector<float>,count> samples;
        for(int k=0;k<count;k++)samples[k]=synthesize(k);
        return samples;
    }();
    return bank.at(std::clamp(id,0,count-1));
}
} // namespace neon::audio
