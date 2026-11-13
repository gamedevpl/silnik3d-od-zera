#pragma once
#include "asset_cache.hpp"
#include "lighting.hpp"

struct Instance {
    MeshRef mesh;
    Vec3 position;
    float radius;
    Material material;
};

inline std::filesystem::path modelFile(const char* name) {
#ifdef ENGINE_ASSET_DIR
    return std::filesystem::path(ENGINE_ASSET_DIR)/name;
#else
    return std::filesystem::path("assets")/name;
#endif
}

inline Instance sphereAt(MeshLibrary& library, float x, Material material) {
    return {library.load(modelFile("sphere.bin")), {x,.15,0}, .76f, material};
}

inline void drawInstance(const Instance& object,double time,double aspect) {
    drawLit(*object.mesh,object.position,object.radius,object.material,time,aspect);
}
