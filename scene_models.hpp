#pragma once
#include "layout.hpp"
#include "workshop_view.hpp"
#include "models.hpp"

inline void drawScene(const Layout& nodes, const Models& models,
                      const WorkshopView& view, double aspect, int selected = -1) {
    glClearColor(.07f, .10f, .14f, 1.f);
    beginFrame();
    for (int i = 0; i < static_cast<int>(nodes.size()); ++i) {
        const auto& node = nodes[i];
        for (const Part& part : models.at(node.model)) {
            Vec3 low = node.position;
            low.x += part.low.x;
            low.y += part.low.y;
            low.z += part.low.z;
            const Tint highlight{1.f, .82f, .18f};
            view.drawBlock(low, part.size, i == selected ? highlight : part.color, aspect);
        }
    }
}
