#pragma once
#include "cell.hpp"

constexpr Box liftGate{-.88, -2.50, .88, -2.38};

struct Socket {
    static constexpr Box opening{-.34, .90, .34, 1.50};

    bool accepts(const Cell& cell) const {
        Vec3 p = cell.resting;
        if (cell.carried || p.y != Cell::floorHeight) return false;
        return p.x - Cell::halfWidth >= opening.x0
            && p.x + Cell::halfWidth <= opening.x1
            && p.z - Cell::halfDepth >= opening.z0
            && p.z + Cell::halfDepth <= opening.z1;
    }
};
