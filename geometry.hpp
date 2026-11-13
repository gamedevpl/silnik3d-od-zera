#pragma once
#include <cmath>
#include <cstdint>
#include <stdexcept>
#include <vector>

struct Vertex {
    float x, y, z;
    float nx, ny, nz;
    float u, v;
};

struct Mesh {
    std::vector<Vertex> vertices;
    std::vector<std::uint32_t> indices;
};

inline Mesh makeSphere(int slices = 48, int stacks = 32) {
    if (slices < 3 || stacks < 2 || slices > 1024 || stacks > 1024)
        throw std::invalid_argument("sphere subdivisions");
    constexpr double pi = 3.141592653589793;
    Mesh mesh;
    for (int row = 0; row <= stacks; ++row) {
        float v = float(row) / stacks;
        for (int col = 0; col <= slices; ++col) {
            float u = float(col) / slices;
            float x = float(std::sin(pi*v)*std::cos(2*pi*u));
            float y = float(std::cos(pi*v));
            float z = float(std::sin(pi*v)*std::sin(2*pi*u));
            mesh.vertices.push_back({x,y,z, x,y,z, u,v});
        }
    }
    for (int row = 0; row < stacks; ++row) {
        for (int col = 0; col < slices; ++col) {
            std::uint32_t a = row*(slices+1)+col;
            std::uint32_t b = a+slices+1;
            if (row != 0) mesh.indices.insert(mesh.indices.end(), {a,a+1,b});
            if (row != stacks-1) mesh.indices.insert(mesh.indices.end(), {a+1,b+1,b});
        }
    }
    return mesh;
}
