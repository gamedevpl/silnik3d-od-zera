#define GLFW_INCLUDE_NONE
#include <glad/gl.h>
#include <GLFW/glfw3.h>
#include "workshop_view.hpp"

int main() {
    if (!glfwInit()) return 1;
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
    glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GLFW_TRUE);
    glfwWindowHint(GLFW_DEPTH_BITS, 24);
    GLFWwindow* window = glfwCreateWindow(960, 540, "Night Shift | WASD | E cell | B boxes | R reset", nullptr, nullptr);
    if (!window) { glfwTerminate(); return 1; }
    glfwMakeContextCurrent(window);
    if (!gladLoadGL(glfwGetProcAddress)) { glfwTerminate(); return 1; }
    glfwSwapInterval(1);

    Workshop workshop;
    WorkshopView view;
    double previous = glfwGetTime();
    bool resetDown = false, boxesDown = false;
    while (!glfwWindowShouldClose(window)) {
        glfwPollEvents();
        auto held = [&](int key) {
            return glfwGetKey(window, key) == GLFW_PRESS;
        };
        if (held(GLFW_KEY_ESCAPE)) break;
        if (held(GLFW_KEY_R) && !resetDown) {
            workshop = Workshop{};
            view = WorkshopView{};
        }
        resetDown = held(GLFW_KEY_R);

        if (held(GLFW_KEY_B) && !boxesDown) view.debugBoxes = !view.debugBoxes;
        boxesDown = held(GLFW_KEY_B);

        double now = glfwGetTime();
        double elapsed = now - previous;
        previous = now;
        workshop.advance(elapsed,
                         held(GLFW_KEY_W), held(GLFW_KEY_A),
                         held(GLFW_KEY_S), held(GLFW_KEY_D), held(GLFW_KEY_E));

        int width, height;
        glfwGetFramebufferSize(window, &width, &height);
        if (width > 0 && height > 0) {
            glViewport(0, 0, width, height);
            view.draw(*workshop.objects.get(workshop.robot), workshop.cell, double(width) / height);
            glfwSwapBuffers(window);
        }
    }
    glfwDestroyWindow(window);
    glfwTerminate();
}
