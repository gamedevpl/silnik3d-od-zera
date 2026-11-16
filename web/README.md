# Silnik w przeglądarce

`web/build.sh` buduje stan silnika z każdego tagu `epNN` do WebAssembly (Emscripten, WebGL 2) i zapisuje wynik w `docs/play/epNN/`. Te pliki nie są w repo: przy każdym pushu na `main` albo nowym tagu `epNN` robi je workflow `.github/workflows/pages.yml` i publikuje razem ze stroną. Strona serii otwiera go pod `play/?ep=epNN`.

Kod odcinków zostaje bez zmian. Różnice między OpenGL 3.3 core a WebGL 2 załatwia jeden nagłówek, `web/shim/glad/gl.h`, podstawiany zamiast GLAD:

- nagłówek shaderów `#version 330 core` zamienia na `#version 300 es`,
- `glfwSwapBuffers` oddaje sterowanie przeglądarce raz na klatkę (`-sASYNCIFY`), więc pętla `while` w `main` może zostać,
- tytuł okna trafia na pasek pod obrazem.

Od E13 WebAudio odtwarza próbki wygenerowane w C++ przez OpenAL. Kliknij obraz gry, a potem podnieś ogniwo klawiszem E.

Lokalnie, żeby obejrzeć stronę z odtwarzaczem:

```sh
source <emsdk>/emsdk_env.sh
web/build.sh            # wszystkie tagi do docs/play
node web/ask-source.mjs # źródła C++ dla czatu w demku
python3 -m http.server --directory docs 8000
```

Ćwiczenia (`check.py`) działają tylko lokalnie.
