# Silnik w przeglądarce

`web/build.sh` buduje stan silnika z każdego tagu `epNN` do WebAssembly (Emscripten, WebGL 2) i zapisuje wynik w `docs/play/epNN/`. Strona serii otwiera go pod `play/?ep=epNN`.

Kod odcinków zostaje bez zmian. Różnice między OpenGL 3.3 core a WebGL 2 załatwia jeden nagłówek, `web/shim/glad/gl.h`, podstawiany zamiast GLAD:

- nagłówek shaderów `#version 330 core` zamienia na `#version 300 es`,
- `glfwSwapBuffers` oddaje sterowanie przeglądarce raz na klatkę (`-sASYNCIFY`), więc pętla `while` w `main` może zostać,
- tytuł okna trafia na pasek pod obrazem.

Po dodaniu nowego tagu:

```sh
source <emsdk>/emsdk_env.sh
web/build.sh docs/play ep10
```

Bez argumentów skrypt przebudowuje wszystkie tagi. Ćwiczenia (`check.py`) działają tylko lokalnie.
