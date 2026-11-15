# E20 · Uruchom i wróć

Ustaw kadr. Uruchom eksponat, zatrzymaj go i powtórz próbę. Sprawdź X w trakcie ruchu i po powrocie do edycji.

`git clone -b e20-start https://github.com/gamedevpl/silnik3d-od-zera.git`

`python3 check.py` · `preview.hpp` · `git diff origin/e20-solution -- preview.hpp`

Zbuduj okno przez `cmake -S . -B build`, `cmake --build build --target scene-view`, `./build/scene-view` (Visual Studio: build/Debug/scene-view.exe). C++17, OpenGL, OpenAL, GLFW; Linux: X11 development headers.

2 gallery · left/right orbit · P play/stop · P play again.
