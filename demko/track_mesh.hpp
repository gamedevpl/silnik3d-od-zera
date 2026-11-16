#pragma once
#include "geometry_api.hpp"
#include "circuit.hpp"
#include "race.hpp"

namespace neon {
// Bake each district into one curved circuit for Metal and WebGL.
struct TrackMesh {
    std::vector<Vertex> data;
    std::vector<int> sections;

    explicit TrackMesh(int simple) {

        const int reach = simple == 2 ? 360 : simple ? 216 : 192;
        const int last = int(std::ceil((lapLength + reach) / 24));
        for (int sector = -1; sector <= last; ++sector) {
            const int tile = circuitIndex(sector);
            const int count = circuitSection(tile, simple);
            sections.push_back(int(data.size()));
            for (int i = 0; i < count; ++i) {
                Vertex v = vertices()[i];
                v.z += (sector - tile) * 24;
                v.x += road(v.z);
                data.push_back(v);
            }
        }
        sections.push_back(int(data.size()));
    }
};

inline int buildActors(const Race &race, double time) {
    auto visible = race.visible();
    int count = int(std::min<size_t>(64, visible.size()));
    for (int i = 0; i < count; ++i)
        std::copy(visible[i].begin(), visible[i].end(), objectBuffer() + 4 * i);
    return actors(std::fmod(time, 240.), race.distance - race.laps * lapLength, race.x, race.lean,
                  race.thrust, count);
}
} // namespace neon
