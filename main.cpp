#define GLFW_INCLUDE_NONE
#include <glad/gl.h>
#include <GLFW/glfw3.h>
#include "frame.hpp"
#include "clock.hpp"

GLFWwindow* window;

void draw() {
    double now = glfwGetTime();
    static double prev = now;
    double elapsed = now - prev;
    prev = now;
    static Clock clock;
    clock.advance(elapsed, [](double dt) {
        player.update(dt);
    });
    frame();
    glfwSwapBuffers(window);
    glfwPollEvents();
}

int main() {
    if (!glfwInit()) return 1;
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
    glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GLFW_TRUE);
    window = glfwCreateWindow(640, 360, "Engine", nullptr, nullptr);
    if (!window) { glfwTerminate(); return 1; }
    glfwMakeContextCurrent(window);
    if (!gladLoadGL(glfwGetProcAddress)) { glfwTerminate(); return 1; }
    glfwSwapInterval(1);
    while (!glfwWindowShouldClose(window)) draw();
    glfwDestroyWindow(window);
    glfwTerminate();
    return 0;
}
