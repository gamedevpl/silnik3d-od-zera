#pragma once
#include "bridge.hpp"
#include "circuit.hpp"

namespace neon {
// Low-poly headlands and shipping traffic, shared by all three renderers.
template<class Quad> void coastScenery(int section, double z, Quad quad) {
    const int k=circuitIndex(section);
    if(k<48)return;
    auto tier=[&](double x,double y,double dz,double rx,double rz,double top,double taper,int sides,int lit,int dark){
        auto point=[&](int i,double scale,double h){
            const double a=tau*i/sides+.19;
            return CoursePoint{x+rx*scale*std::cos(a),h,z+dz+rz*scale*std::sin(a)};
        };
        for(int i=0;i<sides;i++){
            auto a=point(i,taper,top),b=point(i+1,taper,top);
            quad(point(i,1,y),point(i+1,1,y),b,a,i%4<2?lit:dark);
            quad(a,b,{x,top,z+dz},{x,top,z+dz},lit);
        }
    };
    if(k>=48 && k<63){
        // Stepped basalt on the outside of the sweep, isolated stacks out to sea.
        for(int row=0;row<2;row++){
            double x=-(65+row*46+10*std::sin(k*.7));
            double h=19+row*20+10*std::cos(k*.91);
            tier(x,0,9,24,21,h,.75,7,0x48465e,0x31364d);
            tier(x,h,9,18,16,h+2,.92,7,0x9ab8b0,0x687d81);
        }
        if(k%4==1)tier(71,0,11,10,10,21+k%13,.42,5,0x645d70,0x384254);
    }
    if(k==61 || k==79){
        const double x=k==61?54:-55;
        tier(x,0,10,14,13,6,.77,9,0x646375,0x484858);
        for(int band=0;band<6;band++){
            const double radius=4.4-.30*band;
            tier(x,6+band*4,10,radius,radius,10+band*4,(radius-.30)/radius,10,
                 band%2?0xdc846b:0xe2d5bb,band%2?0x9b5158:0xa5a5a9);
        }
        tier(x,30,10,4,4,31,1,10,0x414558,0x292e45);
        tier(x,31,10,2.6,2.6,34,1,10,0xffe09b,0xf9af60);
        tier(x,34,10,4,4,36,.13,10,0x565770,0x35394b);
    }
    if(k==70 || k==86){
        // Two rock pillars join into a natural arch above the inlet.
        double x=48+11*std::sin(k),h=22.+k%17;
        tier(x,0,2,8,9,h,.62,6,0x977278,0x604f66);
        tier(x+24,0,4,10,11,h+3,.48,6,0x89717b,0x574d63);
        tier(x+12,h-3,3,19,7,h+4,.83,7,0xaa8581,0x726274);
    }
    if(k==73){
        // A freestanding sea arch spans the racing line. Build both faces and the soffit.
        auto stone=[&](int i,double width,double depth){
            const double angle=tau*.5*i/18.;
            const double seam=1.4*std::sin(i*2.1)+.9*std::sin(i*.91);
            return CoursePoint{(43.+width+seam)*std::cos(angle),
                               (36.+width+seam)*std::sin(angle),z+depth+2.*std::sin(i*.72)};
        };
        for(int i=0;i<18;i++){
            int front=i%4==1?0xad7770:i%3?0x995e62:0xb48778;
            quad(stone(i,0,1),stone(i,8,2),stone(i+1,8,2),stone(i+1,0,1),front);
            quad(stone(i,0,1),stone(i+1,0,1),stone(i+1,0,11),stone(i,0,11),0x654b59);
            quad(stone(i,8,2),stone(i,8,11),stone(i+1,8,11),stone(i+1,8,2),0xc19883);
            quad(stone(i,0,11),stone(i+1,0,11),stone(i+1,8,11),stone(i,8,11),0x805e68);
            quad(stone(i,5,.5),stone(i,5.7,.5),stone(i+1,5.7,.5),stone(i+1,5,.5),0xd3a786);
        }
    }
    if(k==51 || k==55 || k==58 || k==82){
        const double x= k==82 ? -79 : 71.+(k%3)*12;
        const double hub=36+k%5;
        tier(x,0,12,5,5,4,.64,8,0x536675,0x314957);
        tier(x,4,12,2.2,2.2,hub,.43,9,0xdcd3be,0x9aafbb);
        tier(x,hub-1,12,2.3,2.8,hub+1.5,.9,9,0xffcc9b,0xa89086);
        for(int j=0;j<3;j++){
            const double a=tau*j/3+.27*k;
            auto blade=[&](double radius,double chord){
                return CoursePoint{x+radius*std::cos(a)-chord*std::sin(a),
                                   hub+radius*std::sin(a)+chord*std::cos(a),z+9.4};
            };
            quad(blade(1,-.48),blade(5,1.3),blade(17,.38),blade(17,-.16),0xece2ce);
            quad(blade(17,-.16),blade(17,.38),blade(19,.20),blade(19,-.13),0xff8a6f);
        }
    }
    if(k==63 || k==80){
        // A moored ferry lies beneath each elevated launch. Its wheelhouse faces the canal.
        tier(1,.65,10,34,5,3,1.09,8,0xc85c4d,0x743c48);
        tier(1,3,10,35,5.3,4,.97,8,0xe3bd88,0xae8066);
        tier(-8,4,10,6,3.2,7.4,.86,8,0xe3d9bc,0x87909e);
        tier(-8,6.3,10,5.6,3.1,7,.98,8,0x84e3e8,0x528eab);
        for(int j=0;j<3;j++){
            tier(9+j*6,4,10,3.6,2.7,6.2,.97,4,j%2?0x388a9a:0xce8853,0x625766);
        }
        tier(2,4,10,1.6,1.5,8.5,.85,8,0xe98d52,0x734451);
    }
}
}
