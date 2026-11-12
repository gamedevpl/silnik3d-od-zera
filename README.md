# Silnik 3D w C++ od zera

Do prób graficznych potrzebujesz Git, Pythona 3, kompilatora C++17, CMake 3.20+, Ninja i sesji graficznej z OpenGL. Uruchom wybraną komendę w katalogu paczki lub na gałęzi main klonu.

## Jak zacząć od E00

W klonie zacznij od `git clone https://github.com/gamedevpl/silnik3d-od-zera.git` i `cd silnik3d-od-zera`. Jeśli korzystasz z paczki, rozpakuj `silnik-3d.zip` i otwórz terminal w katalogu z plikiem `replay`.

Aby dokładnie powtórzyć ruchy w Vimie, zacznij w tym samym katalogu. Paczka zawiera już plik `silnik-3d.bundle`. W klonie utwórz go poleceniem `git bundle create silnik-3d.bundle HEAD main --tags`. Następnie utwórz `work/engine` i przejdź do niego. W tym miejscu `git clone -q ../../silnik-3d.bundle ../../ref` tworzy kopię do podglądu, a `cp -R ../../ref/vendor .` umieszcza biblioteki w budowanym projekcie. Polecenia z tabeli poniżej uruchamiaj z katalogu zawierającego `replay`.

