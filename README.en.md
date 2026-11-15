# E20 · Play then return

Set the camera. Play, stop and repeat. Check X during motion and after returning to edit.

`git clone -b e20-start https://github.com/gamedevpl/silnik3d-od-zera.git`

`python3 check.py` · `preview.hpp` · `git diff origin/e20-solution -- preview.hpp`

Build the viewer with `cmake -S . -B build`, `cmake --build build --target scene-view`, `./build/scene-view` (Visual Studio: build/Debug/scene-view.exe). C++17, OpenGL, OpenAL, GLFW; Linux: X11 development headers.

2 gallery · left/right orbit · P play/stop · P play again.
