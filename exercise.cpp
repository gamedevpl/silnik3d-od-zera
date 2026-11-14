#include "workshop.hpp"
#include <cmath>
#include <cstdio>

int main() {
    Workshop game;
    auto& robot = *game.objects.get(game.robot);
    robot = {2.60, 0, -1.82};
    auto press = [&](double dt, bool down) {
        game.advance(dt, false, false, false, false, down);
    };
    int changes = 0;
    for (int i = 0; i < 50; ++i) {
        bool before = game.cell.carried;
        press(Clock::tick, true);
        if (game.cell.carried != before) ++changes;
    }
    bool held = game.cell.carried;
    std::printf("E held: 1.00 s\nState changes: %d\nCarrying: %s\n", changes, held ? "yes" : "no");
    press(Clock::tick, false);
    bool releaseKeptState = game.cell.carried == held;
    press(Clock::tick, true);
    bool dropped = !game.cell.carried;
    std::printf("Next press: %s\n", dropped ? "drop" : "pick up");
    if (changes != 1 || !held || !releaseKeptState || !dropped) return 1;

    game = Workshop{};
    auto& p = *game.objects.get(game.robot);
    press(0, true);
    if (game.cell.carried) return 1;
    p = {2.60,0,-1.82};
    press(Clock::tick, true);
    if (game.cell.carried) return 1;
    press(.003, false);
    press(.003, true);
    if (!game.cell.carried) return 1;
    for (int i = 0; i < 30; ++i)
        game.advance(Clock::tick, false, false, true, false, true);
    Vec3 mounted = game.cell.position(p);
    if (std::abs(mounted.z-p.z) > .001) return 1;
    press(.003, false);
    press(.003, true);
    Vec3 atRest = game.cell.position(p);
    if (game.cell.carried || atRest.y > .03 || !game.cell.inReach(p)) return 1;
    game.advance(.08, false, false, true, false, false);
    return std::abs(game.cell.position(p).z-atRest.z) > .001;
}
