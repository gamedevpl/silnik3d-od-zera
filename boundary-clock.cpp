#include <clock.hpp>
#include <cstdio>

int main() {
    for (int fps : {30, 240}) {
        Clock clock;
        int steps = 0;
        for (int frame = 1; frame <= 2 * fps + 1; ++frame) {
            double now = double(frame) / fps;
            double prev = double(frame - 1) / fps;
            clock.advance(now - prev, [&](double) { ++steps; });
            if (frame >= 2 * fps)
                std::printf("%3d FPS  t=%.6f  steps=%3d  lag=%.17g  tick=%.17g\n",
                            fps, now, steps, clock.lag, clock.tick);
        }
    }
}
