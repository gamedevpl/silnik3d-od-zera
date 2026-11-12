#define GLFW_INCLUDE_NONE
#include <glad/gl.h>
#include <GLFW/glfw3.h>
#include <cstdio>

GLFWwindow* window;

int main() {
    if (!glfwInit()) return 1;
    window = glfwCreateWindow(640, 360, "Engine", nullptr, nullptr);
    if (!window) { glfwTerminate(); return 1; }
    std::printf("OpenGL %d.%d\n",
        glfwGetWindowAttrib(window, GLFW_CONTEXT_VERSION_MAJOR),
        glfwGetWindowAttrib(window, GLFW_CONTEXT_VERSION_MINOR));
    glfwDestroyWindow(window);
    glfwTerminate();
}
