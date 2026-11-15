# E21 · Open the exported gallery

Disconnect the source folder. Follow the material reference and verify the bitmap bytes in the package.

`git clone -b e21-start https://github.com/gamedevpl/silnik3d-od-zera.git`

`python3 check.py` · `package.hpp` · `git diff origin/e21-solution -- package.hpp`

Build the viewer with `cmake -S . -B build`, `cmake --build build --target scene-view`, `./build/scene-view` (Visual Studio: build/Debug/scene-view.exe). C++17, OpenGL, OpenAL, GLFW; Linux: X11 development headers.

2 gallery · E export · F open last package · scene-view gallery-pack-1
