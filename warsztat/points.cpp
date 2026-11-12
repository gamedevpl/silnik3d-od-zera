#include "corners.hpp"
#include <cstdio>
#include <set>
#include <tuple>
int main() {
    std::set<std::tuple<double,double,double>> xyz;
    std::set<std::pair<double,double>> xy;
    for (Vec3 p : corners) {
        xyz.emplace(p.x,p.y,p.z);
        xy.emplace(p.x,p.y);
    }
    std::printf("XYZ: %zu vertices\nXY:  %zu positions\n",xyz.size(),xy.size());
}
