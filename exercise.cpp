#include "clock.hpp"
#include <cmath>
#include <cstdio>

int main() {
    Clock clock;
    int steps = 0;
    auto step = [&](double) { ++steps; };
    clock.advance(1.0 / 3.0, step);
    std::printf("steps: %d, remainder: %.3f ms\n", steps, 1000 * clock.lag);
    bool longFrame = steps == 12 && std::abs(clock.lag - .01) < 1e-8;
    clock.advance(.015, step);
    return longFrame && steps == 13 && std::abs(clock.lag - .005) < 1e-8 ? 0 : 1;
}
