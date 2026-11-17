#pragma once
#include <algorithm>
#include <cmath>

namespace neon {
constexpr double lapLength = 2304, tau = 6.2831853071795864769;
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
constexpr double firstLip=1488, secondLip=1908, jumpSpan=60;
inline bool shippingGap(double z){
    const double p=lapPosition(z);
    return (p>=firstLip && p<firstLip+jumpSpan) || (p>=secondLip && p<secondLip+jumpSpan);
}
inline double landingLane(double lip){return lip==firstLip?-7.:7.;}
inline bool cleanLanding(double before,double after,double x){
    for(double lip:{firstLip,secondLip}){
        const double ahead=lapPosition(lip+jumpSpan-before);
        if(ahead>0 && ahead<=after-before && std::abs(x-landingLane(lip))<3.)return true;
    }
    return false;
}
// The magnetic launch rails guide the ships over the shipping lanes.
// The approach, free arc and receiving rail share their endpoint gradients.
inline double crossingHeight(double p,double lip){
    const double u=(p-lip)/jumpSpan;
    if(u>=0 && u<=1)return 15+20*u*(1-u);
    double t=std::clamp((u<0?p-lip+90:lip+jumpSpan+90-p)/90.,0.,1.);
    return 15*t*t;
}
inline double viaductHeight(double z){
    double p=lapPosition(z);
    return crossingHeight(p,firstLip)+crossingHeight(p,secondLip)+27*ramp((p-480)/204)*ramp((1056-p)/216);
}
inline double viaductGrade(double z){return (viaductHeight(z+1)-viaductHeight(z-1))*.5;}
inline double cameraGrade(double z){return .82*viaductGrade(z+10);}
inline double chicane(double z) {
    double p = lapPosition(z);
    return 138*(ramp((p-1100)/245)-ramp((p-1390)/265))
         - 175*(ramp((p-1600)/255)-ramp((p-1875)/285))
         + 134 * (ramp((p - 480) / 228) - ramp((p - 748) / 184)) -
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
