#pragma once
#include "layout.hpp"
#include "workshop_view.hpp"
#include "hierarchy.hpp"

inline void drawScene(const Layout& nodes, const Models& models,
                      const WorkshopView& view, double aspect, int selected = -1) {
    glClearColor(.07f, .10f, .14f, 1.f);
    beginFrame();
    for (int i = 0; i < static_cast<int>(nodes.size()); ++i) {
        const auto& node = nodes[i];
        if (node.model == "head") {
            Vec3 aim = turnY({.5,-1,0},node.turns);
            double travel = node.position.y;
            Vec3 spot{node.position.x + aim.x*travel,.012,node.position.z + aim.z*travel};
            view.drawBlock({spot.x-.24,spot.y,spot.z-.24},{.48,.012,.48},{1.f,.75f,.25f},aspect);
        }
        for (const auto& raw : models.at(node.model)) {
            auto part = oriented(raw,node.turns);
            Vec3 low = node.position;
            low.x += part.low.x;
            low.y += part.low.y;
            low.z += part.low.z;
            const Tint highlight{1.f, .82f, .18f};
            Tint color = part.color;
            if ((node.model == "lamp" || node.model == "head") && part.color[1] > .8f)
                color = node.light == 2 ? Tint{.18f,.83f,1.f} : Tint{1.f,.63f,.15f};
            else if (i == selected) color = highlight;
            view.drawBlock(low, part.size, color, aspect);
        }
    }
}
