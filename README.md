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
