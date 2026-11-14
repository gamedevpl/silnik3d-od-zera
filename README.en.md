# E14 · One more shift

Carry the cell from the shelf to its socket and drive into the lift. At the upper floor press R. A new shift puts the cell back on the shelf. The starter's empty platform then takes off by itself.

    git clone -b e14-start https://github.com/gamedevpl/silnik3d-od-zera.git
    cd silnik3d-od-zera
    python3 check.py

Fix the restart in shift.hpp. After one second without input the empty deck should still be at height zero. Complete both journeys in one process: the counter should reach two. Compare your edit with e14-solution or check out ep14 for the complete episode.

The check uses Python 3 and a C++17 compiler. The game needs OpenGL 3.3, CMake 3.20+, OpenAL and the GLFW build dependencies. On Debian/Ubuntu install libopenal-dev, pkg-config, xorg-dev, libwayland-dev and libxkbcommon-dev. macOS includes OpenAL. Build with cmake -S . -B build and cmake --build build. WASD drives, E picks up or drops, B toggles the debug boxes and R starts a new shift.

[Polski](README.md)
