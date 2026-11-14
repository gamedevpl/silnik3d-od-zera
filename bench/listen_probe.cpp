#include "sound.hpp"
#include <array>
#include <cstdio>

int main() {
    constexpr unsigned updatesPerSecond = 50;
    bool previous = false;
    for (bool powered : std::array<bool, 2>{false, true}) {
        unsigned clicks = 0;
        for (unsigned frame = 0; frame < updatesPerSecond; ++frame) {
            const auto events = listen(false, false, previous, powered, false);
            clicks += events.latch;
            previous = powered;
        }
        std::printf("Power %s | 1 s | %u clicks\n", powered ? "ON " : "OFF", clicks);
    }
}
