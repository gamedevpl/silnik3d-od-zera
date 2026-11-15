#include "preview.hpp"
#include <iostream>
int main() {
    Layout edit{{"pillar",{0,0,0},5},{"sculpture",{-1,1,0},7}};
    Preview p; bool ok=true;
    for (int run=0;run<2;++run) {
        p.play(edit,10); p.tick(edit,11); p.tick(edit,12);
        double wall=p.active(edit)[1].position.x;
        p.stop(); double back=p.active(edit)[1].position.x;
        std::cout<<"run "<<run+1<<"  wall "<<wall<<"  edit "<<back<<"\n";
        ok &= wall==1 && back==-1 && edit[0].position.x==0;
    }
    edit[1].position.x=2; p.play(edit,30); p.tick(edit,30.5);
    ok &= p.active(edit)[1].position.x==2.5;
    p.stop(); return ok && edit[1].position.x==2 ? 0 : 1;
}
