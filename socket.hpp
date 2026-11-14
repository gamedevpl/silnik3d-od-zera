#pragma once
#include "cell.hpp"

constexpr Box liftGate{-.88, -2.50, .88, -2.38};

struct Socket {
    static constexpr Box opening{-.34, .90, .34, 1.50};

    bool accepts(const Cell& cell) const {
        Vec3 p = cell.resting;
        if (cell.carried || p.y != Cell::floorHeight) return false;
        double cx = (opening.x0 + opening.x1) / 2;
        double cz = (opening.z0 + opening.z1) / 2;
        return std::hypot(p.x - cx, p.z - cz) <= Cell::pickupRadius;
    }
};
