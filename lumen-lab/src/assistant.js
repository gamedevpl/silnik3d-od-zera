/* The gamedev.pl mascot on Lumen Lab: explains the scenes, says where they are in the film and
   switches the running scene. Same panel as the rest of the site (../ask/ask.js), on the
   browser's own model through genaicode/browser. Nothing leaves the page.
   Loaded by index.html only where that model exists. */
import { createPageAgent } from "https://cdn.jsdelivr.net/npm/genaicode@2.33.0/dist/browser.js";
import { mountAsk, esc } from "../../ask/ask.js";

const L = window.LUMEN;
const live = () => Date.now() >= Date.parse(L.FILM.premiere);
const line = s => `${s.id}: "${s.en}" (chapter "${s.chapter.en}", film ${s.chapter.at}). ${s.nen}`;
const STOP = new Set("the a an is are was were do does did how what where when why which who in on of to for and or it this that with i my me you can show scene light".split(" "));
const words = t => String(t).toLowerCase().match(/[a-z0-9-]{2,}/g)?.filter(w => !STOP.has(w)) ?? [];

const tools = [
  {
    name: "list_scenes",
    description: "Every scene of Lumen Lab grouped by the film's chapters: scene id, name, chapter start time in the film.",
    run: () => L.CHAPTERS.map(c => `${c.en} (film ${c.at}): ` + c.scenes.map(([id, , en]) => `${id} "${en}"`).join("; ")).join("\n"),
  },
  {
    name: "current_scene",
    description: "The scene running on screen right now, with what it shows.",
    run: () => line(L.current()),
  },
  {
    name: "find_scene",
    description: "Find scenes about a technique or problem. Give key words, e.g. \"shadow acne\", \"lightmap\", \"noise\".",
    inputSchema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] },
    run: ({ query }) => {
      const q = words(query);
      if (!q.length) return "Give one or two key words.";
      const hits = L.SCENES.map(s => {
        const low = `${s.id} ${s.en} ${s.chapter.en} ${s.chapter.ens} ${s.nen}`.toLowerCase();
        return { s, score: q.reduce((n, w) => n + (low.includes(w) ? 1 : 0), 0) };
      }).filter(h => h.score).sort((a, b) => b.score - a.score);
      return hits.length ? hits.slice(0, 4).map(h => line(h.s)).join("\n") : "No scene matches. Try list_scenes.";
    },
  },
  {
    name: "show_scene",
    description: "Switch the screen to a scene, by its id from list_scenes or find_scene.",
    inputSchema: { type: "object", properties: { id: { type: "string", enum: L.SCENES.map(s => s.id) } }, required: ["id"] },
    run: ({ id }) => L.show(id) ? `Now showing ${line(L.current())}` : "No such scene.",
  },
  {
    name: "about",
    description: "What Lumen Lab is, the film it comes from, where the code is and its licence.",
    run: () => [
      "Lumen Lab is the demo from the Polish YouTube video essay \"Ujarzmić fotony: 40 lat światła i cienia w grach\" (forty years of light and shadow in games) by GamedevPL.",
      live() ? `The film is on YouTube: https://www.youtube.com/watch?v=${L.FILM.id}` : "The film premieres on YouTube on 8 January 2027.",
      "One scene (three columns, a character, a lantern) shows each technique: palette light, blob shadows, Gouraud, lightmaps, shadow volumes, shadow maps, deferred shading, SSAO, PBR, path tracing, ReSTIR, distance fields.",
      "Plain JavaScript and raw WebGL2, no libraries. Code: https://github.com/gamedevpl/silnik3d-od-zera/tree/main/lumen-lab (MIT). No game assets or id Software code; techniques are reimplemented from published papers.",
      "Mood scenes set the atmosphere and do not recreate any game.",
    ].join("\n"),
  },
];

const agent = createPageAgent({
  name: "mascot",
  instructions: [
    "You are the gamedev.pl mascot on Lumen Lab, a WebGL2 demo of forty years of lighting tricks in games, made for a GamedevPL video essay.",
    "Use the tools for every fact. Never invent scenes, times or techniques the tools do not mention.",
    "When the user wants to see something, find the scene and call show_scene.",
    "Name scenes by their id in backticks, like `D4-b`, and film moments as film 13:27.",
    "Answer in English, in one to four short sentences.",
    "If the tools do not answer the question, say you do not know.",
  ].join(" "),
  tools,
  nano: { language: "en", maxSteps: 4, ...(self.__silnikModel ? { languageModel: self.__silnikModel } : {}) },
});

const T = {
  en: {
    askOpen: "Ask the mascot", askTitle: "Ask about Lumen Lab", askNew: "New", askClose: "Close",
    askNote: "Runs on your browser's built-in model. Nothing leaves this page. It answers in English and can be wrong.",
    askPlaceholder: "Why does the shadow detach?", askSend: "Ask", askStop: "Stop",
    askDownload: "Download the model (once)", askDownloading: "Downloading", askLoading: "Starting the model…",
    askHello: "Hi! Ask what a scene shows, or tell me what you want to see and I will switch to it.",
    askThinking: "Thinking…",
    askChips: ["What am I looking at?", "Show me shadow acne", "How did Doom do lighting?"],
    askTool: { list_scenes: "scenes", current_scene: "this scene", find_scene: "searching", show_scene: "switching scene", about: "about" },
  },
  pl: {
    askOpen: "Zapytaj maskotkę", askTitle: "Zapytaj o Lumen Lab", askNew: "Od nowa", askClose: "Zamknij",
    askNote: "Działa na modelu wbudowanym w przeglądarkę. Nic nie wychodzi z tej strony. Odpowiada po angielsku i czasem się myli.",
    askPlaceholder: "Why does the shadow detach?", askSend: "Zapytaj", askStop: "Stop",
    askDownload: "Pobierz model (raz)", askDownloading: "Pobieranie", askLoading: "Uruchamiam model…",
    askHello: "Cześć! Zapytaj, co pokazuje scena, albo powiedz, co chcesz zobaczyć, a przełączę.",
    askThinking: "Myślę…",
    askChips: ["What am I looking at?", "Show me shadow acne", "How did Doom do lighting?"],
    askTool: { list_scenes: "sceny", current_scene: "ta scena", find_scene: "szukam", show_scene: "przełączam scenę", about: "o demie" },
  },
};

const ids = new Set(L.SCENES.map(s => s.id.toLowerCase()));
function rich(s) {
  return esc(s)
    .replace(/(https:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
    .replace(/`([^`\n]+)`/g, (m, x) => ids.has(x.toLowerCase()) ? `<a href="?shot=${x}" data-scene="${x}">${x}</a>` : `<code>${x}</code>`)
    .replace(/\*\*([^*\n]+)\*\*/g, "<b>$1</b>")
    .replace(/\bfilm (\d{1,2}:\d\d)\b/g, (m, t) => live()
      ? `<a href="https://www.youtube.com/watch?v=${L.FILM.id}&t=${t.split(":").reduce((a, b) => a * 60 + +b, 0)}s" target="_blank" rel="noopener">${m}</a>` : m)
    .replace(/\n/g, "<br>");
}

const { redraw } = mountAsk(agent, {
  texts: () => T[L.lang()],
  rich,
  onClick: t => { const a = t.closest("[data-scene]"); if (!a) return false; L.show(a.dataset.scene); return true; },
});
document.addEventListener("lumen:lang", redraw);
// Scene links in answers switch the scene in place instead of reloading the page.
document.addEventListener("click", ev => { if (ev.target.closest?.(".ask [data-scene]")) ev.preventDefault(); });
