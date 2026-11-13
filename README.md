# E03 · Pierwsza pełna ściana / The First Solid Face

PL. W buforze są trzy narożniki. W trybie trójkątów wnętrze ściany nadal ma kolor tła. Uruchom `python3 check.py`, odszukaj wywołanie rysowania w `face.hpp` i zmień liczbę pobieranych wierzchołków. Powtórz próbę. Zielony kanał piksela wewnątrz trójkąta powinien wzrosnąć, a piksel poza nim ma pozostać czarny.

EN. The buffer holds three corners. In triangle mode the interior still has the background colour. Run `python3 check.py`, find the draw call in `face.hpp`, and change the number of vertices it consumes. Repeat the test. The inside pixel should gain green while the outside pixel stays black.

Requires Git, Python 3, CMake 3.20+, a C++17 toolchain and a desktop OpenGL 3.3 context. Linux also needs the development packages for the bundled GLFW window backend.

```sh
git clone -b e03-start https://github.com/gamedevpl/silnik3d-od-zera.git
cd silnik3d-od-zera
python3 check.py
git diff origin/e03-solution -- face.hpp
```

Starting exercise: `e03-start`. Solved exercise: `e03-solution`. Complete episode: `ep03`.
