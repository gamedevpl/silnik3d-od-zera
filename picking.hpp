#pragma once
#include "lens.hpp"
#include "models.hpp"
#include <algorithm>
#include <optional>

struct Ray { Vec3 origin, direction; };

// Direction advances one unit of camera depth per unit of t.
inline Ray cursorRay(double x, double y, double width, double height, double yaw, double radius) {
    double nx = 2 * x / width - 1;
    double ny = 1 - 2 * y / height;
    Vec3 eyeDirection{nx * (width / height) / lens::focal, ny / lens::focal, -1};
    auto toWorld = [yaw](Vec3 v) { return aboutY(aboutX(v, -lens::tilt), yaw); };
    return {toWorld({0, 0, radius}), toWorld(eyeDirection)};
}

inline std::optional<double> boxHit(Ray ray, Vec3 low, Vec3 size) {
    double enter = lens::nearPlane, leave = lens::farPlane;
    auto slab = [&](double origin, double direction, double a, double b) {
        if (std::abs(direction) < 1e-10) return a <= origin && origin <= b;
        double t0 = (a - origin) / direction, t1 = (b - origin) / direction;
        if (t0 > t1) std::swap(t0, t1);
        enter = std::max(enter, t0);
        leave = std::min(leave, t1);
        return enter <= leave;
    };
    if (slab(ray.origin.x, ray.direction.x, low.x, low.x + size.x) &&
        slab(ray.origin.y, ray.direction.y, low.y, low.y + size.y) &&
        slab(ray.origin.z, ray.direction.z, low.z, low.z + size.z)) return enter;
    return {};
}

inline Vec3 offset(Vec3 a, Vec3 b) { return {a.x+b.x, a.y+b.y, a.z+b.z}; }

inline int pick(const Layout& nodes, const Models& models, Ray ray) {
    double closest = lens::farPlane;
    int selected = -1;
    for (int i = 0; i < static_cast<int>(nodes.size()); ++i) {
        const auto& node = nodes[i];
        for (const auto& part : models.at(node.model)) {
            auto hit = boxHit(ray, offset(node.position, part.low), part.size);
            if (hit && *hit < closest) {
                closest = *hit;
                selected = i;
            }
        }
    }
    return selected;
}

constexpr double gridStep = .5;
inline double snapX(double x) { return std::round(x / gridStep) * gridStep; }
