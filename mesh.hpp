#pragma once
#include "wire.hpp"
#include "corners.hpp"

inline void cube(Paper paper) {
    Pixel dots[8];
    for (int i=0; i<8; ++i) {
        Vec3 p = corners[i];
        dots[i] = paper.project(p);
        paper.dot(dots[i],paper.pen+2);
    }
}
