#pragma once
#include "shift.hpp"

// Drive both ways using the same buttons as the player.
template<class Frame> void runRoute(Shift& shift, bool second, Frame frame) {
    auto drive = [&](char key, int ticks) {
        for (int i = 0; i < ticks; ++i) {
            shift.advance(Clock::tick, key == 'W', key == 'A', key == 'S',
                          key == 'D', key == 'E');
            frame(key);
        }
    };
    drive(' ',12);
    if (second) { drive('W',86); drive('D',81); }
    else        { drive('D',81); drive('W',86); }
    drive('E',1);
    drive(' ',18);
    drive('S',60);
    drive('A',65);
    drive('E',1);
    drive(' ',20);
    drive('W',110);
    drive(' ',100);
}
