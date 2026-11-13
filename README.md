# E05 · Tekstura w ruchu / Texture in motion

PL. Przytrzymaj U, aby obejrzeć cztery oznaczone narożniki tekstury, lub puść U i obejrzyj podłogę w perspektywie. Użyj strzałek jak w E04. Podczas ruchu odległa szachownica migocze. W texture.hpp sprawdź, który filtr pomniejszania wybiera silnik. Poziomy od 128 × 128 do 1 × 1 już istnieją. Wybierz filtr trójliniowy i uruchom próbę ponownie.

EN. Hold U to inspect the four marked corners, or release U and use the E04 arrow keys to move the camera over the tiled floor. The distant checks shimmer. In texture.hpp inspect the minification filter. Levels from 128 × 128 down to 1 × 1 already exist. Select trilinear filtering and repeat the test.

```sh
git clone -b e05-start https://github.com/gamedevpl/silnik3d-od-zera.git
cd silnik3d-od-zera
python3 check.py
git diff origin/e05-solution -- texture.hpp
```

Git, Python 3, CMake 3.20+, a C++17 compiler, GLFW development prerequisites and OpenGL 3.3 are required. The complete episode checkpoint is ep05.
