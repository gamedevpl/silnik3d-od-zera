/* Page logic: language switch, season tabs, episode rows. Data lives in series.js. */
(function(){
const { repo: REPO, playlist: PLAYLIST, seasons: SEASONS } = window.SERIES;

const T = {
  pl: {
    navHow:"Jak to działa", navEps:"Odcinki", navCode:"Kod",
    kicker:"Seria na YouTube · C++ · OpenGL",
    title:"Silnik 3D w C++ <span class=\"tq\">od zera</span>", titleAlt:"C++ 3D Engine From Scratch",
    lede:"Budujemy własny silnik 3D, zaczynając od pustego katalogu. Bez lektora: prawdziwy Vim, prawdziwe błędy i napisy PL/EN. Każdy odcinek kończy się zadaniem, które sprawdzisz u siebie jedną komendą.",
    ctaPlaylist:"Playlista na YouTube", ctaCode:"Kod na GitHubie",
    factSubs:"napisy PL/EN",
    bubble:"12 krawędzi.<br>Czemu jedna<br>po skosie?", crumb:"Silnik 3D od zera",
    howTitle:"Jak to działa",
    howLede:"Oglądasz, jak kod powstaje, a na końcu dostajesz jedną małą rzecz do naprawienia samodzielnie.",
    s1t:"Oglądasz", s1p:"Od pustego main() do działającego programu. Bez lektora, z napisami po polsku albo angielsku. Rozdziały w opisie pozwalają wrócić do konkretnego miejsca.",
    s2t:"Klonujesz start", s2p:"Każde zadanie ma gałąź startową. Jedna komenda git clone i masz dokładnie ten kod, który był na ekranie, z jednym zepsutym miejscem.",
    s3t:"Naprawiasz do PASS", s3p:"python3 check.py najpierw powie RETRY. Poprawiasz jeden plik i uruchamiasz ponownie. Po PASS porównujesz swoją wersję z rozwiązaniem.",
    termRetry:"tło nie pulsuje",
    epsTitle:"Odcinki", epsLede:"Premiery w środy o 18:00 czasu polskiego. Short z każdego odcinka wychodzi kilka dni później.",
    premiere:"Premiera", soonNote:"Do tego czasu kod i zadanie już czekają poniżej.",
    open:"Rozwiń", nextUp:"Najbliższa premiera", latest:"Najnowszy", outNow:"Już jest", planned:"W planie", season:"Sezon", watchYT:"Oglądaj na YouTube", shortLink:"Short", chapters:"Rozdziały",
    exLabel:"Twoja kolej", runCmds:"W terminalu uruchom kolejno:",
    afterPass:"Pierwszy wynik to RETRY. Zapisz zmianę w {f} i uruchom check.py ponownie. Po PASS porównaj z rozwiązaniem:",
    solution:"Rozwiązanie", fullCode:"Pełny kod po odcinku", startBranch:"Gałąź startowa",
    copy:"kopiuj", copied:"skopiowane",
    reqTitle:"Czego potrzebujesz",
    req1:"Do zadań: Git, Python 3 i kompilator C++17 (GCC albo Clang).",
    req2:"Do całego silnika z odcinków: CMake, Ninja, GLFW, GLAD i karta z OpenGL 3.3 core.",
    req3:"Kod na licencji MIT. Bierz, zmieniaj, buduj swoje.",
    nextTitle:"Co dalej",
    nextP:"Odcinek 2 kończy się zapowiedzią trójkątów. Zanim nagram ciąg dalszy, chcę zobaczyć, jak Wam idą zadania. Napisz pod filmem, co zadziałało, a co nie.",
    made:"Made by", madeBy:"Prowadzi Grzegorz, który robi gry od 1997, dziś głównie przeglądarkowe na gamedev.pl.",
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
    lede:"Building my own 3D engine, starting from an empty folder. No voiceover: real Vim, real errors and subtitles in English and Polish. Every episode ends with an exercise you check on your machine with one command.",
    ctaPlaylist:"YouTube playlist", ctaCode:"Code on GitHub",
    factSubs:"EN/PL subtitles",
    bubble:"12 edges.<br>Why is one<br>diagonal?", crumb:"3D Engine From Scratch",
    howTitle:"How it works",
    howLede:"You watch the code being written, and at the end you get one small thing to fix yourself.",
    s1t:"Watch", s1p:"From an empty main() to a running program. No voiceover, subtitles in English or Polish. Chapters in the description take you back to any step.",
    s2t:"Clone the start", s2p:"Every exercise has a start branch. One git clone and you have exactly the code from the screen, with one broken spot.",
    s3t:"Fix it until PASS", s3p:"python3 check.py first prints RETRY. Change one file and run it again. Once you get PASS, compare your edit with the solution.",
    termRetry:"background does not pulse",
    epsTitle:"Episodes", epsLede:"New episodes on Wednesdays, 18:00 Warsaw time. A Short from each episode follows a few days later.",
    premiere:"Premiere", soonNote:"The code and the exercise are already waiting below.",
    open:"Open", nextUp:"Next premiere", latest:"Latest", outNow:"Out now", planned:"Planned", season:"Season", watchYT:"Watch on YouTube", shortLink:"Short", chapters:"Chapters",
    exLabel:"Your turn", runCmds:"Run these commands in your terminal:",
    afterPass:"The first check prints RETRY. Save your change in {f} and run check.py again. Once you get PASS, compare with the solution:",
    solution:"Solution", fullCode:"Full code after the episode", startBranch:"Start branch",
    copy:"copy", copied:"copied",
    reqTitle:"What you need",
    req1:"For the exercises: Git, Python 3 and a C++17 compiler (GCC or Clang).",
    req2:"For the whole engine from the episodes: CMake, Ninja, GLFW, GLAD and a GPU with OpenGL 3.3 core.",
    req3:"The code is MIT licensed. Take it, change it, build your own.",
    nextTitle:"What's next",
    nextP:"Episode 2 ends with triangles coming up. Before I record more, I want to see how the exercises go for you. Tell me under the video what worked and what didn't.",
    made:"Made by", madeBy:"By Grzegorz, making games since 1997, these days mostly browser games on gamedev.pl.",
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
const code = e => "E" + String(e.n).padStart(2, "0");
const TZ = "Europe/Warsaw";
const fmtLong = (iso, lang) => new Intl.DateTimeFormat(T[lang].dateFmt,{weekday:"long",day:"numeric",month:"long",hour:"2-digit",minute:"2-digit",timeZone:TZ}).format(new Date(iso));
const fmtShort = (iso, lang) => new Intl.DateTimeFormat(T[lang].dateFmt,{day:"numeric",month:"short",timeZone:TZ}).format(new Date(iso));

let lang = "pl", season = null;

/* The episode to open first: the next premiere, or the latest one that is out. */
function featured(now){
  const all = SEASONS.flatMap(s => s.episodes.map(e => ({ s, e }))).filter(x => x.e.video);
  return all.find(x => Date.parse(x.e.at) > now) || all[all.length - 1] || null;
}

function body(e, L, now){
  const d = e[lang], live = now >= Date.parse(e.at), shortLive = e.short && now >= Date.parse(e.shortAt);
  const cmds = `git clone -b ${e.slug}-start ${REPO}.git\ncd silnik3d-od-zera\npython3 check.py`;
  const diff = `git diff origin/${e.slug}-solution -- ${e.file}`;
  const video = live
    ? `<div class="video" data-yt="${e.video}"><img loading="lazy" alt="" onerror="this.remove()" src="https://i.ytimg.com/vi/${e.video}/hqdefault.jpg"><button class="play" aria-label="${esc(L.watchYT)}"></button></div>`
    : `<div class="video"><div class="soon"><img class="pix" src="room.png" alt=""><div class="bubble"><b>${L.premiere}</b>${fmtLong(e.at, lang)}</div><small>${L.soonNote}</small></div></div>`;
  const ytLinks = (live ? `<a href="https://www.youtube.com/watch?v=${e.video}">${L.watchYT}</a>` : "")
    + (shortLive ? `<a href="https://www.youtube.com/shorts/${e.short}">${L.shortLink}</a>` : "");
  const ch = d.ch.map(([t,n]) => `<li><code>${t}</code> ${live ? `<a href="https://www.youtube.com/watch?v=${e.video}&t=${tsToSec(t)}s">${esc(n)}</a>` : esc(n)}</li>`).join("");
  return `
    <div class="ep">
      <div>
        ${video}
        <p class="sum" style="margin-top:14px">${esc(d.sum)}</p>
        ${ytLinks ? `<div class="links-row">${ytLinks}</div>` : ""}
        <details class="ch"><summary>${L.chapters} (${d.ch.length})</summary><ol>${ch}</ol></details>
      </div>
      <div class="ex">
        <span class="label">${L.exLabel}</span>
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
    </div>`;
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
    const live = now >= Date.parse(e.at), isF = f && f.e === e;
    const pill = live
      ? `<span class="pill live">${isF ? L.latest : L.outNow}</span>`
      : `<span class="pill soon-pill">${isF ? L.nextUp + " · " : ""}${fmtShort(e.at, lang)}</span>`;
    const isOpen = first ? isF : open.has(e.slug);
    return `<details class="row${isF ? " featured" : ""}" id="${e.slug}"${isOpen ? " open" : ""}>
      <summary class="row-head"><span class="ep-num">${code(e)}</span><h3>${esc(d.t)}</h3><span class="ep-meta">${e.len}</span>${pill}<span class="chev" aria-hidden="true"></span></summary>
      ${body(e, L, now)}
    </details>`;
  }).join("");
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
  const c = ev.target.closest(".copy");
  if (c){
    navigator.clipboard.writeText(c.dataset.copy).then(() => {
      c.textContent = T[lang].copied;
      setTimeout(() => c.textContent = T[lang].copy, 1500);
    }).catch(() => {});
    return;
  }
  const p = ev.target.closest(".video[data-yt] .play");
  if (p){
    const box = p.parentElement, id = box.dataset.yt;
    box.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen title="YouTube"></iframe>`;
  }
});

(function initLang(){
  let l = new URLSearchParams(location.search).get("lang");
  if (!T[l]) { try { l = localStorage.getItem("lang"); } catch(_){} }
  if (!T[l]) l = (navigator.language || "pl").toLowerCase().startsWith("pl") ? "pl" : "en";
  setLang(l);
})();

/* For assistant.js. */
window.SILNIK = { T, lang: () => lang, code, render: renderEpisodes };

/* The CRT shows what episode 2 ends with: 8 corners, 12 edges, corner 6 in yellow.
   Drawn at the monitor's own 95x60 pixels, like the film. */
(function cube(){
  const cv = document.getElementById("cube"), g = cv.getContext("2d");
  const V = [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
  const E = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const W = cv.width, H = cv.height, s = 15;
  function line(x0,y0,x1,y1){
    x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);
    const dx=Math.abs(x1-x0), dy=-Math.abs(y1-y0), sx=x0<x1?1:-1, sy=y0<y1?1:-1; let e=dx+dy;
    for(;;){ g.fillRect(x0,y0,1,1); if(x0===x1&&y0===y1) break; const e2=2*e; if(e2>=dy){e+=dy;x0+=sx} if(e2<=dx){e+=dx;y0+=sy} }
  }
  let last = -1;
  function frame(now){
    const step = Math.floor(now / 80);           // ~12 fps, stepped like pixel animation
    if (step !== last){
      last = step;
      const t = reduce ? 1.1 : step * 0.08;
      const yaw = t*0.6, pitch = 0.5 + Math.sin(t*0.37)*0.25;
      const cy=Math.cos(yaw), sy=Math.sin(yaw), cp=Math.cos(pitch), sp=Math.sin(pitch);
      const P = V.map(([x,y,z]) => {
        const X = x*cy + z*sy, Z0 = -x*sy + z*cy, Y = y*cp - Z0*sp, Z = y*sp + Z0*cp, k = 4.5/(4.5+Z);
        return [W/2 + X*s*k, H/2 + Y*s*k, Z];
      });
      g.fillStyle = "#151423"; g.fillRect(0,0,W,H);
      for (const [a,b] of E){
        g.fillStyle = (P[a][2]+P[b][2])/2 > 0.3 ? "#8e7e79" : "#ffe1a2";
        line(P[a][0],P[a][1],P[b][0],P[b][1]);
      }
      P.forEach(([x,y],i) => {
        x=Math.round(x); y=Math.round(y);
        if (i === 6){ g.fillStyle = "#eea75e"; g.fillRect(x-2,y-2,5,5); g.fillStyle="#ffe1a2"; g.fillRect(x-1,y-1,3,3); }
        else { g.fillStyle = "#76ddaf"; g.fillRect(x-1,y-1,3,3); }
      });
      g.fillStyle = "#76ddaf"; g.fillRect(2,H-4,(step>>3)%2?3:0,2); // cursor blink
    }
    if (!reduce) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

})();

/* The helper needs the browser's built-in model, so the rest of the page never waits for it. */
if ("LanguageModel" in self || self.__silnikModel) import("./assistant.js").catch(() => {});
