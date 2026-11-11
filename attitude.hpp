#pragma once
#include "quat.hpp"

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
        Quat y = axisAngle({0,1,0},yaw);
        Quat x = axisAngle({1,0,0},pitch);
        Quat z = axisAngle({0,0,1},roll);
        return rotate(y*x*z,p);
    }
};
