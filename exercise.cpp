#include "asset_cache.hpp"
#include <iostream>

int main() {
    try {
        std::filesystem::path folder=ENGINE_ASSET_DIR;
        const Mesh source=readMesh(folder/"sphere.mesh");
        const Mesh binary=readMesh(folder/"sphere.bin");
        MeshLibrary library;
        auto left=library.load(folder/"sphere.bin");
        auto right=library.load(folder/"."/"sphere.bin");
        bool exact=sameMesh(source,binary) && sameMesh(binary,*left);
        std::cout<<"mesh reads = "<<library.fileReads()<<"\nshared mesh = "
                 <<(left==right ? "yes" : "no")<<"\nattributes + indices = "
                 <<(exact ? "match" : "mismatch")<<'\n';
        return exact && left==right && library.fileReads()==1 ? 0 : 1;
    } catch (const std::exception& ex) {
        std::cerr<<ex.what()<<'\n';
        return 2;
    }
}
