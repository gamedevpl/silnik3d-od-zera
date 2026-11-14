# E13 · Hear it click

Leave the cell in the socket for a second. How many times should the latch click? Pickup makes a rising chirp, seating the cell makes a metal click and entering the powered lift starts its motor.

    git clone -b e13-start https://github.com/gamedevpl/silnik3d-od-zera.git
    cd silnik3d-od-zera
    python3 check.py

In sound.hpp compare the current and previous power states. The latch should click once per insertion, including when you remove the cell and put it back. Verify the call counts after one second. Compare your code with e13-solution. The episode snapshot is ep13.

The check needs Python 3 and a C++17 compiler. The game also needs OpenGL 3.3, CMake 3.20+, OpenAL and the GLFW platform headers. On Debian/Ubuntu install libopenal-dev, pkg-config, xorg-dev, libwayland-dev and libxkbcommon-dev. macOS includes OpenAL. Build with cmake -S . -B build and cmake --build build. Use WASD to drive, E to pick up or drop, and R to reset.
