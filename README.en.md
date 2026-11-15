# E16 · What is under the cursor?

Open the gallery with 2. Click the sculpture in front of the left column. Press 3 and click the same pixel. Only the order of the rows has changed. Both clicks should select the sculpture. Click through a hole in the sculpture and you can select the visible column instead.

Run `python3 check.py` on `e16-start`. Fix hit selection in `pick` in `picking.hpp`. Compare the depth for each intersected model part. Compare your result with `e16-solution`.

Build with `cmake -S . -B build` and `cmake --build build --target scene-view`. Run `./build/scene-view` (Visual Studio: build/Debug/scene-view.exe). Requires C++17, CMake, OpenGL, bundled GLFW and OpenAL. On Linux install X11 development headers as well. Press 1 for the workshop or 2/3 for the gallery. Click an object and drag its red X handle. Release to stop. Grid spacing is half a world unit. S saves and opens a copy, R reloads it.
