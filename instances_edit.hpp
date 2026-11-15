#pragma once
#include "layout.hpp"
#include <algorithm>

inline int nextId(const Layout& nodes) {
    int highest = 0;
    for (const auto& node : nodes) highest = std::max(highest, node.id);
    return highest + 1;
}

inline int duplicate(Layout& nodes, int index) {
    Node copy = nodes.at(index);
    copy.id = nextId(nodes);
    copy.position.x += 2;
    nodes.push_back(copy);
    return int(nodes.size()) - 1;
}

inline void changeLight(Layout& nodes, int id) {
    for (auto& node : nodes) {
        if (node.id == id) node.light = node.light == 1 ? 2 : 1;
    }
}
