#pragma once
#include "collision.hpp"
#include <cmath>

struct Cell {
    Vec3 resting{2.60, 1.29, -2.44};
    bool carried = false;
    bool wasDown = false;

    bool inReach(Vec3 robot) const {
        return std::hypot(robot.x - resting.x, robot.z - resting.z) <= .90;
    }

    Vec3 position(Vec3 robot) const {
        if (carried) return {robot.x, .62, robot.z};
        return resting;
    }

    void interact(Vec3 robot) {
        if (carried) {
            Vec3 drop{robot.x, .02, robot.z + .60};
            if (blocked(drop)) drop.z = robot.z;
            resting = drop;
            carried = false;
        } else if (inReach(robot)) {
            carried = true;
        }
    }

    void update(Vec3 robot, bool down) {
        if (down) interact(robot);
    }
};
