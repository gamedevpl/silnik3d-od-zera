/* Page logic: language switch, season tabs, episode rows. Data lives in series.js. */
(function(){
const { repo: REPO, playlist: PLAYLIST, seasons: SEASONS, upcoming: UPCOMING = [] } = window.SERIES;
const NOTES = window.NOTES || {};

/* Reader progress: { e00: { w: 1, p: 1 } }, kept only in this browser. */
const KEY = "silnik:progress";
let progress = {};
try { progress = JSON.parse(localStorage.getItem(KEY)) || {}; } catch(_){}
const done = (slug, k) => !!(progress[slug] && progress[slug][k]);

const T = {
  pl: {
    navHow:"Jak to działa", navEps:"Odcinki", navCode:"Kod",
    kicker:"Seria na YouTube · C++ · OpenGL",
    title:"Silnik 3D w C++ <span class=\"tq\">od zera</span>", titleAlt:"C++ 3D Engine From Scratch",
    lede:"Od pustego katalogu do własnego silnika. Bez lektora: prawdziwy Vim, prawdziwe błędy, napisy PL/EN i zadanie po każdym odcinku.",
    ctaPlaylist:"Playlista na YouTube", ctaCode:"Kod na GitHubie",
    factSubs:"napisy PL/EN",
    bubble:"12 krawędzi.<br>Czemu jedna<br>po skosie?", bubblePass:"PASS", crumb:"Silnik 3D od zera",
    howTitle:"Jak to działa",
    
    s1t:"Oglądasz", s1p:"Kod powstaje na ekranie, linijka po linijce.",
    s2t:"Klonujesz start", s2p:"Ten sam kod co w filmie, z jednym zepsutym miejscem.",
    s3t:"Naprawiasz do PASS", s3p:"Poprawiasz jeden plik, aż test przejdzie.",
    termRetry:"tło nie pulsuje",
    epsTitle:"Odcinki", 
    premiere:"Premiera", soonNote:"Do tego czasu kod i zadanie już czekają poniżej.",
    open:"Rozwiń", nextUp:"Najbliższa premiera", latest:"Najnowszy", startHere:"Zacznij tutaj", outNow:"Już jest", planned:"W planie", season:"Sezon", watchYT:"Oglądaj na YouTube", shortLink:"Short", chapters:"Rozdziały",
    seasonCount:"{a} z {b} odcinków gotowe", nextEps:"Dalej w tym sezonie", nextSeasons:"Kolejne sezony",
    doneW:"Obejrzane", doneP:"Zadanie: PASS", progressLabel:"Twój postęp", note:"Notatka",
    exLabel:"Twoja kolej", runCmds:"W terminalu uruchom kolejno:",
    afterPass:"Pierwszy wynik to RETRY. Zapisz zmianę w {f} i uruchom check.py ponownie. Po PASS porównaj z rozwiązaniem:",
    solution:"Rozwiązanie", fullCode:"Pełny kod po odcinku", startBranch:"Gałąź startowa",
    copy:"kopiuj", copied:"skopiowane",
    need:"Do zadań wystarczą Git, Python 3 i kompilator C++17. Kod na licencji MIT.",
    made:"Made by",
    games:"Gry w przeglądarce",
    askOpen:"Zapytaj o serię", askTitle:"Zapytaj o serię", askHello:"Pytaj o odcinki, zadania i o to, w której minucie coś było.",
    askNote:"Działa w Twojej przeglądarce, nic nie wysyła. Mały model: odpowiada po angielsku i czasem się myli.",
    askPlaceholder:"np. what is gimbal lock?", askSend:"Wyślij", askNew:"Od nowa", askStop:"Stop", askClose:"Zamknij",
    askDownload:"Pobierz model (kilka GB, jeden raz)", askDownloading:"Pobieranie modelu", askLoading:"Wczytywanie modelu…",
    askThinking:"szukam…", askTool:{ list_episodes:"lista odcinków", get_episode:"odcinek", search_subtitles:"napisy" },
    askChips:["Where do I start?","How do I run the E01 exercise?","Where is gimbal lock explained?"],
    dateFmt:"pl-PL"
  },
  en: {
    navHow:"How it works", navEps:"Episodes", navCode:"Code",
    kicker:"YouTube series · C++ · OpenGL",
    title:"C++ 3D Engine <span class=\"tq\">From Scratch</span>", titleAlt:"Silnik 3D w C++ od zera",
    lede:"From an empty folder to my own engine. No voiceover: real Vim, real errors, EN/PL subtitles and an exercise after every episode.",
    ctaPlaylist:"YouTube playlist", ctaCode:"Code on GitHub",
    factSubs:"EN/PL subtitles",
    bubble:"12 edges.<br>Why is one<br>diagonal?", bubblePass:"PASS", crumb:"3D Engine From Scratch",
    howTitle:"How it works",
    
    s1t:"Watch", s1p:"The code is written on screen, line by line.",
    s2t:"Clone the start", s2p:"The same code as in the film, with one broken spot.",
    s3t:"Fix it until PASS", s3p:"Fix one file until the check passes.",
    termRetry:"background does not pulse",
    epsTitle:"Episodes", 
    premiere:"Premiere", soonNote:"The code and the exercise are already waiting below.",
    open:"Open", nextUp:"Next premiere", latest:"Latest", startHere:"Start here", outNow:"Out now", planned:"Planned", season:"Season", watchYT:"Watch on YouTube", shortLink:"Short", chapters:"Chapters",
    seasonCount:"{a} of {b} episodes out", nextEps:"Next in this season", nextSeasons:"Next seasons",
    doneW:"Watched", doneP:"Exercise: PASS", progressLabel:"Your progress", note:"Note",
    exLabel:"Your turn", runCmds:"Run these commands in your terminal:",
    afterPass:"The first check prints RETRY. Save your change in {f} and run check.py again. Once you get PASS, compare with the solution:",
    solution:"Solution", fullCode:"Full code after the episode", startBranch:"Start branch",
    copy:"copy", copied:"copied",
    need:"The exercises need only Git, Python 3 and a C++17 compiler. The code is MIT licensed.",
    made:"Made by",
    games:"Browser games",
    askOpen:"Ask about the series", askTitle:"Ask about the series", askHello:"Ask about episodes, exercises, or the minute something happened.",
    askNote:"Runs in your browser and sends nothing out. It is a small model: it can be wrong.",
    askPlaceholder:"e.g. what is gimbal lock?", askSend:"Send", askNew:"New", askStop:"Stop", askClose:"Close",
    askDownload:"Download the model (a few GB, once)", askDownloading:"Downloading the model", askLoading:"Loading the model…",
    askThinking:"looking…", askTool:{ list_episodes:"episode list", get_episode:"episode", search_subtitles:"subtitles" },
    askChips:["Where do I start?","How do I run the E01 exercise?","Where is gimbal lock explained?"],
    dateFmt:"en-GB"
  }
};


const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const tsToSec = ts => ts.split(":").reduce((a,b)=>a*60+(+b),0);
/* An episode is treated as published unless it sets `premiere: true`; then it shows a premiere card until `at`. */
const isOut = (e, now) => !e.premiere || now >= Date.parse(e.at);
const code = e => "E" + String(e.n).padStart(2, "0");
const TZ = "Europe/Warsaw";
const fmtLong = (iso, lang) => new Intl.DateTimeFormat(T[lang].dateFmt,{weekday:"long",day:"numeric",month:"long",hour:"2-digit",minute:"2-digit",timeZone:TZ}).format(new Date(iso));
const fmtShort = (iso, lang) => new Intl.DateTimeFormat(T[lang].dateFmt,{day:"numeric",month:"short",timeZone:TZ}).format(new Date(iso));

let lang = "pl", season = null;

/* The episode to open first: the next premiere, or the first episode of the newest season. */
function featured(now){
  const all = SEASONS.flatMap(s => s.episodes.map(e => ({ s, e }))).filter(x => x.e.video);
  const next = all.find(x => !isOut(x.e, now));
  if (next || !all.length) return next || null;
  const newest = all[all.length - 1].s;
  return all.find(x => x.s === newest);
}

function body(e, L, now){
  const d = e[lang], live = isOut(e, now), shortLive = e.short && now >= Date.parse(e.shortAt);
  const cmds = `git clone -b ${e.slug}-start ${REPO}.git\ncd silnik3d-od-zera\npython3 check.py`;
  const diff = `git diff origin/${e.slug}-solution -- ${e.file}`;
  const video = live
    ? `<div class="video" data-yt="${e.video}"><canvas class="pix" width="96" height="54" data-demo="${e.demo || "cube"}" aria-hidden="true"></canvas><img loading="lazy" alt="" onerror="this.remove()" src="https://i.ytimg.com/vi/${e.video}/hqdefault.jpg"><button class="play" aria-label="${esc(L.watchYT)}"></button></div>`
    : `<div class="video"><div class="soon"><img class="pix" src="art/room-rear.png" alt=""><div class="bubble"><b>${L.premiere}</b>${fmtLong(e.at, lang)}</div><small>${L.soonNote}</small></div></div>`;
  const ytLinks = (live ? `<a href="https://www.youtube.com/watch?v=${e.video}">${L.watchYT}</a>` : "")
    + (shortLive ? `<a href="https://www.youtube.com/shorts/${e.short}">${L.shortLink}</a>` : "");
  const ch = d.ch.map(([t,n]) => `<li><code>${t}</code> ${live ? `<a href="https://www.youtube.com/watch?v=${e.video}&t=${tsToSec(t)}s" data-seek="${tsToSec(t)}">${esc(n)}</a>` : esc(n)}</li>`).join("");
  const nt = NOTES[e.slug] && NOTES[e.slug][lang];
  const noteHtml = nt ? nt.html.replace(/\[\[(\d+:\d\d)\]\]/g, (_, t) => `<a class="ts" href="https://www.youtube.com/watch?v=${e.video}&t=${tsToSec(t)}s" data-seek="${tsToSec(t)}">${t}</a>`) : "";
  const check = k => `<button type="button" class="check" data-check="${k}" data-slug="${e.slug}" aria-pressed="${done(e.slug, k)}"><i aria-hidden="true"></i>${k === "w" ? L.doneW : L.doneP}</button>`;
  return `
    <div class="ep">
      <div>
        ${video}
        <p class="sum" style="margin-top:14px">${esc(d.sum)}</p>
        ${ytLinks ? `<div class="links-row">${ytLinks}</div>` : ""}
        <details class="ch"><summary>${L.chapters} (${d.ch.length})</summary><ol>${ch}</ol></details>
      </div>
      <div class="ex">
        <img class="ex-face pix" src="art/m-puzzled.png" alt="" width="82" height="78"><span class="label">${L.exLabel}</span>
        <h4>${esc(d.exT)}</h4>
        <p>${d.exP}</p>
        <p style="margin-bottom:8px">${L.runCmds}</p>
        <div class="cw"><pre class="cmd">${cmds.split("\n").map(l=>`<span class="p">$ </span>${esc(l)}`).join("\n")}</pre><button class="copy" type="button" data-copy="${esc(cmds)}">${L.copy}</button></div>
        <p class="after">${L.afterPass.replace("{f}", `<code>${e.file}</code>`)}</p>
        <div class="cw" style="margin-top:8px"><pre class="cmd"><span class="p">$ </span>${esc(diff)}</pre><button class="copy" type="button" data-copy="${esc(diff)}">${L.copy}</button></div>
        <div class="sol">
          <a href="${REPO}/tree/${e.slug}-start">${L.startBranch}</a>
          <a href="${REPO}/tree/${e.slug}-solution">${L.solution}</a>
          <a href="${REPO}/tree/${e.ep}">${L.fullCode}</a>
        </div>
      </div>
      <div class="checks">${check("w")}${check("p")}</div>
      ${nt ? `<details class="note"><summary><img class="pix" src="art/m-focus.png" alt="" width="41" height="39"><span class="label">${L.note}</span><b>${esc(nt.t)}</b><small>${esc(nt.min)}</small></summary><article>${noteHtml}</article></details>` : ""}
    </div>`;
}

/* Paints ticks in the rows and wakes up the mascots at the bottom, one sixth of the way at a time. */
function paintProgress(){
  const eps = SEASONS.flatMap(s => s.episodes).filter(e => e.video);
  const total = eps.length * 2, n = eps.reduce((a, e) => a + done(e.slug, "w") + done(e.slug, "p"), 0);
  document.querySelectorAll(".ticks").forEach(t => { t.children[0].classList.toggle("on", done(t.dataset.slug, "w")); t.children[1].classList.toggle("on", done(t.dataset.slug, "p")); });
  document.querySelectorAll(".check").forEach(b => b.setAttribute("aria-pressed", done(b.dataset.slug, b.dataset.check)));
  const faces = document.querySelectorAll(".faces .strip img"), lit = total ? Math.round(faces.length * n / total) : 0;
  faces.forEach((f, i) => f.classList.toggle("lit", i < lit));
  const c = document.getElementById("progressCount");
  if (c) c.textContent = `${T[lang].progressLabel}: ${n}/${total}`;
}

function renderEpisodes(){
  const L = T[lang], now = Date.now(), f = featured(now);
  if (season === null) season = f ? f.s.n : SEASONS[0].n;
  const open = new Set([...document.querySelectorAll("details.row[open]")].map(d => d.id));
  const first = !document.querySelector("#episodes .row");
  const tabs = document.getElementById("seasons");
  tabs.hidden = SEASONS.length < 2;
  tabs.innerHTML = SEASONS.map(s => {
    const ready = s.episodes.filter(e => e.video).length;
    return `<button type="button" role="tab" data-season="${s.n}" aria-selected="${s.n === season}">${esc(s[lang].t)}<span>${ready}/${s.episodes.length}</span></button>`;
  }).join("");
  const s = SEASONS.find(x => x.n === season) || SEASONS[0];
  document.getElementById("episodes").innerHTML = s.episodes.map(e => {
    const d = e[lang];
    if (!e.video)
      return `<div class="row planned" id="${e.slug}"><div class="row-head"><span class="ep-num">${code(e)}</span><h3>${esc(d.t)}</h3><span class="pill">${L.planned}</span></div></div>`;
    const live = isOut(e, now), isF = f && f.e === e;
    const pill = live
      ? (isF ? `<span class="pill live">${L.startHere}</span>` : "")
      : `<span class="pill soon-pill">${isF ? L.nextUp + " · " : ""}${fmtShort(e.at, lang)}</span>`;
    const isOpen = first ? isF : open.has(e.slug);
    return `<details class="row${isF ? " featured" : ""}" id="${e.slug}"${isOpen ? " open" : ""}>
      <summary class="row-head"><canvas class="thumb pix" width="48" height="30" data-demo="${e.demo || "cube"}" aria-hidden="true"></canvas><span class="ep-num">${code(e)}</span><h3>${esc(d.t)}</h3><span class="ticks" data-slug="${e.slug}" aria-hidden="true"><i></i><i></i></span><span class="ep-meta">${e.len}</span>${pill}<span class="chev" aria-hidden="true"></span></summary>
      ${body(e, L, now)}
    </details>`;
  }).join("");
  const next = s.next || [], ready = s.episodes.filter(e => e.video).length;
  document.getElementById("seasonIntro").innerHTML = `<b>${esc(s[lang].t)}</b><span>${esc(s[lang].d || "")}</span><small>${L.seasonCount.replace("{a}", ready).replace("{b}", s.episodes.length + next.length)}</small>`;
  const tile = (num, x, d, big) => `<li${big ? ' class="big"' : ""}><canvas class="pix" width="${big ? 96 : 48}" height="${big ? 54 : 30}" data-demo="${x.demo}" aria-hidden="true"></canvas><div><span class="ep-num">${num}</span><span class="pill">${L.planned}</span><h3>${esc(x[lang].t)}</h3><p>${esc(d)}</p></div></li>`;
  document.getElementById("teasers").innerHTML =
    (next.length ? `<h3 class="sub">${L.nextEps}</h3><ul class="tiles">${next.map(x => tile(code(x), x, x[lang].q)).join("")}</ul>` : "")
    + (UPCOMING.length ? `<h3 class="sub">${L.nextSeasons}</h3><ul class="tiles two">${UPCOMING.map(x => tile(`${L.season} ${x.n}`, x, x[lang].d, true)).join("")}</ul>` : "");
  paintProgress();
}

function setLang(next){
  lang = T[next] ? next : "pl";
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-t]").forEach(el => { el.innerHTML = T[lang][el.dataset.t]; });
  document.querySelectorAll(".lang button").forEach(b => b.setAttribute("aria-pressed", b.dataset.lang === lang));
  document.title = lang === "pl" ? "Silnik 3D w C++ od zera · gamedev.pl" : "C++ 3D Engine From Scratch · gamedev.pl";
  renderEpisodes();
  try { localStorage.setItem("lang", lang); } catch(_){}
  try { const u = new URL(location); u.searchParams.set("lang", lang); history.replaceState(null, "", u); } catch(_){}
  document.dispatchEvent(new CustomEvent("silnik:lang", { detail: lang }));
}

document.getElementById("playlistBtn").href = PLAYLIST;
document.querySelectorAll(".lang button").forEach(b => b.addEventListener("click", () => setLang(b.dataset.lang)));
document.addEventListener("click", ev => {
  const tab = ev.target.closest("[data-season]");
  if (tab){ season = +tab.dataset.season; renderEpisodes(); return; }
  const chk = ev.target.closest(".check");
  if (chk){
    const p = progress[chk.dataset.slug] || (progress[chk.dataset.slug] = {});
    p[chk.dataset.check] = p[chk.dataset.check] ? 0 : 1;
    try { localStorage.setItem(KEY, JSON.stringify(progress)); } catch(_){}
    paintProgress(); return;
  }
  const c = ev.target.closest(".copy");
  if (c){
    navigator.clipboard.writeText(c.dataset.copy).then(() => {
      c.textContent = T[lang].copied;
      setTimeout(() => c.textContent = T[lang].copy, 1500);
    }).catch(() => {});
    return;
  }
  /* A chapter plays from its moment in the player on the page; a modified click still opens YouTube. */
  const seek = ev.target.closest("a[data-seek]");
  const plain = !(ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey || ev.button);
  const p = ev.target.closest(".video[data-yt] .play");
  const box = p ? p.parentElement : seek && plain ? seek.closest(".row").querySelector(".video[data-yt]") : null;
  if (box){
    if (seek) ev.preventDefault();
    const start = seek ? `&start=${seek.dataset.seek}` : "";
    box.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${box.dataset.yt}?autoplay=1&rel=0${start}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen title="YouTube"></iframe>`;
    if (seek) box.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
});

(function initLang(){
  let l = new URLSearchParams(location.search).get("lang");
  if (!T[l]) { try { l = localStorage.getItem("lang"); } catch(_){} }
  if (!T[l]) l = (navigator.language || "pl").toLowerCase().startsWith("pl") ? "pl" : "en";
  setLang(l);
})();

/* The hero cuts between the two camera angles of the film: the face with the screen in its
   glasses, and the view over the shoulder at the CRT. Sheets are 320x180 frames at 12 fps. */
(function hero(){
  const face = document.getElementById("face"), rear = document.querySelector(".shot.rear"), bub = document.getElementById("heroBubble");
  const SHEETS = { idle: 42, puzzled: 30, satisfied: 30, curious: 30, surprised: 30 };
  const CUTS = [
    { sheet: "idle", bubble: "bubble" },
    { sheet: "puzzled", bubble: "bubble" },
    { rear: 5 },
    { sheet: "satisfied", bubble: "bubblePass", hold: 1.5 },
    { rear: 4 },
    { sheet: "surprised" },
    { sheet: "curious", bubble: "bubble" },
    { rear: 5 },
  ];
  for (const name in SHEETS) new Image().src = `art/face-${name}.png`;
  let cut = 0, frame = 0, held = 0, text = "";
  function show(){
    const c = CUTS[cut], key = c.rear ? "" : c.bubble || "";
    rear.hidden = !c.rear; face.hidden = !!c.rear;
    if (!c.rear){
      const n = SHEETS[c.sheet];
      face.style.backgroundImage = `url(art/face-${c.sheet}.png)`;
      face.style.backgroundSize = `${n * 100}% 100%`;
      face.style.backgroundPosition = `${Math.min(frame, n - 1) / (n - 1) * 100}% 0`;
    }
    const next = key ? T[lang][key] : "";
    if (next !== text){ bub.innerHTML = text = next; }
  }
  function tick(){
    const c = CUTS[cut], len = c.rear ? c.rear * 12 : SHEETS[c.sheet] + (c.hold || 0) * 12;
    if (++frame >= len){ frame = 0; cut = (cut + 1) % CUTS.length; }
    show();
  }
  show();
  document.addEventListener("silnik:lang", () => { text = ""; show(); });
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) setInterval(tick, 1000 / 12);
})();

/* For assistant.js. */
window.SILNIK = { T, lang: () => lang, code, isOut, render: renderEpisodes };

/* Small pixel programs, one per episode, drawn at 12 fps like the film: what each one builds.
   The same cube also runs on the hero's CRT. */
(function demos(){
  const V = [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
  const E = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
  function line(g,x0,y0,x1,y1){
    x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);
    const dx=Math.abs(x1-x0), dy=-Math.abs(y1-y0), sx=x0<x1?1:-1, sy=y0<y1?1:-1; let e=dx+dy;
    for(;;){ g.fillRect(x0,y0,1,1); if(x0===x1&&y0===y1) break; const e2=2*e; if(e2>=dy){e+=dy;x0+=sx} if(e2<=dx){e+=dx;y0+=sy} }
  }
  const DRAW = {
    /* E00: the background goes dark, light, dark. */
    pulse(g,W,H,t){
      const k = (1 - Math.cos(t * 2.2)) / 2, c = (lo,hi) => Math.round(lo + (hi - lo) * k);
      g.fillStyle = `rgb(${c(65,244)},${c(26,137)},${c(16,44)})`; g.fillRect(0,0,W,H);
    },
    /* E01: a square that jumps the same at any frame rate. */
    jump(g,W,H,t){
      g.fillStyle = "#844021"; g.fillRect(0,0,W,H);
      const floor = Math.round(H * 0.82), size = Math.max(5, Math.round(H * 0.2)), p = (t * 0.9) % 1;
      g.fillStyle = "#cc854e"; g.fillRect(Math.round(W*0.08), floor, Math.round(W*0.84), 1);
      const y = Math.round(4 * p * (1 - p) * H * 0.5);
      g.fillStyle = "#151423"; g.fillRect(Math.round(W/2 - size/2) - 1, floor - size - y - 1, size + 2, size + 2);
      g.fillStyle = "#b9ffdc"; g.fillRect(Math.round(W/2 - size/2), floor - size - y, size, size);
    },
    /* E02: 8 corners, 12 edges, corner 6 in yellow. */
    cube(g,W,H,t){
      const s = H * 0.25, yaw = t*0.6, pitch = 0.5 + Math.sin(t*0.37)*0.25;
      const cy=Math.cos(yaw), sy=Math.sin(yaw), cp=Math.cos(pitch), sp=Math.sin(pitch);
      const P = V.map(([x,y,z]) => {
        const X = x*cy + z*sy, Z0 = -x*sy + z*cy, Y = y*cp - Z0*sp, Z = y*sp + Z0*cp, k = 4.5/(4.5+Z);
        return [W/2 + X*s*k, H/2 + Y*s*k, Z];
      });
      g.fillStyle = "#151423"; g.fillRect(0,0,W,H);
      for (const [a,b] of E){ g.fillStyle = (P[a][2]+P[b][2])/2 > 0.3 ? "#8e7e79" : "#ffe1a2"; line(g,P[a][0],P[a][1],P[b][0],P[b][1]); }
      const big = W > 60;
      P.forEach(([x,y],i) => {
        x=Math.round(x); y=Math.round(y);
        if (i === 6){ g.fillStyle = "#eea75e"; big ? g.fillRect(x-2,y-2,5,5) : g.fillRect(x-1,y-1,3,3); }
        else if (big){ g.fillStyle = "#76ddaf"; g.fillRect(x-1,y-1,3,3); }
      });
    },
  };
  /* Teasers for planned episodes and seasons. */
  const bg = (g,W,H,c) => { g.fillStyle = c || "#151423"; g.fillRect(0,0,W,H); };
  const box = (g,x,y,w,h,c) => { g.fillStyle = c; g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h)); };
  Object.assign(DRAW, {
    /* E03: a triangle fills row by row. */
    tri(g,W,H,t){
      bg(g,W,H); const rows = H - 8, n = Math.floor((t * 9) % (rows + 10));
      for (let i = 0; i < rows; i++){ const w = Math.round((i + 1) * (W * 0.5) / rows); box(g, W/2 - w/2, 4 + i, w, 1, i < n ? "#eea75e" : "#353044"); }
    },
    /* E04: two faces swap which one is drawn on top. */
    depth(g,W,H,t){
      bg(g,W,H); const s = H * 0.5, a = [W*0.24, H*0.16, "#76ddaf"], b = [W*0.42, H*0.34, "#eea75e"];
      for (const [x,y,c] of (Math.floor(t / 1.4) % 2 ? [a,b] : [b,a])){ box(g,x-1,y-1,s+2,s+2,"#151423"); box(g,x,y,s,s,c); }
    },
    /* E05: a checkerboard floor sliding towards the camera. */
    tex(g,W,H,t){
      bg(g,W,H,"#242134"); const hz = Math.round(H * 0.3);
      for (let y = hz; y < H; y++){
        const d = (y - hz + 1) / (H - hz), z = 1 / d + t * 2;
        for (let x = 0; x < W; x++){ const u = (x - W/2) / (d * W * 0.5); g.fillStyle = (Math.floor(u * 2) + Math.floor(z * 2)) & 1 ? "#ffe1a2" : "#503849"; g.fillRect(x,y,1,1); }
      }
    },
    /* E06: a ball with a highlight that follows the lamp. */
    light(g,W,H,t){
      bg(g,W,H); const r = H * 0.36, cx = W/2, cy = H/2, lx = Math.cos(t * 1.2) * 0.7, ly = -0.5;
      for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++){
        const d = x*x + y*y; if (d > r*r) continue;
        const nx = x / r, ny = y / r, nz = Math.sqrt(Math.max(0, 1 - nx*nx - ny*ny)), k = nx*lx + ny*ly + nz*0.6;
        g.fillStyle = k > 0.95 ? "#ffe1a2" : k > 0.6 ? "#76ddaf" : k > 0.25 ? "#367879" : "#283b44"; g.fillRect(Math.round(cx + x), Math.round(cy + y), 1, 1);
      }
    },
    /* E07: one mesh, drawn twice. */
    mesh(g,W,H,t){
      bg(g,W,H); const s = H * 0.17, pitch = 0.5, P = (ox, yaw) => V.map(([x,y,z]) => { const cy=Math.cos(yaw), sy=Math.sin(yaw), X=x*cy+z*sy, Z0=-x*sy+z*cy; return [ox + X*s, H/2 + (y*Math.cos(pitch) - Z0*Math.sin(pitch))*s]; });
      [[W*0.28, t*0.8, "#ffe1a2"], [W*0.72, -t*0.5, "#76ddaf"]].forEach(([ox,yaw,c]) => { const p = P(ox,yaw); g.fillStyle = c; for (const [a,b] of E) line(g,p[a][0],p[a][1],p[b][0],p[b][1]); });
    },
    /* E08: three objects; one is removed and its place reused. */
    scene(g,W,H,t){
      bg(g,W,H); const s = Math.round(H * 0.3), y = H * 0.56, ph = Math.floor(t / 0.9) % 4;
      box(g, W*0.08, y + s, W*0.84, 1, "#755052");
      [["#76ddaf",1],["#eea75e", ph !== 1],["#ffe1a2",1]].forEach(([c,on],i) => { const x = W*0.2 + i * W*0.24; if (on) box(g, x, y - (i === 1 && ph === 2 ? 3 : 0), s, s, i === 1 && ph >= 2 ? "#5fd3f3" : c); else { g.fillStyle = "#353044"; g.fillRect(Math.round(x), Math.round(y + s - 1), s, 1); } });
    },
    /* Season 2: a robot carries a cell to the socket and the lamp comes on. */
    robot(g,W,H,t){
      const p = (t * 0.25) % 1, lit = p > 0.72; bg(g,W,H, lit ? "#503849" : "#151423");
      const fl = Math.round(H * 0.8), sx = W * 0.82; box(g,0,fl,W,1,"#755052");
      box(g, W*0.5 - 4, 3, 8, 3, lit ? "#ffe1a2" : "#353044"); if (lit) box(g, W*0.5 - 9, 6, 18, 1, "#eea75e");
      box(g, sx, fl - 9, 6, 9, "#353044"); box(g, sx + 1, fl - 7, 4, 4, lit ? "#00e4ac" : "#151423");
      const x = W * 0.1 + Math.min(p / 0.72, 1) * (sx - W * 0.1 - 9);
      box(g, x, fl - 7, 7, 6, "#76ddaf"); box(g, x + 1, fl - 1, 2, 1, "#283b44"); box(g, x + 4, fl - 1, 2, 1, "#283b44"); box(g, x + 4, fl - 5, 2, 2, "#151423");
      if (!lit) box(g, x + 2, fl - 11, 3, 4, "#eea75e");
    },
    /* Season 3: a level grid; the cursor picks a block and moves it. */
    editor(g,W,H,t){
      bg(g,W,H,"#172229"); const c = 6;
      g.fillStyle = "#283b44"; for (let x = 3; x < W; x += c) g.fillRect(x,0,1,H); for (let y = 3; y < H; y += c) g.fillRect(0,y,W,1);
      const cell = (i,j,col) => box(g, 4 + i*c, 4 + j*c, c - 1, c - 1, col);
      [[2,2],[3,2],[4,2],[4,3],[9,5],[10,5],[11,5]].forEach(([i,j]) => cell(i,j,"#755052")); cell(12,2,"#00e4ac");
      const k = Math.floor(t * 2) % 10, i = 6 + Math.min(k, 4), j = 4 + (k > 5 ? 1 : 0); cell(i,j,"#eea75e");
      g.fillStyle = "#ffe1a2"; const px = 4 + i*c + 3, py = 4 + j*c + 3; g.fillRect(px,py,1,5); g.fillRect(px,py,4,1); g.fillRect(px+1,py+1,1,1); g.fillRect(px+2,py+2,1,1);
    },
  });
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let last = -1;
  function frame(now){
    const step = Math.floor(now / 83);
    if (step !== last){
      last = step;
      for (const cv of document.querySelectorAll("canvas[data-demo]")){
        if (!cv.offsetParent) continue;
        (DRAW[cv.dataset.demo] || DRAW.cube)(cv.getContext("2d"), cv.width, cv.height, still ? 1.1 : step * 0.083);
      }
    }
    if (!still) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  if (still) document.addEventListener("silnik:lang", () => { last = -1; requestAnimationFrame(frame); });
})();

})();

/* The helper needs the browser's built-in model, so the rest of the page never waits for it. */
if ("LanguageModel" in self || self.__silnikModel) import("./assistant.js").catch(() => {});
