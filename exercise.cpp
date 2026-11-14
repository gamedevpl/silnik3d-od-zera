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
    bool same = true;
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
