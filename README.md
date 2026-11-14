# E13 · Słychać, że działa

Odłóż ogniwo w gnieździe i zostaw je tam przez sekundę. Ile razy powinien odezwać się zatrzask? W silniku są trzy krótkie dźwięki. Podniesienie ogniwa daje narastający ton, styk gniazda metaliczny klik, a wjazd do zasilonej windy niski dźwięk silnika.

    git clone -b e13-start https://github.com/gamedevpl/silnik3d-od-zera.git
    cd silnik3d-od-zera
    python3 check.py

W sound.hpp porównaj bieżące zasilanie z poprzednim. Zatrzask ma odezwać się dokładnie raz, również przy ponownym osadzeniu po wyjęciu ogniwa. Sprawdź oba zdarzenia i licznik po sekundzie. Rozwiązanie: e13-solution. Pełny stan: ep13.

Test wymaga Pythona 3 i kompilatora C++17. Do gry potrzebujesz OpenGL 3.3, CMake 3.20+, OpenAL i zależności GLFW. Na Debianie/Ubuntu zainstaluj libopenal-dev, pkg-config, xorg-dev, libwayland-dev i libxkbcommon-dev. W macOS OpenAL jest częścią systemu. Zbuduj za pomocą cmake -S . -B build i cmake --build build. WASD porusza, E podnosi i odkłada ogniwo, R przywraca początek.

[English](README.en.md)
