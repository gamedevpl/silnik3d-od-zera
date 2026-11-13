#pragma once
#include "instances.hpp"
#include "scene.hpp"

struct Gallery {
    MeshLibrary meshes;
    Scene<Instance> objects;
    std::optional<Handle> selected;
    Handle first{},middle{},last{};

    Gallery() {
        first=objects.create(sphereAt(meshes,-1.65f,{.18f,.2f}));
        middle=objects.create(sphereAt(meshes,0,{.45f,.1f}));
        last=objects.create(sphereAt(meshes,1.65f,{.8f,.05f}));
        selected=middle;
    }

    void next() {
        std::optional<Handle> firstLive,nextLive;
        objects.each([&](Handle h,const Instance&){
            if (!firstLive) firstLive=h;
            if (!nextLive && selected && h.index>selected->index) nextLive=h;
        });
        selected=nextLive ? nextLive : firstLive;
    }

    void eraseSelection() {
        if (selected) objects.erase(*selected);
    }

    Handle add(float x=0) {
        return objects.create(sphereAt(meshes,x,{.24f,.76f}));
    }

    bool move(double dx,double dy) {
        auto p=selected ? objects.get(*selected) : nullptr;
        if (!p) return false;
        p->position.x+=dx;
        p->position.y+=dy;
        return true;
    }
};
