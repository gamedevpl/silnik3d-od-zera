# Strona serii

Statyczna strona dla GitHub Pages (`main` / `/docs`): https://gamedevpl.github.io/silnik3d-od-zera/

- `series.js`: wszystkie dane. Nowy odcinek to jeden wpis w `episodes`, nowy sezon to kolejny obiekt w `seasons` (zakładki pojawiają się od dwóch sezonów). Wpis bez `video` wyświetla się jako „W planie”.
- Zajawki: `next` w sezonie to planowane odcinki (tytuł i jedno pytanie, bez dat), `upcoming` to kolejne sezony (nazwa i jedno zdanie). Dodanie pola `slug` po utworzeniu gałęzi zadania udostępnia link do ćwiczenia i istniejącą notatkę. W zapowiedzi znaczniki czasu są zwykłym tekstem. Gdy odcinek wychodzi, jego wpis przenosi się z `next` do `episodes` z tym samym `slug`.
- `notes.js`: krótkie notatki do odcinków, klucz to `slug` odcinka; `[[m:ss]]` w treści staje się linkiem do momentu filmu. Odcinek bez notatki po prostu jej nie pokazuje.
- Postęp czytelnika (obejrzane, zadanie PASS) zapisuje się tylko w `localStorage` przeglądarki.
- `app.js`: język PL/EN, zakładki, wiersze odcinków. Odcinek z `video` jest traktowany jako opublikowany. Z `premiere: true` pokazuje kartę premiery do czasu `at`.
- `assistant.js`: „Zapytaj o serię”. Działa na modelu wbudowanym w Chrome przez `vendor/genaicode-browser.js`, bez serwera. Ładuje się tylko tam, gdzie przeglądarka ma ten model.
- `subs.js`: angielskie napisy jako `[sekunda, tekst]`, z plików `.en.srt`. Po dodaniu odcinka dopisz jego napisy pod kluczem `e03` itd.
- `vendor/genaicode-browser.js`: `npx esbuild <genaicode>/src/browser.ts --bundle --format=esm --minify --target=es2022`.

Podgląd lokalnie: `python3 -m http.server -d docs 8000`.

Grafiki w `art/` pochodzą z renderera filmu w repo ops (`tools/media/essay/productions/cpp-3d-engine/montaz/e02/`, sprite'y w `room_art/brand/`, gotowe miny w `maskotka/`). Arkusze mają klatki 320×180 obok siebie, 12 kl./s; opis w `art/frames.json`.
