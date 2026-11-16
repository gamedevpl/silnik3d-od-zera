#pragma once
#include <algorithm>
#include <cmath>

namespace neon {
constexpr double lapLength = 1152, tau = 6.2831853071795864769;
inline double lapPosition(double z) { return z - lapLength * std::floor(z / lapLength); }
inline double ramp(double t) {
    t = std::clamp(t, 0., 1.);
    return t * t * (3 - 2 * t);
}
constexpr double forkStart = 288, forkEnd = 456;
inline double islandHalf(double z) {
    double p = lapPosition(z);
    return 6.8 * ramp((p - forkStart) / 30) * ramp((forkEnd - p) / 42);
}
inline double bridgeHeight(double x, double z) {
    double p = lapPosition(z);
    return x < 0 ? 4.8 * ramp((p - forkStart) / 49) * ramp((forkEnd - p) / 49) : 0.;
}
inline int routeSign(double x) { return x < 0 ? -1 : 1; }
// The waterfront stays at datum; only the racing ribbon climbs above it.
inline double viaductHeight(double z){
    double p=lapPosition(z);
    return 27*ramp((p-480)/204)*ramp((1056-p)/216);
}
inline double viaductGrade(double z){return (viaductHeight(z+1)-viaductHeight(z-1))*.5;}
inline double cameraGrade(double z){return .82*viaductGrade(z+10);}
inline double chicane(double z) {
    double p = lapPosition(z);
    return 78 * (ramp((p - 480) / 228) - ramp((p - 764) / 234)) -
           19 * (ramp((p - 862) / 100) - ramp((p - 992) / 110));
}
inline int routeHint(double x, double z) {
    double p = lapPosition(z);
    if (p >= forkStart - 86 && p < forkStart)
        return 1;
    if (p >= forkStart && p < forkEnd)
        return x < 0 ? 2 : 3;
    return 0;
}
} // namespace neon
