#pragma once
#include "layout.hpp"
#include "workshop_view.hpp"
#include <map>

struct Part { Vec3 low, size; Tint color; };
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

inline void drawScene(const Layout& nodes, const Models& models,
                      const WorkshopView& view, double aspect) {
    glClearColor(.07f, .10f, .14f, 1.f);
    beginFrame();
    for (const auto& node : nodes) {
        for (const Part& part : models.at(node.model)) {
            Vec3 low = node.position;
            low.x += part.low.x;
            low.y += part.low.y;
            low.z += part.low.z;
            view.drawBlock(low, part.size, part.color, aspect);
        }
    }
}
