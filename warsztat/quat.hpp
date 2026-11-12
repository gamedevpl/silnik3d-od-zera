#pragma once
#include "rotation.hpp"
#include <cmath>

struct Quat { double w, x, y, z; };

// axis is a unit vector. All callers use the three unit basis axes.
inline Quat axisAngle(Vec3 axis, double angle) {
    double half = angle / 2.0;
    double s = std::sin(half);
    return {std::cos(half), axis.x*s, axis.y*s, axis.z*s};
}
inline Quat operator*(Quat a, Quat b) {
    return {a.w*b.w - a.x*b.x - a.y*b.y - a.z*b.z,
            a.w*b.x + a.x*b.w + a.y*b.z - a.z*b.y,
            a.w*b.y - a.x*b.z + a.y*b.w + a.z*b.x,
            a.w*b.z + a.x*b.y - a.y*b.x + a.z*b.w};
}
inline Quat unit(Quat q) {
    double n = std::sqrt(q.w*q.w + q.x*q.x + q.y*q.y + q.z*q.z);
    return {q.w/n,q.x/n,q.y/n,q.z/n};
}
inline Vec3 rotate(Quat q, Vec3 v) {
    Quat result = q * Quat{0,v.x,v.y,v.z} * Quat{q.w,-q.x,-q.y,-q.z};
    return {result.x,result.y,result.z};
}
