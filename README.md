# E12 · Gniazdo zasila warsztat

Zabierz ogniwo z prawego regału i odłóż obok żółtej ramki przed windą. Starter włącza prąd, mimo że styki są obok siebie. Napraw kontrolę dopasowania w `Socket::accepts` w pliku `socket.hpp`. Oprzyj ją na obrysie podstawy ogniwa i wewnętrznych krawędziach ramki.

    git clone -b e12-start https://github.com/gamedevpl/silnik3d-od-zera.git
    cd silnik3d-od-zera
    python3 check.py

Obok ramki lampy mają zostać ciemne, a drzwi windy zamknięte. Ogniwo mieszczące się w otworze ma włączyć lampy i odblokować przejście. Gdy wyjmiesz ogniwo, obwód powinien się rozłączyć. Próba sprawdza również każdy brzeg, kluczowe wysokości, zachowanie przy bezruchu i możliwość wjechania do windy.

Test wymaga Pythona 3 i kompilatora C++17. Do wersji okienkowej z OpenGL 3.3 potrzebne są CMake 3.20 i zależności GLFW (Debian/Ubuntu: pkg-config xorg-dev libwayland-dev libxkbcommon-dev). Zbuduj program przez `cmake -S . -B build` i `cmake --build build`. WASD porusza robotem, E podnosi i odkłada, B pokazuje obrysy, R wraca na początek. Rozwiązanie jest na `e12-solution`, a stan odcinka na `ep12`.

[English](README.en.md)
