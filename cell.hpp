#pragma once
#include "collision.hpp"
#include <cmath>

struct Cell {
    static constexpr double pickupRadius = .90;
    static constexpr double carryHeight = .62;
    static constexpr double floorHeight = .02;
    static constexpr double dropOffsetZ = .60;
    static constexpr double halfWidth = .18;
    static constexpr double halfDepth = .13;

    Vec3 resting{2.60, 1.29, -2.44};
    bool carried = false;
    bool wasDown = false;

    bool inReach(Vec3 robot) const {
        return std::hypot(robot.x - resting.x, robot.z - resting.z) <= pickupRadius;
    }

    Vec3 position(Vec3 robot) const {
        if (carried) return {robot.x, carryHeight, robot.z};
        return resting;
    }

    void interact(Vec3 robot) {
        if (carried) {
            Vec3 drop{robot.x, floorHeight, robot.z + dropOffsetZ};
            if (blocked(drop)) drop.z = robot.z;
            resting = drop;
            carried = false;
        } else if (inReach(robot)) {
            carried = true;
        }
    }

    void update(Vec3 robot, bool down) {
        if (down && !wasDown) interact(robot);
        wasDown = down;
    }
};
