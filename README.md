# E16 · Co jest pod kursorem?

Kliknij rzeźbę na tle lewej kolumny w galerii (2). Otwórz ten sam układ z inną kolejnością wierszy (3). Kliknij dokładnie to samo miejsce. W obu próbach ma zaświecić się rzeźba. W otworze w rzeźbie można zaznaczyć widoczną za nim kolumnę.

Na gałęzi `e16-start` uruchom `python3 check.py`. Popraw wybór trafienia w `pick` w pliku `picking.hpp`. Znaczenie ma głębokość trafienia w konkretną część modelu. Porównaj z `e16-solution`.

Do uruchomienia okna potrzebujesz CMake, C++17, OpenGL, GLFW (w repo) i OpenAL. Na Linuksie zainstaluj też nagłówki X11. Wykonaj `cmake -S . -B build` i `cmake --build build --target scene-view`. Uruchom `./build/scene-view` (Visual Studio: build/Debug/scene-view.exe). 1 otwiera warsztat, 2 i 3 galerię. Po zaznaczeniu przeciągnij czerwony uchwyt osi X i puść przycisk. Skok siatki wynosi pół jednostki. S zapisuje i otwiera kopię, R wczytuje ponownie. Cel engine nadal uruchamia grę.
