// Browser ABI. State is copied after a simulation step so JS never owns race rules.
#include "track_mesh.hpp"
#include "race_lights.hpp"
#include "materials.hpp"
#include "sound_bank.hpp"
#include "canvas_scene.hpp"
#include <optional>
#include <algorithm>

namespace {
neon::Race race;
constexpr size_t stateFields = 14;
std::array<double, stateFields + 2 * std::tuple_size_v<decltype(race.rivals)> + 20> snapshot;
std::vector<neon::Object> objects;
std::optional<neon::TrackMesh> track;
std::vector<float> canvasCommands;
} // namespace
extern "C" {
// The upload views remain valid until releaseTrack() or the next buildTrack().
const float *soundClip(int id) { return neon::audio::clip(id).data(); }
int soundLength(int id) { return int(neon::audio::clip(id).size()); }
int soundRate() { return neon::audio::rate; }
const uint8_t *surfaceMap(int id) { return neon::materialTile(id).data(); }
int buildTrack(int simple) {
    track.emplace(simple);
    return int(track->sections.size());
}
const int *trackSections() { return track->sections.data(); }
const Vertex *trackVertices() { return track->data.data(); }
void releaseTrack() { track.reset(); }
int raceActors(double time) { return neon::buildActors(race, time); }

const float *raceLights() {
    static neon::RaceLights lamps;
    lamps = neon::raceLights(race);
    return lamps.front().data();
}

int canvasFrame(int width, int height, double pan) {
    neon::CanvasScene scene(race, width, height, pan, canvasCommands);
    return int(canvasCommands.size());
}
const float *canvasData() { return canvasCommands.data(); }
void raceReset() { race = neon::Race{}; }
double lapLength() { return neon::lapLength; }
double elevation(double z){return neon::viaductHeight(z);}
double cameraPitch(double z){return neon::cameraGrade(z);}
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
    snapshot[i++] = race.wakeCharge;
    snapshot[i++] = race.launchTime;
    snapshot[i++] = race.speed;
    snapshot[i++] = race.contactStrength;
    snapshot[i++] = neon::bridgeHeight(race.x,race.distance);
    snapshot[i++] = neon::routeHint(race.x,race.distance);
    snapshot[i++] = race.lockTime;
    snapshot[i++] = race.overdrive;
    const auto &r=race.relay;
    snapshot[i++]=r.carrier;
    snapshot[i++]=r.cargo;
    snapshot[i++]=r.gateX();
    snapshot[i++]=r.gateAhead(race.distance);
    snapshot[i++]=r.scores[0];
    snapshot[i++]=*std::max_element(r.scores.begin()+1,r.scores.end());
    snapshot[i++]=r.victoryTime>0?r.winner:-1;
    snapshot[i++]=r.payoutTime>0?r.lastBank:-1;
    snapshot[i++]=r.lastPayout;
    snapshot[i++]=neon::Relay::goal;
    snapshot[i++]=r.carrier?neon::gap(race.rivals[r.carrier-1].z,race.distance):0;
    snapshot[i++]=race.corner.outwardSlide;
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
