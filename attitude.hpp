#pragma once
#include "quat.hpp"

struct Attitude {
    Quat pose{1,0,0,0};
    void reset(double degrees) {
        pose = axisAngle({1,0,0},radians(degrees));
    }
    void turn(bool horizontal, double angle) {
        Vec3 axis = horizontal ? Vec3{0,1,0} : Vec3{0,0,1};
        double step = horizontal ? angle : -angle;
        pose = unit(pose * axisAngle(axis,step));
    }
    Vec3 apply(Vec3 p) const {
        return rotate(pose,p);
    }
};
