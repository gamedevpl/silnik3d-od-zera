# E11 · Pick up the cell

Drive to the right shelf using WASD. When the E sign appears above the cell, hold the key. The robot keeps picking up and dropping the cell. Edit `Cell::update` in `cell.hpp` so one press produces one action. Release E, drive away and press it again to set the cell down.

    git clone -b e11-start https://github.com/gamedevpl/silnik3d-od-zera.git
    cd silnik3d-od-zera
    python3 check.py

The check needs Python 3 and a C++17 compiler. It tests one second of holding E over 50 input samples, release, a fresh press, range, transport and a short tap between movement ticks. Aim for one change during the first second and a drop on the second press. Compare with `e11-solution`. The complete episode is tagged `ep11`.

The optional OpenGL 3.3 window needs CMake 3.20 and the GLFW dependencies (Debian/Ubuntu: pkg-config xorg-dev libwayland-dev libxkbcommon-dev). Run `cmake -S . -B build`, then `cmake --build build`, and launch engine. WASD drives, E handles the cell, B toggles footprints, R resets and Esc quits.

[Polski](README.md)
