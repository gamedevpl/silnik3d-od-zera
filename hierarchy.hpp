#pragma once
#include "models.hpp"
#include <set>
#include <algorithm>

inline Vec3 turnY(Vec3 p, int quarters) {
    int q = (quarters % 4 + 4) % 4;
    while (q--) p = {p.z,p.y,-p.x};
    return p;
}

inline Node compose(Node base, Node child) {
    Vec3 local = child.position;
    child.position = {base.position.x + local.x,
                      base.position.y + local.y,
                      base.position.z + local.z};
    child.turns += base.turns;
    child.parent = base.parent;
    return child;
}

inline Layout worldLayout(const Layout& local) {
    Layout world = local;
    for (auto& node : world) {
        std::set<int> visited{node.id};
        while (node.parent) {
            if (!visited.insert(node.parent).second) throw std::runtime_error("Parent cycle");
            auto parent = std::find_if(local.begin(),local.end(),
                [&](const Node& n){return n.id == node.parent;});
            if (parent == local.end()) throw std::runtime_error("Missing parent");
            node = compose(*parent,node);
        }
    }
    return world;
}

inline Part oriented(Part part, int turns) {
    Vec3 a=turnY(part.low,turns);
    Vec3 b=turnY({part.low.x+part.size.x,part.low.y+part.size.y,part.low.z+part.size.z},turns);
    part.low={std::min(a.x,b.x),a.y,std::min(a.z,b.z)};
    part.size={std::abs(b.x-a.x),b.y-a.y,std::abs(b.z-a.z)};
    return part;
}
