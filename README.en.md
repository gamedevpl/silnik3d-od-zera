# E19 · The hinged spotlight

Move the base, then turn it a quarter turn. Compare the head with the end of the arm and its footprint on the floor.

`git clone -b e19-start https://github.com/gamedevpl/silnik3d-od-zera.git`

`python3 check.py` · `hierarchy.hpp` · `git diff origin/e19-solution -- hierarchy.hpp`

Build the viewer with `cmake -S . -B build`, `cmake --build build --target scene-view`, `./build/scene-view` (Visual Studio: build/Debug/scene-view.exe). C++17, OpenGL, OpenAL, GLFW; Linux: X11 development headers.

5 arm · click base · drag X · T rotate 90° · S save.
