# E21 · Otwórz na innym komputerze

Odłącz katalog wejściowy. Sprawdź, do którego pliku odsyła materiał i czy te same piksele znalazły się w paczce.

`git clone -b e21-start https://github.com/gamedevpl/silnik3d-od-zera.git`

`python3 check.py` · `package.hpp` · `git diff origin/e21-solution -- package.hpp`

Zbuduj okno przez `cmake -S . -B build`, `cmake --build build --target scene-view`, `./build/scene-view` (Visual Studio: build/Debug/scene-view.exe). C++17, OpenGL, OpenAL, GLFW; Linux: X11 development headers.

2 gallery · E export · F open last package · scene-view gallery-pack-1
