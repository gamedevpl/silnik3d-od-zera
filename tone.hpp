#pragma once
#include <cmath>
#include <cstdint>
#include <vector>

enum class Cue { pickup, latch, lift };
constexpr int sampleRate = 44100;

inline std::vector<std::int16_t> tone(Cue cue) {
    const double length = cue == Cue::pickup ? .16 : cue == Cue::latch ? .095 : .42;
    const double tau = 6.283185307179586;
    std::vector<std::int16_t> pcm(static_cast<int>(length * sampleRate));
    for (unsigned i = 0; i < pcm.size(); ++i) {
        double t = double(i) / sampleRate;
        double s;
        if (cue == Cue::pickup) {
            s = std::sin(tau * (360*t + 1100*t*t)) * std::exp(-t*22);
        } else if (cue == Cue::latch) {
            s = (.62*std::sin(tau*1550*t) + .38*std::sin(tau*2340*t)) * std::exp(-t*125);
            double tail = t - .018;
            if (tail > 0) s += .42*std::sin(tau*790*tail) * std::exp(-tail*92);
        } else {
            s = (.67*std::sin(tau*(88*t + 74*t*t)) + .33*std::sin(tau*225*t))
                * std::sin(3.141592653589793*t/length);
        }
        const double attack = std::fmin(1.0, t * 2000);
        const double release = std::fmin(1.0, (length-t) * 700);
        pcm[i] = static_cast<std::int16_t>(s * attack * release * 14000);
    }
    return pcm;
}
