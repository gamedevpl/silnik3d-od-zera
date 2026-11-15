#include "hierarchy.hpp"
#include <iostream>
int main() {
    Layout local{{"head",{2,0,0},8,1,7,0},{"base",{1,0,1},3,0,0,1},{"boom",{0,2,0},7,0,3,0}};
    auto head=worldLayout(local).front();
    auto aim=turnY({.5,-1,0},head.turns);
    std::cout<<"head X Z: "<<head.position.x<<" "<<head.position.z<<"\n";
    std::cout<<"aim X Z: "<<aim.x<<" "<<aim.z<<"\n";
    if (head.position.x!=1 || head.position.z!=-1 || head.position.y!=2 || aim.z!=-.5) return 1;
    local[2].turns=1;
    auto rotated=worldLayout(local).front();
    auto twice=turnY({.5,-1,0},rotated.turns);
    if (twice.x!=-.5 || twice.z!=0) return 1;
    local[2].turns=0;
    local[1].turns=-1; head=worldLayout(local).front();
    if(head.position.z!=3) return 1;
    local[1].parent=8;
    try { worldLayout(local); return 1; } catch(const std::runtime_error&) {}
    return 0;
}
