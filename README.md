# E10 · Ściana

Wjedź ukośnie w prawy regał i trzymaj W+D. Robot zatrzymuje się przy krawędzi, chociaż obok jest miejsce. Zmień funkcję `moveRobot` w `collision.hpp`, aby mógł sunąć wzdłuż regału. Podczas całej próby obrysy robota i regału mają się mijać. Na tej samej przekątnej w pustym miejscu robot zachowuje prędkość z E09.

    git clone -b e10-start https://github.com/gamedevpl/silnik3d-od-zera.git
    cd silnik3d-od-zera
    python3 check.py

Próba wymaga Pythona 3 i kompilatora C++17. W ciągu ostatniej sekundy ruchu droga wzdłuż X powinna wynieść około 1,41, a szczelina przed regałem ma być mniejsza od 0,03. Porównaj wynik z gałęzią `e10-solution`. Gotowy odcinek jest pod tagiem `ep10`.

Opcjonalne okno OpenGL 3.3 wymaga CMake 3.20 i zależności GLFW (na Debianie/Ubuntu `pkg-config xorg-dev libwayland-dev libxkbcommon-dev`). Wykonaj `cmake -S . -B build`, następnie `cmake --build build`, i uruchom `engine` z katalogu kompilacji. WASD porusza robotem, B przełącza obrysy, R odtwarza start, Esc zamyka okno.

[English](README.en.md)
