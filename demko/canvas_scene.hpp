#pragma once
#include "race.hpp"

namespace neon {
// Canvas command stream: a positive vertex count draws a polygon; other commands use Op.
class CanvasScene {
    using Point = std::array<double, 2>;
    enum Op { Ellipse = -1, Rect = -2, ClipBelow = -3, Restore = -4 };
    double width, focal, horizon, camZ, camX, heading;
    std::vector<float> &out;

    Point project(double x, double y, double z) const {
        double d = std::max(.4, z - camZ);
        return {width * .5 + focal * (x + road(z) - camX - d * heading) / d,
                horizon - focal * (y - 4.15) / d};
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
        int far = int(std::floor((camZ + (mirror ? 144 : 156)) / 12));
        for (int k = far; k * 12 > camZ + 1; --k) {
            double z = k * 12;
            for (int side : {-1, 1}) {
                double x = side * (28 + std::abs(k % 4)),
                       top = sign * (8 + std::abs(std::sin(k * 21 + side)) * 15);
                polygon(mirror ? 0x252c40 : 0x272840,
                        {project(x, 0, z), project(x, top, z), project(x + side * 5, top, z),
                         project(x + side * 5, 0, z)});
                if (!mirror) {
                    polygon(0xab8294, {project(x, top * .7, z), project(x + side * 4, top * .7, z),
                                       project(x + side * 4, top * .68, z), project(x, top * .68, z)});
                    polygon(0x68c8d3,
                            {project(side * 19.3, 0, z), project(side * 19.55, 0, z),
                             project(side * 19.55, 0, z + 11), project(side * 19.3, 0, z + 11)});
                }
            }
            if (!mirror)
                for (int lane = -2; lane <= 2; lane++) {
                    double x = lane * 7;
                    polygon(0x84a9af, {project(x - .12, .08, z), project(x + .12, .08, z),
                                       project(x + .12, .08, z + 4), project(x - .12, .08, z + 4)});
                }
            if (k % 2 == 0) {
                emit({12, double(mirror ? 0x645265 : 0xe7aa87),
                      std::max(1., focal * (mirror ? .12 : .17) / (z - camZ))});
                for (int i = 0; i < 12; i++) {
                    auto p = project(22 * std::cos(i * tau / 12),
                                     sign * (4 + 7 * std::sin(i * tau / 12)), z);
                    emit({p[0], p[1]});
                }
            }
        }
    }
    void actor(const Object &o) {
        auto [x, z, kind, age] = o;
        if (z <= camZ + 1)
            return;
        auto [cx, cy] = project(x, 1.85, z);
        double r = focal / (z - camZ);
        if (kind >= 6) {
            constexpr int colors[] = {0x34e4d0, 0xf96198, 0xf6c547, 0x7d91ff, 0xd372f8, 0x88e26b};
            int color = colors[int(kind) - 6];
            auto p = [&](double dx, double dy, double dz) {
                return project(x + dx, 1.85 + dy + dx * age, z + dz);
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
                    polygon(0x50f6b7, {project(x, .14, zz + 1.8), project(x + s * 2.9, .14, zz),
                                       project(x + s * 2.9, .14, zz - .65), project(x, .14, zz + 1.1)});
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
          heading(slope(camZ) - pan / 48), out(commands) {
        out.clear();
        double span = std::min(w, h), sunX = w * .5 + span * .256 - heading * focal,
               skyY = horizon - span * .17, waterY = horizon + span * .17;
        emit({Ellipse, 0xffdc9f, 0, sunX, skyY, span * .065, span * .065, 0});
        emit({Ellipse, 0xffcd96, 2, sunX, skyY, span * .13, span * .018, -.2});
        emit({ClipBelow, horizon});
        emit({Ellipse, 0x87726d, 0, sunX, waterY, span * .063, span * .061, 0});
        emit({Ellipse, 0xb39370, 2, sunX, waterY, span * .128, span * .014, .2});
        structures(true);
        emit({Restore});
        structures(false);
        auto visible = race.visible();
        std::stable_sort(visible.begin(), visible.end(), [](auto &a, auto &b) { return a[1] > b[1]; });
        for (auto &o : visible)
            actor(o);
        auto p = [&](double x, double y, double z) {
            return project(race.x + x, 1.85 + y + x * race.lean, camZ + 9.2 + z);
        };
        for (int s : {-1, 1}) {
            polygon(0xd4d9dd, {p(0, .3, 2.35), p(s * .55, .1, .54), p(0, .4, -1)});
            polygon(0xf19b55, {p(s * .55, .1, .54), p(s * 1.55, -.09, -.91), p(s * .56, .08, -1.12)});
            polygon(0x59e6ff, {p(s * .49, 0, -1.16), p(s * .66, 0, -1.16),
                               p(s * .57, 0, -1.7 - race.thrust * .8)});
        }
    }
};
} // namespace neon
