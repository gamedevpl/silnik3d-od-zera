# E08 · Kto dostał stare zaznaczenie? / Who got the old selection?

PL. Zaznaczamy A, usuwamy je i dodajemy B. B otrzymuje wolny indeks. Sprawdź, czy przesunięcie przez stare zaznaczenie zmienia B. W scene.hpp dopisz sprawdzenie pokolenia uchwytu w valid(). Powtórz próbę. Stary uchwyt ma być odrzucony, a nowy nadal przesuwa B.

EN. Select A, remove it and add B in the same slot. Check whether moving the old selection moves B. In scene.hpp make valid() compare the handle's generation, then repeat the test. The old handle should be rejected while the new one still moves B.

```sh
git clone -b e08-start https://github.com/gamedevpl/silnik3d-od-zera.git
cd silnik3d-od-zera
python3 check.py
git diff origin/e08-solution -- scene.hpp
```

The exercise needs Python 3 and a C++17 compiler. Build the desktop engine with CMake and the project's GLFW prerequisites. Tab cycles selection; X deletes; N creates an object in the middle. Creation deliberately keeps the previous selection so the old-handle experiment can be repeated. A/D and W/S move the selected object horizontally and vertically. Arrow keys orbit and dolly the camera. The window title shows the selected handle and whether it is live. The full season checkpoint is ep08.
