// Page UI: one scene fills the screen, the card explains it, the footer lists the film's chapters.
// The chat helper (if the browser has a built-in model) talks to window.LUMEN.
import { CHAPTERS, SCENES, FILM, byId } from './scenes.js';
import { initSiteMenu } from '../../site-menu.js';

const $ = (s) => document.querySelector(s);
const T = {
  pl: { chapter: 'Rozdział', pause: 'Ⅱ Pauza', play: '▶ Graj', prev: 'Poprzednia scena', next: 'Następna scena',
    film: (t, live, url) => live ? `Z filmu <a href="${url}" target="_blank" rel="noopener">„Ujarzmić fotony” ↗</a>, rozdział od ${t}.` : `Z filmu „Ujarzmić fotony” na YouTube (premiera 8 stycznia 2027), rozdział od ${t}.`,
    mood: 'Sceny „nasza scena” oddają klimat, nie odtwarzają żadnej gry.' },
  en: { chapter: 'Chapter', pause: 'Ⅱ Pause', play: '▶ Play', prev: 'Previous scene', next: 'Next scene',
    film: (t, live, url) => live ? `From our film <a href="${url}" target="_blank" rel="noopener">“Ujarzmić fotony” ↗</a> (Polish, EN subtitles), chapter at ${t}.` : `From our Polish film “Ujarzmić fotony” on YouTube (premieres 8 January 2027), chapter at ${t}.`,
    mood: 'Mood scenes set the atmosphere; they do not recreate any game.' },
};
let lang = (() => { try { const l = localStorage.getItem('lang'); if (T[l]) return l; } catch {} return /^pl\b/i.test(navigator.language || '') ? 'pl' : 'en'; })();
let current = byId(new URLSearchParams(location.search).get('shot')) || byId('M-swing');
let paused = false, t = 0, last = performance.now(), scale = Math.min(devicePixelRatio || 1, 1.5), slow = 0;
const listeners = new Set();
const siteMenu = initSiteMenu({
  currentSite: 'lumen-lab',
  getLang: () => lang,
  getGithubUrl: () => 'https://github.com/gamedevpl/silnik3d-od-zera/tree/main/docs/lumen-lab',
  githubSub: 'silnik3d-od-zera',
});

function secs(at) { return at.split(':').reduce((a, b) => a * 60 + +b, 0); }
function filmUrl(at) { return `https://www.youtube.com/watch?v=${FILM.id}&t=${secs(at)}s`; }

function drawUI() {
  const l = T[lang], c = current.chapter, ci = CHAPTERS.indexOf(c), list = c.scenes;
  document.documentElement.lang = lang;
  for (const el of document.querySelectorAll('[data-pl]')) el.textContent = el.dataset[lang];
  $('#lang').textContent = lang === 'pl' ? 'EN' : 'PL';
  $('#lang').setAttribute('aria-label', lang === 'pl' ? 'English' : 'Polski');
  $('#chapNo').textContent = c.id === 'mood' ? '★' : `${l.chapter} ${ci + 1}`;
  $('#chapName').textContent = c[lang];
  $('#sceneName').textContent = current[lang];
  $('#sceneNote').textContent = lang === 'pl' ? current.npl : current.nen;
  const idx = list.findIndex((s) => s[0] === current.id);
  $('#count').textContent = `${idx + 1} / ${list.length}`;
  $('#prev').setAttribute('aria-label', l.prev); $('#next').setAttribute('aria-label', l.next);
  $('#pause').textContent = paused ? l.play : l.pause;
  $('#chips').innerHTML = list.map(([id, pl, en]) => `<button type="button" data-shot="${id}" aria-current="${id === current.id}">${lang === 'pl' ? pl : en}</button>`).join('');
  const live = Date.now() >= Date.parse(FILM.premiere);
  $('#film').innerHTML = c.id === 'mood' ? l.mood : l.film(c.at, live, filmUrl(c.at));
  $('#chapters').innerHTML = CHAPTERS.map((ch, i) => `<button type="button" role="tab" data-chapter="${ch.id}" aria-selected="${ch === c}"><b>${ch.id === 'mood' ? '★ ' : `${i + 1}. `}${ch[lang]}</b><small>${ch.id === 'mood' ? (lang === 'pl' ? 'klimat' : 'mood') : ch.at}</small></button>`).join('');
  $(`#chapters [aria-selected="true"]`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  document.title = `${current[lang]} · Lumen Lab`;
  siteMenu?.render();
}

function show(id) {
  const s = byId(id);
  if (!s) return false;
  current = s; t = 0; slow = 0;
  window.LL?.resetPT?.();
  const u = new URL(location.href); u.searchParams.set('shot', s.id); history.replaceState(null, '', u);
  drawUI();
  listeners.forEach((f) => f(s));
  return true;
}
function step(d) { const i = SCENES.indexOf(current); show(SCENES[(i + d + SCENES.length) % SCENES.length].id); }

function size() {
  const w = Math.round(innerWidth * scale), h = Math.round(innerHeight * scale);
  const c = $('#c'); if (c.width !== w || c.height !== h) window.LL.resize(w, h);
}

function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  if (!paused || current.id.startsWith('D7')) {
    if (!paused) t = (t + dt) % 12;
    try { size(); window.LL.render(current.id, t, { spp: 1 }); } catch (e) { console.error(e); }
    // Heavy scenes on weak GPUs: drop resolution instead of frames.
    if (dt > 0.05 && ++slow > 20 && scale > 0.5) { scale = Math.max(0.5, scale * 0.8); slow = 0; }
  }
  requestAnimationFrame(frame);
}

function start() {
  if (!window.LL || !document.createElement('canvas').getContext('webgl2')) { $('#nogl').hidden = false; return; }
  requestAnimationFrame((n) => { last = n; frame(n); });
}

document.addEventListener('click', (ev) => {
  const b = ev.target.closest('button'); if (!b) return;
  if (b.dataset.shot) show(b.dataset.shot);
  else if (b.dataset.chapter) show(CHAPTERS.find((c) => c.id === b.dataset.chapter).scenes[0][0]);
  else if (b.id === 'prev') step(-1);
  else if (b.id === 'next') step(1);
  else if (b.id === 'pause') { paused = !paused; drawUI(); }
  else if (b.id === 'lang') { lang = lang === 'pl' ? 'en' : 'pl'; try { localStorage.setItem('lang', lang); } catch {} drawUI(); document.dispatchEvent(new CustomEvent('lumen:lang', { detail: lang })); }
});
document.addEventListener('keydown', (ev) => {
  if (ev.target.closest?.('input,textarea')) return;
  if (ev.key === 'ArrowRight') step(1);
  else if (ev.key === 'ArrowLeft') step(-1);
  else if (ev.key === ' ' && ev.target === document.body) { ev.preventDefault(); paused = !paused; drawUI(); }
});

// For the chat helper and for anyone poking at the console.
window.LUMEN = { show, current: () => current, lang: () => lang, onChange: (f) => listeners.add(f), CHAPTERS, SCENES, FILM };

drawUI();
if (window.LLready) start(); else addEventListener('load', start);
