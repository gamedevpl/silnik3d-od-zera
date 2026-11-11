#pragma once
#include "rotation.hpp"

struct Attitude {
    double yaw=0, pitch=0, roll=0;
    void reset(double degrees) {
        yaw=roll=0;
        pitch=radians(degrees);
    }
    void turn(bool horizontal, double angle) {
        if (horizontal) yaw += angle;
        else roll -= angle;
    }
    Vec3 apply(Vec3 p) const {
        return aboutY(aboutX(aboutZ(p,roll),pitch),yaw);
    }
};
