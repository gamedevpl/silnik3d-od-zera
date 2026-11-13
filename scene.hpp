#pragma once
#include <cstdint>
#include <limits>
#include <optional>
#include <stdexcept>
#include <utility>
#include <vector>

struct Handle {
    std::size_t index;
    std::uint64_t generation;
};

template<class T> class Scene {
    struct Slot {
        std::uint64_t generation = 1;
        bool alive = false;
        std::optional<T> object;
    };
    std::vector<Slot> slots;
    std::vector<std::size_t> freeSlots;

public:
    bool valid(Handle handle) const {
        if (handle.index >= slots.size()) return false;
        const Slot& slot = slots[handle.index];
        return slot.alive;
    }

    Handle create(T object) {
        if (freeSlots.empty()) {
            slots.push_back({1,true,std::move(object)});
            return {slots.size()-1,1};
        }
        auto index=freeSlots.back();
        Slot& slot=slots[index];
        slot.object.emplace(std::move(object));
        slot.alive=true;
        freeSlots.pop_back();
        return {index,slot.generation};
    }

    T* get(Handle handle) {
        return valid(handle) ? &*slots[handle.index].object : nullptr;
    }

    bool erase(Handle handle) {
        if (!valid(handle)) return false;
        Slot& slot=slots[handle.index];
        const bool reusable=slot.generation<std::numeric_limits<std::uint64_t>::max();
        if (reusable) freeSlots.push_back(handle.index);
        slot.object.reset();
        slot.alive=false;
        if (reusable) ++slot.generation;
        return true;
    }

    template<class F> void each(F fn) const {
        for (std::size_t i=0;i<slots.size();++i) {
            const Slot& slot=slots[i];
            if (slot.alive) fn(Handle{i,slot.generation},*slot.object);
        }
    }
};
