#pragma once
#include "surface.hpp"

inline void beginFrame() {
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
}

inline void drawPanel(float x, float y, float z, Tint tint) {
    std::array<ClipPoint,4> points{{
        {x-.43f,y-.55f,z,1}, {x+.43f,y-.55f,z,1},
        {x+.43f,y+.55f,z,1}, {x-.43f,y+.55f,z,1}
    }};
    quad(points, tint);
}

inline void overlap(bool nearFirst) {
    const auto nearWall = []{ drawPanel(-.16f,-.13f,-.5f,mint); };
    const auto farWall = []{ drawPanel(.18f,.12f,.5f,coral); };
    if (nearFirst) { nearWall(); farWall(); }
    else           { farWall(); nearWall(); }
}
