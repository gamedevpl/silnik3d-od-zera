#define GLFW_INCLUDE_NONE
#include <glad/gl.h>
#include <GLFW/glfw3.h>
#include "depth.hpp"
#include <algorithm>
#include <array>
#include <cmath>
#include <cstdio>

int main() {
    if (!glfwInit()) return 2;
    glfwWindowHint(GLFW_VISIBLE, GLFW_FALSE);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
    glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GLFW_TRUE);
    glfwWindowHint(GLFW_DEPTH_BITS, 24);
    auto win = glfwCreateWindow(240,180,"Depth test",nullptr,nullptr);
    if (!win) { glfwTerminate(); return 2; }
    glfwMakeContextCurrent(win);
    if (!gladLoadGL(glfwGetProcAddress)) { glfwTerminate(); return 2; }
    int w,h,bits;
    glfwGetFramebufferSize(win,&w,&h);
    glGetFramebufferAttachmentParameteriv(GL_FRAMEBUFFER, GL_DEPTH, GL_FRAMEBUFFER_ATTACHMENT_DEPTH_SIZE, &bits);
    if (!bits) { glfwTerminate(); return 2; }
    glViewport(0,0,w,h);
    bool ok=true;
    for (bool nearFirst : {true,false}) {
        glClearColor(0,0,0,1);
        beginFrame();
        overlap(nearFirst);
        std::array<unsigned char,4> p{};
        glReadPixels(w/2,h/2,1,1,GL_RGBA,GL_UNSIGNED_BYTE,p.data());
        std::printf("%s: RGB(%d,%d,%d)\n",nearFirst?"near first":"far first",p[0],p[1],p[2]);
        for (int i=0;i<3;++i)
            ok &= std::abs(int(p[i])-std::lround(mint[i]*255))<=1;
        ok &= glGetError()==GL_NO_ERROR;
    }
    glfwTerminate();
    return ok ? 0 : 1;
}
