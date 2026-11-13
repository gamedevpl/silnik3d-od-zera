#define GLFW_INCLUDE_NONE
#include <glad/gl.h>
#include <GLFW/glfw3.h>
#include "lighting.hpp"
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
    auto window = glfwCreateWindow(320,240,"Material check",nullptr,nullptr);
    if (!window) { glfwTerminate(); return 2; }
    glfwMakeContextCurrent(window);
    if (!gladLoadGL(glfwGetProcAddress)) { glfwTerminate(); return 2; }
    constexpr int w=192,h=192;
    // Same pixel dimensions on both regular and high-density windows.
    GLuint fbo, color, depth;
    glGenFramebuffers(1,&fbo);
    glBindFramebuffer(GL_FRAMEBUFFER,fbo);
    glGenRenderbuffers(1,&color);
    glBindRenderbuffer(GL_RENDERBUFFER,color);
    glRenderbufferStorage(GL_RENDERBUFFER,GL_RGBA8,w,h);
    glFramebufferRenderbuffer(GL_FRAMEBUFFER,GL_COLOR_ATTACHMENT0,GL_RENDERBUFFER,color);
    glGenRenderbuffers(1,&depth);
    glBindRenderbuffer(GL_RENDERBUFFER,depth);
    glRenderbufferStorage(GL_RENDERBUFFER,GL_DEPTH_COMPONENT24,w,h);
    glFramebufferRenderbuffer(GL_FRAMEBUFFER,GL_DEPTH_ATTACHMENT,GL_RENDERBUFFER,depth);
    if (glCheckFramebufferStatus(GL_FRAMEBUFFER)!=GL_FRAMEBUFFER_COMPLETE) return 2;
    glViewport(0,0,w,h);
    glEnable(GL_DEPTH_TEST);
    camera.radius=3.4;
    camera.yaw=0.;
    const Mesh sphere=makeSphere();
    std::array<int,2> areas{};
    bool ok=true;
    for (int i=0;i<2;++i) {
        const Material material{i==0 ? .15f:.92f,0};
        glClearColor(.025f,.033f,.047f,1);
        glClear(GL_COLOR_BUFFER_BIT|GL_DEPTH_BUFFER_BIT);
        drawLit(sphere,{0,0,0},1,material,.4,1);
        float received;
        glGetUniformfv(lighting().gpu.program,lighting().roughness,&received);
        std::vector<unsigned char> rgb(w*h*3);
        glReadPixels(0,0,w,h,GL_RGB,GL_UNSIGNED_BYTE,rgb.data());
        for (int n=0;n<w*h;++n)
            areas[i]+=rgb[n*3]>205 && rgb[n*3+1]>205 && rgb[n*3+2]>205;
        std::printf("roughness input %.2f / shader %.2f / bright pixels %d\n",
                    material.roughness,received,areas[i]);
        ok &= std::abs(received-material.roughness)<.001f;
    }
    ok &= areas[0]>0 && areas[1]>areas[0] && glGetError()==GL_NO_ERROR;
    glfwTerminate();
    return ok?0:1;
}
