#include "package.hpp"
#include <iostream>
int main() {
    files::path source="source", out="receiver";
    files::create_directory(source); files::create_directory(out);
    std::ofstream(source/"models.boxes")<<"gallery geometry";
    std::ofstream(source/"floor.mat")<<"map blue.ppm\n";
    std::string bitmap="P3\n1 1\n255\n20 80 120\n";
    std::ofstream(source/"blue.ppm")<<bitmap;
    auto pack=exportGallery({{"gallery",{0,0,0},1}},.4,7.8,source,out);
    files::rename(source,"offline");
    std::ifstream pixels(pack/mapName(pack/"floor.mat"));
    std::string data{std::istreambuf_iterator<char>(pixels),{}};
    std::cout<<"material -> blue.ppm\nmap bytes: "<<data.size()<<" / "<<bitmap.size()<<"\n";
    if (data != bitmap) return 1;
    files::rename("offline",source);
    files::rename(source/"blue.ppm",source/"mosaic.ppm");
    std::ofstream(source/"floor.mat")<<"map mosaic.ppm\n";
    auto alternate=exportGallery({},.2,8,source,out);
    files::rename(source,"offline");
    std::ifstream other(alternate/"mosaic.ppm");
    if (std::string(std::istreambuf_iterator<char>(other),{})!=bitmap) return 1;
    return data==bitmap && files::exists(pack/"exhibit.scene") && files::exists(pack/"camera.txt") ? 0 : 1;
}
