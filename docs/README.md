# Strona serii

Statyczna strona dla GitHub Pages (`main` / `/docs`): https://gamedevpl.github.io/silnik3d-od-zera/

- `series.js`: wszystkie dane. Nowy odcinek to jeden wpis w `episodes`, nowy sezon to kolejny obiekt w `seasons` (zakładki pojawiają się od dwóch sezonów). Wpis bez `video` wyświetla się jako „W planie”.
- `app.js`: język PL/EN, zakładki, wiersze odcinków. Odcinek z `video` jest traktowany jako opublikowany. Z `premiere: true` pokazuje kartę premiery do czasu `at`.
- `assistant.js`: „Zapytaj o serię”. Działa na modelu wbudowanym w Chrome przez `vendor/genaicode-browser.js`, bez serwera. Ładuje się tylko tam, gdzie przeglądarka ma ten model.
- `subs.js`: angielskie napisy jako `[sekunda, tekst]`, z plików `.en.srt`. Po dodaniu odcinka dopisz jego napisy pod kluczem `e03` itd.
- `vendor/genaicode-browser.js`: `npx esbuild <genaicode>/src/browser.ts --bundle --format=esm --minify --target=es2022`.

Podgląd lokalnie: `python3 -m http.server -d docs 8000`.

Grafiki w `art/` pochodzą z renderera filmu w repo ops (`tools/media/essay/productions/cpp-3d-engine/montaz/e02/`, sprite'y w `room_art/brand/`, gotowe miny w `maskotka/`). Arkusze mają klatki 320×180 obok siebie, 12 kl./s; opis w `art/frames.json`.
