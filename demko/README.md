# Neonowy kanał

[Zagraj w Neon Grand Prix](https://gamedevpl.github.io/silnik3d-od-zera/demko/).

Siedem statków startuje na torze o długości 1152 jednostek. Wyścig trwa przez kolejne okrążenia. Pozycja zależy od łącznego przebytego dystansu, a gra zapisuje najlepszy czas pełnego okrążenia w przeglądarce.

Możesz wyprzedzać po obu stronach. Tuż za rywalem dostajesz premię do prędkości i szybciej ładujesz dopalacz. Zielone strzałki dają krótki zryw i odnawiają osłonę. Działko i rakiety spowalniają rywali i niszczą pomarańczowe miny. Kontakt z bandą kosztuje prędkość. Po utracie osłony statek zwalnia na naprawę i wraca do wyścigu.

| Sterowanie | Akcja |
| --- | --- |
| ← → lub A/D | Skręt |
| ↑ lub W | Dopalacz |
| ↓ lub S | Hamulec aerodynamiczny, ciaśniejszy skręt |
| Spacja / R | Działko / rakieta |
| P lub Esc | Pauza i wznowienie |

Na telefonie można trzymać skręt i dopalacz dwoma palcami. Start uruchamia oryginalną muzykę 150 BPM z filmu *I have a vibe, for a new game*. Po pierwszych 48 sekundach powtarza się fragment od 16. do 48. sekundy. Silnik i efekty reagują na grę niezależnie od muzyki.

## Kod

- [Modele statków, pasy i geometria toru w C++](demo.cpp)
- [Fizyka wyścigu, rywale i kolizje](../docs/demko/race.js)
- [WebGL i zapasowy widok Canvas 2D](../docs/demko/renderer.js)
- [Sterowanie i interfejs](../docs/demko/app.js)
- [Odtwarzanie muzyki i synteza efektów](../docs/demko/audio.js)

Ustaw `WASI_SDK_PATH` na katalog WASI SDK 34 i uruchom `./demko/build.sh` z katalogu głównego. Gotowy moduł jest w `docs/demko/flight.wasm`. Do lokalnej gry uruchom `python3 -m http.server --directory docs 8000` i otwórz `/demko/`.

## Wersja natywna na macOS

Na Macu z Metal i macOS 13 lub nowszym zbuduj aplikację z katalogu głównego repozytorium. Kompilacja wymaga Apple Command Line Tools.

```sh
./demko/macos/build.sh
open 'build/macos/Neonowy kanał.app'
```

Enter rozpoczyna wyścig. Sterowanie jest takie jak w tabeli powyżej, a M przełącza dźwięk. Aplikacja zawiera muzykę, działa offline i zapisuje rekord lokalnie. Używa tych samych modeli C++ co wersja WWW. Reguły wyścigu są w [race.hpp](macos/race.hpp), za grafikę odpowiada Metal, a za dźwięk AVFoundation.
