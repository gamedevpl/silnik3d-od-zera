#pragma once
#include "lift.hpp"
#include "workshop.hpp"

struct Shift {
    Workshop workshop;
    Lift lift;
    unsigned trips = 0;
    bool departureRequested = false;

    void restart() {
        workshop = Workshop{};
        lift = Lift{};
        departureRequested = false;
    }

    void advance(double elapsed, bool w, bool a, bool s, bool d, bool use = false) {
        auto& p = *workshop.objects.get(workshop.robot);
        bool driving = !departureRequested;
        workshop.advance(elapsed, driving && w, driving && a,
                         driving && s, driving && d, driving && use);
        bool aboard = lift.onDeck(p);
        if (workshop.powered && aboard) departureRequested = true;
        bool arrived = lift.atTop();
        lift.advance(std::min(elapsed, .25), departureRequested);
        if (aboard) p.y = lift.height;
        if (!arrived && lift.atTop() && aboard) ++trips;
    }
};
