#pragma once

struct SoundEvents {
    bool pickup = false;
    bool latch = false;
    bool lift = false;
};

inline SoundEvents listen(bool wasCarried, bool carried,
                          bool wasPowered, bool powered, bool enteredLift) {
    SoundEvents sounds;
    sounds.pickup = carried && !wasCarried;
    sounds.latch = powered;
    sounds.lift = powered && enteredLift;
    return sounds;
}
