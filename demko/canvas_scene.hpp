#pragma once
#include "race.hpp"
#include "circuit.hpp"
#include "bridge.hpp"

namespace neon {
// Canvas command stream: a positive vertex count draws a polygon; other commands use Op.
class CanvasScene {
    using Point = std::array<double, 2>;
    enum Op { Ellipse = -1, Rect = -2, ClipBelow = -3, Restore = -4, Opacity = -5 };
    double width, focal, horizon, camZ, camX, heading, turbineAngle, cameraLift;
    std::vector<float> &out;

    Point project(double x, double y, double z) const {
        double d = std::max(.4, z - camZ);
        return {width * .5 + focal * (x + road(z) - camX - d * heading) / d,
                horizon - focal * (y - 4.15 - cameraLift) / d};
    }
    void emit(std::initializer_list<double> values) {
        out.insert(out.end(), values.begin(), values.end());
    }
    void polygon(int rgb, std::initializer_list<Point> points) {
        emit({double(points.size()), double(rgb), 0});
        for (auto p : points)
            emit({p[0], p[1]});
    }
    void structures(bool mirror) {
        double sign = mirror ? -1 : 1;
        int far = int(std::floor((camZ + (mirror ? 174 : 336)) / 12));
        for (int k = far; k * 12 > camZ + 1; --k) {
            double z = k * 12;
            double d = z - camZ;
            emit({Opacity, 1 - ramp((d - (mirror ? 112 : 236)) / (mirror ? 62 : 100))});
            for (int side : {-1, 1}) {
                double x = side * (28 + std::abs(k % 4)),
                       top = sign * (8 + std::abs(std::sin(((k % 96 + 96) % 96) * 21 + side)) * 15);
                polygon(mirror ? 0x252c40 : 0x272840,
                        {project(x, 0, z), project(x, top, z), project(x + side * 5, top, z),
                         project(x + side * 5, 0, z)});
                if (!mirror && d < 165) {
                    polygon(0xab8294, {project(x, top * .7, z), project(x + side * 4, top * .7, z),
                                       project(x + side * 4, top * .68, z), project(x, top * .68, z)});
                    polygon(0x68c8d3,
                            {project(side * 19.3, 0, z), project(side * 19.55, 0, z),
                             project(side * 19.55, 0, z + 11), project(side * 19.3, 0, z + 11)});
                }
            }
            if (d >= 174)
                continue;
            emit({Opacity, 1 - ramp((d - 112) / 62)});
            for (int offset : {6, 0}) {
                auto face = [&](CoursePoint a, CoursePoint b, CoursePoint c, CoursePoint d, int rgb) {
                    auto q = [&](CoursePoint p) { return project(p.x, sign * p.y, p.z); };
                    polygon(mirror ? 0x343746 : rgb, {q(a), q(b), q(c), q(d)});
                };
                courseSpan(z + offset, face);
                if (!mirror)
                    lockSpray(z + offset, turbineAngle / .85, face);
            }
            if (!mirror)
                for (int lane = -2; lane <= 2; lane++) {
                    double x = lane * 7;
                    if (islandHalf(z + 2) > 0 && x < islandHalf(z + 2) + .2)
                        continue;
                    polygon(0x84a9af, {project(x - .12, .08, z), project(x + .12, .08, z),
                                       project(x + .12, .08, z + 4), project(x - .12, .08, z + 4)});
                }
            int section = circuitIndex(int(std::floor(z / 24)));
            if (!mirror) {
                int edge = district(section) == District::Shipyard ? 0xffb24f : 0x64ddda;
                for (int side : {-1, 1}) {
                    double x = side * 18.4;
                    polygon(edge, {project(x - .13, .09, z), project(x + .13, .09, z),
                                   project(x + .13, .09, z + 12), project(x - .13, .09, z + 12)});
                }
            }
            if (!mirror && k % 2 == 1 && (section == 0 || section == 7 || section == 16)) {
                double gate = z + 3, top = sign * (section ? 12 : 9);
                auto beam = [&](double x, double y, double w, double h, int rgb) {
                    polygon(rgb,
                            {project(x, sign * y, gate), project(x + w, sign * y, gate),
                             project(x + w, sign * (y + h), gate), project(x, sign * (y + h), gate)});
                };
                for (int side : {-1, 1})
                    beam(side * 19.4 - 1, 0, 2, section ? 15 : 9, 0x42516b);
                beam(-20, std::abs(top), 40, 1.2, 0x47596e);
                if (section) {
                    beam(-20, 15, 40, .65, 0x47596e);
                    for (int j = 0; j < 8; j++) {
                        double x = -19 + j * 4.7;
                        polygon(0x50657b,
                                {project(x, top, gate), project(x + .5, top, gate),
                                 project(x + 4.9, sign * 15, gate), project(x + 4.4, sign * 15, gate)});
                    }
                    beam(-19, 12, 38, .21, 0x64ddda);
                } else
                    for (int j = 0; j < 24; j++)
                        beam(-12 + j, 9, 1, .6, j % 2 ? 0x243044 : 0xdce7d7);
            }
            if (!mirror && k % 2 == 1 && section == 7) {
                double zz = z + 1;
                auto blade = [&](double a, double r) {
                    return project(-20.6 + r * std::cos(a), 11.7 + r * std::sin(a), zz);
                };
                for (int i = 0; i < 6; i++) {
                    double a = i * tau / 6 + turbineAngle;
                    polygon(0xe69d56, {blade(a, .52), blade(a + .34, .52), blade(a + .72, 3.9),
                                       blade(a + .43, 4)});
                }
            }
            if (k % 8 == 1 && district(section) == District::Shipyard) {
                int side = section % 8 == 0 ? 1 : -1;
                polygon(0x56677e, {project(side * 22, 0, z), project(side * 24, 0, z),
                                   project(side * 24, sign * 21, z), project(side * 22, sign * 21, z)});
                polygon(0xf4a456,
                        {project(side * 22, sign * 20, z), project(side * 6, sign * 15, z),
                         project(side * 6, sign * 14.5, z), project(side * 22, sign * 19, z)});
            }
            if (k % 2 == 0 && section % 2 && district(section) == District::Quay) {
                emit({12, double(mirror ? 0x645265 : 0xe7aa87),
                      std::max(1., focal * (mirror ? .12 : .17) / (z - camZ))});
                for (int i = 0; i < 12; i++) {
                    auto p = project(22 * std::cos(i * tau / 12),
                                     sign * (4 + 7 * std::sin(i * tau / 12)), z);
                    emit({p[0], p[1]});
                }
            }
        }
        emit({Opacity, 1});
    }
    void actor(const Object &o) {
        auto [x, z, kind, age] = o;
        if (z <= camZ + 1)
            return;
        double deck = bridgeHeight(x, z);
        auto [cx, cy] = project(x, 1.85 + deck, z);
        double r = focal / (z - camZ);
        if (kind == 12) {
            for (int j = 0; j < 5; j++)
                for (int side : {-1, 1}) {
                    double ox = x + side * (1.3 + j * .14), zz = z - 4 - j * 2.6;
                    polygon(0x65ddd0, {project(ox, deck + .32, zz + 1.4),
                                       project(ox + side * .22, deck + .32, zz + 1.4),
                                       project(ox + side * .48, deck + .32, zz),
                                       project(ox + side * .17, deck + .32, zz)});
                }
        } else if (kind == 13) {
            for (int side : {-1, 1}) {
                double xx = cx + side * 2.25 * r;
                emit({Rect, 0xffc870, xx, cy - r, r * .17, r});
                emit({Rect, 0xffc870, xx - (side > 0 ? .45 * r : 0), cy - r, r * .6, r * .16});
            }
        } else if (kind == 14) {
            emit({Ellipse, 0xffdc93, std::max(1., age * r * .24), cx, cy, (2.1 + (1 - age) * 1.5) * r,
                  (1.6 + (1 - age)) * r, 0});
        } else if (kind >= 6) {
            constexpr int colors[] = {0x34e4d0, 0xf96198, 0xf6c547, 0x7d91ff, 0xd372f8, 0x88e26b};
            int color = colors[int(kind) - 6];
            auto p = [&](double dx, double dy, double dz) {
                return project(x + dx, deck + 1.85 + dy + dx * age, z + dz);
            };
            for (int s : {-1, 1}) {
                polygon(0xc4ddd9, {p(0, .12, 2.4), p(s * .58, .32, .1), p(0, .38, -1.3)});
                polygon(color, {p(s * .58, .32, .1), p(s * 1.75, 0, -1.2), p(s * .7, .1, -1.4),
                                p(0, .15, -1.3)});
                polygon(color, {p(s * .6, .08, -1.3), p(s * .86, .08, -1.3), p(s * .72, .06, -3.5)});
            }
        } else if (kind == 0) {
            for (int j = 0; j < 3; j++)
                for (int s : {-1, 1}) {
                    double zz = z - 2 + j * 1.9;
                    polygon(0x50f6b7,
                            {project(x, deck + .14, zz + 1.8), project(x + s * 2.9, deck + .14, zz),
                             project(x + s * 2.9, deck + .14, zz - .65), project(x, deck + .14, zz + 1.1)});
                }
        } else if (kind == 1) {
            polygon(0xff664e, {{cx, cy - r}, {cx + r, cy}, {cx, cy + r}, {cx - r, cy}});
        } else if (kind == 5) {
            emit({Rect, 0xffc36c, cx - r, cy - r, r * (1 + age), r});
        } else {
            emit({Rect, 0xffc875, cx, cy, std::max(2., r * .19), std::max(3., r)});
        }
    }

