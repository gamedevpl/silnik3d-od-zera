#include "route_check.hpp"
#include <cmath>
#include <cstdio>

int main() {
    Shift shift;
    auto step = [](char) {};
    runRoute(shift, false, step);
    std::printf("Trip 1: %u | deck %.2f\n", shift.trips, shift.lift.height);
    if (shift.trips != 1 || !shift.lift.atTop()) return 1;
    shift.restart();
    for (int i = 0; i < 50; ++i) shift.advance(Clock::tick, false, false, false, false);
    std::printf("Reset: shelf %s | light %s\n", shift.workshop.cell.inReach({2.60,0,-1.8}) ? "yes" : "no",
                shift.workshop.powered ? "ON" : "OFF");
    std::printf("Empty deck after 1 s: %.2f\n", shift.lift.height);
    bool clean = !shift.workshop.powered && !shift.workshop.cell.carried &&
                 shift.lift.height == 0 && shift.trips == 1;
    runRoute(shift, true, step);
    std::printf("Trip 2: %u | deck %.2f\n", shift.trips, shift.lift.height);
    if (!clean || shift.trips != 2 || !shift.lift.atTop()) return 1;
    shift.restart();
    for (int i=0; i<170; ++i) shift.advance(Clock::tick,true,false,false,false);
    if (shift.workshop.powered || shift.lift.height != 0 || shift.trips != 2) return 1;
    return 0;
}
