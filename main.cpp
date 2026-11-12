#define GLFW_INCLUDE_NONE
#include <glad/gl.h>
#include <GLFW/glfw3.h>
#include <cstdio>

int main() {
    if (!glfwInit()) return 1;
    std::puts("GLFW ready");
    glfwTerminate();
}
