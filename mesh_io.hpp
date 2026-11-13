#pragma once
#include "geometry.hpp"
#include <algorithm>
#include <cmath>
#include <cstring>
#include <filesystem>
#include <fstream>
#include <iomanip>
#include <limits>
#include <stdexcept>

inline void checkCounts(std::size_t vertices, std::size_t indices) {
    if (!vertices || vertices > 1000000 || !indices || indices > 6000000 || indices % 3)
        throw std::runtime_error("invalid mesh counts");
}

inline void checkMesh(const Mesh& mesh) {
    checkCounts(mesh.vertices.size(), mesh.indices.size());
    for (const Vertex& v : mesh.vertices)
        for (float f : {v.x,v.y,v.z,v.nx,v.ny,v.nz,v.u,v.v})
            if (!std::isfinite(f)) throw std::runtime_error("invalid mesh coordinate");
    for (auto i : mesh.indices)
        if (i >= mesh.vertices.size()) throw std::runtime_error("invalid mesh index");
}

inline void putWord(std::ostream& out, std::uint32_t bits) {
    for (int i=0; i<4; ++i) out.put(static_cast<char>((bits >> (8*i)) & 255));
}

inline std::uint32_t getWord(std::istream& in) {
    std::uint32_t bits=0;
    for (int i=0; i<4; ++i) {
        int byte=in.get();
        if (byte==EOF) throw std::runtime_error("truncated mesh");
        bits |= static_cast<std::uint32_t>(byte) << (8*i);
    }
    return bits;
}

inline void saveMesh(const std::filesystem::path& path, const Mesh& mesh) {
    static_assert(sizeof(float)==4 && std::numeric_limits<float>::is_iec559);
    checkMesh(mesh);
    std::ofstream out(path,std::ios::binary);
    out.exceptions(std::ios::failbit | std::ios::badbit);
    bool binary=path.extension()==".bin";
    if (binary) {
        out.write("MSH1",4);
        putWord(out,mesh.vertices.size());
        putWord(out,mesh.indices.size());
    } else {
        out << "mesh1 " << mesh.vertices.size() << ' ' << mesh.indices.size() << '\n';
        out << std::setprecision(std::numeric_limits<float>::max_digits10);
    }
    for (const Vertex& v : mesh.vertices) {
        for (float f : {v.x,v.y,v.z,v.nx,v.ny,v.nz,v.u,v.v}) {
            if (binary) {
                std::uint32_t bits;
                std::memcpy(&bits,&f,4);
                putWord(out,bits);
            } else out << f << ' ';
        }
        if (!binary) out << '\n';
    }
    for (auto i : mesh.indices) {
        if (binary) putWord(out,i);
        else out << i << ' ';
    }
    if (!binary) out << '\n';
    out.close();
}

inline Mesh readMesh(const std::filesystem::path& path) {
    std::ifstream in(path,std::ios::binary);
    if (!in) throw std::runtime_error("cannot open mesh: "+path.string());
    bool binary=path.extension()==".bin";
    std::uint32_t vertices=0, indices=0;
    if (binary) {
        char tag[4];
        if (!in.read(tag,4) || std::memcmp(tag,"MSH1",4)) throw std::runtime_error("invalid binary mesh header");
        vertices=getWord(in);
        indices=getWord(in);
    } else {
        std::string tag;
        if (!(in>>tag>>vertices>>indices) || tag!="mesh1") throw std::runtime_error("invalid text mesh header");
    }
    checkCounts(vertices,indices);
    Mesh mesh;
    mesh.vertices.resize(vertices);
    mesh.indices.resize(indices);
    for (auto& v : mesh.vertices) {
        for (float* f : {&v.x,&v.y,&v.z,&v.nx,&v.ny,&v.nz,&v.u,&v.v}) {
            if (binary) {
                auto bits=getWord(in);
                std::memcpy(f,&bits,4);
            } else if (!(in>>*f)) throw std::runtime_error("missing vertex attribute");
        }
    }
    for (auto& i : mesh.indices) {
        if (binary) i=getWord(in);
        else if (!(in>>i)) throw std::runtime_error("missing index");
    }
    checkMesh(mesh);
    return mesh;
}

inline bool sameMesh(const Mesh& a,const Mesh& b) {
    if (a.vertices.size()!=b.vertices.size() || a.indices!=b.indices) return false;
    for (std::size_t i=0;i<a.vertices.size();++i) {
        const auto& l=a.vertices[i];
        const auto& r=b.vertices[i];
        if (l.x!=r.x || l.y!=r.y || l.z!=r.z || l.nx!=r.nx ||
            l.ny!=r.ny || l.nz!=r.nz || l.u!=r.u || l.v!=r.v) return false;
    }
    return true;
}
