#pragma once
#include <cmath>

struct Jumper {
    double height = 0;
    double speed = 270;
    double peak = 0;

    void update(double dt) {
        speed -= 800 * dt;
        height += speed * dt;
        if (height > peak) peak = height;
        if (height < 0) {
            height = 0;
            speed = 270;
        }
    }
};
inline Jumper player;

inline void frame() {
    static const double start = glfwGetTime();
    double elapsed = glfwGetTime() - start;
    float pulse = 0.5f - 0.5f * std::cos(elapsed * 1.8);
    glClearColor(0.25f + 0.65f * pulse,
                 0.09f + 0.31f * pulse,
                 0.06f + 0.04f * pulse, 1.f);
    glClear(GL_COLOR_BUFFER_BIT);
    int w, h;
    glfwGetFramebufferSize(glfwGetCurrentContext(), &w, &h);
    int size = h / 10;
    int y = h / 10 + int(player.height * h / 70.0);
    glEnable(GL_SCISSOR_TEST);
    glScissor((w - size) / 2, y, size, size);
    glClearColor(0.72f, 1.f, 0.86f, 1.f);
    glClear(GL_COLOR_BUFFER_BIT);
    glDisable(GL_SCISSOR_TEST);
}
