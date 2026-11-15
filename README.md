# E17 · Jedno przeciągnięcie, jedno Undo

Przeciągnij kolumnę przez trzy pola. Cofnij raz i ponów. Sprawdź też nowy gest po cofnięciu.

`git clone -b e17-start https://github.com/gamedevpl/silnik3d-od-zera.git`

`python3 check.py` · `history.hpp` · `git diff origin/e17-solution -- history.hpp`

Zbuduj okno przez `cmake -S . -B build`, `cmake --build build --target scene-view`, `./build/scene-view` (Visual Studio: build/Debug/scene-view.exe). C++17, OpenGL, OpenAL, GLFW; Linux: X11 development headers.

2 gallery · click · drag the red X handle · U undo · Y redo.
