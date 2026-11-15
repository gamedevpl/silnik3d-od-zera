#pragma once
#include "rotation.hpp"

namespace lens {
constexpr double tilt = .25;
constexpr double nearPlane = .1, farPlane = 40;
inline const double focal = 1.0 / std::tan(radians(50) / 2);
}
