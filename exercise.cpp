#include "framing.hpp"
#include <cmath>
#include <iostream>
int main(){
    Frame bookmark;
    auto trial=[&](double wantedYaw,double wantedRadius){
        bookmark.remember(wantedYaw,wantedRadius);
        double yaw=-.8, radius=12;
        bookmark.recall(yaw,radius);
        std::cout<<"frame: "<<yaw<<" / "<<radius<<"  expected "<<wantedYaw<<" / "<<wantedRadius<<"\n";
        return yaw==wantedYaw && radius==wantedRadius;
    };
    return trial(.4,6.6) && trial(-.3,9.0) ? 0 : 1;
}
