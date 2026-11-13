# E06 · Światło i materiał / Light and material

PL. Dwa materiały mają chropowatość 0,15 i 0,92. Obejrzyj te same ujęcia kuli pod tą samą lampą. Odszukaj w lighting.hpp miejsce, w którym drawLit przesyła roughness do shadera. Zapisz poprawkę i ponów test. Oczekujemy dwóch wartości w GPU i większej powierzchni jasnego odblasku dla drugiej kuli.

EN. The materials use roughness 0.15 and 0.92. Compare the same sphere under the same lamp. In lighting.hpp find where drawLit sends roughness to the shader. Save your change and repeat the test. The GPU must receive two distinct values, and the second sphere should have a wider highlight.

```sh
git clone -b e06-start https://github.com/gamedevpl/silnik3d-od-zera.git
cd silnik3d-od-zera
python3 check.py
git diff origin/e06-solution -- lighting.hpp
```

The test requires a C++17 compiler, CMake, Python 3 and desktop OpenGL 3.3. Press M in the engine to compare the metal response on the right sphere. Arrow keys orbit and dolly the camera.
