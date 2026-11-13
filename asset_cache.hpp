#pragma once
#include "mesh_io.hpp"
#include <map>
#include <memory>

using MeshRef = std::shared_ptr<const Mesh>;

class MeshLibrary {
    std::map<std::filesystem::path,MeshRef> cache;
    unsigned reads = 0;
public:
    MeshRef load(const std::filesystem::path& file) {
        auto key = std::filesystem::weakly_canonical(file);
        auto found = cache.end();
        if (found != cache.end()) return found->second;
        auto mesh = std::make_shared<Mesh>(readMesh(key));
        ++reads;
        cache[key] = mesh;
        return mesh;
    }
    unsigned fileReads() const { return reads; }
};
