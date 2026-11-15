#include "picking.hpp"
#include <filesystem>
#include <iostream>

int main() {
    auto dir = std::filesystem::path(__FILE__).parent_path() / "assets" / "scenes";
    std::ifstream parts(dir / "models.boxes");
    auto models = readModels(parts);
    bool passed = true;
    for (auto file : {"gallery.scene", "reordered.scene"}) {
        std::ifstream data(dir / file);
        auto nodes = readScene(data);
        auto at = [&](double x, double y) {
            int i = pick(nodes, models, cursorRay(x,y,800,450,.20,7.8));
            return i < 0 ? std::string("sky") : nodes.at(i).model;
        };
        auto front = at(365,130);
        std::cout << file << ": " << front << '\n';
        passed &= front == "sculpture" && at(375,130) == "pillar";
        passed &= at(400,0) == "sky";
    }
    // The long beam enters the ray first even though its centre is farther away.
    Models testParts;
    testParts["long"] = {{{-1,-1,-15},{2,2,14},{1,1,1}}};
    testParts["short"] = {{{-1,-1,-4},{2,2,1},{1,1,1}}};
    Layout stacked{{"long",{}},{"short",{}}};
    Ray straight{{0,0,0},{0,0,-1}};
    for (int pass = 0; pass < 2; ++pass) {
        int index = pick(stacked, testParts, straight);
        passed &= index >= 0 && stacked.at(index).model == "long";
        std::reverse(stacked.begin(), stacked.end());
    }
    passed &= snapX(.24) == 0 && snapX(.26) == .5;
    passed &= snapX(-.24) == 0 && snapX(-.26) == -.5;
    passed &= snapX(.74) == .5 && snapX(-.76) == -1;
    return passed ? 0 : 1;
}
