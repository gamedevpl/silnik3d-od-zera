/* The gamedev.pl mascot on the Neon Canal demo: answers how to play, how the race is doing and
   where things live in the C++ and browser code. Same panel as the series page (../ask/ask.js),
   running on the browser's own model through genaicode/browser. Nothing leaves the page. */
import { createPageAgent } from "../vendor/genaicode-browser.js";
import { mountAsk, esc } from "../ask/ask.js";

const pl = () => document.documentElement.lang === "pl";
const SOURCE_URL = "https://github.com/gamedevpl/silnik3d-od-zera/blob/main/";
const WEB_FILES = ["docs/demko/app.js", "docs/demko/renderer.js", "docs/demko/race.js", "docs/demko/audio.js"];
const ROLES = {
  "demko/race.hpp": "race physics, rival pilots, weapons and collisions (the rules of the race)",
  "demko/raceway.hpp": "track geometry and a small perspective rasterizer for the canal",
  "demko/demo.cpp": "ship models, lane markings and track meshes, reused by the browser",
  "demko/race_fx.inc": "raceway lighting and the arcade encounter, in ship world coordinates",
  "demko/lighting.h": "a small diffuse lightmap for the recessed neon panels",
  "demko/web_race.cpp": "the browser ABI: JavaScript calls the C++ simulation and copies its state",
  "demko/canvas_scene.hpp": "projects racers, track scenery and reflections for Canvas 2D",
  "demko/track_mesh.hpp": "bakes the curved track and builds visible ships for both Metal and WebGL",
  "demko/geometry_api.hpp": "vertex layout shared with the renderer",
  "demko/scene-cues.hpp": "music cue timings",
  "docs/demko/app.js": "browser controls, HUD, pause and language switch",
  "docs/demko/renderer.js": "WebGL renderer with a Canvas 2D fallback",
  "docs/demko/race.js": "loads the required WebAssembly game and reads its state for the HUD",
  "docs/demko/audio.js": "soundtrack loop and synthesized engine and weapon sounds",
};

