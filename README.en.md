# E15 · The first scene file

Run `python3 check.py`. It saves two objects and reads their text back. The shelf should return to (−3.70, 0, −2.87) and the sculpture to (1.25, 0.58, −0.75). On e15-start two coordinates change places during saving. Read the output, edit writeScene in layout.hpp and run the test again. Compare with e15-solution.

Build with `cmake -S . -B build` and `cmake --build build --target scene-view`. Run `./build/scene-view` (Visual Studio: build/Debug/scene-view.exe). Requires CMake, C++17, OpenGL 3.3, GLFW platform dependencies and OpenAL. Linux builds of GLFW require X11 development headers.

Press 1 for the workshop or 2 for the gallery. Edit assets/scenes/gallery.scene and press R to reload the current document. S saves and opens copy.scene in your working directory. The first line is scene 1. Each object then supplies a model name and its X Y Z position. You can also pass a custom scene path on the command line. All models consist of boxes. The engine target still runs the E14 game.
