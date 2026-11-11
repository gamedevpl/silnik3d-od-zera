#include "attitude.hpp"
#include <algorithm>
#include <cmath>
#include <cstdio>
#include <cstdlib>

int main(int argc, char** argv) {
    if (argc != 2) { std::puts("usage: ./axes PITCH_IN_DEGREES"); return 2; }
    double pitch=std::atof(argv[1]);
    Attitude yaw,roll;
    yaw.reset(pitch); roll.reset(pitch);
    yaw.turn(true,radians(45)); roll.turn(false,radians(45));
    double gap=0;
    for (Vec3 axis : {Vec3{1,0,0},Vec3{0,1,0},Vec3{0,0,1}}) {
        Vec3 a=yaw.apply(axis), b=roll.apply(axis);
        gap=std::max(gap,std::hypot(a.x-b.x,a.y-b.y,a.z-b.z));
    }
    std::printf("pitch %.0f deg   yaw +45 / roll -45\n",pitch);
    std::printf("max axis gap = %.3f\n",gap);
    std::puts(gap<1e-8 ? "SAME orientation" : "DISTINCT orientations");
}
