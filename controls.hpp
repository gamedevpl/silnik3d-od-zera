#pragma once
#include "attitude.hpp"
#include <algorithm>
#include <cstdlib>
#include <cstring>

inline Attitude initialPose() {
    Attitude pose;
    const char* pitch=std::getenv("PITCH");
    pose.reset(pitch ? std::atof(pitch) : 28.0);
    return pose;
}
inline Attitude orientation=initialPose();
inline bool comparison() { return std::getenv("TURN") != nullptr; }

inline void turnFrame(double dt) {
    static double advanced=0;
    if (comparison()) {
        double degrees=std::min(45.0-advanced,40.0*dt);
        bool yaw=std::strcmp(std::getenv("TURN"),"roll")!=0;
        orientation.turn(yaw,radians(degrees));
        advanced+=degrees;
    } else {
        orientation.turn(true,radians(45)*dt);
        orientation.turn(false,radians(23)*dt);
    }
}
