#include <attitude.hpp>
#include <corners.hpp>
#include <algorithm>
#include <cmath>
#include <cstdio>

// One line per degree. The frame maps use the camera from mesh.hpp.
int main() {
    Attitude pose, home;
    home.reset(90);
    pose = home;
    auto frame = [&]() {
        double gap = 0;
        for (Vec3 p : corners) {
            Vec3 a = pose.apply(p), b = home.apply(p);
            gap = std::max(gap, std::hypot(a.x-b.x, a.y-b.y, a.z-b.z));
            Vec3 camera = aboutX(aboutY(a, 0.56), -0.32);
            std::printf("%.9f %.9f ", camera.x, camera.y);
        }
        std::printf("%.9f\n", gap);
    };
    frame();
    std::fflush(stdout);
    int key;
    while ((key = std::getchar()) != EOF) {
        if (key == '0') {
            pose = home;
            frame();
        } else if (key == 'y' || key == 'z') {
            for (int degree = 0; degree < 45; ++degree) {
                pose.turn(key == 'y', radians(key == 'y' ? 1.0 : -1.0));
                frame();
            }
        }
        std::fflush(stdout);
    }
}
