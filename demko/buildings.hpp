#pragma once
#include "circuit.hpp"
#include <cstdint>
#include <initializer_list>

namespace neon {
struct Building { double x,y,z,w,h,d; };
inline double cityNoise(int n) {
    uint32_t h=uint32_t(n)*2654435761u;
    h^=h>>16;h*=2246822519u;
    return (h^(h>>13))/4294967296.;
}
constexpr double canalWidthFactor=3.15;
inline Building skylineBlock(int k,int side,int row,double widthFactor) {
    const int id=((k%18+18)%18)*23+side*93+row*43;
    return {side*(12+8*(widthFactor-1)+row*12+cityNoise(id+7)*5),0,k*8+cityNoise(id)*2.5,
            2+cityNoise(id+3)*3.8,4+cityNoise(id+2)*(row?28:16),4};
}
inline Building harborBlock(int sector,int side,int row) {
    int k=circuitIndex(sector),id=k*37+row*13+side*8;
    return {side*(48+row*37+cityNoise(id)*23),0,sector*24.,
            5+cityNoise(id+2)*7,k==39&&side<0?46.:8+cityNoise(id+1)*25,10};
}
inline Building crown(Building b){return {b.x+.22*b.w,b.h,b.z+.6,.60*b.w,.22*b.h,2.8};}
inline Building penthouse(Building b){return {b.x+.18*b.w,b.h,b.z+1,.66*b.w,2+b.h*.13,7.5};}
template<class F> void citySolids(int sector,F visit) {
    for(int j=0;j<3;j++)for(int side:{-1,1})for(int row=0;row<2;row++){
        int k=3*sector+j,id=((k%18+18)%18)*23+side*93+row*43;
        auto b=skylineBlock(k,side,row,canalWidthFactor);
        visit(b);
        if(id%5==0||id%5==1)visit(crown(b));
        visit({b.x+.3,b.h,b.z+.35,.66*b.w,1.2,2.6});
    }
    const int tile=circuitIndex(sector);
    if(tile<20||tile>46)return;
    for(int side:{-1,1})for(int row=0;row<2;row++){
        auto b=harborBlock(sector,side,row);visit(b);visit(penthouse(b));
        if(tile==39&&side<0){
            visit({b.x+.36*b.w,b.h+3,b.z+3,.24*b.w,10,3});
            if(!row)visit({b.x-34,25,b.z+3,35,2.1,2.8});
        }
    }
}
} // namespace neon
