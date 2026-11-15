#pragma once
#include <cstdint>

struct Vertex {
    float x, y, z;
    std::uint8_t r, g, b, a;
};
extern "C" {
int sceneBlock(int simple);
int sectionStart(int index);
const Vertex *vertices();
float *objectBuffer();
int actors(double time, double distance, double x, double lean, double thrust, int count);
}
