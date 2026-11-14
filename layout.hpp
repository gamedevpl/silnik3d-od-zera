#pragma once
#include "rotation.hpp"
#include <fstream>
#include <iomanip>
#include <limits>
#include <stdexcept>
#include <string>
#include <vector>

struct Node {
    std::string model;
    Vec3 position;
};
using Layout = std::vector<Node>;

inline Layout readScene(std::istream& in) {
    std::string tag;
    int version;
    if (!(in >> tag >> version) || tag != "scene" || version != 1)
        throw std::runtime_error("Expected scene 1");
    Layout objects;
    Node node;
    while (in >> node.model) {
        auto& p = node.position;
        if (!(in >> p.x >> p.y >> p.z))
            throw std::runtime_error("Missing XYZ: " + node.model);
        objects.push_back(node);
    }
    if (in.bad()) throw std::runtime_error("Scene read failed");
    return objects;
}

inline void writeScene(std::ostream& out, const Layout& objects) {
    out << std::setprecision(std::numeric_limits<double>::max_digits10);
    out << "scene 1\n";
    for (const auto& node : objects) {
        const auto& p = node.position;
        out << node.model << ' ' << p.x << ' '
            << p.z << ' ' << p.y << '\n';
    }
    if (!out) throw std::runtime_error("Scene write failed");
}
