#pragma once
#include "layout.hpp"
#include <algorithm>

struct Preview {
    bool running = false;
    Layout runtime;
    double startTime = 0, startX = 0;
    int exhibit = -1;

    Layout& active(Layout& editor) {
        return running ? runtime : editor;
    }
    void play(Layout& editor, double time) {
        if (running) return;
        auto it = std::find_if(editor.begin(),editor.end(),
            [](const Node& n) { return n.model == "sculpture"; });
        if (it == editor.end()) return;
        exhibit = int(it - editor.begin());
        startX = it->position.x;
        startTime = time;
        runtime = editor;
        running = true;
    }
    void tick(Layout& editor, double time) {
        if (!running) return;
        double travel = std::clamp(time - startTime, 0.0, 2.0);
        active(editor).at(exhibit).position.x = startX + travel;
    }
    void stop() {
        running = false;
        runtime.clear();
        exhibit = -1;
    }
};
