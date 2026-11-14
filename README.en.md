# E09 · Night Shift. A robot in the workshop

[Polski](README.md)

A small robot now lives in the scene from E08. Hold W for a second, press R to return to the start, then try W+D. The engine gives both runs exactly the same time. Should the robot cover the same distance?

## Your turn

```sh
git clone -b e09-start https://github.com/gamedevpl/silnik3d-od-zera.git
cd silnik3d-od-zera
python3 check.py
```

On Windows with Visual Studio, run `py -3 check.py` from a Developer Command Prompt. The check needs Python 3 and a C++17 compiler. It calls the same movement code as the game, stepping the clock 50 times at 20 ms for each combination of keys.

The start prints `W 2.00   W+D 2.83` and `RETRY`. Open [drive.hpp](drive.hpp) and change `direction`. Preserve the heading the player selected. One second of movement should cover two units in every direction, including diagonals. Opposing keys on one axis should cancel, and releasing every key should stop the robot.

Run the check again. Once you see `W 2.00   W+D 2.00` and `PASS`, compare your file with the [solution](https://github.com/gamedevpl/silnik3d-od-zera/tree/e09-solution).

```sh
git diff origin/e09-solution -- drive.hpp
```

## Open the workshop

You need CMake 3.20+, a C++17 compiler and a graphical session with OpenGL 3.3 core. GLFW and GLAD are included. On Debian or Ubuntu the default GLFW configuration also needs `pkg-config xorg-dev libwayland-dev libxkbcommon-dev`.

```sh
cmake -S . -B build
cmake --build build --config Release --target engine
./build/engine
```

With the Visual Studio generator, run `.\build\Release\engine.exe` for the last command. Drive with WASD, press R to reset the robot and its trail, or Esc to close the window. The robot can pass through the shelves at this stage. Movement lives in [workshop.hpp](workshop.hpp), keyboard input in [main.cpp](main.cpp) and drawing in [workshop_view.hpp](workshop_view.hpp).

[Engine after E08](https://github.com/gamedevpl/silnik3d-od-zera/tree/ep08) · [Game after E09](https://github.com/gamedevpl/silnik3d-od-zera/tree/ep09)
