# E02 · Wyprostuj boki kostki

Kostka ma już dwanaście krawędzi, ale boki idą na skos. W `mesh.hpp` popraw połączenia między dwiema ramkami. Sprawdź wszystkie cztery pary. Do żółtego narożnika 6 ma prowadzić narożnik 2.

```sh
git clone -b e02-start https://github.com/gamedevpl/silnik3d-od-zera.git
cd silnik3d-od-zera
python3 check.py
```

Pierwsze uruchomienie pokazuje pomiar i `RETRY`. Zmień plik, zapisz i ponów `python3 check.py`, aż zobaczysz `PASS`. Test kompiluje kod z Twojego katalogu. Potrzebujesz Gita, Pythona 3 i kompilatora C++17 (GCC lub Clang). Porównaj swoją próbę z gałęzią rozwiązania bez przełączania plików roboczych:

```sh
git diff origin/e02-solution -- mesh.hpp
```

Pełny stan końcowy odcinka ma tag `ep02`.

## Straighten the sides of the cube

The cube has twelve edges, but its sides run diagonally. In `mesh.hpp`, fix the connections between the two face loops. Check all four pairs. Corner 2 should connect to the yellow corner 6.

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

## Etapy serii

- `start` – pusty katalog.
- `ep00-hello` – skompiluj przez `c++ main.cpp -o hello` i uruchom `./hello`.
- `ep00-window` – pierwsze pomarańczowe okno.
- `ep00-frozen` – kolor utknął. Stąd startuje Short E00.
- `ep00` – pulsujące tło; dokładnie ten projekt otwiera long E01.
- `ep01-variable` – kwadrat skacze, wysokość zależy od czasu klatki.
- `ep01-clock` – zegar jest napisany, ale jeszcze niepodłączony. Stąd startuje Short E01.
- `ep01` – kwadrat jest aktualizowany w krokach 20 ms.

Na przykład `git diff ep00-frozen ep00 -- frame.hpp` pokazuje poprawkę zatrzymanej animacji. Polecenia `:Run`, `:TryBuild` i `:Rates` z filmu należą do narzędzi nagraniowych Vima. W powyższym przepisie można uruchomić samodzielnie każdy etap od `ep00-window`.