  public:
    CanvasScene(const Race &race, int w, int h, double pan, std::vector<float> &commands)
        : width(w), focal(std::min(w, h) * .76), horizon(h * .43),
          camZ(race.distance - race.laps * lapLength - 9.2), camX(race.x * .87 + road(camZ) + pan),
          heading(slope(camZ) - pan / 48), turbineAngle(race.elapsed * .85),
          cameraLift(bridgeHeight(race.x, race.distance)), out(commands) {
        out.clear();
        double span = std::min(w, h), sunX = w * .5 + span * .256 - heading * focal,
               skyY = horizon - span * .17, waterY = horizon + span * .17;
        emit({Ellipse, 0xffdc9f, 0, sunX, skyY, span * .065, span * .065, 0});
        emit({Ellipse, 0xffcd96, 2, sunX, skyY, span * .13, span * .018, -.2});
        // A distant shore softens the meeting of the skyline and its reflection.
        for (int i = 0; i < 24; i++) {
            auto ridge = [&](int j) {
                return horizon - span * (.023 + .011 * std::sin(j * .9 + heading * 8) +
                                         .006 * std::cos(j * 1.9 + heading * 19));
            };
            double a = width * i / 24, b = width * (i + 1) / 24;
            polygon(0x705469, {{a, horizon}, {a, ridge(i)}, {b, ridge(i + 1)}, {b, horizon}});
        }
        emit({ClipBelow, horizon});
        emit({Ellipse, 0x544958, 0, sunX, waterY, span * .063, span * .061, 0});
        emit({Ellipse, 0x74616a, 2, sunX, waterY, span * .128, span * .014, .2});
        structures(true);
        emit({Restore});
        structures(false);
        auto visible = race.visible();
        std::stable_sort(visible.begin(), visible.end(), [](auto &a, auto &b) { return a[1] > b[1]; });
        for (auto &o : visible)
            actor(o);
        auto p = [&](double x, double y, double z) {
            return project(race.x + x, cameraLift + 1.85 + y + x * race.lean, camZ + 9.2 + z);
        };
        for (int s : {-1, 1}) {
            polygon(0xd4d9dd, {p(0, .3, 2.35), p(s * .55, .1, .54), p(0, .4, -1)});
            polygon(0xf19b55, {p(s * .55, .1, .54), p(s * 1.55, -.09, -.91), p(s * .56, .08, -1.12)});
            polygon(0xffeba3, {p(s * .9, .09, -1.24), p(s * 1.55, -.06, -.92), p(s * 1.45, .04, -.78),
                               p(s * .90, .16, -1.0)});
            polygon(0x80dbe5, {p(0, .68, .03), p(s * .36, .39, -.48), p(s * .25, .46, .76)});
            polygon(0xc2fff3, {p(s * .74 - .20, .18, -1.35), p(s * .74 + .20, .18, -1.35),
                               p(s * .74 + .20, .01, -1.35), p(s * .74 - .20, .01, -1.35)});
            polygon(0x59e6ff, {p(s * .49, 0, -1.16), p(s * .66, 0, -1.16),
                               p(s * .57, 0, -1.7 - race.thrust * .8)});
        }
    }
};
} // namespace neon
