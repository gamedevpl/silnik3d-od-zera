#pragma once
#include "layout.hpp"
#include <array>
#include <map>

struct Part { Vec3 low, size; std::array<float,3> color; };
using Models = std::map<std::string, std::vector<Part>>;

inline Models readModels(std::istream& in) {
    Models models;
    std::string name;
    while (in >> name) {
        Part p;
        if (!(in >> p.low.x >> p.low.y >> p.low.z
                 >> p.size.x >> p.size.y >> p.size.z
                 >> p.color[0] >> p.color[1] >> p.color[2]))
            throw std::runtime_error("Invalid model: " + name);
        models[name].push_back(p);
    }
    if (models.empty()) throw std::runtime_error("Missing models");
    return models;
}

