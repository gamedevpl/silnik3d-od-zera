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

## E02 — od kwadratu do kostki

Na ep02-flat osiem wierzchołków daje cztery pozycje na ekranie. ep02-wire łączy osiem rzutowanych narożników. Żółty punkt pozwala śledzić orientację podczas skoku.

W ep02-euler kolejność obrotów to Y(yaw) · X(pitch) · Z(roll). ep02-quat-euler składa trzy kwaterniony z tych samych kątów. W ep02 kontroler przechowuje jedną orientację i mnoży ją z prawej strony przez przyrost wokół lokalnej osi.

    c++ -std=c++17 axes.cpp -o axes
    ./axes 60
    ./axes 90

Test porównuje obrócone osie bazowe po yaw +45° i roll −45°. Wypisuje największą odległość końców odpowiadających sobie wektorów jednostkowych. Do prób z filmu ustaw TURN=yaw lub TURN=roll i PITCH=60 lub PITCH=90 przy uruchamianiu engine. Bez tych zmiennych kostka skacze i obraca się wokół dwóch osi. Render jest ortograficzny, krawędzie rysuje test nożycowy OpenGL z E01.
