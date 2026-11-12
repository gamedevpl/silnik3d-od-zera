# E01 · Ogranicz nadrabianie czasu

Jedna klatka trwa 333,333 ms, a symulacja pracuje w krokach po 20 ms. W `clock.hpp` ogranicz czas przyjmowany z jednej klatki do 250 ms. Zachowaj resztę dla następnej klatki. Sprawdź, czy 16 kroków zmieniło się w 12 i zostało 10 ms.

```sh
git clone -b e01-start https://github.com/gamedevpl/silnik3d-od-zera.git
cd silnik3d-od-zera
python3 check.py
```

Pierwsze uruchomienie pokazuje pomiar i `RETRY`. Zmień plik, zapisz i ponów `python3 check.py`, aż zobaczysz `PASS`. Test kompiluje kod z Twojego katalogu. Potrzebujesz Gita, Pythona 3 i kompilatora C++17 (GCC lub Clang). Porównaj swoją próbę z gałęzią rozwiązania bez przełączania plików roboczych:

```sh
git diff origin/e01-solution -- clock.hpp
```

Pełny stan końcowy odcinka ma tag `ep01`.

## Cap the catch-up time

A frame takes 333.333 ms and the simulation advances in 20 ms steps. In `clock.hpp`, cap the time accepted from one frame at 250 ms. Carry the remainder into the next frame. Check that 16 steps drop to 12 with 10 ms left.

Run the three commands above with Git, Python 3 and a C++17 compiler (GCC or Clang). The first run prints the measurement and `RETRY`. Edit the file, save it and rerun `python3 check.py` until it prints `PASS`. The diff command compares your working file against the solution branch. The full episode ends at the tag shown above.

# Silnik 3D w C++ od zera

Kod z sesji Gamedev.pl. Każdy odcinek rozwija jeden projekt.

## Budowanie

Potrzebujesz kompilatora C++17, CMake 3.20+ i Ninja. GLFW i GLAD znajdują się w katalogu `vendor/` wraz z licencjami. Na macOS potrzebne są Command Line Tools, a na Linuksie także pakiety deweloperskie systemu okienkowego obsługiwanego przez GLFW.

```sh
cmake -S . -B build -G Ninja
cmake --build build
./build/engine
```

Zamknij okno, aby zakończyć program. Nagrania powstały z kompilacji natywnej na macOS.
