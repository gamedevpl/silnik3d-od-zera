# E18 · Dwie lampy

Zduplikuj lampę. Po zmianie barwy kopii pierwsza powinna pozostać bursztynowa. Sprawdź identyfikatory i wspólną nazwę modelu.

`git clone -b e18-start https://github.com/gamedevpl/silnik3d-od-zera.git`

`python3 check.py` · `instances_edit.hpp` · `git diff origin/e18-solution -- instances_edit.hpp`

Zbuduj okno przez `cmake -S . -B build`, `cmake --build build --target scene-view`, `./build/scene-view` (Visual Studio: build/Debug/scene-view.exe). C++17, OpenGL, OpenAL, GLFW; Linux: X11 development headers.

4 lamps · select lamp · D duplicate · C change bulb · S save.
