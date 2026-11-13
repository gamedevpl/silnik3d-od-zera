#include "scene.hpp"
#include <iostream>

struct Piece { float x; };

int main() {
    Scene<Piece> scene;
    auto other=scene.create({-1});
    auto a=scene.create({0});
    if (!scene.erase(a)) return 2;
    auto b=scene.create({1});
    auto* stale=scene.get(a);
    if (stale) stale->x+=2;
    const bool keptPosition=scene.get(b)->x==1;
    std::cout<<"A = "<<a.index<<':'<<a.generation<<"  B = "<<b.index<<':'<<b.generation
             <<"\nold selection = "<<(stale?"accepted":"rejected")
             <<"\nB.x after old move = "<<scene.get(b)->x<<'\n';
    scene.get(b)->x+=2;
    bool pass=a.index==b.index && a.generation!=b.generation && !stale && keptPosition &&
              scene.get(b)->x==3 && scene.get(other)->x==-1 && !scene.erase(a);
    std::cout<<"B.x after new move = "<<scene.get(b)->x<<'\n';
    return pass ? 0 : 1;
}
