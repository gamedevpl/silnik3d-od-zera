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
  }
};
