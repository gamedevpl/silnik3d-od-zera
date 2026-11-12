# E02 · Build the cube in C++

## E02 Short · where the diagonal came from

The two experiments work from the repository root on `main` or beside `replay` in the extracted kit. You need Git, Vim, Python 3 and a C++17 compiler.

    git clone -b ep02-marked-rings silnik-3d.bundle ref
    cd ref
    vim mesh.hpp

From a GitHub clone use `git clone -b ep02-marked-rings . ref` for the first line. To watch the jump in a window, run `cmake -S . -B build -G Ninja` once in `ref`. In stock Vim the film’s `:Run` is equivalent for the viewer to `:!cmake --build build && ./build/engine`. Close the game window to return to Vim.

1. Type `:18` and press Enter. Type `yy` to copy the back edge and `p` to paste it. Save with `:w` and run. The two loops look the same. To check without graphics, run `:!python3 ../replay edges --source .` in Vim. There are 12 calls, with an empty list of side connections.
2. On line 19, type `0f+`, then `2x` and `:w`. Run the probe command again. The output now includes `1->6` among its side pairs. The call count is still 12.
3. Open `:e corners.hpp`. Of the front corners, only 1 and 2 match the x coordinate of six. Only two also matches y. Return with `:b#`. Type `/next` and press Enter. The cursor lands on `next` in the second argument.
4. Type `ciw`, then `i`, Esc and `:w`. Use `:!!` to repeat the last shell command. If the last command ran the game, enter the full probe command again. The sides are now `0->4 1->5 2->6 3->7`. Run the game to see the jumping cube.

To start with crossed sides, use `ep02-crossed-sides`. After opening mesh.hpp, enter `:19` and press Enter before step 3. The fixed tag is `ep02-wire`. From the kit directory `python3 replay edges` compares the three saved checkpoints.

## E02 · where the minus on roll comes from

From the main checkout, use `git clone -b ep02-euler . sign-edit`. From the offline kit use `git clone -b ep02-euler silnik-3d.bundle sign-edit`. Run `cd sign-edit` and `vim axes.cpp`.

Search for `/roll.turn`. Both calls pass 45°. Open `:e attitude.hpp` and search for `/roll -=`. The controller subtracts the argument from roll. Open `:e ../steer.cpp` and search for `/pose.turn(`. The Z key passes −1° for each of 45 steps, adding 45° to roll. Return with `:b axes.cpp`. On the line with the two calls, press `o` and add:

    std::printf("roll = %g deg\n", roll.roll / radians(1));

Press Esc, save with `:w`, then run `:!c++ -std=c++17 axes.cpp -o axes && ./axes 90`. In this separate test roll reads −45° and the largest distance between corresponding axis tips reads 0.000. Press Enter, remove the diagnostic with `u` and save with `:w`. Change the last argument of the shell command from 90 to 60. Now the gap is 0.383.

