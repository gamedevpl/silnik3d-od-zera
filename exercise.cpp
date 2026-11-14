#include "workshop.hpp"
#include <cstdio>

void step(Workshop& game, bool use = false, bool forward = false) {
    game.advance(Clock::tick,forward,false,false,false,use);
}

int main() {
    Workshop game;
    auto& robot = *game.objects.get(game.robot);
    robot = {2.60,0,-1.82};
    step(game,true);
    bool pickup = game.sounds.pickup;
    step(game,true);
    if (!pickup || game.sounds.pickup) return 1;
    robot = {0,0,1.20-Cell::dropOffsetZ};
    step(game);
    step(game,true);
    int latch = game.sounds.latch;
    for (int i = 1; i < 50; ++i) {
        step(game);
        latch += game.sounds.latch;
    }
    robot = {0,0,-1.8};
    int motor = 0;
    for (int i = 0; i < 50; ++i) {
        step(game,false,true);
        motor += game.sounds.lift;
    }
    std::printf("Pickup: %d\nLatch / 1 s: %d\nLift: %d\n",int(pickup),latch,motor);
    if (latch != 1 || motor != 1) return 1;
    robot = {0,0,.60};
    step(game,true);
    if (game.powered || game.sounds.latch || !game.sounds.pickup) return 1;
    step(game);
    step(game,true);
    if (!game.sounds.latch || game.sounds.pickup) return 1;
    step(game);
    if (game.sounds.latch) return 1;
    robot = {2,0,-2.49};
    step(game,false,true);
    return game.sounds.lift ? 1 : 0;
}