Przejdź E00 w Vimie od [pierwszego zapisu pliku](#e00--co-zapisuje-vim-a-co-uruchamia-powłoka) do [pierwszego celu CMake](#e00--co-właściwie-zbudował-ninja).

| Odcinek | Long | Short |
|---|---|---|
| E00 | `python3 replay setup` · `python3 probe-swaps`, `python3 replay clock` | `python3 replay pulse` |
| E01 | `python3 replay 01` · `python3 replay landing` · `python3 replay steps` | `python3 replay race` |
| E02 | Cały long: `python3 replay 02`. Same punkty z pierwszej minuty: `python3 replay corners`. | `python3 replay edges` |



## E02 Short · skąd się wzięła przekątna

Do próby wystarczą Git, Python 3 i kompilator C++17. W rozpakowanym zestawie, w katalogu z plikiem `replay`, utwórz roboczą kopię początkowej pomyłki:

    git clone -b ep02-crossed-sides silnik-3d.bundle ref
    cd ref
    vim mesh.hpp

W pełnym klonie z GitHuba, obok pliku `replay`, w pierwszym poleceniu użyj `git clone -b ep02-crossed-sides . ref`. Z Vima uruchom `:!python3 ../replay edges --source .`. Próbnik kompiluje zapisany `mesh.hpp` i wypisuje końce odcinków rzeczywiście podanych do `paper.line`. Jedna z czterech par to `1->6`.

Wpisz `:e corners.hpp` i znajdź róg, który ma takie same x i y jak szóstka. Wróć przez `:b#`. Przy wywołaniu `paper.line(dots[i], dots[next+4]);` ustaw kursor na słowie `next`. Wpisz `ciwi`, naciśnij Esc i zapisz plik przez `:w`. Polecenie `:!!` powtarza poprzedni test powłoki. Nadal są 12 krawędzi. Boki to teraz `0->4 1->5 2->6 3->7`. Polecenie `python3 replay edges` z katalogu paczki powtarza trzy zapisane etapy.

Aby odtworzyć także początek filmu, w pierwszym poleceniu wybierz tag `ep02-marked-rings`. W `mesh.hpp` ustaw kursor na wierszu 18. Naciśnij `yy`, następnie `p`. Na kopii ustaw kursor na pierwszym znaku `+`, usuń `+4` klawiszami `2x` i zapisz przez `:w`. Teraz możesz wykonać tę samą próbę dla skrzyżowanych boków.

## E02 · czy inna oś cofnie obrót?

W terminalu, obok `replay`, uruchom `python3 steer ep02-euler`. Biały pierścień zaznacza start żółtego narożnika 6. Naciśnij Y, poczekaj na koniec obrotu, a potem naciśnij Z. Y dodaje 45° yaw, Z dodaje 45° roll. Przy pochyleniu 90° narożnik wraca do pierścienia. Zamknij próbnik klawiszem Esc, uruchom `python3 steer ep02` i powtórz te same ruchy. Tym razem narożnik mija start. Zerem przywrócisz pozycję początkową. Pośredni etap z filmu, który składa kwaterniony z trzech kątów, możesz sprawdzić przez `python3 steer ep02-quat-euler`. Także tutaj po Z szóstka wraca do pierścienia.

Do tej próby wystarczą Git, Python 3 i kompilator C++17. Aby poeksperymentować ze źródłem w świeżym katalogu zestawu, wykonaj:

    git clone -b ep02-quat-euler silnik-3d.bundle ref
    cd ref
    vim attitude.hpp

W pełnym klonie z GitHuba zacznij w katalogu, w którym leżą skrypty `steer` i `replay`, i użyj `git clone -b ep02-quat-euler . ref` w pierwszym wierszu. Jeśli masz już katalog `ref` utworzony z pliku bundle obok tych skryptów, przejdź w nim do etapu poleceniem `git -C ref switch --detach ep02-quat-euler` z katalogu paczki, po czym wykonaj dwa pozostałe wiersze. W pliku zmień `else roll -= angle;` na `else roll += angle;`, zapisz przez `:w` i uruchom `:!python3 ../steer . --trace`. Po Z największy odstęp narożników od startu wynosi teraz 2,000000. Po cofnięciu zmiany przez `u` i zapisie powtórz próbę.

Program kompiluje nagłówek `attitude.hpp` z wybranego etapu. W Vimie otwartym w klonie `ref` obok skryptu z paczki wpisz `:!python3 ../steer .`, aby sprawdzić swój zapisany plik. Okno korzysta z Tkinter i Pillow 10.1 lub nowszej. Możesz wykonać to samo ćwiczenie liczbowo bez obu bibliotek przez `python3 steer ep02-euler --trace` i `python3 steer ep02 --trace`. Ostatnie wiersze podają największą odległość narożnika od jego własnej pozycji startowej. Wyniki po Z wynoszą 0,000000 i 1,780891.

## E02 · Pełny obrót

Polecenie `python3 replay turns` kompiluje pięć wersji mesh.hpp i mierzy pozycję narożnika 6 względem środka kostki przy skali 200. Porównaj pierwsze trzy pomiary. Wpisanie 360 bezpośrednio do aboutY przesuwa róg; po zamianie 360 stopni na radiany róg wraca na miejsce. Dwie ostatnie próby obracają kostkę o +45° wokół Y i −45° wokół Z.

Po rozpakowaniu ZIP-a zacznij w katalogu z tym plikiem README:

    git clone silnik-3d.bundle ref
    git -C ref worktree add --detach ../turn ep02-turn-360
    vim turn/mesh.hpp
    python3 replay turns --source turn

W klonie Git zacznij na gałęzi main:

    git worktree add --detach ../turn ep02-turn-360
    vim ../turn/mesh.hpp
    python3 replay turns --source ../turn

W Vimie zamień `aboutY(p,360)` na `aboutY(p,radians(360))`, zapisz i wyjdź przez `:wq`. Narożnik powinien wrócić z (−18, 101) do (276, 210).

## E00 · Co zapisuje Vim, a co uruchamia powłoka

Na macOS lub Linuksie do próby z początku filmu wystarczą Vim i kompilator C++. Zacznij w pustym katalogu.

    mkdir -p work/engine
    cd work/engine
    vim main.cpp

Wpisz `int main() {}` i zapisz przez `:w`. Wykonaj `:!c++ main.cpp -o hello`, wróć do edytora klawiszem Enter, a potem uruchom `:!./hello; echo $?`. Zobaczysz jedynie kod wyjścia 0. Dopisz `#include <cstdio>` nad main i `std::puts("engine online");` w jego ciele, po czym zapisz plik. Ponownie uruchom hello. Stary program wciąż nic nie wypisuje. Polecenie `:!ls -1t main.cpp hello` pokaże nowszy main.cpp na górze. Powtórz kompilację, a potem uruchomienie. Tym razem zobaczysz „engine online” i zero.

## E00 · Co właściwie zbudował Ninja?

Kontynuuj w swoim nowym katalogu `work/engine`, w którym `main.cpp` wypisuje „engine online”. Do tego kroku potrzebujesz też CMake 3.20 lub nowszego oraz programu Ninja w PATH. W Vimie otwórz `:e CMakeLists.txt`, wpisz poniższe trzy wiersze i zapisz przez `:w`.

    cmake_minimum_required(VERSION 3.20)
    project(Engine LANGUAGES C CXX)
    set(CMAKE_CXX_STANDARD 17)

Uruchom `:!cmake -S . -B build -G Ninja`, naciśnij Enter, aby wrócić do Vima, i spróbuj `:!cmake --build build && ./build/engine`. CMake wygenerował reguły w `build/build.ninja`. Ninja zgłasza `no work to do`, a powłoka nie znajduje pliku `build/engine`.

Wróć klawiszem Enter. W trybie normalnym naciśnij `G`, następnie `o` i dopisz `add_executable(engine main.cpp)`. Naciśnij Esc, zapisz przez `:w` i wykonaj `:!!`. To samo polecenie przebuduje projekt i uruchomi program. Tym razem po kompilacji i linkowaniu pojawi się „engine online”.

## E00 · Od pierwszego include do uruchomienia GLAD

Uruchom `python3 replay setup` w sesji graficznej. Pierwsze dwie kompilacje zatrzymują się na brakujących nagłówkach GLAD i GLFW. Trzecia uruchamia GLFW. Kolejne dwie tworzą okno 640 × 360 i odczytują wersję kontekstu, najpierw domyślną, potem po zażądaniu OpenGL 3.3 core. Na Macu użytym w filmie były to 2.1 i 4.1. Wynik na Twoim komputerze zależy od sterownika. Dwie ostatnie próby ładują funkcje OpenGL przed uaktywnieniem kontekstu i po nim. Tę jedną zmianę możesz porównać w klonie.

    git diff ep00-loader-before ep00-loader-after -- main.cpp

## E01 · dlaczego kwadrat stanął przy 240 FPS?

Uruchom `python3 replay steps`. Próbnik kompiluje trzy wersje pętli w draw() i końcowy zegar, po czym liczy rzeczywiste wywołania Jumper.update w ukrytym oknie OpenGL. Po 0,667 s warunek na czas pojedynczej klatki daje 20 kroków przy 30 FPS i zero przy 240 FPS. Zbieranie czasu daje 20 i 33. Pętla rozliczająca każdy pełny krok daje 33 i 33, także po wydzieleniu clock.hpp.

Przy 2,000000 s zapas zapisany w double jest odrobinę mniejszy od kroku 20 ms. Oba liczniki pokazują 99. Cztery ostatnie wiersze próby wypisują zapas z pełną dokładnością oraz kolejną klatkę: przy 30 FPS jest w niej już 101 kroków, przy 240 FPS jest 100.

Aby zmienić warunek samodzielnie, z katalogu zawierającego ten plik wykonaj:

    git worktree add --detach ../test-clock ep01-inline-bank

W `../test-clock/main.cpp` zamień `if (lag >= 0.02)` na `while (lag >= 0.02)`, zapisz i uruchom:

    python3 replay steps --source ../test-clock

## E01 · lądowanie na podłodze

Grawitacja i drugie odbicie. Uruchom `python3 replay landing`. W klatce 20 przy 30 FPS porównaj `ep01-fall`, `ep01-clamp` i `ep01-bounce`. Po samym ustawieniu wysokości na zero prędkość wynosi −263,3. Po przywróceniu +270 kwadrat w klatce 21 znów znajduje się nad podłogą. Każdy etap możesz też samodzielnie skompilować i otworzyć jego okno.

Do tej próby liczbowej wystarczą Git, Python 3 i kompilator C++17. W katalogu zestawu utwórz kopię do edycji:

    git worktree add --detach ../skok ep01-clamp

W `../skok/frame.hpp` dopisz `speed = 120;` pod wciętym `height = 0;` w warunku kontaktu. Zapisz plik. Z tego samego katalogu wywołaj:

    python3 replay landing --source ../skok

W klatce 20 otrzymasz prędkość +120,0. Klatkę później wysokość wynosi już 3,1.

## E02 · punkty / corner experiment

Na gałęzi main uruchom `python3 replay corners`. The command traces six builds from one old square through eight projected corners. To change the second corner yourself, make a clean worktree:

    git worktree add --detach ../e02-points ep02-stacked-corners
    c++ -std=c++17 -I../e02-points corner-trace.cpp -o ../e02-points/points
    ../e02-points/points

Zmień corners[2] na corners[3] w pliku ../e02-points/mesh.hpp i powtórz obie ostatnie komendy.

## E02 · test przy 89° / the 89° test

Na gałęzi main uruchom `python3 replay 02`. From main this repeats the 60°, 89° and 90° Euler test and compares all three controllers at 90°. Requires Git, Python 3 and a C++17 compiler. Własny kąt sprawdzisz w osobnym katalogu roboczym:

    git worktree add --detach ../e02-angles ep02-euler
    cd ../e02-angles
    c++ -std=c++17 axes.cpp -o axes
    ./axes 89
    ./axes 90

## Short E01 · skok przy 15 FPS

W katalogu zestawu uruchom `python3 replay race`. Pięć prób porównuje czas pierwszego kontaktu z ziemią przy wybranej liczbie klatek i przy 240 FPS. Próbnik zatrzymuje skok po pierwszym kontakcie wewnątrz kroku fizyki. Dzięki temu wykrywa też lądowanie, po którym postać odbiłaby się przed kolejną klatką. Podany czas oznacza chwilę klatki zawierającej kontakt. Dokładność ogranicza czas jednej klatki.

Polecenie `python3 replay frame` porównuje jedną klatkę z filmu przed poprawką i po niej. Wystarczą Git, Python 3 i kompilator C++17. Możesz też własnoręcznie zmienić warunek.

Na gałęzi main otwórz etap z nieudanym testem w osobnym katalogu.

    git worktree add --detach ref ep01-matched-tick
    cd ref
    vim clock.hpp

W Vimie wpisz `:!python3 ../frame 15` i naciśnij Enter. Próbnik C++ korzysta z clock.hpp z bieżącego katalogu. Po pierwszym przebiegu zostaje 33,333 ms. Naciśnij Enter, by wrócić do edytora. W clock.hpp zmień `if (lag >= tick)` na `while (lag >= tick)`, zapisz przez `:w` i ponów tę samą komendę. W tej samej klatce 66,667 ms zmieszczą się dwa kroki, a reszta wyniesie zero. Wywołanie clock.advance znajdziesz przez `:e ../clock-trace.cpp` i `13G`. Aby porównać również lądowania, wpisz `:!python3 ../race 15`.

From the ref directory, open clock.hpp in Vim and run `:!python3 ../frame 15`. Replace if with while, save with `:w`, and repeat the same command. The remaining time drops from 33.333 ms to zero.

Kod z sesji Gamedev.pl. Każdy odcinek rozwija jeden projekt.

## Powtórz próbę z filmu

Otwórz terminal w sklonowanym repozytorium na gałęzi `main`. Potrzebujesz Git, Pythona 3 i kompilatora C++17. E00 i E01 wymagają też CMake, Ninja i sesji graficznej z OpenGL. Wybierz swój odcinek.

| Odcinek | Polecenie | Co obserwować |
|---|---|---|
| E00 | `python3 replay clock` | Argument cosinusa i kolor jednego piksela w dwóch chwilach |
| E01 | `python3 replay 01` | Wysokość skoku i czas lądowania przy 30 i 240 FPS |
| E02 | `python3 replay 02` | Odległość osi po dwóch obrotach kostki przy nachyleniu 90° |

Skrypt pobiera etapy z lokalnej historii Git i buduje je w tymczasowym katalogu. Twój kod zostaje na bieżącej gałęzi. Zmianę warunku zegara możesz prześledzić poleceniem `git diff ep01-single-step ep01 -- clock.hpp`.

For the E01 Short, run `python3 replay race`. It measures the first rendered frame containing a landing at 15 or 30 FPS and at 240 FPS.

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

W E00 polecenie `python3 replay 00` najpierw liczy prezentacje bufora. Próbnik prosi okno o zamknięcie przy ósmej prezentacji. W ep00-one-frame program sam kończy się po jednej, w ep00-draw-loop dochodzi do ośmiu. Po przeniesieniu rysowania do frame.hpp (ep00-window) ponownie otrzymujemy osiem. Każdy wiersz RGB pochodzi z odczytu piksela przed zamianą buforów.
From work/engine, run `python3 ../../probe-swaps .` to measure the source you just saved. In stock Vim type `:!python3 ../../probe-swaps .`. This is the terminal equivalent of the filmed :Swaps shortcut.

Na początku `python3 replay 01` odtwarza cztery wersje rysowania kwadratu. W kolumnach bg_test i box_test jest faktyczny wynik glIsEnabled(GL_SCISSOR_TEST) przy czyszczeniu tła i kwadratu. Po 30 klatkach porównaj kolory środka i rogu. Próbnik czyta ten sam tylny bufor przed prezentacją, ze stałym zegarem 30 Hz. W katalogu work/engine polecenie `python3 ../../probe-scissor .` mierzy zapisany kod.

The first part of `python3 replay 01` runs four versions of the square. bg_test and box_test report glIsEnabled(GL_SCISSOR_TEST) at the background and box clears. Compare the centre and corner colours 30 frames apart. The diagnostic samples the same back buffer before presentation using a fixed 30 Hz clock. From work/engine run `python3 ../../probe-scissor .` to measure your own saved code.

W pionowym E02 uruchom `python3 replay edges`. Program kompiluje mesh.hpp z trzech etapów i zapisuje końce odcinków przekazanych do paper.line. Dwie ramki mają osiem odcinków. W obu kolejnych wersjach jest dwanaście. W ep02-crossed-sides wśród par jest 1→6, w ep02-wire jest 2→6. Wymagane Git, Python 3 i kompilator C++17.

For the vertical E02 experiment run `python3 replay edges`. This compiles mesh.hpp at three checkpoints and records the endpoints sent to paper.line. The two loops contain eight edges. Both later versions contain twelve. The crossed build includes 1→6, the repaired build includes 2→6. Requires Git, Python 3 and a C++17 compiler.

### Short E00

W katalogu po rozpakowaniu paczki lub na gałęzi main uruchom `python3 replay pulse`. Python buduje i uruchamia rzeczywisty projekt C++. Wszystkie cztery próby zaczynają się w 0,20 s. W trzeciej elapsed zmienia się z 0,000 na 1,000, ale argument cosinusa pozostaje równy 0,360. W czwartej argument zmienia się z 0,000 na 1,800 i piksel zmienia kolor.

    git worktree add --detach ../pulse-edit ep00-unused-elapsed

W `../pulse-edit/frame.hpp` zmień tylko `cos(start * 1.8)` na `cos(elapsed * 1.8)`. Po zapisie uruchom w dotychczasowym katalogu:

    python3 replay pulse --source ../pulse-edit

### E00 · zegar i pomarańczowy piksel

W 4:04 zobaczysz pomiar liczby klatek. Po rozpakowaniu paczki użyj `python3 probe-swaps` w jej głównym katalogu. W 5:11 zaczynają się cztery próby z zegarem. Powtórz je z tego samego katalogu poleceniem `python3 replay clock`. Próbnik ustawia pierwszą klatkę na 0,2 s, potem porównuje argument cosinusa i piksel z odczytem przy 1,2 s.

W katalogu głównym klonu dodaj osobny katalog na ćwiczenie:

    git worktree add --detach ref ep00-static-elapsed
    cd ref
    python3 ../probe . arg --start-time 0.2

Przed edycją oba argumenty wynoszą zero. W ref/frame.hpp usuń tylko static z deklaracji elapsed. Powtórz ostatnie polecenie. Drugi argument wzrośnie do 1,800. Obie zapisane wersje porównasz przez git diff ep00-static-elapsed ep00 -- frame.hpp w ref.
