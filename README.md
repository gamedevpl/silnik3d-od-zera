# E07 · Jedna siatka, dwa obiekty / One mesh, two instances

PL. Na ekranie są dwie kule z jednego pliku. Czy wczytaliśmy siatkę dwa razy? Uruchom próbę, porównaj obie ścieżki w exercise.cpp i nadaj im wspólny klucz w asset_cache.hpp. Porównaj liczbę odczytów i tożsamość siatki. Każda instancja ma własne położenie i materiał.

EN. Two spheres come from the same file. Did we read the mesh twice? Run the test, compare the two paths in exercise.cpp and give them one cache key in asset_cache.hpp. Compare the read count and the mesh identities. Each instance has its own pose and material.

```sh
git clone -b e07-path-start https://github.com/gamedevpl/silnik3d-od-zera.git
cd silnik3d-od-zera
python3 check.py
git diff origin/e07-solution -- asset_cache.hpp
```

The test requires Python 3 and a C++17 compiler. For the desktop scene use CMake and the project's GLFW prerequisites. Build target bake to convert assets/sphere.mesh into binary form and verify all attributes and triangle indices survive the round trip. The full checkpoint is ep07.
