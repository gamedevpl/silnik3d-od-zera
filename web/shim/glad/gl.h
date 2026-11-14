// Browser stand-in for GLAD: WebGL 2 needs no loader. The episode code stays
// untouched; this header adapts it at build time (see web/README.md).
#pragma once
#include <GLES3/gl3.h>
#include <emscripten.h>
#include <string>
#define GLFW_INCLUDE_NONE
#include <GLFW/glfw3.h>

inline int gladLoadGL(void*) { return 1; }
#define gladLoadGL(loader) gladLoadGL(nullptr)

// Desktop GLSL 3.30 and GLSL ES 3.00 differ here only in the header line.
inline void webShaderSource(GLuint shader, GLsizei count, const GLchar* const* text, const GLint* length) {
    std::string source;
    for (GLsizei i = 0; i < count; ++i)
        source += length && length[i] >= 0 ? std::string(text[i], length[i]) : std::string(text[i]);
    const std::string desktop = "#version 330 core";
    // GLSL ES also wants the directive on the very first line, so drop what precedes it.
    if (auto at = source.find(desktop); at != std::string::npos)
        source = "#version 300 es\nprecision highp float;\nprecision highp int;" + source.substr(at + desktop.size());
    const char* out = source.c_str();
    glShaderSource(shader, 1, &out, nullptr);
}
#define glShaderSource webShaderSource

// A browser tab cannot run a blocking loop: hand control back once per frame.
EM_ASYNC_JS(void, webNextFrame, (), { await new Promise(requestAnimationFrame); });
EM_JS(void, webTitle, (const char* text), { if (Module.onTitle) Module.onTitle(UTF8ToString(text)); });
inline void webSwapBuffers(GLFWwindow*) { webNextFrame(); }
inline void webSetTitle(GLFWwindow*, const char* text) { webTitle(text); }
#define glfwSwapBuffers webSwapBuffers
#define glfwSwapInterval(interval) ((void)0) // requestAnimationFrame already paces frames
#define glfwSetWindowTitle webSetTitle
