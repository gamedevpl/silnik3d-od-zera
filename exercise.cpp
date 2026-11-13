#define GLFW_INCLUDE_NONE
#include <glad/gl.h>
#include <GLFW/glfw3.h>
#include "face.hpp"
#include <array>
#include <cstdio>

// Sample the interior and exterior of the first triangle with a fixed pose.
int main() {
    if (!glfwInit()) return 2;
    glfwWindowHint(GLFW_VISIBLE, GLFW_FALSE);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
    glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GLFW_TRUE);
    auto window = glfwCreateWindow(480, 270, "E03", nullptr, nullptr);
    if (!window) { glfwTerminate(); return 2; }
    glfwMakeContextCurrent(window);
    if (!gladLoadGL(glfwGetProcAddress)) { glfwTerminate(); return 2; }
    int w, h;
    glfwGetFramebufferSize(window, &w, &h);
    glViewport(0, 0, w, h);
    Paper paper{w/2, h/2, h/4, 1};
    orientation.reset(28);
    glClearColor(0,0,0,1);
    glClear(GL_COLOR_BUFFER_BIT);
    drawFace(paper, w, h);
    int x=0, y=0;
    for (int i : {4,6,5}) {
        Vec3 p = orientation.apply(corners[i]);
        auto point = paper.project(aboutX(aboutY(p,.56),-.32));
        x += point.x;
        y += point.y;
    }
    std::array<unsigned char,4> inside{}, outside{};
    glReadPixels(x/3, y/3, 1, 1, GL_RGBA, GL_UNSIGNED_BYTE, inside.data());
    glReadPixels(1, 1, 1, 1, GL_RGBA, GL_UNSIGNED_BYTE, outside.data());
    std::printf("inside %u %u %u | outside %u %u %u\n",
        inside[0], inside[1], inside[2], outside[0], outside[1], outside[2]);
    bool valid = glGetError() == GL_NO_ERROR && inside[1] > 100 && outside[1] == 0;
    glfwDestroyWindow(window);
    glfwTerminate();
    return valid ? 0 : 1;
}
