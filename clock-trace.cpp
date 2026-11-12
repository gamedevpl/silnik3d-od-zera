#include <clock.hpp>
#include <cstdio>
#include <cstdlib>

int main(int argc, char** argv) {
    if (argc == 2) {
        const int fps = std::atoi(argv[1]);
        if (fps < 1 || fps > 1000) return 2;
        Clock clock;
        const double elapsed = 1.0 / fps;
        std::printf("frame 1: +%.3f ms\n", elapsed * 1000);
        int steps = 0;
        clock.advance(elapsed, [&](double tick) {
            std::printf("step %d: lag %.3f ms, tick %.3f ms\n",
                        ++steps, clock.lag * 1000, tick * 1000);
        });
        std::printf("return: %d step%s, lag %.3f ms\n", steps, steps == 1 ? "" : "s", clock.lag * 1000);
        return 0;
    }
    if (argc != 1) return 2;
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
