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
    int id = 0;
    int light = 0;
    int parent = 0, turns = 0;
};
using Layout = std::vector<Node>;

inline Layout readScene(std::istream& in) {
    std::string tag;
    int version;
    if (!(in >> tag >> version) || tag != "scene" || (version < 1 || version > 3))
        throw std::runtime_error("Expected scene 1");
    Layout objects;
    Node node;
    while (in >> node.model) {
        auto& p = node.position;
        if (!(in >> p.x >> p.y >> p.z))
            throw std::runtime_error("Missing XYZ: " + node.model);
        if (version == 1) node.id = int(objects.size()) + 1;
        else if (!(in >> node.id >> node.light) || node.id <= 0 || node.light < 0 || node.light > 2)
            throw std::runtime_error("Invalid instance");
        if (version == 3 && (!(in >> node.parent >> node.turns) || node.parent < 0))
            throw std::runtime_error("Invalid parent transform");
        for (const auto& other : objects)
            if (other.id == node.id) throw std::runtime_error("Repeated instance ID");
        objects.push_back(node);
    }
    if (in.bad()) throw std::runtime_error("Scene read failed");
    return objects;
}

inline void writeScene(std::ostream& out, const Layout& objects) {
    out << std::setprecision(std::numeric_limits<double>::max_digits10);
    out << "scene 3\n";
    for (const auto& node : objects) {
        const auto& p = node.position;
        out << node.model << ' ' << p.x << ' '
            << p.y << ' ' << p.z << ' ' << node.id << ' ' << node.light << ' ' << node.parent << ' ' << node.turns << '\n';
    }
    if (!out) throw std::runtime_error("Scene write failed");
}
