# E12 · Power the workshop

Take the cell from the right shelf and put it beside the yellow socket in front of the lift. The starter powers the circuit even when the contacts miss. Edit `Socket::accepts` in `socket.hpp` using the footprint of the cell and the inside edges of the rim.

    git clone -b e12-start https://github.com/gamedevpl/silnik3d-od-zera.git
    cd silnik3d-od-zera
    python3 check.py

Dropping beside the socket should leave the lamps dark and the lift locked. A cell seated in the opening should light both lamps and open the path to the lift. Removing the cell should break the circuit. The check also covers all four boundaries, height, repeat updates, and driving through the doorway.

The check requires Python 3 and a C++17 compiler. The OpenGL 3.3 window needs CMake 3.20 and GLFW dependencies (Debian/Ubuntu: pkg-config xorg-dev libwayland-dev libxkbcommon-dev). Build with `cmake -S . -B build` and `cmake --build build`. WASD drives, E picks up and drops, B toggles outlines, and R resets the room. Compare with `e12-solution`; the full episode is tagged `ep12`.
