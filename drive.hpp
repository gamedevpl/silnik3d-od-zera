#pragma once
#include <cmath>

struct Stick { double x, z; };

inline Stick direction(bool w, bool a, bool s, bool d) {
    Stick v{double(d - a), double(s - w)};
    return v;
}
