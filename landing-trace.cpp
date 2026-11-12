#define GLFW_INCLUDE_NONE
#include <glad/gl.h>
#include <GLFW/glfw3.h>
#include <frame.hpp>
#include <cstdio>

int main() {
    Jumper jumper;
    for (int frame = 0; frame <= 40; ++frame) {
        jumper.update(frame == 0 ? 0.0 : 1.0 / 30.0);
        if (frame == 10 || (frame >= 19 && frame <= 21) || frame == 40) {
            std::printf("%3d   %7.1f   %+7.1f\n", frame, jumper.height, jumper.speed);
        }
    }
}
