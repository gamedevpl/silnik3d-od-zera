#include "history.hpp"
#include <iostream>
int main() {
    Layout nodes{{"pillar",{0,0,0}},{"pillar",{4,0,0}}};
    History h;
    auto drag = [&](int i, std::vector<double> path) {
        h.begin(i,nodes[i].position.x);
        for (double x : path) { nodes[i].position.x=x; h.sample(x); }
        h.release();
    };
    drag(0,{.5,1,1.5});
    h.undo(nodes);
    std::cout << "Undo X = " << nodes[0].position.x << '\n';
    bool ok = nodes[0].position.x==0 && h.done.empty();
    drag(0,{}); // A click without travel must keep the redo stack.
    h.redo(nodes);
    std::cout << "Redo X = " << nodes[0].position.x << '\n';
    ok &= nodes[0].position.x==1.5;
    h.undo(nodes); drag(1,{3.5,3});
    ok &= h.undone.empty() && nodes[0].position.x==0;
    auto count=h.done.size(); drag(1,{3,3});
    ok &= h.done.size()==count;
    return ok ? 0 : 1;
}
