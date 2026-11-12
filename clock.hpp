#pragma once
#include <algorithm>

struct Clock {
    double lag = 0;
    static constexpr double tick = 1.0 / 50.0;

    template<class F>
    void advance(double elapsed, F step) {
        lag += std::min(elapsed, 0.25);
        while (lag >= tick) {
            step(tick);
            lag -= tick;
        }
    }
};
