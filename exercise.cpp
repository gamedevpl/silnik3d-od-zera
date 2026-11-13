#define GLFW_INCLUDE_NONE
#include <glad/gl.h>
#include <GLFW/glfw3.h>
#include "texture.hpp"
#include <cstdio>

int main() {
    if (!glfwInit()) return 2;
    glfwWindowHint(GLFW_VISIBLE,GLFW_FALSE);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR,3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR,3);
    glfwWindowHint(GLFW_OPENGL_PROFILE,GLFW_OPENGL_CORE_PROFILE);
    glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT,GLFW_TRUE);
    auto window = glfwCreateWindow(240,180,"E05",nullptr,nullptr);
    if (!window) { glfwTerminate(); return 2; }
    glfwMakeContextCurrent(window);
    if (!gladLoadGL(glfwGetProcAddress)) { glfwTerminate(); return 2; }
    GLuint board = createBoard(false);
    GLint filter = 0;
    glGetTexParameteriv(GL_TEXTURE_2D,GL_TEXTURE_MIN_FILTER,&filter);
    std::printf("min filter: 0x%x\nmip widths:",filter);
    bool ok = filter == GL_LINEAR_MIPMAP_LINEAR;
    for (int size=tileSize,level=0; size>=1; size/=2,++level) {
        GLint w=0,h=0;
        glGetTexLevelParameteriv(GL_TEXTURE_2D,level,GL_TEXTURE_WIDTH,&w);
        glGetTexLevelParameteriv(GL_TEXTURE_2D,level,GL_TEXTURE_HEIGHT,&h);
        std::printf(" %d",w);
        ok &= w==size && h==size;
    }
    std::puts("");
    glDeleteTextures(1,&board);
    ok &= glGetError()==GL_NO_ERROR;
    glfwTerminate();
    return ok ? 0 : 1;
}
