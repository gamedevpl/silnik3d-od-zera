# E04 · Kamera i głębia / Camera and Depth

PL. Dwie ściany nakładają się w środku kadru. Miętowa jest bliżej. Uruchom próbę w obu kolejnościach rysowania. W depth.hpp znajdź beginFrame(). Bufor głębi jest dostępny i czyszczony. Włącz porównywanie głębi, zapisz plik i powtórz próbę. W obu przypadkach środkowy piksel powinien być miętowy.

EN. Two panels overlap at the centre. The mint one is closer. Run both drawing orders. In depth.hpp find beginFrame(). The depth buffer exists and is cleared. Enable depth comparisons, save, and run the test again. The central pixel should be mint in both orders.

```sh
git clone -b e04-start https://github.com/gamedevpl/silnik3d-od-zera.git
cd silnik3d-od-zera
python3 check.py
git diff origin/e04-solution -- depth.hpp
```

Git, Python 3, CMake 3.20+, a C++17 compiler, GLFW development prerequisites and a desktop OpenGL 3.3 context are required. The full engine at tag ep04 uses Left/Right to orbit and Up/Down to move in/out. Space pauses or resumes the cube simulation. Camera controls remain active while paused.
