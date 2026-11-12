#pragma once
#include "rotation.hpp"
#include <algorithm>
#include <cmath>

struct Pixel { int x, y; };
struct Paper {
    int cx, cy, radius, pen;
    Pixel project(Vec3 p) const {
        return {cx + int(std::lround(p.x * radius)), cy + int(std::lround(p.y * radius))};
    }
    void dot(Pixel p, int r) const {
        glScissor(p.x-r,p.y-r,2*r+1,2*r+1);
        glClear(GL_COLOR_BUFFER_BIT);
    }
    void line(Pixel a, Pixel b) const {
        int dx=b.x-a.x, dy=b.y-a.y;
        int n=std::max(std::abs(dx), std::abs(dy));
        if (n==0) { dot(a,pen); return; }
        for (int i=0; i<=n; ++i)
            dot({a.x+int(std::lround(double(dx)*i/n)),a.y+int(std::lround(double(dy)*i/n))},pen);
    }
};
