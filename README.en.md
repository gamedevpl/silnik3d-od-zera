# E18 · Two lamps

Duplicate the lamp. Changing the copy should leave the original amber. Compare their IDs and shared model name.

`git clone -b e18-start https://github.com/gamedevpl/silnik3d-od-zera.git`

`python3 check.py` · `instances_edit.hpp` · `git diff origin/e18-solution -- instances_edit.hpp`

Build the viewer with `cmake -S . -B build`, `cmake --build build --target scene-view`, `./build/scene-view` (Visual Studio: build/Debug/scene-view.exe). C++17, OpenGL, OpenAL, GLFW; Linux: X11 development headers.

4 lamps · select lamp · D duplicate · C change bulb · S save.
