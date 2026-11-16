#pragma once
#include "bridge.hpp"
#include "race.hpp"

namespace neon {
// Effects are local to the contact point. Each shard has a fixed trajectory.
template <class Triangle> void damageMesh(int kind, double time, double age, Triangle tri) {
    if (kind == Sparks) {
        const double side = age < 0 ? -1 : 1, intensity = std::clamp(std::abs(age), 0., 1.);
        for (int i = 0; i < 9; i++) {
            double u = std::fmod(time * 2.8 + i * .3819, 1.), x = -side * u * (.3 + .13 * (i % 4));
            double y = 1.12 + u * (1.1 + .25 * (i % 3)) - 1.6 * u * u, z = -1 - u * 4.5;
            tri({x, y, z}, {x + .055 * intensity, y + .08 * intensity, z},
                {x - side * .12, y - .08, z - .48 * intensity}, i % 3 ? 0xffb04c : 0xfff4b6);
        }
    } else if (kind == Fragments || kind == PlayerFragments) {
        for (int i = 0; i < 11; i++) {
            double a = i * 2.4, x = std::cos(a) * (.45 + 2.6 * age), z = std::sin(a) * (1.1 + 2 * age) - age;
            double y = std::max(.16, 1.8 + age * (2 + i % 4) - 6 * age * age), r = (1 - age) * .48 + .06;
            tri({x - r, y, z}, {x + r, y + .24, z + .22}, {x + r * std::sin(8 * age + a), y + r, z - .42},
                i % 3 == 0 ? 0xf6b16d : 0x677487);
        }
    } else {
        const double side = age < 0 ? -1 : 1;
        age = std::abs(age);
        if (kind == FireTrail) {
            for (int i = 0; i < 4; i++) {
                double x = side * (.72 + .13 * std::sin(i + time * 12)),
                       len = 1.3 + .38 * std::sin(time * 15 + i);
                tri({x - .18, 2, -1}, {x + .20, 2.08, -1},
                    {x + .12, 2.32 + .15 * (i % 2), -1 - len * (1 - .16 * i)}, i % 2 ? 0xffda6c : 0xf47843);
            }
        }
        for (int i = 0; i < 6; i++) {
            double u = std::fmod(time * 1.15 + age + i / 6., 1.), r = .10 + .32 * std::sin(u * 3.14159);
            double x = side * (.74 + .3 * u * std::sin(u * 5 + age)), y = 2.17 + 1.2 * u, z = -1.18 - 3.8 * u;
            int col = u < .38 ? 0x596473 : u < .68 ? 0x687481 : 0x84909a;
            r *= 1 - u * u;
            CoursePoint top{x, y + r, z}, left{x - r, y + .04, z}, right{x + r * .8, y, z},
                base{x, y - r * .65, z};
            CoursePoint upperLeft{x - r * .68, y + r * .7, z}, upperRight{x + r * .64, y + r * .8, z};
            CoursePoint lowerLeft{x - r * .68, y - r * .6, z}, lowerRight{x + r * .68, y - r * .55, z};
            tri(top, upperLeft, upperRight, col);
            tri(upperLeft, left, right, col);
            tri(upperLeft, right, upperRight, col);
            tri(left, lowerLeft, right, col - 0x060605);
            tri(lowerLeft, lowerRight, right, col - 0x060605);
            tri(lowerLeft, base, lowerRight, col - 0x060605);
        }
    }
}
} // namespace neon
