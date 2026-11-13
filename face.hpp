#pragma once
#include "pipeline.hpp"
#include "shaders.hpp"
#include "controls.hpp"
#include "corners.hpp"
#include "wire.hpp"

inline void drawFace(Paper paper, int w, int h) {
    static Pipeline gpu(vertex, fragment);
    constexpr int order[] = {4, 6, 5};
    float points[2 * (sizeof(order) / sizeof(int))];
    int n = 0;
    for (int i : order) {
        Vec3 p = orientation.apply(corners[i]);
        p = aboutX(aboutY(p, 0.56), -0.32);
        Pixel dot = paper.project(p);
        points[n++] = 2.f * dot.x / w - 1;
        points[n++] = 2.f * dot.y / h - 1;
    }
    gpu.upload(points, sizeof(points));
    glDrawArrays(GL_TRIANGLES, 0, 2);
}
