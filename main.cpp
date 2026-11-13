#define GLFW_INCLUDE_NONE
#include <glad/gl.h>
#include <GLFW/glfw3.h>
#include "frame.hpp"
#include "clock.hpp"

GLFWwindow* window;

void sceneKey(GLFWwindow* window,int key,int,int action,int) {
    if (action != GLFW_PRESS && action != GLFW_REPEAT) return;
    auto& view=gallery();
    switch (key) {
    case GLFW_KEY_TAB: if(action==GLFW_PRESS) view.next(); break;
    case GLFW_KEY_X: if(action==GLFW_PRESS) view.eraseSelection(); break;
    case GLFW_KEY_N: if(action==GLFW_PRESS) view.add(); break;
    case GLFW_KEY_A: view.move(-.25,0); break;
    case GLFW_KEY_D: view.move(.25,0); break;
    case GLFW_KEY_W: view.move(0,.25); break;
    case GLFW_KEY_S: view.move(0,-.25); break;
    default: return;
    }
    std::string title="Scene | Tab X N | WASD";
    if (view.selected) {
        title+=" | "+std::to_string(view.selected->index)+":"+std::to_string(view.selected->generation);
        title+=view.objects.valid(*view.selected)?" live":" stale";
    }
    glfwSetWindowTitle(window,title.c_str());
}

void draw() {
    double now = glfwGetTime();
    static double prev = now;
    double elapsed = now - prev;
    prev = now;
    static Clock clock;
    static bool paused = false, spaceDown = false;
    const auto held = [](int key){ return glfwGetKey(window,key) == GLFW_PRESS; };
    const bool space = held(GLFW_KEY_SPACE);
    if (space && !spaceDown) paused = !paused;
    spaceDown = space;
    const double step = std::clamp(elapsed, 0.0, 0.1);
    camera.move((held(GLFW_KEY_RIGHT)-held(GLFW_KEY_LEFT))*step,
                (held(GLFW_KEY_DOWN)-held(GLFW_KEY_UP))*step*3);
    if (!paused) clock.advance(elapsed, [](double dt) {
        player.update(dt);
        turnFrame(dt);
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
    glfwWindowHint(GLFW_DEPTH_BITS, 24);
    window = glfwCreateWindow(640, 360, "Engine", nullptr, nullptr);
    if (!window) { glfwTerminate(); return 1; }
    glfwMakeContextCurrent(window);
    if (!gladLoadGL(glfwGetProcAddress)) { glfwTerminate(); return 1; }
    glfwSetKeyCallback(window,sceneKey);
    glfwSetWindowTitle(window,"Scene | Tab selects | X deletes | N creates | WASD moves");
    glfwSwapInterval(1);
    while (!glfwWindowShouldClose(window)) draw();
    glfwDestroyWindow(window);
    glfwTerminate();
    return 0;
}
