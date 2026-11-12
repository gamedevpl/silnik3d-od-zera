#include <clock.hpp>
#include <cstdio>

int main() {
    Clock clock;
    for (int frame = 1; frame <= 2; ++frame) {
        const double elapsed = 1.0 / 30.0;
        const double carried = clock.lag;
        double before_step = 0;
        int steps = 0;
        clock.advance(elapsed, [&](double) {
            if (steps == 0) before_step = clock.lag;
            ++steps;
        });
        std::printf("%d %.3f %.3f %d %.3f\n", frame, carried * 1000,
                    before_step * 1000, steps, clock.lag * 1000);
    }
}
