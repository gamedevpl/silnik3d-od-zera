#pragma once
#include "pipeline.hpp"
#include "shaders.hpp"
#include "controls.hpp"
#include "corners.hpp"
#include "wire.hpp"

inline void drawFace(Paper paper, int w, int h) {
    static Pipeline gpu(vertex, fragment);

    constexpr int order[] = {
        0,1,2, 0,2,3,  0,4,7, 0,7,3,
        1,5,6, 1,6,2,  0,1,5, 0,5,4,
        3,2,6, 3,6,7,  4,6,5, 4,7,6
    };
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
    glDrawArrays(GL_TRIANGLES, 0, n / 2);
}
