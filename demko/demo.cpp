#include "raceway.hpp"

extern "C" const uint8_t* fly(double seconds,double steer,double shot) {
    cue={48,{6.35,10.55,13.56,15.45,16.95,18.78,21.18,23.70,26.,29.29,33.6},
         {26.,26.4,26.8},29.6,31.2,36.4,46.4};
    if(shot>=0){
        for(int i=0;i<3;i++)cue.bolts[i]=shot+.16*i;
    }
    static std::vector<uint8_t> pixels;
    pixels=Frame(seconds,11,std::clamp(steer,-3.2,3.2)).draw();
    return pixels.data();
}
