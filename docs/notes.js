/* Short written notes, one per episode slug. Shown under the episode as a paper page.
   [[m:ss]] becomes a link that plays the film from that moment. */
window.NOTES = {
  e00: {
    pl: {
      t: "Okno to jeszcze nie OpenGL",
      min: "2 min czytania",
      html: `
<p>Pierwsze okno w odcinku otwiera się szybko. Tyle że dostaje domyślny OpenGL 2.1 [[8:43]], a do shaderów chcę 3.3 core. Między „mam okno” a „mogę rysować” są trzy kroki i każdy da się pominąć tak, że program dalej się skompiluje.</p>
<ol class="flow">
  <li><b>Poproś</b><code>glfwWindowHint</code><span>Przed utworzeniem okna. Bez tego: 2.1.</span></li>
  <li><b>Ustaw</b><code>glfwMakeContextCurrent</code><span>Kontekst musi być bieżący w tym wątku.</span></li>
  <li><b>Załaduj</b><code>gladLoadGL</code><span>Dopiero teraz. Wcześniej zwraca 0.</span></li>
</ol>
<p><b>Prośba.</b> Wersję i profil ustawia się podpowiedziami przed <code>glfwCreateWindow</code>. To prośba o minimum: poprosiłem o 3.3, a ten Mac dał 4.1 [[10:21]].</p>
<pre class="cmd">glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GLFW_TRUE);</pre>
<p><b>Kontekst.</b> Okno istnieje, a GLAD i tak zwraca zero [[11:16]]. Powód: funkcje OpenGL ładuje się z kontekstu, który jest bieżący w danym wątku, a utworzenie okna go bieżącym nie robi.</p>
<pre class="cmd">glfwMakeContextCurrent(window);
if (!gladLoadGL(glfwGetProcAddress)) { glfwTerminate(); return 1; }</pre>
<p><b>Strażnik.</b> Wynik ładowania najpierw wypisuję, potem zamieniam na warunek, który kończy program [[11:54]]. Bez niego pierwsze wywołanie OpenGL trafiłoby w pusty wskaźnik.</p>`
    },
    en: {
      t: "A window is not OpenGL yet",
      min: "2 min read",
      html: `
<p>The first window in the episode opens quickly. But it comes with the default OpenGL 2.1 [[8:43]], and I want 3.3 core for shaders. Between “I have a window” and “I can draw” there are three steps, and each can be skipped in a way that still compiles.</p>
<ol class="flow">
  <li><b>Ask</b><code>glfwWindowHint</code><span>Before creating the window. Without it: 2.1.</span></li>
  <li><b>Bind</b><code>glfwMakeContextCurrent</code><span>The context must be current on this thread.</span></li>
  <li><b>Load</b><code>gladLoadGL</code><span>Only now. Earlier it returns 0.</span></li>
</ol>
<p><b>The request.</b> Version and profile are set with hints before <code>glfwCreateWindow</code>. It is a request for a minimum: I asked for 3.3 and this Mac gave me 4.1 [[10:21]].</p>
<pre class="cmd">glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);
glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GLFW_TRUE);</pre>
<p><b>The context.</b> The window exists and GLAD still returns zero [[11:16]]. The reason: OpenGL functions are loaded from the context that is current on the calling thread, and creating a window does not make it current.</p>
<pre class="cmd">glfwMakeContextCurrent(window);
if (!gladLoadGL(glfwGetProcAddress)) { glfwTerminate(); return 1; }</pre>
<p><b>The guard.</b> I print the loader result first, then turn it into a check that stops startup [[11:54]]. Without it, the first OpenGL call would go through a null pointer.</p>`
    }
  },
  e01: {
    pl: {
      t: "Dlaczego if nie wystarcza",
      min: "2 min czytania",
      html: `
<p>Skok ma wyglądać tak samo przy 30 i przy 240 klatkach na sekundę. Pierwszy pomysł, czyli dać fizyce równe 20 ms na każdą narysowaną klatkę, psuje to od razu: przy 240 FPS skoczek już wylądował, gdy ten drugi jeszcze leci [[9:19]].</p>
<ol class="flow">
  <li><b>Zbieraj</b><code>lag += elapsed</code><span>Czas każdej klatki trafia do skarbonki.</span></li>
  <li><b>Krocz</b><code>while (lag >= tick)</code><span>Jeden krok to zawsze 20 ms.</span></li>
  <li><b>Zostaw resztę</b><code>lag -= tick</code><span>Reszta czeka na następną klatkę.</span></li>
</ol>
<p><b>Skarbonka.</b> Przy 240 FPS klatka trwa 4,2 ms. Jeśli czekam na pełne 20 ms w jednej klatce, kwadrat nie ruszy się nigdy [[10:01]]. Dlatego czas między wywołaniami <code>draw()</code> odkładam, a krok robię, gdy uzbiera się 20 ms.</p>
<p><b>Pętla.</b> Z samym <code>if</code> wolniejsze okno zostaje w tyle. W drugiej klatce przy 30 FPS mam 46,7 ms. Jeden krok zostawia 26,7 ms, czyli starczy jeszcze na drugi [[11:09]]. Stąd <code>while</code>.</p>
<pre class="cmd">lag += elapsed;
while (lag >= tick) {
    step(tick);
    lag -= tick;
}</pre>
<p><b>Wynik.</b> Po 0,67 s oba liczniki pokazują 33 kroki [[11:30]]. Liczba klatek jest inna, liczba kroków fizyki ta sama.</p>`
    },
    en: {
      t: "Why an if is not enough",
      min: "2 min read",
      html: `
<p>The jump should look the same at 30 and at 240 frames per second. The first idea, giving physics a flat 20 ms per rendered frame, breaks at once: at 240 FPS the jumper has landed while the other one is still in the air [[9:19]].</p>
<ol class="flow">
  <li><b>Collect</b><code>lag += elapsed</code><span>Every frame's time goes into the jar.</span></li>
  <li><b>Step</b><code>while (lag >= tick)</code><span>One step is always 20 ms.</span></li>
  <li><b>Keep the rest</b><code>lag -= tick</code><span>The leftover waits for the next frame.</span></li>
</ol>
<p><b>The jar.</b> At 240 FPS a frame lasts 4.2 ms. If I wait for a full 20 ms inside one frame, the square never moves [[10:01]]. So I save the time between calls to <code>draw()</code> and take a step once 20 ms has piled up.</p>
<p><b>The loop.</b> With a plain <code>if</code> the slower window falls behind. In the second frame at 30 FPS I have 46.7 ms. One step leaves 26.7 ms, which buys a second one [[11:09]]. Hence <code>while</code>.</p>
<pre class="cmd">lag += elapsed;
while (lag >= tick) {
    step(tick);
    lag -= tick;
}</pre>
<p><b>The result.</b> At 0.67 s both counters show 33 steps [[11:30]]. The frame counts differ, the physics step count does not.</p>`
    }
  },
  e02: {
    pl: {
      t: "Gimbal lock w trzech pomiarach",
      min: "2 min czytania",
      html: `
<p>Kostką sterują trzy kąty. Sprawdzam, czy obrót klawiszem Y i obrót klawiszem Z to wciąż dwa różne ruchy, i mierzę odległość między końcówkami osi +Z po każdym z nich.</p>
<ol class="flow">
  <li><b>60°</b><code>0.383</code><span>Dwa klawisze, dwa różne położenia.</span></li>
  <li><b>89°</b><code>0.013</code><span>Znaczniki prawie się pokrywają.</span></li>
  <li><b>90°</b><code>0.000</code><span>Jeden ruch pod dwoma klawiszami.</span></li>
</ol>
<p><b>Co się stało.</b> Przy pochyleniu 90° oś −Z pokrywa się z Y [[17:41]]. Dwa sterowania kręcą wtedy wokół tej samej osi i jeden stopień swobody znika. Przy 60° różnica wynosi 0,383 [[15:35]], przy 89° już tylko 0,013 [[17:25]].</p>
<p><b>Kwaterniony same nie pomagają.</b> Zapisuję te same trzy obroty jako kwaterniony i powtarzam test: dalej 0,000 [[19:46]]. Składam te same trzy kąty w tej samej kolejności, więc wynik jest ten sam.</p>
<p><b>Co pomaga.</b> Przestaję trzymać trzy kąty. Trzymam jedną orientację i każdy obrót składam z nią wokół lokalnej osi kostki [[21:26]]. Przy tych samych 90° odstęp wynosi 1,000 [[22:04]].</p>`
    },
    en: {
      t: "Gimbal lock in three measurements",
      min: "2 min read",
      html: `
<p>Three angles steer the cube. I check whether a turn with the Y key and a turn with the Z key are still two different moves, and measure the distance between the +Z tips after each.</p>
<ol class="flow">
  <li><b>60°</b><code>0.383</code><span>Two keys, two different positions.</span></li>
  <li><b>89°</b><code>0.013</code><span>The marks nearly overlap.</span></li>
  <li><b>90°</b><code>0.000</code><span>One move under two keys.</span></li>
</ol>
<p><b>What happened.</b> At 90° of pitch, −Z lines up with Y [[17:41]]. Both controls now turn around the same axis and one degree of freedom is gone. At 60° the gap is 0.383 [[15:35]], at 89° only 0.013 [[17:25]].</p>
<p><b>Quaternions alone do not help.</b> I write the same three rotations as quaternions and repeat the test: still 0.000 [[19:46]]. I am composing the same three angles in the same order, so the result is the same.</p>
<p><b>What helps.</b> I stop storing three angles. I keep one orientation and compose each turn with it around a local cube axis [[21:26]]. At the same 90° the gap is 1.000 [[22:04]].</p>`
    }
  },
  e03: {
    pl: { t: "Gdzie zniknęła przekątna?", min: "1 min czytania", html: `
<p>Połącz rogi 4 i 6. GPU potrafi narysować ten odcinek z dwóch wierzchołków. Co zobaczysz, jeśli w tym samym wywołaniu zmienisz tryb na <code>GL_TRIANGLES</code>? Znika nawet przekątna [[17:25]]. W buforze są trzy rogi, ale ostatni argument <code>glDrawArrays</code> wciąż każe pobrać tylko dwa.</p>
<p>Na gałęzi <code>e03-start</code> uruchom <code>python3 check.py</code>. Test pobiera kolor wewnątrz spodziewanego trójkąta i obok niego. W <code>face.hpp</code> zmień liczbę pobieranych wierzchołków i powtórz pomiar. Wewnętrzny piksel powinien stać się miętowy, a zewnętrzny pozostać czarny. Po trzecim wierzchołku połowa ściany jest pełna [[18:01]]. Aby wypełnić resztę ściany, drugi trójkąt może użyć tej samej przekątnej i rogu 7.</p>` },
    en: { t: "Where did the diagonal go?", min: "1 min read", html: `
<p>Connect corners 4 and 6. Two vertices are enough for the GPU to draw that line. What happens if you switch the same draw call to <code>GL_TRIANGLES</code>? Even the diagonal disappears [[17:25]]. The buffer holds three corners, but the last argument to <code>glDrawArrays</code> still asks for only two.</p>
<p>On <code>e03-start</code>, run <code>python3 check.py</code>. It samples a pixel inside the expected triangle and another outside it. Change the vertex count in <code>face.hpp</code> and repeat the measurement. The inside pixel should turn mint while the outside pixel stays black. Three vertices fill half the face [[18:01]]. A second triangle can use the same diagonal and corner 7 to fill the rest of the face.</p>` }
  },
  e04: {
    pl: { t: "Dwie ściany w jednym pikselu", min: "1 min czytania", html: `
<p>Narysuj miętową ścianę i za nią koralową. W miejscu, gdzie obie zasłaniają ten sam piksel, wygrywa ostatnie wywołanie [[11:23]]. Na <code>e04-start</code> testuje to <code>python3 check.py</code>. Po włączeniu porównywania głębi zamiana kolejności nadal daje miętowy środek [[13:54]].</p>
<p>Przesuń kamerę z odległości 4 na 8. Listwa nadal ma 72 piksele. W <code>camera.hpp</code> przekaż odległość jako <code>w</code>. Po podzieleniu współrzędnych przez <code>w</code> ta sama listwa ma z daleka 36 pikseli [[20:09]]. Sprawdź też płaszczyzny odcinania. Po dopasowaniu <code>z</code> bliska granica przypada na −1, daleka na +1 [[21:16]].</p>` },
    en: { t: "Two walls in one pixel", min: "1 min read", html: `
<p>Draw the mint wall, then the coral wall behind it. At the pixel they share, the last draw wins [[11:23]]. On <code>e04-start</code>, <code>python3 check.py</code> samples that pixel. Enable the depth comparison and reversing the order still leaves a mint centre [[13:54]].</p>
<p>Move the camera from distance 4 to 8. The strip still spans 72 pixels. In <code>camera.hpp</code>, pass distance as <code>w</code>. After the GPU divides by <code>w</code>, the strip spans 36 pixels at the greater distance [[20:09]]. Check the clipping planes too. After adjusting <code>z</code>, the near plane maps to −1 and the far plane to +1 [[21:16]].</p>` }
  },
  e05: {
    pl: { t: "Który poziom tekstury trafia do piksela?", min: "1 min czytania", html: `
<p>Jeśli obrócisz zwykłą szachownicę do góry nogami, trudno zauważyć różnicę. Nadaj rogom własne kolory i zaznacz je kreskami [[2:19]]. Po nałożeniu obrazka na kartę pojedyncza koralowa kreska wypada u góry. Popraw współrzędną <code>v</code> i sprawdź, czy kreska wróciła na dół po lewej [[23:28]].</p>
<p>Teraz powtórz teksturę na podłodze 32 razy i rusz kamerą. Daleki pas migocze, choć na GPU jest już komplet mniejszych obrazów. Na <code>e05-start</code> wybierz filtr pomniejszania, który z nich korzysta. Powtórz ten sam przejazd i porównaj ruch dalekiego pasa [[25:01]].</p>` },
    en: { t: "Which texture level reaches the pixel?", min: "1 min read", html: `
<p>Flip a plain checkerboard upside down and the result is hard to spot. Give each corner a colour and a different number of bars [[2:19]]. On the textured card the single coral bar appears at the top. Correct <code>v</code> and check that the bar returns to the bottom left [[23:28]].</p>
<p>Repeat the texture 32 times across the floor and move the camera. The far strip flickers even though the smaller images already exist on the GPU. On <code>e05-start</code>, choose a minification filter that samples them. Repeat the same camera movement and compare the far strip [[25:01]].</p>` }
  },
  e06: {
    pl: { t: "Dwa materiały, jeden odblask", min: "1 min czytania", html: `
<p>Jeden pierścień daje równik [[4:58]]. Zmień szerokość geograficzną, połącz sąsiednie rzędy trójkątami i zakoduj kierunek normalnej kolorem. Jeśli cała kula ma jeden kolor, sprawdź, czy wszystkie wierzchołki dostały tę samą normalną [[9:49]]. Na kuli jednostkowej wyśrodkowanej w początku układu lokalna pozycja wierzchołka jest już jego normalną.</p>
<p>Oba materiały dają po 84 jasne piksele [[15:22]]. W <code>lighting.hpp</code> sprawdź wartość wysyłaną jako <code>roughness</code>. Przy 0,15 i 0,92 ten sam pomiar daje 81 i 443 piksele [[16:06]]. W obu ujęciach lampa i kamera stoją w tym samym miejscu.</p>` },
    en: { t: "Two materials, one highlight", min: "1 min read", html: `
<p>One ring gives you the equator [[4:58]]. Vary the latitude, join the rows with triangles, then use colour to show the normal direction. A single colour over the whole sphere is a reason to check whether every vertex received the same normal [[9:49]]. On a unit sphere centred at the origin, a vertex’s local position is already its normal.</p>
<p>Both materials give 84 bright pixels [[15:22]]. In <code>lighting.hpp</code>, follow the value sent as <code>roughness</code>. With 0.15 and 0.92 the same measurement gives 81 and 443 pixels [[16:06]]. Both runs use the same lamp and camera positions.</p>` }
  },
  e07: {
    pl: { t: "Czy druga kula potrzebuje drugiej siatki?", min: "1 min czytania", html: `
<p>Program prosi o <code>sphere.bin</code>, a druga instancja o <code>./sphere.bin</code>. Na dysku jest jeden plik. W pierwszym podejściu <code>load</code> za każdym razem otwiera go od nowa. W drugim jest już mapa, ale różne zapisy ścieżki wciąż tworzą dwa wpisy [[5:34]].</p>
<p>Na gałęzi <code>e07-path-start</code> sprawdź w <code>exercise.cpp</code> oba argumenty, potem przejdź do miejsca, w którym <code>asset_cache.hpp</code> tworzy klucz. Po ujednoliceniu ścieżek odczyt jest jeden, a obie kule mają tę samą siatkę i własne położenia [[6:24]].</p>` },
    en: { t: "Does a second sphere need a second mesh?", min: "1 min read", html: `
<p>One instance asks for <code>sphere.bin</code>, the other for <code>./sphere.bin</code>. Both refer to one file. The first loader opens it every time. Adding a map still leaves two entries because the path spellings differ [[5:34]].</p>
<p>On <code>e07-path-start</code>, compare the arguments in <code>exercise.cpp</code>. Follow them to the line where <code>asset_cache.hpp</code> builds the key. Once both spellings resolve to the same key, the counter reads one. Both spheres share a mesh and keep separate positions [[6:24]].</p>` }
  },
  e08: {
    pl: { t: "Ten sam indeks po usunięciu obiektu", min: "1 min czytania", html: `
<p>Najpierw <code>create</code> tylko dopisuje na końcu tablicy. Po usunięciu A nowy obiekt trafia do 2:1. Stary uchwyt wygasł, ale miejsce zostaje puste [[7:52]]. Po dopisaniu puli wolnych miejsc B trafia do 1:2 i test ujawnia, że stary uchwyt A porusza nowym obiektem [[11:49]].</p>
<p>Na gałęzi <code>e08-start</code> porównaj numer pokolenia w uchwycie z pokoleniem slotu. Po naprawie uruchom scenę. Klawisz X usuwa zaznaczony obiekt, N dodaje nowy, Tab wybiera aktualny uchwyt, a W i D przesuwają wybraną kulę [[13:11]].</p>` },
    en: { t: "The same index after deleting an object", min: "1 min read", html: `
<p>At first <code>create</code> only appends. Erase A and the replacement lands in 2:1. The old handle expires, but the slot stays empty [[7:52]]. Implement a free list and B reuses 1:2. The next test shows A’s old handle moving the new object [[11:49]].</p>
<p>On <code>e08-start</code>, compare the handle’s generation with the slot’s generation. After the fix, try the scene. X erases the selected object, N adds an object, Tab selects a live handle, and W and D move the selected sphere [[13:11]].</p>` }
  },
  e09: {
    pl: { t: "Co mierzą dwa klawisze?", min: "1 min czytania", html: `
<p>Stań robotem na skrzyżowaniu linii. Wybierz W i jedź przez sekundę. Wróć klawiszem R, a potem przytrzymaj W i D. Żeby nie mierzyć sekundy stoperem, uruchom <code>python3 check.py</code> na gałęzi <code>e09-start</code> [[11:20]]. W obydwu przejazdach zegar wykona 50 kroków po 20 ms.</p>
<p>W pierwszej próbie jazda prosto ma długość 2,00. Po skosie robot przesuwa się o 2 w prawo i o 2 w głąb [[9:22]]. Droga ma długość przekątnej: √(2² + 2²) ≈ 2,83. W <code>drive.hpp</code> zachowaj kierunek ruchu, ograniczając długość wektora wejścia. Sprawdź też W+S i puszczenie wszystkich klawiszy.</p>
<p>Po poprawce oba przejazdy mają po 2,00 jednostki [[10:53]]. Porównaj swoją zmianę z <a href="https://github.com/gamedevpl/silnik3d-od-zera/tree/e09-solution">rozwiązaniem E09</a>. Możesz też uruchomić <a href="https://github.com/gamedevpl/silnik3d-od-zera/tree/ep09">pełny warsztat</a> i spróbować dojechać do półki [[11:05]].</p>` },
    en: { t: "What do two keys measure?", min: "1 min read", html: `
<p>Park the robot where two grid lines cross. Hold W for a second. Press R to return to the start, then drive with W and D. To time both runs precisely, run <code>python3 check.py</code> on the <code>e09-start</code> branch [[11:20]]. The clock advances 50 steps of 20 ms each time.</p>
<p>The straight trip covers 2.00 units. On the diagonal the robot goes 2 units right and 2 units into the room [[9:22]]. The distance travelled is the diagonal of that square: √(2² + 2²) ≈ 2.83. In <code>drive.hpp</code>, keep the direction while limiting the length of the input vector. Try W+S and releasing all the keys, too.</p>
<p>After the fix both trips cover 2.00 units [[10:53]]. Compare your change with the <a href="https://github.com/gamedevpl/silnik3d-od-zera/tree/e09-solution">E09 solution</a>, then open the <a href="https://github.com/gamedevpl/silnik3d-od-zera/tree/ep09">full workshop</a> and drive up to a shelf [[11:05]].</p>` }
  },
  e10: {
    pl: { t: "Dlaczego robot przykleja się do regału?", min: "1 min czytania", html: `
<p>Przytrzymaj W i D. Każdy krok przesuwa robota trochę w prawo i trochę w głąb warsztatu. Przed regałem tylko ta druga część ruchu prowadzi do zderzenia. Gdy odrzucisz cały krok, znika także ruch w prawo.</p>
<p>Uruchom <code>python3 check.py</code> na gałęzi <code>e10-start</code>. Robot trzyma oba klawisze przez 1,5 sekundy. Obrysy się mijają, ale w ostatniej sekundzie ruch wzdłuż półki wynosi 0,00. W <code>moveRobot</code> w pliku <code>collision.hpp</code> sprawdź osobno każdą oś. Przy drugim sprawdzeniu uwzględnij pozycję po pierwszym. Powtórz próbę. Robot przejeżdża 1,41 wzdłuż półki i zostawia szczelinę 0,006.</p>
<p><a href="play/?ep=ep10">Poprowadź robota w przeglądarce</a>. Klawiszem B przełączysz obrysy, R wróci na start. <a href="https://github.com/gamedevpl/silnik3d-od-zera/tree/e10-solution">Rozwiązanie ćwiczenia</a>.</p>` },
    en: { t: "Why does the robot stick to the shelf?", min: "1 min read", html: `
<p>Hold W and D. Each step moves the robot a little to the right and a little deeper into the workshop. At the shelf only the second part of that movement causes a collision. Rejecting the whole step also cancels the move to the right.</p>
<p>Run <code>python3 check.py</code> on <code>e10-start</code>. The robot holds both keys for 1.5 seconds. The footprints stay apart, yet it travels 0.00 along the shelf in the final second. In <code>moveRobot</code> in <code>collision.hpp</code>, test each axis separately. Use the position after the first test when you check the second axis. Run the test again. The robot travels 1.41 along the shelf, leaving a gap of 0.006.</p>
<p><a href="play/?ep=ep10">Drive the robot in your browser</a>. B toggles the outlines, R resets. <a href="https://github.com/gamedevpl/silnik3d-od-zera/tree/e10-solution">Exercise solution</a>.</p>` }
  }
};
