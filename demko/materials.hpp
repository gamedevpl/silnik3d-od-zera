#pragma once
#include <algorithm>
#include <array>
#include <cmath>
#include <cstdint>
#include <initializer_list>

namespace neon {
// RG encodes the tangent-space normal, B the base tone, A the roughness.
constexpr int tileSize = 64;
using MaterialTile = std::array<uint8_t, tileSize * tileSize * 4>;
enum class Tile { Steel, Glass, Cladding, Hull, SmokeSprite, FlameSprite, EmberSprite };
constexpr int tileCount = 8;
inline double textureNoise(double x, double y, unsigned seed) {
    auto corner = [&](int i, int j) {
        uint32_t h = uint32_t(i) * 0x1f123bb5u ^ uint32_t(j) * 0x9e3779b9u ^ seed;
        h = (h ^ (h >> 16)) * 0x85ebca6bu;
        return double(h ^ (h >> 13)) / 4294967295.;
    };
    int i = int(std::floor(x)), j = int(std::floor(y));
    double u = x - i, v = y - j;
    u = u * u * (3 - 2 * u);
    v = v * v * (3 - 2 * v);
    return std::lerp(std::lerp(corner(i, j), corner(i + 1, j), u),
                     std::lerp(corner(i, j + 1), corner(i + 1, j + 1), u), v);
}
inline MaterialTile bakePlume(Tile kind) {
    MaterialTile result{};
    auto density = [](double x, double y) {
        double n = 0;
        for (int i = 0; i < 4; i++) {
            double freq = (1 << i) * 2.;
            n += (textureNoise(x * freq + 5.2, y * freq - 3.1, 231 + i) - .5) / (1 << i);
        }
        return std::clamp((1 - std::hypot(x, y) + .43 * n) * 1.65, 0., 1.);
    };
    for (int j = 0; j < 64; j++)
        for (int i = 0; i < 64; i++) {
            double x = (i - 31.5) / 30., y = (j - 31.5) / 30.;
            double d = density(x, y), n = textureNoise(8 * x, 8 * y, 121);
            double light =
                std::clamp(.48 + 1.7 * (d - density(x - .12, y - .15)) + .34 * n - .20 * y, 0., 1.);
            double folds=textureNoise(x*4+.8*n,y*4-.5*n,341);
            light=std::clamp(light+.64*(folds-.5),0.,1.);
            double r=32+157*light,g=34+147*light,b=45+142*light,a=d*d*(.68+.32*folds);
            if (kind == Tile::FlameSprite) {
                double tongue=std::sin(x*10+folds*7+3*y);
                double heat=std::clamp(d*(1.04+.32*y)+.16*n+.22*folds+.12*tongue,0.,1.);
                r = 243 + 12 * heat;
                g = 48 + 195 * heat * heat;
                b = 14 + 157 * std::pow(heat, 4);
                a = d * (.56 + .44 * heat) * std::clamp(1.2-std::abs(x)*(.65-.5*y)+.20*tongue,.0,1.);
            } else if (kind == Tile::EmberSprite) {
                double q = std::max(0., 1 - std::hypot(x, y));
                r = 255;
                g = 108 + 145 * q * q;
                b = 30 + 194 * std::pow(q, 4);
                a = q * q * q;
            }
            if (i == 0 || j == 0 || i == 63 || j == 63)
                a = 0;
            int k = 4 * (64 * j + i);
            result[k] = uint8_t(r);
            result[k + 1] = uint8_t(g);
            result[k + 2] = uint8_t(b);
            result[k + 3] = uint8_t(255 * a);
        }
    return result;
}
inline MaterialTile bakeTile(Tile kind) {
    MaterialTile pixels{};
    auto height = [&](int ix, int iy) {
        int x = (ix + 64) % 64, y = (iy + 64) % 64;
        double u = x * 6.28318530718 / 64, v = y * 6.28318530718 / 64;
        if (kind == Tile::Cladding) {
            bool grille = x > 7 && x < 43 && y > 10 && y < 34;
            return (grille ? .35 * std::cos(2 * v * 8) : 0.) - (x < 2 || y < 2 ? .64 : 0.) +
                   .12 * std::cos(5 * u + 2 * v) * std::sin(4 * v);
        }
        if (kind == Tile::Hull) {
            double spine = std::abs(x - 32. + .24 * (y - 32));
            bool intake = std::abs(x - 32) > 17 && y > 19 && y < 42;
            return (intake ? .42 * std::sin(12 * v) : 0.) - (spine < 1.4 || y % 32 == 0 ? .62 : 0.);
        }
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
            double grime = kind == Tile::Cladding ? .24 * textureNoise(x / 7., y / 20., 45) : 0.;
            bool stencil = kind == Tile::Hull &&
                           ((x > 43 && x < 46 && y > 8 && y < 26) || (x > 48 && x < 51 && y > 8 && y < 20));
            pixels[i + 2] = byte(stencil ? .96 : .64 + .32 * h + .12 * panel - grime);
            pixels[i + 3] = byte(kind == Tile::Steel ? .48 + .19 * panel : .20 + .14 * panel);
        }
    return pixels;
}
// A full elevation of occupied rooms, louvres, signs and service ducts.
inline MaterialTile cityElevation(){
    MaterialTile out{};
    for(int y=0;y<64;y++)for(int x=0;x<64;x++){
        int bay=x/8,floor=y/8,px=x%8,py=y%8;
        double room=textureNoise(bay*2,floor*3,471),lit=0;
        std::array<int,3> c={53+3*(bay%3),67+3*(floor%3),84};
        if(px>0 && px<7 && py>1 && py<7){
            bool warm=room>.69;
            c=warm?std::array<int,3>{224,148,91}:room>.39?std::array<int,3>{91,157,175}:std::array<int,3>{30,49,70};
            lit=room>.39?.56:0;
            if(py==6 || (px==4 && bay%3==1) || (py==4 && floor%3==0)){
                for(int &v:c)v=v*52/100;lit*=.4;
            }
            if(px==2 && py==3 && room>.67)c={243,197,139};
        }else if(py==0)c={26,40,58};
        if(bay==3 || bay==7){
            c={60,70,82};if(px==3 || px==4)c={125,140,146};
            if((floor+bay)%3==0 && py>1 && py<7){c=py%2?std::array<int,3>{34,46,57}:std::array<int,3>{112,122,124};}
            lit=0;
        }
        if(x>32 && x<39 && y>27 && y<52){
            bool glyph=(x==34 || x==37 || (y%6==1 && x>33));
            c=glyph?std::array<int,3>{255,202,130}:std::array<int,3>{166,77,61};lit=.64;
        }
        int k=4*(y*64+x);for(int j=0;j<3;j++)out[k+j]=c[j];out[k+3]=uint8_t(255*lit);
    }
    return out;
}
inline const MaterialTile &materialTile(int id) {
    static const std::array<MaterialTile, tileCount> tiles = {
        bakeTile(Tile::Steel),       bakeTile(Tile::Glass),        bakeTile(Tile::Cladding),
        bakeTile(Tile::Hull),        bakePlume(Tile::SmokeSprite), bakePlume(Tile::FlameSprite),
        bakePlume(Tile::EmberSprite),cityElevation()};
    return tiles.at(std::clamp(id, 0, tileCount - 1));
}
} // namespace neon
