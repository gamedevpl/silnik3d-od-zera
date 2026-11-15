# Neonowy kanał

[Zagraj w slalom](https://gamedevpl.github.io/silnik3d-od-zera/demko/).

Przeleć przez przynajmniej 11 z 18 zielonych bramek i dotrzyj do złotej mety. Kontakt z pomarańczową miną zabiera jeden z trzech punktów osłony. Dopalacz zużywa energię, a trafiona bramka ją odnawia. Za co czwartą bramkę dostajesz rakietę. Rakieta ma większy zasięg rażenia niż działko. Gra zapisuje najlepszy czas ukończonego slalomu w tej przeglądarce.

Steruj strzałkami lub A/D. Przytrzymaj ↑ lub W, aby przyspieszyć. Spacja obsługuje działko, R odpala rakietę, P zatrzymuje grę. Przyciski pod ekranem obsługują dotyk. Start włącza muzykę i silnik, a przycisk z nutą wycisza i przywraca dźwięk.

Modele miasta, bram i statku powstają w C++ w WebAssembly. Przeglądarka przesyła powtarzalny odcinek miasta do GPU raz. WebGL rysuje lot, lustrzane odbicia i cienie. Przy wyłączonym WebGL działa prostszy widok Canvas 2D z tymi samymi zasadami i przeszkodami. Web Audio generuje muzykę i efekty na miejscu.

Aby zbudować moduł, ustaw `WASI_SDK_PATH` na katalog WASI SDK 34 i uruchom `./demko/build.sh` z katalogu głównego. Do lokalnej gry uruchom `python3 -m http.server --directory docs 8000` i otwórz `/demko/`.
