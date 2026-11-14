#pragma once
#include "rotation.hpp"

struct Box { double x0, z0, x1, z1; };

constexpr Box shelves[] = {
    {-3.70, -2.87, -1.97, -2.12},
    { 1.90, -2.87,  3.63, -2.12}
};

inline Box robotBox(Vec3 p) {
    return {p.x-.34, p.z-.26, p.x+.35, p.z+.33};
}

inline bool overlaps(Box a, Box b) {
    return a.x0 < b.x1 && a.x1 > b.x0
        && a.z0 < b.z1 && a.z1 > b.z0;
}

inline bool blocked(Vec3 p, const Box* closedGate = nullptr) {
    if (closedGate && overlaps(robotBox(p), *closedGate)) return true;
    for (Box shelf : shelves)
        if (overlaps(robotBox(p), shelf)) return true;
    return false;
}

inline void moveRobot(Vec3& p, double dx, double dz, const Box* closedGate = nullptr) {
    if (!blocked({p.x + dx, p.y, p.z}, closedGate)) p.x += dx;
    if (!blocked({p.x, p.y, p.z + dz}, closedGate)) p.z += dz;
}