let files;
async function sources() {
  if (files) return files;
  const response = await fetch(new URL("./source.json", import.meta.url));
  if (!response.ok) throw Error("Source index HTTP " + response.status);
  const cpp = await response.json();
  const web = await Promise.all(WEB_FILES.map(async f => [f, await fetch(new URL(f.replace(/^docs\/demko\//, ""), import.meta.url)).then(r => r.ok ? r.text() : "").catch(() => "")]));
  return files = { ...cpp, ...Object.fromEntries(web.filter(([, text]) => text)) };
}
async function series() {
  if (window.SERIES) return window.SERIES;
  await new Promise((ok, fail) => { const s = document.createElement("script"); s.src = "../series.js"; s.onload = ok; s.onerror = fail; document.head.append(s); });
  return window.SERIES;
}
const STOP = new Set("the a an is are was were do does did how what where when why which who in on of to for and or it this that with i my me you can code file game race ship".split(" "));
const words = text => String(text).toLowerCase().match(/[a-z0-9_]{2,}/g)?.filter(w => !STOP.has(w)) ?? [];
const text = sel => document.querySelector(sel)?.textContent.trim() ?? "";

const tools = [
  {
    name: "how_to_play",
    description: "The rules of Neon Canal, the controls (keyboard, mouse, trackpad, touch) and racing tips.",
    run: async () => {
      const readme = (await sources())["demko/README.md"];
      return readme.slice(0, readme.indexOf("## Source code")).replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").trim();
    },
  },
  {
    name: "race_status",
    description: "What is on screen right now: whether a race is running or paused, position, shield, lap and lap time, and the best lap saved on this device.",
    run: () => {
      const overlay = document.querySelector(".overlay");
      const racing = overlay && overlay.hidden;
      let best = 0;
      try { best = Number(localStorage.getItem("neon.lap.v6")) || 0; } catch (_) {}
      const hud = document.querySelector(".hud");
      return [
        racing ? "A race is running." : `Not racing. The menu shows "${text("#title")}".`,
        hud && !hud.hidden ? `HUD: ${text("#position")}, ${text("#shield")}, ${text("#lap")}.` : "No race started yet.",
        best ? `Best full lap on this device: ${best.toFixed(1)} s.` : "No best lap saved yet.",
      ].join("\n");
    },
  },
  {
    name: "list_files",
    description: "The source files of the demo and what each one does. The race rules and models are C++; the browser side is JavaScript.",
    run: () => Object.entries(ROLES).map(([f, role]) => `${f}: ${role}`).join("\n"),
  },
  {
    name: "search_code",
    description: "Find where something is done in the demo's C++ or JavaScript. Give key words, e.g. \"slipstream\" or \"shield\". Returns file:line and the line.",
    inputSchema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] },
    run: async ({ query }) => {
      const q = words(query);
      if (!q.length) return "Give one or two key words.";
      const hits = [];
      for (const [file, body] of Object.entries(await sources())) {
        if (file.endsWith(".md")) continue;
        body.split("\n").forEach((line, i) => {
          const low = line.toLowerCase();
          const score = q.reduce((n, w) => n + (low.includes(w) ? 1 : 0), 0) + (/^\s*\/\//.test(line) ? .5 : 0);
          if (score >= 1) hits.push({ score, line: `${file}:${i + 1} ${line.trim().slice(0, 160)}` });
        });
      }
      hits.sort((a, b) => b.score - a.score);
      return hits.length ? hits.slice(0, 8).map(h => h.line).join("\n") : "Nothing matches. Try other words, or list_files.";
    },
  },
  {
    name: "read_code",
    description: "Read up to 40 lines of one file, starting at a line number from search_code.",
    inputSchema: { type: "object", properties: { file: { type: "string", enum: Object.keys(ROLES) }, line: { type: "number" } }, required: ["file"] },
    run: async ({ file, line = 1 }) => {
      const body = (await sources())[file];
      if (!body) throw new Error("No such file.");
      const from = Math.max(1, Math.floor(line) - 5);
      return body.split("\n").slice(from - 1, from + 39).map((l, i) => `${from + i} ${l}`).join("\n");
    },
  },
  {
    name: "series_episodes",
    description: "The episodes of the YouTube series \"C++ 3D Engine From Scratch\" that this demo belongs to: id, title and one line each.",
    run: async () => {
      const s = await series();
      return s.seasons.map(season => `${season.en.t}: ` + [...season.episodes, ...(season.next || [])]
        .map(e => `E${String(e.n).padStart(2, "0")} "${e.en.t}"${e.en.q ? " (" + e.en.q + ")" : ""}`).join("; ")).join("\n");
    },
  },
];

const agent = createPageAgent({
  name: "mascot",
  instructions: [
    "You are the gamedev.pl mascot on the page of Neon Canal, a small racing game built for the YouTube series \"C++ 3D Engine From Scratch\" by Grzegorz.",
    "The race rules, track and ships are C++, compiled to WebAssembly; the browser draws them with WebGL.",
    "Use the tools for every fact. Never invent controls, files or numbers.",
    "Point to code as file:line, like demko/race.hpp:42.",
    "Answer in English, in one to four short sentences.",
    "If the tools do not answer the question, say you do not know.",
  ].join(" "),
  tools,
  nano: { language: "en", maxSteps: 4, ...(self.__silnikModel ? { languageModel: self.__silnikModel } : {}) },
});

const T = {
  en: {
    askOpen: "Ask the mascot", askTitle: "Ask about Neon Canal", askNew: "New", askClose: "Close",
    askNote: "Runs on your browser's built-in model. Nothing leaves this page. It answers in English.",
    askPlaceholder: "How do I overtake?", askSend: "Ask", askStop: "Stop",
    askDownload: "Download the model (once)", askDownloading: "Downloading", askLoading: "Starting the model…",
    askHello: "Hi! Ask me how to race, how you are doing, or where something is in the C++ code.",
    askThinking: "Thinking…",
    askChips: ["How do I overtake?", "Where are the race rules in C++?", "How is my race going?"],
    askTool: { how_to_play: "rules", race_status: "race", list_files: "files", search_code: "searching code", read_code: "reading code", series_episodes: "episodes" },
  },
  pl: {
    askOpen: "Zapytaj maskotkę", askTitle: "Zapytaj o Neonowy kanał", askNew: "Od nowa", askClose: "Zamknij",
    askNote: "Działa na modelu wbudowanym w przeglądarkę. Nic nie wychodzi z tej strony. Odpowiada po angielsku.",
    askPlaceholder: "Jak wyprzedzać?", askSend: "Zapytaj", askStop: "Stop",
    askDownload: "Pobierz model (raz)", askDownloading: "Pobieranie", askLoading: "Uruchamiam model…",
    askHello: "Cześć! Zapytaj, jak się ścigać, jak Ci idzie albo gdzie coś jest w kodzie C++.",
    askThinking: "Myślę…",
    askChips: ["How do I overtake?", "Where are the race rules in C++?", "How is my race going?"],
    askTool: { how_to_play: "zasady", race_status: "wyścig", list_files: "pliki", search_code: "szukam w kodzie", read_code: "czytam kod", series_episodes: "odcinki" },
  },
};

function rich(s) {
  return esc(s)
    .replace(/`([^`\n]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*\n]+)\*\*/g, "<b>$1</b>")
    .replace(/\b((?:docs\/)?demko\/[\w.-]+\.(?:cpp|hpp|h|inc|js))(?::(\d+))?/g, (m, f, line) =>
      `<a href="${SOURCE_URL}${f}${line ? "#L" + line : ""}" target="_blank" rel="noopener">${m}</a>`)
    .replace(/\n/g, "<br>");
}

const { root, redraw } = mountAsk(agent, {
  texts: () => T[pl() ? "pl" : "en"],
  rich,
  // Opening the panel pauses a running race, the same way leaving the window does.
  onOpen: () => window.dispatchEvent(new Event("blur")),
});
new MutationObserver(redraw).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
// Keep the corner free for the touch controls while racing.
const overlay = document.querySelector(".overlay");
const sync = () => root.classList.toggle("away", !!overlay?.hidden);
if (overlay) { new MutationObserver(sync).observe(overlay, { attributes: true, attributeFilter: ["hidden"] }); sync(); }
