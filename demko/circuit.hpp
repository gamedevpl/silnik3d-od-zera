#pragma once
namespace neon {
constexpr int circuitSections = 96;
enum class District { Quay, Locks, Shipyard, Coast };
inline int circuitIndex(int section) {
    return (section % circuitSections + circuitSections) % circuitSections;
}
inline District district(int section) {
    const int k = circuitIndex(section);
    if(k>=48 && k<90)return District::Coast;
    return k < 6 || k >= 38 ? District::Quay : k < 23 ? District::Locks : District::Shipyard;
}
} // namespace neon
