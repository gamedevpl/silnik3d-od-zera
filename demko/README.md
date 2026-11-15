# Neonowy kanał

[Uruchom demo w przeglądarce](https://gamedevpl.github.io/silnik3d-od-zera/demko/)

Przelot jest renderowany na bieżąco przez C++ w WebAssembly. Tor biegnie przez neonowe bramy nad wodą i przechodzi w podwójny wiraż. Możesz przejąć ster, przyspieszyć lub oddać serię strzałów. Na telefonie służą do tego przyciski pod kadrem.

Źródła renderera są w tym katalogu. Gotowa aplikacja dla GitHub Pages jest w `docs/demko/`. Aby przebudować moduł, ustaw `WASI_SDK_PATH` na katalog WASI SDK 34 i wykonaj `./demko/build.sh` z katalogu głównego. Do lokalnego podglądu użyj `python3 -m http.server --directory docs 8000` i otwórz `/demko/`.

Za wirażem tor się poszerza, dołączają rywale, a w mgle zapalają się smugi. Przytrzymanie dopalacza steruje ciągiem i rozmyciem. Rakietę można odpalić osobno klawiszem R lub przyciskiem.
