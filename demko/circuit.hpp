#pragma once
namespace neon {
constexpr int circuitSections = 48;
enum class District { Quay, Locks, Shipyard };
inline int circuitIndex(int section) {
    return (section % circuitSections + circuitSections) % circuitSections;
}
inline District district(int section) {
    const int k = circuitIndex(section);
    return k < 6 || k >= 38 ? District::Quay : k < 23 ? District::Locks : District::Shipyard;
}
} // namespace neon
