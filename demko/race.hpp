#pragma once
#include <algorithm>
#include <array>
#include <cmath>
#include <vector>
#include "junction.hpp"

namespace neon {
inline double bound(double x, double a, double b) { return std::clamp(x, a, b); }
inline double road(double z) {
    double a = tau * z / lapLength;
    return 17 * sin(3 * a) + 10 * sin(2 * a + .8) + 4 * sin(6 * a - .6) + chicane(z);
}
inline double slope(double z) {
    double a = tau * z / lapLength;
    return tau / lapLength * (51 * cos(3 * a) + 20 * cos(2 * a + .8) + 24 * cos(6 * a - .6)) +
           (chicane(z + .1) - chicane(z - .1)) / .2;
}
inline double gap(double a, double b) {
    double d = a - b;
    return d - lapLength * floor(d / lapLength + .5);
}
struct Input {
    int steer = 0;
    bool boost = false, brake = false;
};
enum class Cue { Fire, Rocket, Break, Hit, Pad, Rail, Repair, Lap, Launch, Wreck };
enum ContactEffect { Sparks = 15, Smoke, FireTrail, Fragments, PlayerFragments };
constexpr double recoveryTime = 1.15;
struct Sector {
    double x, z, mineX;
    bool mine, used = false;
};
inline Sector sector(int i) {
    constexpr int lanes[] = {0, 10, 15, 5, -8, -14, -4, 9, 13, 0, -12, -6};
    double x = lanes[i % 12];
    double z = 56. + i * 96;
    if (islandHalf(z) > 0)
        x = routeSign(x) * std::max(std::abs(x), islandHalf(z) + 3.5);
    double mine = x + (x > 0 ? -7 : 7);
    return {x, z, mine, i % 3 != 0 && (islandHalf(z - 17) == 0 || std::abs(mine) > islandHalf(z - 17) + 2)};
}
struct Pilot {
    double x, z, speed, lean = 0, stun = 0, boost = 0, hitGlow = 0, kick = 0, recovery = 0;
    int hull = 3;
};
struct Shot {
    double x, z;
    bool rocket, spent = false;
    int target = -1;
};
struct Burst {
    double x, z, age = 0;
};
using Object = std::array<float, 4>;

struct Race {
    double distance = 0, elapsed = 0, x = 0, vx = 0, lean = 0, speed = 36, thrust = 0, energy = 100;
    double cooldown = 0, rocketCooldown = 0, immunity = 0, padBoost = 0, wallLock = 0, lapStart = 0,
           lastLap = 0;
    int laps = 0, shield = 3, rockets = 2, rank = 7, refills = 0, nextSector = 3;
    bool drafting = false, spent = false;
    double wakeCharge = 0, launchTime = 0, chargedLane = 0, steerMemory = 0;
    double scrape = 0, scrapeSide = 1, recovery = 0, contactLock = 0;
    int damagedSide = 1;
    int wakePilot = -1, forkSide = 0;
    std::array<Pilot, 6> rivals{};
    std::vector<Sector> sectors = {sector(0), sector(1), sector(2)};
    std::vector<Shot> shots;
    std::vector<Burst> bursts;
    std::vector<Cue> cues;
    Race() {
        constexpr double lanes[] = {0, 6, -12, 12, -3, 3};
        constexpr double grid[] = {9, 9, 19, 19, 53, 77};
        for (int i = 0; i < 6; i++)
            rivals[i] = {lanes[i], grid[i], 37. + i * .8};
    }
    int targetAhead() const {
        int id = -1;
        double best = 75;
        for (int i = 0; i < int(rivals.size()); ++i) {
            const auto &p = rivals[i];
            double dz = gap(p.z, distance), lateral = std::abs(p.x - x);
            if (p.recovery > 0)
                continue;
            if (islandHalf(distance) > 0 && islandHalf(p.z) > 0 && routeSign(x) != routeSign(p.x))
                continue;
            if (dz < 3 || dz > 64 || lateral > 2.8 + .12 * dz)
                continue;
            const double score = dz + 2 * lateral;
            if (score < best) {
                best = score;
                id = i;
            }
        }
        return id;
    }
    void shoot(bool rocket) {
        if (recovery > 0)
            return;
        if (rocket) {
            if (!rockets || rocketCooldown > 0)
                return;
            rockets--;
            rocketCooldown = .65;
        } else {
            if (cooldown > 0)
                return;
            cooldown = .20;
        }
        shots.push_back({x, distance + 2, rocket, false, rocket ? targetAhead() : -1});
        cues.push_back(rocket ? Cue::Rocket : Cue::Fire);
    }
    void impact(double strength = 1., int side = 1) {
        if (immunity > 0)
            return;
        damagedSide = side;
        immunity = 1.2;
        speed *= 1. - .24 * strength;
        if (--shield == 0) {
            recovery = recoveryTime;
            launchTime = padBoost = wakeCharge = 0;
            energy = std::max(25., energy * .5);
            speed = 20;
            immunity = 2;
            cues.push_back(Cue::Wreck);
        } else
            cues.push_back(Cue::Hit);
    }
    void scrapeRail(int inward, double dt) {
        const double normal = std::max(0., -inward * vx);
        speed *= std::exp(-(.33 + .026 * normal) * dt);
        scrape = .24;
        scrapeSide = -inward;
        if (wallLock <= 0 && normal > 2) {
            speed *= 1. - std::min(.16, normal * .006);
            vx = inward * normal * .26;
            if (normal > 17)
                impact(.32, -inward);
            cues.push_back(Cue::Rail);
            wallLock = .42;
        } else
            vx = inward * std::max(0., inward * vx);
    }
    void movePilots(double dt) {
        drafting = false;
        wakePilot = -1;
        double nearestWake = 28;
        for (int i = 0; i < 6; i++) {
            auto &p = rivals[i];
            double ahead = gap(p.z, distance), phase = tau * p.z / lapLength;
            double bend = slope(p.z + 28) - slope(p.z - 4);
            int index = std::max(0, int(ceil((p.z - 56) / 96)));
            auto pad = sector(index);
            double approach = pad.z - p.z;
            double line =
                bound(8 * sin(phase * 2 + i * 1.6) + 5 * sin(phase * 5 + i) + bend * 19, -15, 15);
            if (approach < 40 && (index + i) % 3)
                line += (pad.x - line) * (1 - approach / 40);
            if (ahead < 2 && ahead > -17 && fabs(p.x - x) < 3.5)
                line = bound(x + (p.x >= x ? 5 : -5), -16, 16);
            for (auto &other : rivals) {
                if (&other == &p)
                    continue;
                double lead = gap(other.z, p.z);
                if (lead > 0 && lead < 9 && fabs(other.x - p.x) < 2.5)
                    line += p.x >= other.x ? 3 : -3;
            }
            if (i == 0 && p.z < 66)
                line *= bound((p.z - 34) / 32, 0, 1);
            double island = islandHalf(p.z);
            if (island > 0)
                line = routeSign(p.x) * std::max(island + 3., routeSign(p.x) * line);
            double dx = bound((line - p.x) * 1.5, -10, 10);
            p.kick *= std::exp(-4 * dt);
            p.x = bound(p.x + (dx + p.kick) * dt, -16.4, 16.4);
            if (island > 0)
                p.x = routeSign(line) * std::max(island + 1.35, std::abs(p.x));
            p.lean = -dx * .035;
            p.hitGlow = std::max(0., p.hitGlow - dt);
            p.stun = std::max(0., p.stun - dt);
            double surge = pow(std::max(0., sin(phase * 4 + i * 1.9)), 6);
            double target = 46 + i * 1.1 + 8 * surge + (p.boost > 0 ? 12 : 0) - 8 * fabs(bend) +
                            bound((distance - p.z) * .19, -14, 16);
            target += 1.4 * bridgeHeight(p.x, p.z);
            p.boost = std::max(0., p.boost - dt);
            if (approach >= 0 && approach < p.speed * dt && fabs(p.x - pad.x) < 3)
                p.boost = 1.2;
            p.speed += ((p.stun > 0 ? target * .53 : target) - p.speed) * (1 - exp(-2 * dt));
            if (p.recovery > 0) {
                p.recovery = std::max(0., p.recovery - dt);
                p.speed = std::min(20., p.speed);
                if (p.recovery == 0)
                    p.hull = 3;
            }
            p.z += p.speed * dt;
            if ((islandHalf(distance) == 0 || routeSign(p.x) == routeSign(x)) && ahead > 2 &&
                ahead < nearestWake && fabs(p.x - x) < 3) {
                drafting = true;
                wakePilot = i;
                nearestWake = ahead;
            }
        }
    }
    void stepShots(double dt) {
        for (auto &shot : shots) {
            if (shot.target >= 0 && gap(rivals[shot.target].z, shot.z) > 0)
                shot.x += bound(rivals[shot.target].x - shot.x, -17 * dt, 17 * dt);
            double prev = shot.z;
            shot.z += dt * (shot.rocket ? 126 : 116);
            if (islandHalf(shot.z) > 0 && std::abs(shot.x) < islandHalf(shot.z)) {
                shot.spent = true;
                bursts.push_back({shot.x, shot.z});
                continue;
            }
            double best = shot.z + 2, hitX = 0;
            Pilot *pilot = nullptr;
            Sector *mine = nullptr;
            auto inPath = [&](double xx, double z) {
                return z >= prev - 1 && z <= shot.z + 1 && z < best &&
                       fabs(xx - shot.x) < (shot.rocket ? 4 : 1.55);
            };
            for (auto &p : rivals) {
                if (p.recovery > 0)
                    continue;
                double z = prev + gap(p.z, prev);
                if (inPath(p.x, z)) {
                    best = z;
                    hitX = p.x;
                    pilot = &p;
                }
            }
            for (auto &s : sectors)
                if (s.mine && inPath(s.mineX, s.z - 17)) {
                    best = s.z - 17;
                    hitX = s.mineX;
                    mine = &s;
                    pilot = nullptr;
                }
            if (pilot || mine) {
                if (pilot) {
                    pilot->stun = shot.rocket ? 2.4 : 1;
                    pilot->hitGlow = .75;
                    pilot->hull = std::max(0, pilot->hull - (shot.rocket ? 2 : 1));
                    if (!pilot->hull)
                        pilot->recovery = recoveryTime;
                } else
                    mine->mine = false;
                shot.spent = true;
                bursts.push_back({hitX, best});
                cues.push_back(Cue::Break);
            }
        }
        std::erase_if(shots, [&](auto &s) { return s.spent || s.z >= distance + 143; });
        for (auto &b : bursts)
            b.age += dt;
        std::erase_if(bursts, [](auto &b) { return b.age >= .45; });
    }
    void advance(double dt, Input in) {
        elapsed += dt;
        for (double *t : {&cooldown, &rocketCooldown, &immunity, &wallLock, &padBoost})
            *t = std::max(0., *t - dt);
        scrape = std::max(0., scrape - dt);
        contactLock = std::max(0., contactLock - dt);
        if (recovery > 0) {
            recovery = std::max(0., recovery - dt);
            in = {0, false, true};
            if (recovery == 0) {
                shield = 3;
                cues.push_back(Cue::Repair);
            }
        }
        movePilots(dt);
        double bend = slope(distance + 16) - slope(distance - 8);
        double target = in.steer * (in.brake ? 29 : 22) - bend * speed * (in.brake ? .28 : .75);
        vx += (target - vx) * (1 - exp(-(in.brake ? 10. : in.steer ? 6.2 : 3.9) * dt));
        x = bound(x + vx * dt, -18, 18);
        if (fabs(x) >= 18 && vx * x > 0)
            scrapeRail(-routeSign(x), dt);
        lean += (-vx * .027 - bend * .44 - lean) * (1 - exp(-8 * dt));
        launchTime = std::max(0., launchTime - dt);
        steerMemory = in.steer ? 0.5 : std::max(0., steerMemory - dt);
        if (wakeCharge >= 1 && in.boost && steerMemory > 0 && std::abs(x - chargedLane) > 1.25 &&
            !in.brake) {
            launchTime = 1.2;
            wakeCharge = 0;
            immunity = std::max(immunity, .45);
            cues.push_back(Cue::Launch);
        }
        if (drafting && !in.boost && launchTime == 0 && wakeCharge < 1) {
            wakeCharge = std::min(1., wakeCharge + dt / 1.05);
            if (wakeCharge == 1)
                chargedLane = x;
        } else if (!drafting && wakeCharge < 1)
            wakeCharge = std::max(0., wakeCharge - dt * .20);
        bool boost = in.boost && !in.brake && energy > 0 && !spent;
        if (boost && launchTime == 0) {
            energy = std::max(0., energy - 22 * dt);
            if (energy == 0)
                spent = true;
        } else {
            energy = std::min(100., energy + (drafting ? 24 : 10) * dt);
            if (!in.boost || energy > 30)
                spent = false;
        }
        thrust += ((boost || padBoost > 0 || launchTime > 0) - thrust) * (1 - exp(-6 * dt));
        speed += ((in.brake ? 29.
                            : 39 + (forkSide < 0 ? 1.4 * bridgeHeight(x, distance) : 0.) + 24 * thrust +
                                  (drafting ? 6 : 0) + (launchTime > 0 ? 20 : 0)) -
                  speed) *
                 (1 - exp(-2.4 * dt));
        double before = distance, travel = speed * dt / bound(1 - bend * x / 24, .87, 1.13);
        if (forkSide > 0)
            energy = std::min(100., energy + 18 * dt);
        distance += travel;
        const double island = islandHalf(distance);
        if (island > 0) {
            if (!forkSide)
                forkSide = routeSign(x);
            double clearance = forkSide * x - island;
            if (clearance < 1.3) {
                x = forkSide * (island + 1.3);
                scrapeRail(forkSide, dt);
            }
        } else
            forkSide = 0;
        while (nextSector * 96 < distance + 210)
            sectors.push_back(sector(nextSector++));
        std::erase_if(sectors, [&](auto &s) { return s.z <= distance - 30; });
        for (auto &s : sectors) {
            if (s.mine && before < s.z - 17 && distance >= s.z - 17) {
                s.mine = false;
                if (fabs(s.mineX - x) < 1.55)
                    impact(1., routeSign(s.mineX - x));
            }
            if (!s.used && before < s.z && distance >= s.z) {
                s.used = true;
                if (recovery == 0 && fabs(s.x - x) < 2.9) {
                    energy = std::min(100., energy + 24);
                    padBoost = 1.05;
                    if (++refills % 2 == 0)
                        rockets = std::min(3, rockets + 1);
                    shield = std::min(3, shield + 1);
                    cues.push_back(Cue::Pad);
                }
            }
        }
        for (auto &p : rivals)
            if (fabs(gap(p.z, distance)) < 1.8 && fabs(x - p.x) < 2 && contactLock == 0 && recovery == 0 &&
                p.recovery == 0) {
                int side = routeSign(x - p.x);
                double closing = std::abs(speed - p.speed), lateral = std::max(0., -side * (vx - p.kick));
                double shove = bound(3. + .65 * lateral + .23 * closing, 3., 17.);
                vx += side * shove;
                p.kick -= side * shove;
                double exchange = (p.speed - speed) * .30;
                speed += exchange;
                p.speed -= exchange;
                if (closing + .8 * lateral > 8)
                    impact(bound((closing + lateral) / 26, .32, 1.), -side);
                else {
                    scrape = .20;
                    scrapeSide = -side;
                    cues.push_back(Cue::Rail);
                }
                contactLock = .42;
            }
        stepShots(dt);
        rank = 1;
        for (auto &p : rivals)
            if (p.z > distance)
                rank++;
        if (int(floor(distance / lapLength)) > laps) {
            laps++;
            double at = elapsed - (distance - laps * lapLength) * dt / travel;
            lastLap = at - lapStart;
            lapStart = at;
            cues.push_back(Cue::Lap);
        }
    }
    std::vector<Object> visible() const {
        std::vector<Object> out;
        double offset = laps * lapLength;
        auto add = [&](double xx, double z, int k, double age = 0) {
            out.push_back({float(xx), float(z - offset), float(k), float(age)});
        };
        if (recovery > 0)
            add(x, distance, PlayerFragments, 1 - recovery / recoveryTime);
        else if (shield < 3)
            add(x, distance, shield == 1 ? FireTrail : Smoke, damagedSide);
        if (scrape > 0)
            add(x + scrapeSide * 1.35, distance, Sparks, scrapeSide * scrape / .24);
        for (int i = 0; i < 6; i++) {
            const auto &p = rivals[i];
            double dz = gap(p.z, distance);
            if (dz <= -10 || dz >= 158)
                continue;
            if (p.recovery > 0)
                add(p.x, distance + dz, Fragments, 1 - p.recovery / recoveryTime);
            else {
                add(p.x, distance + dz, 6 + i, p.lean);
                if (p.hull < 3 && dz < 85)
                    add(p.x, distance + dz, p.hull == 1 ? FireTrail : Smoke, i * .13);
            }
        }
        const int locked = rockets > 0 ? targetAhead() : -1;
        for (int i = 0; i < int(rivals.size()); i++) {
            const auto &p = rivals[i];
            double dz = gap(p.z, distance);
            if (p.recovery > 0 || dz < 0 || dz > 100)
                continue;
            if (p.hitGlow > 0)
                add(p.x, distance + dz, 14, p.hitGlow / .75);
            else if (i == locked)
                add(p.x, distance + dz, 13);
            if (i == wakePilot)
                add(p.x, distance + dz, 12, wakeCharge);
        }
        for (auto &s : sectors) {
            if (!s.used && s.z < distance + 153)
                add(s.x, s.z, 0);
            if (s.mine && s.z - 17 < distance + 145)
                add(s.mineX, s.z - 17, 1);
        }
        for (auto &s : shots)
            add(s.x, s.z, s.rocket ? 3 : 2);
        for (auto &b : bursts)
            add(b.x, b.z, 5, b.age);
        return out;
    }
};
} // namespace neon
