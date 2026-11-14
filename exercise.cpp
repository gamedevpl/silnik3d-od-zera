#include "workshop.hpp"
#include <cstdio>

Workshop dropAt(double x) {
    Workshop game;
    auto& robot = *game.objects.get(game.robot);
    robot = {x,0,1.20-Cell::dropOffsetZ};
    game.cell.carried = true;
    game.advance(Clock::tick,false,false,false,false,true);
    return game;
}

void report(const char* label, const Workshop& game) {
    std::printf("%s: light %s / lift %s\n", label, game.powered ? "ON" : "OFF",
                game.powered ? "OPEN" : "LOCKED");
}

int main() {
    Workshop beside = dropAt(.60), inside = dropAt(0);
    report("Beside", beside);
    report("Seated", inside);
    std::printf("Power changes: %u / %u\n", beside.powerChanges, inside.powerChanges);
    if (beside.powered || !inside.powered || inside.powerChanges != 1) return 1;
    for (int i = 0; i < 50; ++i) inside.advance(Clock::tick,false,false,false,false,false);
    if (inside.powerChanges != 1) return 1;
    Workshop clear = inside;
    inside.advance(Clock::tick,false,false,false,false,true);
    if (inside.powered || !inside.cell.carried || inside.powerChanges != 2) return 1;
    for (Workshop* game : {&beside,&clear}) {
        auto& robot = *game->objects.get(game->robot);
        robot = {0,0,-1.8};
        for (int i = 0; i < 50; ++i)
            game->advance(Clock::tick,true,false,false,false,false);
        if ((robot.z < liftGate.z0) != game->powered) return 1;
    }
    constexpr Box rim = Socket::opening;
    constexpr double left = rim.x0 + Cell::halfWidth;
    constexpr double right = rim.x1 - Cell::halfWidth;
    constexpr double back = rim.z0 + Cell::halfDepth;
    constexpr double front = rim.z1 - Cell::halfDepth;
    // Make each fixture land exactly on its edge in double precision.
    static_assert(left - Cell::halfWidth == rim.x0 && right + Cell::halfWidth == rim.x1);
    static_assert(back - Cell::halfDepth == rim.z0 && front + Cell::halfDepth == rim.z1);
    Cell probe;
    constexpr double middleX = (rim.x0 + rim.x1) / 2;
    constexpr double middleZ = (rim.z0 + rim.z1) / 2;
    for (Vec3 touch : {Vec3{left, Cell::floorHeight, middleZ},
                       Vec3{right, Cell::floorHeight, middleZ},
                       Vec3{middleX, Cell::floorHeight, back},
                       Vec3{middleX, Cell::floorHeight, front}}) {
        probe.resting = touch;
        if (!Socket{}.accepts(probe)) return 1;
    }
    for (auto position : {Vec3{.20,Cell::floorHeight,1.20}, Vec3{-.20,Cell::floorHeight,1.20},
                          Vec3{0,Cell::floorHeight,.95}, Vec3{0,Cell::floorHeight,1.45},
                          Vec3{0,Cell::carryHeight,1.20}}) {
        probe.resting = position;
        if (Socket{}.accepts(probe)) return 1;
    }
    return 0;
}
