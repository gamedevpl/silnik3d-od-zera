// Viewer for people coming from the film: a list of scenes (no ?shot) or one looping scene with a back link.
// Skipped under automation, so the recorder (tools/record2.js in the production pack) sees a bare canvas.
const GROUPS = [
  ['Paleta (Doom)', 'Palette (Doom)', [
    ['D0-b', 'Latarnia jako tablica kolorów', 'Lantern as a colour table'],
    ['D0-b-levels', 'Poziomy jasności sektora', 'Sector light levels'],
    ['D0-c', 'Cykl palety', 'Palette cycling'],
    ['D0-a', 'Postać bez cienia', 'Character with no shadow']]],
  ['Kółko pod stopami', 'Blob shadow', [
    ['D1-a', 'Cień-kółko przy skoku', 'Blob shadow while jumping'],
    ['D1-a-debug', 'Promień w dół do podłogi', 'Ray down to the floor'],
    ['D1-b', 'Kółko na krawędzi schodka', 'Blob on a step edge'],
    ['D1-b-debug', 'Krawędź schodka, z promieniem', 'Step edge, with the ray'],
    ['D1-c', 'Kółko i spłaszczona sylwetka', 'Blob vs flattened silhouette']]],
  ['Wierzchołki: Gouraud', 'Vertices: Gouraud', [
    ['D2-a', 'Świeca, światło w wierzchołkach', 'Candle, per-vertex light'],
    ['D2-a-black', 'To samo bez światła otoczenia', 'Same without ambient'],
    ['D2-a-pp', 'Światło na piksel', 'Per-pixel light'],
    ['D2-b', 'Gęstsza siatka podłogi', 'Denser floor mesh']]],
  ['Lightmapa (Quake)', 'Lightmap (Quake)', [
    ['D3-a', 'Wypiekanie lightmapy', 'Baking the lightmap'],
    ['D3-b', 'Tekstura, lightmapa, razem', 'Texture, lightmap, combined'],
    ['D3-b-final', 'Gotowa scena', 'Final scene'],
    ['D3-c', 'Błysk i postać bez cienia', 'Flash, character without shadow'],
    ['D3-d', 'Relief na ścianie', 'Wall relief']]],
  ['Bryły cieni (Doom 3)', 'Shadow volumes (Doom 3)', [
    ['D5-clean', 'Cienie z brył', 'Stencil shadows'],
    ['D5-a', 'Bryły w siatce', 'Volumes as wireframe'],
    ['D5-b', 'Z-pass: kamera w cieniu się psuje', 'Z-pass breaks inside the shadow'],
    ['D5-c', 'Z-fail: działa', 'Z-fail works'],
    ['D5-d', 'Koszt: mapa nakładania', 'Cost: overdraw heat map'],
    ['D5-e', 'Dziura w modelu = przeciek', 'Hole in the mesh = leak']]],
  ['Mapa cieni', 'Shadow map', [
    ['D4-clean', 'Słońce i ruchomy cień', 'Sun and a moving shadow'],
    ['D4-a', 'Z podglądem mapy głębi', 'With the depth map'],
    ['D4-b', 'Trądzik cienia (bias 0)', 'Shadow acne (bias 0)'],
    ['D4-c', 'Bias: od trądziku do Piotrusia Pana', 'Bias: acne to peter panning']]],
  ['Deferred, SSAO, PBR', 'Deferred, SSAO, PBR', [
    ['D6-a', '50 latarni naraz', '50 lights at once'],
    ['D6-b', 'G-buffer', 'G-buffer'],
    ['D6-c', 'Szkło w deferred', 'Glass in deferred'],
    ['D6-d-ao', 'SSAO: ciemne kąty', 'SSAO: dark corners'],
    ['D6-e', 'Za duży promień SSAO: aureole', 'SSAO radius too large: halos'],
    ['D6-f', 'PBR: szorstkość i metaliczność', 'PBR: roughness and metalness']]],
  ['Promienie', 'Rays', [
    ['D7-a', 'Path tracing (zbiera próbki)', 'Path tracing (accumulates)'],
    ['D7-a-move', 'Path tracing w ruchu: szum', 'Path tracing in motion: noise'],
    ['D7-c', 'ReSTIR włącz/wyłącz', 'ReSTIR on/off'],
    ['D7-d', 'Pola odległości (SDF)', 'Distance fields (SDF)']]],
  ['Nasza scena', 'Mood scenes', [
    ['M-swing', 'Bujająca się latarnia', 'Swinging lamp'],
    ['M-torch', 'Pochodnia w ruchu', 'Walking torch']]],
];
const pl = /^pl\b/i.test(navigator.language || '');
const css = `#gal{position:fixed;inset:0;overflow:auto;background:#0d1014;color:#e8edf2;font:16px/1.45 system-ui,sans-serif;padding:32px 6vw}
#gal h1{margin:0 0 4px;font-size:28px}#gal p{margin:0 0 24px;color:#9aa4b2;max-width:52em}#gal h2{margin:22px 0 8px;font-size:15px;color:#f2b84b;text-transform:uppercase;letter-spacing:.04em}
#gal a{color:#e8edf2;text-decoration:none;display:inline-block;margin:0 8px 8px 0;padding:8px 12px;background:#1a2028;border-radius:8px}#gal a:hover{background:#26303b}
#nav{position:fixed;left:12px;top:12px;z-index:5;white-space:nowrap;font:14px system-ui,sans-serif}#nav a,#nav span{color:#e8edf2;background:rgba(13,16,20,.8);padding:6px 10px;border-radius:6px;text-decoration:none;margin-right:6px}`;
if (!navigator.webdriver) {
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const shot = new URLSearchParams(location.search).get('shot');
  const name = (id) => { for (const g of GROUPS) for (const s of g[2]) if (s[0] === id) return pl ? s[1] : s[2]; return id; };
  if (shot) {
    const n = document.createElement('div'); n.id = 'nav';
    n.innerHTML = `<a href="./">← ${pl ? 'wszystkie sceny' : 'all scenes'}</a><span></span>`;
    n.querySelector('span').textContent = name(shot); document.body.appendChild(n);
  } else {
    const g = document.createElement('div'); g.id = 'gal';
    g.innerHTML = `<h1>Lumen Lab</h1><p>${pl
      ? 'Sceny z filmu „Ujarzmić fotony”: czterdzieści lat sztuczek ze światłem i cieniem w jednym silniku WebGL2. Kliknij scenę, żeby ją uruchomić. Ciężkie sceny (promienie) mogą zwolnić słabszy komputer.'
      : 'Scenes from our film on light and shadow in games: forty years of lighting tricks in one WebGL2 engine. Click a scene to run it. Ray-traced scenes can be slow on weaker machines.'}</p>` +
      GROUPS.map(([gp, ge, list]) => `<h2>${pl ? gp : ge}</h2>` + list.map(([id, p, e]) => `<a href="?shot=${id}">${pl ? p : e}</a>`).join('')).join('');
    document.body.appendChild(g);
  }
}
