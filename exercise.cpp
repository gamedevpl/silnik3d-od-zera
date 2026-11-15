#include "instances_edit.hpp"
#include <sstream>
#include <iostream>
int main() {
    Layout lamps{{"lamp",{-1,0,0},7,1},{"plinth",{0,0,0},32,0}};
    int copy=duplicate(lamps,0);
    changeLight(lamps,lamps[copy].id);
    std::cout<<"bulbs: "<<lamps[0].light<<" / "<<lamps[copy].light<<"\n";
    std::cout<<"IDs: "<<lamps[0].id<<" / "<<lamps[copy].id<<"\n";
    if (lamps[copy].id==7 || lamps[copy].id==32 || lamps[0].light!=1 || lamps[copy].light!=2) return 1;
    Layout sparse{{"lamp",{},3,1},{"lamp",{},8,1}};
    int third=duplicate(sparse,0);
    changeLight(sparse,sparse.at(third).id);
    if (sparse.at(third).id==8 || sparse[0].light!=1 || sparse.at(third).light!=2) return 1;
    int more=duplicate(lamps,copy);
    std::stringstream file; writeScene(file,lamps); auto back=readScene(file);
    return back[more].id!=back[copy].id && back[0].model==back[more].model && back[copy].light==2 ? 0 : 1;
}
