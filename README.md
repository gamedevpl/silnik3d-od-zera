# E00 · Uruchom puls tła

Kolor okna stoi w miejscu. W `frame.hpp` zostaw jeden czas startu i spraw, aby jasność zależała od czasu, który upłynął do bieżącej klatki. Sprawdź ciemną, jasną i ponownie ciemną fazę.

```sh
git clone -b e00-start https://github.com/gamedevpl/silnik3d-od-zera.git
cd silnik3d-od-zera
python3 check.py
```

Pierwsze uruchomienie pokazuje pomiar i `RETRY`. Zmień plik, zapisz i ponów `python3 check.py`, aż zobaczysz `PASS`. Test kompiluje kod z Twojego katalogu. Potrzebujesz Gita, Pythona 3 i kompilatora C++17 (GCC lub Clang). Porównaj swoją próbę z gałęzią rozwiązania bez przełączania plików roboczych:

```sh
git diff origin/e00-solution -- frame.hpp
```

Pełny stan końcowy odcinka ma tag `ep00`.

## Bring the pulse back

The window stays one colour. In `frame.hpp`, keep one start time and make the brightness follow the time elapsed up to the current frame. Check the dark, bright and dark phases.

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
