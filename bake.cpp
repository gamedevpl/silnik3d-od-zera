#include "mesh_io.hpp"
#include <iostream>

int main(int argc,char** argv) {
    if (argc!=3) { std::cerr<<"usage: bake input.mesh output.bin\n"; return 2; }
    try {
        Mesh source=readMesh(argv[1]);
        saveMesh(argv[2],source);
        return sameMesh(source,readMesh(argv[2])) ? 0 : 1;
    } catch (const std::exception& ex) {
        std::cerr<<ex.what()<<'\n';
        return 1;
    }
}
