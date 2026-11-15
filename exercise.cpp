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
        passed &= front == "sculpture";
        for (auto sample : {std::pair<int,const char*>{375,"pillar"}, {400,"sky"}}) {
            auto actual = at(sample.first, sample.first == 375 ? 130 : 0);
            if (actual != sample.second && front == "sculpture") {
                std::cerr << file << " pixel X=" << sample.first << ": expected "
                          << sample.second << ", got " << actual << '\n';
            }
            passed &= actual == sample.second;
        }
    }
    if (!passed) return 1;
    // The long beam enters the ray first even though its centre is farther away.
    Models testParts;
    testParts["long"] = {{{-1,-1,-15},{2,2,14},{1,1,1}}};
    testParts["short"] = {{{-1,-1,-4},{2,2,1},{1,1,1}}};
    Layout stacked{{"long",{}},{"short",{}}};
    Ray straight{{0,0,0},{0,0,-1}};
    for (int pass = 0; pass < 2; ++pass) {
        int index = pick(stacked, testParts, straight);
        auto name = index < 0 ? std::string("sky") : stacked.at(index).model;
        if (name != "long") {
            std::cerr << "Overlapping boxes: expected long (front at t=1), got " << name << '\n';
            passed = false;
        }
        std::reverse(stacked.begin(), stacked.end());
    }
    for (auto [x, expected] : {std::pair<double,double>{.24,0}, {.26,.5},
                               {-.24,0}, {-.26,-.5}, {.74,.5}, {-.76,-1}}) {
        const auto actual = snapX(x);
        if (actual != expected) {
            std::cerr << "snapX(" << x << "): expected " << expected << ", got " << actual << '\n';
            passed = false;
        }
    }
    return passed ? 0 : 1;
}
