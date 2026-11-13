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
  e05: {
    pl: { t: "Który poziom tekstury trafia do piksela?", min: "1 min czytania", html: `
<p>Ustaw kamerę tak, żeby było widać podłogę aż po horyzont. Na dole jeden piksel obejmuje kawałek kratki. W oddali w tym samym pikselu mieści się już kilka kratek. Podczas jazdy zmienia się to, które z nich trafią do próbki [[1:45]].</p>
<p>Mipmapy są już wygenerowane, od 128 × 128 aż do 1 × 1. W <code>texture.hpp</code> sprawdź wartość <code>GL_TEXTURE_MIN_FILTER</code>. Filtr trójliniowy bierze próbki z dwóch sąsiednich poziomów i miesza wyniki. Porównaj daleki pas podłogi podczas powtórki tej samej trasy [[2:44]].</p>` },
    en: { t: "Which texture level reaches the pixel?", min: "1 min read", html: `
<p>Look towards the horizon. Close to the camera, one pixel covers part of a tile. Further out, several tiles fit inside it. As the camera moves, different squares end up under the same sample [[1:45]].</p>
<p>The texture already has levels ranging from 128 × 128 to 1 × 1. Check <code>GL_TEXTURE_MIN_FILTER</code> in <code>texture.hpp</code>. A trilinear filter samples two neighbouring levels and blends the results. Watch the same strip of distant floor on the return run [[2:44]].</p>` }
  },
  e06: {
    pl: { t: "Dwa materiały, jeden odblask", min: "1 min czytania", html: `
<p>Kule mają chropowatość 0,15 i 0,92. Zatrzymaj lampę w tym samym miejscu i porównaj odblaski. W pierwszej próbie oba mają po 84 jasne piksele [[1:35]]. Co dostał shader?</p>
<p>Między opisem materiału a wywołaniem rysującym w <code>lighting.hpp</code> wkrała się stała 0,25. Gdy przy każdym rysowaniu do shadera trafia chropowatość bieżącego materiału, ta sama próba daje 81 i 443 jasne piksele [[2:19]].</p>` },
    en: { t: "Two materials, one highlight", min: "1 min read", html: `
<p>The spheres request roughness 0.15 and 0.92. Hold the lamp still and compare the highlights. On the first pass, each has 84 bright pixels [[1:35]]. Which value actually reached the shader?</p>
<p>Follow the material into the draw call in <code>lighting.hpp</code>. Both draws upload the constant 0.25. Send the current material’s roughness on each draw and the same test measures 81 and 443 bright pixels [[2:19]].</p>` }
  },
  e07: {
    pl: { t: "Czy druga kula potrzebuje drugiej siatki?", min: "1 min czytania", html: `
<p>Po spakowaniu siatka zajmuje 36 780 bajtów. Wersja tekstowa zajmowała 75 878 bajtów. W obu plikach jest tych samych 693 wierzchołków i 3648 indeksów [[1:41]].</p>
<p>Obie kule proszą o ten sam plik. Odczytaj licznik po dodaniu drugiej [[2:00]]. W <code>asset_cache.hpp</code> poszukaj modelu pod jego kluczem przed otwarciem pliku. Po poprawce obie instancje odwołują się do tej samej siatki. Nadal możesz przesunąć jedną z nich osobno [[2:57]].</p>` },
    en: { t: "Does a second sphere need a second mesh?", min: "1 min read", html: `
<p>The packed mesh takes 36,780 bytes. The text version took 75,878 bytes. Both store the same 693 vertices and 3,648 indices [[1:41]].</p>
<p>Both spheres ask for the same file. Check the read counter when the second one arrives [[2:00]]. In <code>asset_cache.hpp</code>, look up the model key before opening the file. With the lookup fixed, both instances point to one mesh. Moving one sphere still leaves the other in place [[2:57]].</p>` }
  },
  e08: {
    pl: { t: "Ten sam indeks po usunięciu obiektu", min: "1 min czytania", html: `
<p>Zapamiętaj uchwyt A: <code>1:1</code>. Usuń A i utwórz B. Kiedy wolne miejsce wraca do puli, B otrzymuje <code>1:2</code> [[1:17]]. Stare zaznaczenie nadal pamięta indeks 1. Spróbuj przesunąć obiekt tym uchwytem.</p>
<p>W <code>scene.hpp</code> sprawdź, czy pokolenie żywego obiektu zgadza się z pokoleniem uchwytu. Po poprawce B zachowuje położenie. Można je przesunąć świeżym uchwytem, podczas gdy sąsiednie kule pozostają na swoich miejscach [[3:21]].</p>` },
    en: { t: "The same index after deleting an object", min: "1 min read", html: `
<p>Keep A’s handle, <code>1:1</code>. Delete A and create B. Once the slot goes back into the free pool, B gets <code>1:2</code> [[1:17]]. The old selection still remembers index 1. Try moving the object through that handle.</p>
<p>In <code>scene.hpp</code>, compare the live slot’s generation with the one in the handle. After the fix B stays put. Its fresh handle can still move it while the neighbouring spheres stay where they were [[3:21]].</p>` }
  }
};
