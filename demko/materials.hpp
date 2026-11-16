#pragma once
#include <algorithm>
#include <array>
#include <cmath>
#include <cstdint>

namespace neon {
// RG encodes the tangent-space normal, B the base tone, A the roughness.
constexpr int tileSize = 64;
using MaterialTile = std::array<uint8_t, tileSize * tileSize * 4>;
enum class Tile { Steel, Glass };
inline MaterialTile bakeTile(Tile kind) {
    MaterialTile pixels{};
    auto height = [&](int ix, int iy) {
        int x = (ix + 64) % 64, y = (iy + 64) % 64;
        double u = x * 6.28318530718 / 64, v = y * 6.28318530718 / 64;
        if (kind == Tile::Glass)
            return (x % 32 < 2 || y % 16 < 2) ? -.62 : .06 * std::cos(u - v);
        int seam = (x + (y / 32) * 16) % 32;
        double rivet = std::hypot(double(seam % 16) - 4., double(y % 32) - 4.);
        return (seam < 2 || y % 32 < 2 ? -.75 : 0.) + .60 * std::max(0., 1 - rivet / 2.6) +
               .06 * std::sin(11 * v + std::sin(u));
    };
    auto byte = [](double a) { return uint8_t(std::lround(255 * std::clamp(a, 0., 1.))); };
    for (int y = 0; y < 64; y++)
        for (int x = 0; x < 64; x++) {
            double dx = height(x - 1, y) - height(x + 1, y), dy = height(x, y - 1) - height(x, y + 1);
            double norm = std::sqrt(1 + dx * dx + dy * dy), h = height(x, y);
            double panel = (x / 32 + 2 * (y / 16)) % 3 / 2.;
            int i = 4 * (y * 64 + x);
            pixels[i] = byte(.5 + .5 * dx / norm);
            pixels[i + 1] = byte(.5 + .5 * dy / norm);
            pixels[i + 2] = byte(.64 + .32 * h + .12 * panel);
            pixels[i + 3] = byte(kind == Tile::Steel ? .48 + .19 * panel : .20 + .14 * panel);
        }
    return pixels;
}
inline const MaterialTile &materialTile(int id) {
    static const std::array<MaterialTile, 2> tiles = {bakeTile(Tile::Steel), bakeTile(Tile::Glass)};
    return tiles.at(std::clamp(id, 0, 1));
}
} // namespace neon
