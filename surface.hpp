#pragma once
#include "pipeline.hpp"
#include "shaders.hpp"
#include <array>

using ClipPoint = std::array<float,4>;
using Tint = std::array<float,3>;
constexpr Tint mint{0.27f,0.68f,0.57f};
constexpr Tint coral{0.93f,0.48f,0.31f};

inline void quad(const std::array<ClipPoint,4>& corners, Tint color) {
    static Pipeline gpu(vertex, fragment);
    static GLint ink = glGetUniformLocation(gpu.program, "ink");
    std::array<ClipPoint,6> triangles{
        corners[0], corners[1], corners[2],
        corners[0], corners[2], corners[3]
    };
    gpu.upload(triangles.front().data(), sizeof(triangles));
    glUniform3fv(ink, 1, color.data());
    glDrawArrays(GL_TRIANGLES, 0, 6);
}
