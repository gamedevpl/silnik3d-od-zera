#pragma once
#include "camera.hpp"
#include "controls.hpp"
#include "corners.hpp"

inline void drawCube(double aspect, double lift) {
    constexpr int faces[6][4] = {
        {0,1,2,3}, {0,4,7,3}, {1,5,6,2},
        {0,1,5,4}, {3,2,6,7}, {4,5,6,7}
    };
    constexpr Tint colors[] = {
        coral, {.27f,.40f,.67f}, {.90f,.68f,.39f},
        {.37f,.32f,.55f}, {.69f,.85f,.76f}, mint
    };
    for (int face=0; face<6; ++face) {
        std::array<ClipPoint,4> projected;
        for (int j=0; j<4; ++j) {
            Vec3 p = orientation.apply(corners[faces[face][j]]);
            p.y += lift;
            projected[j] = camera.project(p, aspect);
        }
        quad(projected, colors[face]);
    }
}
