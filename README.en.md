# E10 · The wall

Drive diagonally into the shelf on the right and keep holding W+D. The robot stops even though there is room to travel along the front edge. Change `moveRobot` in `collision.hpp` so it can slide along the shelf. Keep the two footprints clear throughout the run and preserve E09's diagonal speed in open space.

    git clone -b e10-start https://github.com/gamedevpl/silnik3d-od-zera.git
    cd silnik3d-od-zera
    python3 check.py

The test uses Python 3 and a C++17 compiler. During the last second the robot should travel about 1.41 units along X and finish less than 0.03 units from the shelf. Compare your result with `e10-solution`. Tag `ep10` contains the completed episode.

For the optional OpenGL 3.3 window, install CMake 3.20 and GLFW build dependencies (Debian/Ubuntu: `pkg-config xorg-dev libwayland-dev libxkbcommon-dev`). Run `cmake -S . -B build`, then `cmake --build build`, and launch `engine` in the build directory. WASD drives, B toggles collision outlines, R resets, and Esc quits.
