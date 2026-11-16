#pragma once
#include <cstdint>

struct Vertex {
    float x, y, z;
    std::uint8_t r, g, b, a;
};
inline constexpr int raceObjectCapacity=512;
namespace neon {struct Race;}
int actors(const neon::Race &race,double time,int count);
extern "C" {
int circuitSection(int section, int simple);
const Vertex *vertices();
float *objectBuffer();
int particleStart();
}
