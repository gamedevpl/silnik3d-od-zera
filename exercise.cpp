#include "layout.hpp"
#include <iostream>
#include <sstream>

int main() {
    Layout original{{"shelf", {-3.7, 0, -2.87}},
                    {"sculpture", {1.25, .58, -.75}}};
    std::stringstream copy;
    writeScene(copy, original);
    auto restored = readScene(copy);
    if (restored.size() != original.size()) return 1;
    // Independent XYZ input keeps matching mistakes in the writer and reader visible.
    std::istringstream fixture("scene 1\nsculpture 1.25 0.58 -0.75\n");
    const auto reference = readScene(fixture);
    bool same = reference.size() == 1 && reference[0].model == "sculpture"
             && reference[0].position.x == 1.25 && reference[0].position.y == .58
             && reference[0].position.z == -.75;
    if (!same) std::cerr << "Known XYZ input read incorrectly\n";
    for (unsigned i = 0; i < restored.size(); ++i) {
        const auto& got = restored[i];
        const auto& want = original[i];
        auto p = got.position;
        std::cout << got.model << ": " << p.x << ' ' << p.y << ' ' << p.z << '\n';
        same &= got.model == want.model && p.x == want.position.x
             && p.y == want.position.y && p.z == want.position.z;
    }
    return same ? 0 : 1;
}
