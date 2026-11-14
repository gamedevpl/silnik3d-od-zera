#include "workshop.hpp"
#include <cmath>
#include <cstdio>

struct Keys { bool w, a, s, d; };

Vec3 travel(Keys keys) {
    Workshop room;
    const Vec3 start = *room.objects.get(room.robot);
    for (int i = 0; i < 50; ++i) {
        room.advance(Clock::tick, keys.w, keys.a, keys.s, keys.d);
    }
    const Vec3 finish = *room.objects.get(room.robot);
    return {finish.x - start.x, finish.y - start.y, finish.z - start.z};
}

int main() {
    const auto w = travel({true, false, false, false});
    const auto wd = travel({true, false, false, true});
    std::printf("1.00 s   W %.2f   W+D %.2f\n",
                std::hypot(w.x, w.z), std::hypot(wd.x, wd.z));
    // Check the heading, neutral input and opposing keys as well as the speed.
    for (int mask = 0; mask < 16; ++mask) {
        Keys keys{bool(mask & 1), bool(mask & 2), bool(mask & 4), bool(mask & 8)};
        int x = int(keys.d) - int(keys.a), z = int(keys.s) - int(keys.w);
        auto end = travel(keys);
        double step = (x && z) ? std::sqrt(2.0) : 2.0;
        if (!(std::abs(end.x - x * step) < 1e-8 && std::abs(end.z - z * step) < 1e-8 && end.y == 0))
            return 1;
    }
    return 0;
}
