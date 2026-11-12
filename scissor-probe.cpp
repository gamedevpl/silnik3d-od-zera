// Observe the two clears and two pixels in E01's render target.
#define GLFW_INCLUDE_NONE
#include <glad/gl.h>
#include <GLFW/glfw3.h>
#include <cstdio>

static int frameNumber = 0;
static bool active[2];
static int clears = 0;

static void observeClear(GLbitfield mask) {
    if (clears < 2) active[clears] = glIsEnabled(GL_SCISSOR_TEST);
    ++clears;
    glad_glClear(mask);
}

static GLFWwindow* createHidden(int w,int h,const char* name,GLFWmonitor* monitor,GLFWwindow* share) {
    glfwWindowHint(GLFW_VISIBLE,GLFW_FALSE);
    return glfwCreateWindow(w,h,name,monitor,share);
}

static void sample(GLFWwindow* window) {
    if (frameNumber == 0 || frameNumber == 30) {
        int w,h;
        glfwGetFramebufferSize(window,&w,&h);
        unsigned char bg[4]{}, box[4]{};
        glReadPixels(w/2,h/2,1,1,GL_RGBA,GL_UNSIGNED_BYTE,bg);
        glReadPixels(5,5,1,1,GL_RGBA,GL_UNSIGNED_BYTE,box);
        std::printf("%d %s %s %u,%u,%u %u,%u,%u\n",frameNumber+1,
                    active[0] ? "ON":"OFF",clears == 1 ? "-" : active[1] ? "ON":"OFF",
                    unsigned(bg[0]),unsigned(bg[1]),unsigned(bg[2]),unsigned(box[0]),unsigned(box[1]),unsigned(box[2]));
    }
    clears = 0;
    ++frameNumber;
}
static double sampleTime() { return frameNumber / 30.0; }
static int finished(GLFWwindow*) { return frameNumber > 30; }

#undef glClear
#define glClear observeClear
#define glfwCreateWindow createHidden
#define glfwSwapBuffers sample
#define glfwWindowShouldClose finished
#define glfwGetTime sampleTime
#define main filmedMain
#include <main.cpp>
#undef main
int main() { return filmedMain(); }
