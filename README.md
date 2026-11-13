# E07 · Jedna siatka, dwa obiekty / One mesh, two instances

PL. Na ekranie są dwie kule z jednego pliku. Czy wczytaliśmy siatkę dwa razy? Uruchom próbę, znajdź wyszukiwanie klucza w asset_cache.hpp, popraw je i powtórz. Porównaj liczbę odczytów i tożsamość siatki. Każda instancja ma własne położenie i materiał.

EN. Two spheres come from the same file. Did we read the mesh twice? Run the test, find the lookup in asset_cache.hpp, fix it and rerun. Compare the read count and the mesh identities. Each instance has its own pose and material.

```sh
git clone -b e07-start https://github.com/gamedevpl/silnik3d-od-zera.git
cd silnik3d-od-zera
python3 check.py
git diff origin/e07-solution -- asset_cache.hpp
```

The test requires Python 3 and a C++17 compiler. For the desktop scene use CMake and the project's GLFW prerequisites. Build target bake to convert assets/sphere.mesh into binary form and verify all attributes and triangle indices survive the round trip. The full checkpoint is ep07.
