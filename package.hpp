#pragma once
#include "layout.hpp"
#include <filesystem>

namespace files = std::filesystem;
inline std::string mapName(const files::path& material) {
    std::ifstream in(material);
    std::string key, name;
    if (!(in >> key >> name) || key != "map" || name.empty() || name=="." || name==".." ||
        name.find_first_not_of("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._-")!=std::string::npos)
        throw std::runtime_error("Invalid floor material");
    return name;
}

inline void copyResources(const files::path& source, const files::path& target) {
    files::copy_file(source / "models.boxes", target / "models.boxes");
    files::copy_file(source / "floor.mat", target / "floor.mat");
    const auto bitmap = mapName(source / "floor.mat");
    files::copy_file(source / bitmap, target / bitmap);
}

inline files::path exportGallery(const Layout& nodes, double yaw, double radius,
                                 const files::path& source, const files::path& parent) {
    int number=1;
    files::path target;
    do { target=parent / ("gallery-pack-" + std::to_string(number++)); }
    while (!files::create_directory(target));
    try {
        copyResources(source,target);
        std::ofstream doc(target / "exhibit.scene");
        writeScene(doc,nodes); doc.close();
        std::ofstream camera(target / "camera.txt");
        camera << std::setprecision(17) << yaw << ' ' << radius << '\n'; camera.close();
        if (!doc || !camera) throw std::runtime_error("Package write failed");
    } catch (...) { files::remove_all(target); throw; }
    return target;
}
