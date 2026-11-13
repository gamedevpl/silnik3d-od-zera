#pragma once
#include "surface.hpp"
#include "rotation.hpp"
#include <algorithm>

struct OrbitCamera {
    double yaw = .52;
    double radius = 5.5;

    void move(double orbit, double dolly) {
        yaw += orbit;
        radius = std::clamp(radius + dolly, 3.2, 14.0);
    }

    ClipPoint project(Vec3 world, double aspect) const {
        Vec3 eye = aboutX(aboutY(world, -yaw), .25);
        const double distance = radius - eye.z;
        constexpr double near = .1, far = 40;
        const double focal = 1.0 / std::tan(radians(50) / 2);
        const double z = ((far+near)*distance - 2*far*near)/(far-near);
        return {float(focal*eye.x/aspect), float(focal*eye.y),
                float(z), float(distance)};
    }
};
inline OrbitCamera camera;
