#pragma once
#include "layout.hpp"
#include <optional>

struct Move { int node; double before, after; };

struct History {
    std::vector<Move> done, undone;
    std::optional<Move> active;

    void begin(int node, double x) {
        active = Move{node, x, x};
    }
    void sample(double x) {
        if (!active || x == active->after) return;
        active->after = x;
    }
    void release() {
        if (active && active->before != active->after) {
            done.push_back(*active);
            undone.clear();
        }
        active.reset();
    }
    void undo(Layout& nodes) {
        if (active || done.empty()) return;
        const Move move = done.back();
        undone.push_back(move);
        nodes.at(move.node).position.x = move.before;
        done.pop_back();
    }
    void redo(Layout& nodes) {
        if (active || undone.empty()) return;
        const Move move = undone.back();
        done.push_back(move);
        nodes.at(move.node).position.x = move.after;
        undone.pop_back();
    }
};
