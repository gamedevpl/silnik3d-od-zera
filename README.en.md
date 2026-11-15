# E17 · One drag, one undo

Drag the column three steps, undo once, then redo. Try a new gesture after undo.

`git clone -b e17-start https://github.com/gamedevpl/silnik3d-od-zera.git`

`python3 check.py` · `history.hpp` · `git diff origin/e17-solution -- history.hpp`

Build the viewer with `cmake -S . -B build`, `cmake --build build --target scene-view`, `./build/scene-view` (Visual Studio: build/Debug/scene-view.exe). C++17, OpenGL, OpenAL, GLFW; Linux: X11 development headers.

2 gallery · click · drag the red X handle · U undo · Y redo.
