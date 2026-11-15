// Browser ABI. State is copied after a simulation step so JS never owns race rules.
#include "race.hpp"
#include <algorithm>

namespace {
neon::Race race;
constexpr size_t stateFields = 14;
std::array<double, stateFields + 2 * std::tuple_size_v<decltype(race.rivals)>> snapshot;
std::vector<neon::Object> objects;
} // namespace
extern "C" {
void raceReset() { race = neon::Race{}; }
double lapLength() { return neon::lapLength; }
double roadX(double z) { return neon::road(z); }
double roadSlopeAt(double z) { return neon::slope(z); }
void raceShoot(int rocket) { race.shoot(rocket != 0); }
void raceAdvance(double seconds, int steer, int boost, int brake, int firing) {
    while (seconds > .000001) {
        const double step = std::min(seconds, 1. / 90);
        if (firing)
            race.shoot(false);
        race.advance(step, {steer, boost != 0, brake != 0});
        seconds -= step;
    }
}
const double *raceState() {
    snapshot = {race.distance,
                race.elapsed,
                race.x,
                race.lean,
                race.thrust,
                race.energy,
                double(race.rank),
                double(race.shield),
                double(race.laps),
                race.lapStart,
                race.lastLap,
                double(race.rockets),
                double(race.drafting),
                double(race.rivals.size())};
    size_t i = stateFields;
    for (const auto &p : race.rivals) {
        snapshot[i++] = p.x;
        snapshot[i++] = p.z;
    }
    return snapshot.data();
}
int raceVisible() {
    objects = race.visible();
    return int(objects.size());
}
const neon::Object *raceObjects() { return objects.data(); }
int raceCueCount() { return int(race.cues.size()); }
int raceCue(int index) { return int(race.cues[index]); }
void raceClearCues() { race.cues.clear(); }
}
