#pragma once
#include "bridge.hpp"

namespace neon {
// Local coordinates shared by the Metal, WebGL and Canvas paths.
constexpr int coreObject=-3, gateObject=-4, canvasPlayer=-5;
template<class Triangle>
void relayArt(int kind,int value,double time,Triangle tri){
    auto diamond=[&](double y,double radius,double height){
        for(int j=0;j<4;j++){
            auto rim=[&](int i){double a=time*2.3+i*tau/4;return CoursePoint{radius*std::cos(a),y,radius*std::sin(a)};};
            tri({0,y+height,0},rim(j+1),rim(j),j%2?0xfff4a5:0xffcf49);
            tri({0,y-height,0},rim(j),rim(j+1),j%2?0xe39334:0xd87528);
        }
    };
    if(kind==coreObject){
        for(int j=0;j<value;j++)diamond(3.65+.65*j+.12*std::sin(time*3),j?.28:.55,j?.31:.62);
        return;
    }
    auto panel=[&](double x,double y,double w,double h,int color){
        CoursePoint a{x,y,0},b{x+w,y,0},c{x+w,y+h,0},d{x,y+h,0};
        tri(a,b,c,color);tri(a,c,d,color);
    };
    for(double x:{-3.7,3.3}){
        panel(x,.05,.4,4.9,0xffbf49);
        panel(x-.14,.05,.68,.38,0xf9e7a0);
        for(int j=0;j<3;j++)panel(x+.08,1.+j*.95,.23,.28,0x78451f);
    }
    panel(-3.7,4.85,7.4,.25,0xffcc5c);
    diamond(5.45,.52,.55);
}
}
