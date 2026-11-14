# E14 · Jeszcze jedna próba

Przejedź od regału do windy. Odłóż ogniwo w gnieździe i wjedź do kabiny. Na piętrze naciśnij R. Na początku następnej zmiany ogniwo wraca na regał, a pusta kabina powinna pozostać na dole. Na starcie ćwiczenia kabina rusza sama.

    git clone -b e14-start https://github.com/gamedevpl/silnik3d-od-zera.git
    cd silnik3d-od-zera
    python3 check.py

Popraw restart w shift.hpp. Po sekundzie bez wejścia wysokość pustej kabiny ma wynosić zero. Ukończ oba kursy w tym samym procesie. Po drugim licznik ma pokazać 2. Porównaj własną zmianę z e14-solution, a pełny projekt z tagiem ep14.

Do testu wystarczają Python 3 i kompilator C++17. Do gry potrzebujesz OpenGL 3.3, CMake 3.20+, OpenAL i zależności GLFW. W systemie Debian/Ubuntu zainstaluj libopenal-dev, pkg-config, xorg-dev, libwayland-dev i libxkbcommon-dev. Na Macu OpenAL dostarcza system. Zbuduj przez cmake -S . -B build i cmake --build build. WASD porusza, E podnosi i odkłada, B pokazuje obrysy, R rozpoczyna nową zmianę.

[English](README.en.md)
