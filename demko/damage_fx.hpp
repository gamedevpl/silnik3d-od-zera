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
        // The two thruster housings separate first; their hot cores cool as they tumble.
        for (int side : {-1, 1}) {
            double spin = side * (.22 + 3.7 * age), cs = std::cos(spin), sn = std::sin(spin);
            double size = 1 - .65 * age, ox = side * (.72 + 1.8 * age),
                   oy = std::max(.28, 1.72 + 2.8 * age - 5 * age * age);
            auto ring = [&](int j, double radius, double dz) {
                double a = j * tau / 12, xx = radius * std::cos(a) * size, yy = radius * std::sin(a) * size;
                return CoursePoint{ox + xx * cs - dz * sn, oy + yy, -.68 - age + xx * sn + dz * cs};
            };
            for (int j = 0; j < 12; j++) {
                auto a = ring(j, .30, -.43), b = ring(j + 1, .30, -.43), c = ring(j + 1, .25, .41),
                     d = ring(j, .25, .41);
                int paint = j < 6 ? 0x8098a6 : 0x47596b;
                tri(a, b, c, paint);
                tri(a, c, d, paint);
                auto inner = ring(j, .18, -.435), next = ring(j + 1, .18, -.435);
                tri(a, inner, b, 0xb7cad2);
                tri(inner, next, b, 0x788b96);
                tri(inner, ring(0, 0, -.36), next, age < .48 ? 0xffcc86 : 0x544652);
            }
        }
        for (int i = 0; i < 16; i++) {
            double a = i * 2.39996, t = age, spread = .25 + (1.5 + (i % 4) * .38) * t;
            double x = std::cos(a) * spread, y = std::max(.14, 1.6 + t * (2 + i % 5) - 6 * t * t),
                   z = std::sin(a) * spread - t;
            double r = (1 - t) * (.26 + .09 * (i % 4)) + .025, angle = a + t * (3 + i % 4);
            auto v = [&](double u, double h, double d) {
                return CoursePoint{x + r * (u * std::cos(angle) - h * std::sin(angle)),
                                   y + r * (u * std::sin(angle) + h * std::cos(angle)), z + r * d};
            };
            // Broken skins have thickness, a torn edge, paint and exposed metal.
            auto nose = v(.7, .27, 1.15), left = v(-1, -.14, -.74), right = v(.76, -.24, -.56),
                 lip = v(-.22, .22, -.9);
            tri(nose, left, lip, i % 3 == 0 ? 0xe88f52 : i % 5 == 1 ? 0x80cdda : 0x849dae);
            tri(nose, lip, right, i % 3 == 0 ? 0xffc27a : 0x546574);
            tri(left, right, lip, 0x354353);
            tri(nose, right, left, 0x404c59);
        }
    }
}
struct Puff {
    CoursePoint center;
    double w, h, angle, opacity;
    int tile;
};

template <class Emit> void damagePuffs(int kind, double time, double age, double speed, Emit emit) {
    auto puff = [&](double x, double y, double z, double w, double h, double angle, double alpha, int tile) {
        emit(Puff{{x, y, z}, w, h, angle, std::clamp(alpha, 0., 1.), tile});
    };
    if (kind == Fragments || kind == PlayerFragments || kind == 5) {
        double u = std::clamp(kind == 5 ? age / .45 : age, 0., 1.);
        double radius = .28 + 2.3 * u;
        for (int i = 0; i < 12; i++) {
            double a = i * 2.39996, r = radius * (.45 + .16 * (i % 4)), size = .25 + .66 * u;
            puff(std::cos(a) * r, 1.7 + std::sin(a) * r * .6 + u * .9, std::sin(a * 1.6) * r, size,
                 size * (.9 + .1 * (i % 3)), a + .45 * u, (1 - u) * .85, i % 3 && u > .25 ? 4 : 5);
        }
        puff(0, 1.8, -.08, 1. + 2.8 * u, 1. + 2.8 * u, 0, std::max(0., 1 - 3 * u), 6);
        for (int i = 0; i < 18; i++) {
            double a = i * 2.39996, r = (1.8 + .4 * (i % 4)) * u;
            puff(r * std::cos(a), 1.7 + r * std::sin(a) - u * u, r * std::cos(a * 1.7), .06, .13 + .12 * u, a,
                 1 - u, 6);
        }
    } else if (kind == FireTrail || kind == Smoke) {
        double side = age < 0 ? -1 : 1;
        // Age remains continuous under acceleration. Airflow advects older puffs farther aft.
        const double flow = std::clamp(speed / 84., 0., 1.25);
        for (int i = 0; i < 14; i++) {
            double u = std::fmod(time * 1.02 + std::abs(age) + i / 14., 1.);
            double x = side * (.83 + .48 * u + .20 * u * std::sin(5 * u + std::abs(age))), y = 1.97 + (2.15 - 1.40 * flow) * u,
                   z = -1.3 - (.85 + 7.4 * flow) * u;
            double r = .14 + (.76 - .27 * flow) * u;
            puff(x, y, z, r, r * (1 + .22 * u), 1.7 * i + .7 * u, .64 * (1 - u * u) * std::min(1., 8 * u), 4);
        }
        if (kind == FireTrail)
            for (int i = 0; i < 9; i++) {
                double u = std::fmod(time * 2.6 + i / 9., 1.), r = .12 + .28 * std::sin(3.14 * u);
                puff(side * (.73 + .11 * std::sin(6 * u)), 2.0 + (1.08 - .68 * flow) * u, -1.27 - (.57 + 3.45 * flow) * u, r, .18 + (.60 - .22 * flow) * u,
                     u - .5, .95 * (1 - u * u), 5);
            }
    } else if (kind == Sparks) {
        double side = age < 0 ? -1 : 1;
        for (int i = 0; i < 10; i++) {
            double u = std::fmod(time * 2.8 + i * .3819, 1.);
            puff(-side * u * (.3 + .13 * (i % 4)), 1.12 + u * (1.1 + .25 * (i % 3)) - 1.6 * u * u,
                 -1 - u * 4.5, .10, .18, side * u, std::abs(age) * (1 - u), 6);
        }
    }
}
} // namespace neon
