#include "raceway.hpp"
#include "scene-cues.hpp"

extern "C" const uint8_t* fly(double seconds,double steer,double shot,double rocket,double boost,double animation) {
    cue=sceneCues;
    if(shot>=0){
        for(int i=0;i<3;i++)cue.bolts[i]=shot+.16*i;
    }
    if(rocket>=0){
        cue.launch=rocket;
        cue.impact=rocket+1.6;
    }
    int stage=std::max(11,int(std::upper_bound(cue.end,cue.end+18,seconds)-cue.end));
    Frame frame(seconds,stage,steer,boost,animation);
    if(rocket>=0)cue.end[9]=rocket;
    static std::vector<uint8_t> pixels;
    pixels=frame.draw();
    return pixels.data();
}
