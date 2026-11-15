# Lumen Lab

Demo do filmu „Ujarzmić fotony: 40 lat światła i cienia w grach” (YouTube, GamedevPL). Jedna scena (trzy kolumny, postać, latarnia) i czterdzieści lat sztuczek ze światłem: paleta, cień-kółko, Gouraud, lightmapy, bryły cieni, mapy cieni, deferred, SSAO, PBR, path tracing, ReSTIR, pola odległości.

**Uruchom w przeglądarce:** https://gamedevpl.github.io/silnik3d-od-zera/lumen-lab/

Czysty JavaScript i surowy WebGL2, bez bibliotek i bez budowania. Lokalnie: `python3 -m http.server` w tym katalogu i otwórz `http://localhost:8000/`. Pojedyncza scena: `?shot=D5-clean` (lista w `src/shots.js`).

## English

Companion demo for our video essay on light and shadow in games. One scene, forty years of lighting tricks, plain JS + raw WebGL2, no build step. Play: https://gamedevpl.github.io/silnik3d-od-zera/lumen-lab/

## Licence

MIT (`LICENSE`). All code is our own. No id Software code is included; techniques are reimplemented from published papers (Williams 1978, Crow 1977, Heidmann 1991, Everitt & Kilgard 2002, Kajiya 1986, Bitterli et al. 2020 and others). Geometry and textures are procedural; no assets from any commercial game. Game and company names belong to their owners; this project is not affiliated with or endorsed by any of them.

`docs/lumen-lab/` holds the copy served by GitHub Pages; keep both in sync.
