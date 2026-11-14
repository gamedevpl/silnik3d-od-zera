#pragma once
#include <cmath>

struct Stick { double x, z; };

inline Stick direction(bool w, bool a, bool s, bool d) {
    Stick v{double(d - a), double(s - w)};
    const double len = std::hypot(v.x, v.z);
    if (len > 1.0) {
        v.x /= len;
        v.z /= len;
    }
    return v;
}
