# Silnik 3D w C++ od zera

Kod z sesji Gamedev.pl. Każdy odcinek rozwija jeden projekt.

## Powtórz próbę z filmu

Otwórz terminal w sklonowanym repozytorium na gałęzi `main`. Potrzebujesz Git, Pythona 3 i kompilatora C++17. E00 i E01 wymagają też CMake, Ninja i sesji graficznej z OpenGL. Wybierz swój odcinek.

| Odcinek | Polecenie | Co obserwować |
|---|---|---|
| E00 | `python3 replay 00` | Argument cosinusa i kolor jednego piksela w dwóch chwilach |
| E01 | `python3 replay 01` | Wysokość skoku i czas lądowania przy 30 i 240 FPS |
| E02 | `python3 replay 02` | Odległość osi po dwóch obrotach kostki przy nachyleniu 90° |

Skrypt pobiera etapy z lokalnej historii Git i buduje je w tymczasowym katalogu. Twój kod zostaje na bieżącej gałęzi. Zmianę warunku zegara możesz prześledzić poleceniem `git diff ep01-single-step ep01 -- clock.hpp`.

### Reproduce the experiment

From a clone on `main`, run one command from the table above. E00 measures the colour of a pixel over one second. E01 compares jumps at two frame rates. E02 compares yaw and roll after pitching the cube. You need Git, Python 3 and a C++17 compiler. The first two episodes also need CMake 3.20+, Ninja and a graphical OpenGL session. The tests build the tagged sources in temporary directories. Use a Git clone with its tags for these commands.

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
- `ep01-clock` – zegar jest napisany, ale jeszcze niepodłączony.
- `ep01-single-step` – przy 30 FPS zegar wykonuje tylko jeden zaległy krok. Stąd startuje próba z Shorta E01.
- `ep01` – kwadrat jest aktualizowany w krokach 20 ms.

Na przykład `git diff ep00-frozen ep00 -- frame.hpp` pokazuje poprawkę zatrzymanej animacji. Polecenia `:Run`, `:TryBuild` i `:Rates` z filmu należą do narzędzi nagraniowych Vima. W powyższym przepisie można uruchomić samodzielnie każdy etap od `ep00-window`.

## E02 — od kwadratu do kostki

Na ep02-flat osiem wierzchołków daje cztery pozycje na ekranie. ep02-wire łączy osiem rzutowanych narożników. Żółty punkt pozwala śledzić orientację podczas skoku.

W ep02-euler kolejność obrotów to Y(yaw) · X(pitch) · Z(roll). ep02-quat-euler składa trzy kwaterniony z tych samych kątów. W ep02 kontroler przechowuje jedną orientację i mnoży ją z prawej strony przez przyrost wokół lokalnej osi.

    c++ -std=c++17 axes.cpp -o axes
    ./axes 60
    ./axes 90

Test porównuje obrócone osie bazowe po yaw +45° i roll −45°. Wypisuje największą odległość końców odpowiadających sobie wektorów jednostkowych. Do prób z filmu ustaw TURN=yaw lub TURN=roll i PITCH=60 lub PITCH=90 przy uruchamianiu engine. Bez tych zmiennych kostka skacze i obraca się wokół dwóch osi. Render jest ortograficzny, krawędzie rysuje test nożycowy OpenGL z E01.

Przy końcu `python3 replay 01` pojawiają się dwie klatki przy 30 FPS. W drugiej przed wywołaniem kroku jest 46,667 ms. Pojedynczy warunek zostawia 26,667 ms, pętla 6,667 ms. Pomiar kompiluje rzeczywisty clock.hpp z obu etapów.

At the end of `python3 replay 01`, compare two frames at 30 FPS. On frame two the clock has 46.667 ms before the first step. The single check leaves 26.667 ms, the loop leaves 6.667 ms. The test compiles each checkpoint’s clock.hpp.
