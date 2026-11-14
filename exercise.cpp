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
    Cell probe;
    for (auto position : {Vec3{.20,Cell::floorHeight,1.20}, Vec3{-.20,Cell::floorHeight,1.20},
                          Vec3{0,Cell::floorHeight,.95}, Vec3{0,Cell::floorHeight,1.45},
                          Vec3{0,Cell::carryHeight,1.20}}) {
        probe.resting = position;
        if (Socket{}.accepts(probe)) return 1;
    }
    return 0;
}
