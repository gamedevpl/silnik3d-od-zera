#pragma once
#include "race.hpp"

namespace neon {
// xyz in the renderer's current lap. Positive power is ion blue, negative is fire.
using RaceLights = std::array<std::array<float, 4>, 16>;
inline RaceLights raceLights(const Race &race) {
    RaceLights lights{};
    size_t count = 0;
    const double local = race.distance - race.laps * lapLength;
    auto add = [&](double x, double y, double z, double power) {
        const double dz = gap(z, race.distance);
        power *= bound((dz + 18) / 8, 0, 1) * bound((112 - dz) / 20, 0, 1);
        if (count < lights.size() && std::abs(power) > .005)
            lights[count++] = {float(x), float(y), float(local + dz), float(power)};
    };
    auto drive = [&](double lane, double z, double bank, double yaw, double throttle, bool twin) {
        const double aft = -2.24 - .50 * throttle;
        const double grade = (Race::deckAt(lane, z + 1) - Race::deckAt(lane, z - 1)) * .5;
        const double x = road(z) + lane + aft * (slope(z) + yaw);
        const double y = Race::deckAt(lane, z) + 1.912 + aft * grade;
        const double power = .93 + 1.37 * throttle;
        if (twin) {
            for (int side : {-1, 1})
                add(x + side * 1.06 * std::cos(bank), y + side * 1.06 * std::sin(bank), z + aft, power);
        } else {
            add(x, y, z + aft, 1.60 * power);
        }
    };
    if (race.recovery <= 0)
        drive(race.x, race.distance, race.lean, race.noseSteer(), race.thrust, true);
    for (const auto &p : race.rivals)
        if (p.recovery <= 0)
            drive(p.x, p.z, p.lean, 0, bound((p.speed - 54) / 30, 0, 1), false);

    // Only incandescent gas emits. Weight its position and power by remaining heat.
    auto glow = [&](const Wake &wake, double strength) {
        struct Center { double x=0, y=0, dz=0, heat=0; };
        Center plasma, fire;
        for (const auto &g : wake.gas) {
            if (!g.hot && !g.ion) continue;
            const double weight = 1 - ramp((g.age / g.life - .15) / .37);
            const double offset = gap(g.z, race.distance);
            if (weight <= 0 || offset < -18 || offset > 112) continue;
            auto &c = g.hot ? fire : plasma;
            c.x += g.x * weight; c.y += g.y * weight; c.dz += offset * weight; c.heat += weight;
        }
        const bool burning = fire.heat > .01;
        const auto &c = burning ? fire : plasma;
        if (c.heat > .001)
            add(c.x / c.heat, c.y / c.heat, race.distance + c.dz / c.heat,
                (burning ? -strength : 1.25) * c.heat / (c.heat + 2));
    };
    for (const auto &w : race.wakes) glow(w, 4.4);
    glow(race.blastGas, 7.);
    return lights;
}
} // namespace neon
