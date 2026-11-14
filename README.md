# E15 · Pierwszy plik sceny

Uruchom `python3 check.py`. Test zapisuje dwa obiekty do strumienia tekstowego i odczytuje je tak samo jak plik. W kopii oczekuje regału w (−3,70, 0, −2,87) i rzeźby w (1,25, 0,58, −0,75). Na gałęzi e15-start zapis zamienia dwie współrzędne. Obejrzyj wynik, popraw writeScene w layout.hpp i ponów próbę. Rozwiązanie jest na e15-solution.

Zbuduj `cmake -S . -B build` i `cmake --build build --target scene-view`. Uruchom `./build/scene-view` (Visual Studio: build/Debug/scene-view.exe). Potrzebujesz CMake, kompilatora C++17, OpenGL 3.3 oraz bibliotek wymaganych przez GLFW i OpenAL. Na Linuksie do kompilacji GLFW potrzebne są nagłówki deweloperskie X11.

1 otwiera warsztat, 2 galerię. Edytuj assets/scenes/gallery.scene, zapisz i naciśnij R w oknie, aby ponownie wczytać aktywny dokument. S zapisuje kopię do copy.scene w katalogu roboczym i otwiera ją. Plik zaczyna się od scene 1. Każdy kolejny obiekt podaje nazwę modelu i jego X Y Z. Możesz też przekazać własny plik jako argument. Modele składają się z prostopadłościanów. Cel engine nadal uruchamia grę z E14.
