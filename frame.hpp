#pragma once
#include <cmath>

inline void frame() {
    static const double start = glfwGetTime();
    double elapsed = glfwGetTime() - start;
    float pulse = 0.5f - 0.5f * std::cos(elapsed * 1.8);
    glClearColor(0.25f + 0.65f * pulse,
                 0.09f + 0.31f * pulse,
                 0.06f + 0.04f * pulse, 1.f);
    glClear(GL_COLOR_BUFFER_BIT);
    glEnable(GL_SCISSOR_TEST);
    glScissor(0, 0, 40, 40);
    glClearColor(0.72f, 1.f, 0.86f, 1.f);
    glClear(GL_COLOR_BUFFER_BIT);
}
