#include <cmath>
#include <cstdio>

static double now;
static float red;
constexpr unsigned GL_COLOR_BUFFER_BIT = 0x4000;
double glfwGetTime() { return now; }
void glClearColor(float r, float, float, float) { red = r; }
void glClear(unsigned) {}
#include "frame.hpp"

int main() {
    float samples[3];
    for (int i = 0; i < 3; ++i) {
        now = 10.0 + i * std::acos(-1.0) / 1.8;
        frame();
        samples[i] = red;
    }
    std::printf("red: %.2f -> %.2f -> %.2f\n", samples[0], samples[1], samples[2]);
    return samples[1] > samples[0] + 0.3f && std::abs(samples[2] - samples[0]) < 0.02f ? 0 : 1;
}
