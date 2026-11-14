#include "workshop.hpp"
#include <cmath>
#include <cstdio>

int main() {
    Workshop game;
    auto& p = *game.objects.get(game.robot);
    p = {1.48, 0, -1.43};
    bool touchesShelf = false;
    double atContact = 0;
    for (int tick = 0; tick < 75; ++tick) {
        game.advance(Clock::tick, true, false, false, true);
        touchesShelf |= blocked(p);
        if (tick == 24) atContact = p.x;
    }
    const double slide = p.x - atContact;
    const double gap = robotBox(p).z0 - shelves[1].z1;
    std::printf("W+D  1.50 s\nOverlap: %s\nSlide along X: %.2f\nShelf gap: %.3f\n",
                touchesShelf ? "yes" : "no", slide, gap);
    // Exercise also protects ordinary movement and all four approach directions.
    for (Box shelf : shelves) {
        Vec3 starts[] = {{shelf.x0-1,0,(shelf.z0+shelf.z1)/2},
                         {shelf.x1+1,0,(shelf.z0+shelf.z1)/2},
                         {(shelf.x0+shelf.x1)/2,0,shelf.z0-1},
                         {(shelf.x0+shelf.x1)/2,0,shelf.z1+1}};
        for (int side = 0; side < 4; ++side) {
            p = starts[side];
            for (int step = 0; step < 50; ++step) {
                game.advance(Clock::tick, side==3, side==1, side==2, side==0);
                if (blocked(p)) return 1;
            }
            if (std::hypot(p.x-starts[side].x, p.z-starts[side].z) < .6) return 1;
        }
    }
    return !touchesShelf && slide > 1.35 && slide < 1.45 && gap >= 0 && gap < .03 ? 0 : 1;
}
