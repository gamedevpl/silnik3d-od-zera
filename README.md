# E09 · Nocna zmiana. Robot w warsztacie

[English](README.en.md)

Na scenie z E08 stoi mały robot. Przytrzymaj W przez sekundę, wróć na początek klawiszem R i spróbuj W+D. W obu próbach silnik daje robotowi ten sam czas. Czy powinien pokonać tę samą drogę?

## Twoje zadanie

```sh
git clone -b e09-start https://github.com/gamedevpl/silnik3d-od-zera.git
cd silnik3d-od-zera
python3 check.py
```

Na Windowsie uruchom `py -3 check.py` z Developer Command Prompt, jeśli korzystasz z kompilatora Visual Studio. Test wymaga Pythona 3 i kompilatora C++17. Uruchamia ten sam kod ruchu co gra, po 50 kroków po 20 ms dla każdego zestawu klawiszy.

Na starcie dostaniesz `W 2.00   W+D 2.83` i `RETRY`. Otwórz [drive.hpp](drive.hpp) i zmień funkcję `direction`. Zachowaj kierunek wybrany przez gracza. Każda jazda przez sekundę, także po skosie, ma dać dwie jednostki drogi. Przeciwne klawisze na tej samej osi mają się znosić, a puszczenie klawiszy zatrzymywać robota.

Uruchom próbę ponownie. Po wyniku `W 2.00   W+D 2.00` i `PASS` możesz porównać swój plik z [rozwiązaniem](https://github.com/gamedevpl/silnik3d-od-zera/tree/e09-solution).

```sh
git diff origin/e09-solution -- drive.hpp
```

## Uruchom warsztat

Potrzebujesz CMake 3.20+, kompilatora C++17 i sesji graficznej z OpenGL 3.3 core. Repo zawiera GLFW i GLAD. Na Debianie lub Ubuntu domyślna konfiguracja GLFW potrzebuje pakietów `pkg-config xorg-dev libwayland-dev libxkbcommon-dev`.

```sh
cmake -S . -B build
cmake --build build --config Release --target engine
./build/engine
```

W konfiguracji Visual Studio ostatnie polecenie to `.\build\Release\engine.exe`. WASD prowadzi robota, R ustawia go z powrotem na początku i czyści ślad, Esc zamyka okno. W tym odcinku robot jeździ swobodnie, także przez regały. Kod ruchu znajdziesz w [workshop.hpp](workshop.hpp), odczyt klawiatury w [main.cpp](main.cpp), a rysowanie w [workshop_view.hpp](workshop_view.hpp).

[Stan silnika po E08](https://github.com/gamedevpl/silnik3d-od-zera/tree/ep08) · [Stan gry po E09](https://github.com/gamedevpl/silnik3d-od-zera/tree/ep09)
