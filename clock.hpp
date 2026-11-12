#pragma once

struct Clock {
    double lag = 0;
    static constexpr double tick = 1.0 / 50.0;

    template<class F>
    void advance(double elapsed, F step) {
        lag += elapsed;
        while (lag >= tick) {
            player.update(tick);
            lag -= tick;
        }
    }
};
