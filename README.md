# E11 · Podnieś ogniwo

WASD dojedź pod prawy regał. Kiedy nad ogniwem pojawi się E, przytrzymaj klawisz. Robot podnosi i odkłada ogniwo wiele razy. Zmień `Cell::update` w `cell.hpp`, by jedno naciśnięcie dawało jedną akcję. Puść E, przejedź kawałek i naciśnij E ponownie, żeby odłożyć ogniwo.

    git clone -b e11-start https://github.com/gamedevpl/silnik3d-od-zera.git
    cd silnik3d-od-zera
    python3 check.py

Próba wymaga Pythona 3 i kompilatora C++17. Obejmuje sekundę trzymania E przy 50 odczytach wejścia, puszczenie, drugie naciśnięcie, zasięg, przewożenie i krótki nacisk między krokami ruchu. Celem jest jedna zmiana w pierwszej sekundzie i odłożenie po kolejnym naciśnięciu. Porównaj wynik z `e11-solution`. Pełny odcinek nosi tag `ep11`.

Okno OpenGL 3.3 wymaga CMake 3.20 i zależności GLFW (Debian/Ubuntu: pkg-config xorg-dev libwayland-dev libxkbcommon-dev). Wykonaj `cmake -S . -B build`, potem `cmake --build build`, i uruchom engine. WASD porusza robotem, E obsługuje ogniwo, B przełącza obrysy, R odtwarza start, Esc zamyka okno.

[English](README.en.md)
