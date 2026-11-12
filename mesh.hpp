#pragma once
#include "wire.hpp"
#include "corners.hpp"

inline void cube(Paper paper) {
    Pixel dots[8];
    for (int i=0; i<8; ++i) {
        Vec3 p = corners[i];
        p = aboutX(aboutY(p,0.56),-0.32);
        dots[i] = paper.project(p);
        paper.dot(dots[i],paper.pen+2);
    }
    for (int i=0; i<4; ++i) {
        int next = (i+1) % 4;
        glClearColor(0.52f,0.70f,0.92f,1.f);
        paper.line(dots[i], dots[next]);
        glClearColor(0.7f,1.f,0.86f,1.f);
        paper.line(dots[i+4], dots[next+4]);
    }
}
