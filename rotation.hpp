#pragma once
#include <cmath>

struct Vec3 { double x, y, z; };
constexpr double radians(double degrees) {
    return degrees * 3.141592653589793 / 180.0;
}

inline Vec3 aboutX(Vec3 p, double a) {
    return {p.x, p.y*std::cos(a) - p.z*std::sin(a),
                 p.y*std::sin(a) + p.z*std::cos(a)};
}
inline Vec3 aboutY(Vec3 p, double a) {
    return {p.x*std::cos(a) + p.z*std::sin(a), p.y,
           -p.x*std::sin(a) + p.z*std::cos(a)};
}
inline Vec3 aboutZ(Vec3 p, double a) {
    return {p.x*std::cos(a) - p.y*std::sin(a),
            p.x*std::sin(a) + p.y*std::cos(a), p.z};
}
