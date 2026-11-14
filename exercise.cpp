#include "route_check.hpp"
#include <cmath>
#include <cstdio>

bool samePosition(Vec3 a, Vec3 b) {
    return a.x == b.x && a.y == b.y && a.z == b.z;
}

int main() {
    Shift shift;
    auto step = [](char) {};
    runRoute(shift, false, step);
    std::printf("Trip 1: %u | deck %.2f\n", shift.trips, shift.lift.height);
    if (shift.trips != 1 || !shift.lift.atTop()) return 1;
    shift.restart();
    Workshop fresh;
    bool onShelf = samePosition(shift.workshop.cell.resting, fresh.cell.resting)
                && !shift.workshop.cell.carried;
    bool atStart = samePosition(*shift.workshop.objects.get(shift.workshop.robot),
                                *fresh.objects.get(fresh.robot));
    for (int i = 0; i < 50; ++i) shift.advance(Clock::tick, false, false, false, false);
    std::printf("Reset: shelf %s | light %s\n", onShelf ? "yes" : "no",
                shift.workshop.powered ? "ON" : "OFF");
    std::printf("Empty deck after 1 s: %.2f\n", shift.lift.height);
    bool clean = onShelf && atStart && !shift.workshop.powered &&
                 shift.lift.height == 0 && shift.trips == 1;
    runRoute(shift, true, step);
    std::printf("Trip 2: %u | deck %.2f\n", shift.trips, shift.lift.height);
    if (!clean || shift.trips != 2 || !shift.lift.atTop()) return 1;
    shift.restart();
    for (int i=0; i<170; ++i) shift.advance(Clock::tick,true,false,false,false);
    if (shift.workshop.powered || shift.lift.height != 0 || shift.trips != 2) return 1;
    return 0;
}
