#pragma once
#include "socket.hpp"
#include <algorithm>

struct Lift {
    static constexpr double upperFloor = 1.35;
    static constexpr double riseSpeed = .75;
    static constexpr double boardingLine = -2.90;
    double height = 0;

    bool atTop() const { return height >= upperFloor; }

    bool onDeck(Vec3 p) const {
        Box feet = robotBox(p);
        return feet.x0 >= liftGate.x0 && feet.x1 <= liftGate.x1
            && p.z <= boardingLine && p.z >= boardingLine - 1.0;
    }

    void advance(double dt, bool depart) {
        if (depart) height = std::min(upperFloor, height + riseSpeed * dt);
    }
};
