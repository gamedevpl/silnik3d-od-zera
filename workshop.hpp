#pragma once
#include "clock.hpp"
#include "socket.hpp"
#include "sound.hpp"
#include "collision.hpp"
#include "drive.hpp"
#include "rotation.hpp"
#include "scene.hpp"

struct Workshop {
    Scene<Vec3> objects;
    Handle robot = objects.create({-.65, 0, 1.65});
    Clock clock;
    Cell cell;
    SoundEvents sounds;
    Socket socket;
    bool powered = false;
    unsigned powerChanges = 0;

    void advance(double elapsed, bool w, bool a, bool s, bool d, bool use = false) {
        const Vec3 before = *objects.get(robot);
        bool wasCarried = cell.carried;
        bool wasPowered = powered;
        clock.advance(elapsed, [&](double dt) {
            auto& p = *objects.get(robot);
            auto v = direction(w, a, s, d);
            moveRobot(p, v.x * 2 * dt, v.z * 2 * dt, powered ? nullptr : &liftGate);
        });
        cell.update(*objects.get(robot), use);
        bool seated = socket.accepts(cell);
        if (powered != seated) {
            powered = seated;
            ++powerChanges;
        }
        Vec3 p = *objects.get(robot);
        bool inDoor = p.x >= liftGate.x0 && p.x <= liftGate.x1;
        bool enteredLift = inDoor && before.z >= liftGate.z0 && p.z < liftGate.z0;
        sounds = listen(wasCarried, cell.carried, wasPowered, powered, enteredLift);
    }
};
