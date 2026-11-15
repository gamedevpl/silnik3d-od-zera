#pragma once
#include "surface.hpp"
#include "lens.hpp"
#include <algorithm>

struct OrbitCamera {
    double yaw = .52;
    double radius = 5.5;

    void move(double orbit, double dolly) {
        yaw += orbit;
        radius = std::clamp(radius + dolly, 3.2, 14.0);
    }

    ClipPoint project(Vec3 world, double aspect) const {
        Vec3 eye = aboutX(aboutY(world, -yaw), lens::tilt);
        const double distance = radius - eye.z;
        constexpr double near = lens::nearPlane, far = lens::farPlane;
        const double focal = lens::focal;
        const double z = ((far+near)*distance - 2*far*near)/(far-near);
        return {float(focal*eye.x/aspect), float(focal*eye.y),
                float(z), float(distance)};
    }
};
inline OrbitCamera camera;
