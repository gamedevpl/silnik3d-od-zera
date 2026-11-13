#pragma once
#include "depth.hpp"
#include "face.hpp"
#include "floor.hpp"
#include "gallery.hpp"

inline Gallery& gallery() { static Gallery view; return view; }
#include <cmath>

struct Jumper {
    double height = 0;
    double speed = 270;
    double peak = 0;

    void update(double dt) {
        speed -= 800 * dt;
        height += speed * dt;
        if (height > peak) peak = height;
        if (height < 0) {
            height = 0;
            speed = 270;
        }
    }
};
inline Jumper player;

inline void frame() {
    static const double start = glfwGetTime();
    double elapsed = glfwGetTime() - start;
    float pulse = 0.5f - 0.5f * std::cos(elapsed * 1.8);
    glClearColor(0.25f + 0.65f * pulse,
                 0.09f + 0.31f * pulse,
                 0.06f + 0.04f * pulse, 1.f);
    int w, h;
    glfwGetFramebufferSize(glfwGetCurrentContext(), &w, &h);
    if (w <= 0 || h <= 0) return;
    glViewport(0, 0, w, h);
    beginFrame();
    const double aspect = double(w)/h;
    if (glfwGetKey(glfwGetCurrentContext(),GLFW_KEY_U)==GLFW_PRESS) {
        drawUVCard(aspect);
        return;
    }
    drawFloor(aspect);
    if (glfwGetKey(glfwGetCurrentContext(),GLFW_KEY_C)==GLFW_PRESS) {
        drawCube(aspect, player.height / 100.0 - .25);
        return;
    }
    auto& scene = gallery();
    scene.objects.each([&](Handle handle,const Instance& item){
        Instance painted=item;
        const bool selected = scene.selected && scene.objects.valid(*scene.selected) &&
                              scene.selected->index==handle.index;
        if (selected) painted.material.metallic=1;
        drawInstance(painted,elapsed,aspect);
    });
}
