/* "Ask about the series": the gamedev.pl mascot answering from the episode list, the chapters,
   the exercises and the subtitles. It runs on the browser's own model through genaicode/browser
   (https://github.com/gtanczyk/genaicode), so there is no server and nothing leaves the page.
   Loaded only where that model exists; everywhere else the page simply has no helper. */
import { createPageAgent } from "https://cdn.jsdelivr.net/npm/genaicode@2.33.0/dist/browser.js";
import { mountAsk, esc } from "./ask/ask.js";

const { T, lang, code, isOut } = window.SILNIK;
const SERIES = window.SERIES;
const L = () => T[lang()];
const all = SERIES.seasons.flatMap(s => s.episodes);
const ready = all.filter(e => e.video);
const byId = id => ready.find(e => code(e) === String(id).toUpperCase());
const isLive = e => isOut(e, Date.now());
const day = iso => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Warsaw" }).format(new Date(iso));
const clock = sec => Math.floor(sec / 60) + ":" + String(Math.floor(sec % 60)).padStart(2, "0");

let subs;
const STOP = new Set("the a an is are was were do does did how what where when why which who in on of to for and or it this that with i my me you can explained explain show shown about episode".split(" "));
const words = text => text.toLowerCase().match(/[a-z0-9+#_.]{2,}/g)?.filter(w => !STOP.has(w)) ?? [];

const tools = [
  {
    name: "list_episodes",
    description: "Every episode of the series: id, title, whether it is out yet, premiere date, one-line summary.",
    run: () => all.map(e => e.video
      ? `${code(e)} "${e.en.t}" (${e.len}), ${isLive(e) ? "out since" : "premieres"} ${day(e.at)}. ${e.en.sum}`
      : `${code(e)} "${e.en.t}", planned, not recorded yet.`).join("\n"),
  },
  {
    name: "get_episode",
    description: "One episode in detail: chapters with their times, the exercise, and the commands that start the exercise.",
    inputSchema: { type: "object", properties: { id: { type: "string", enum: ready.map(code) } }, required: ["id"] },
    run: ({ id }) => {
      const e = byId(id);
      if (!e) throw new Error("No such episode.");
      return [
        `${code(e)} "${e.en.t}" (${e.len}), ${isLive(e) ? "out since" : "premieres"} ${day(e.at)}.`,
        "Chapters: " + e.en.ch.map(([t, n]) => `${t} ${n}`).join("; "),
        `Exercise: ${e.en.exT}. ${e.en.exP.replace(/<[^>]+>/g, "")}`,
        `Start: git clone -b ${e.start || e.slug + "-start"} ${SERIES.repo}.git && cd silnik3d-od-zera && python3 check.py`,
        `It prints RETRY first. Edit ${e.file}, run python3 check.py again until PASS.`,
        `Compare with the solution: git diff origin/${e.slug}-solution -- ${e.file}`,
        "Needs Git, Python 3 and a C++17 compiler.",
      ].join("\n");
    },
  },
  {
    name: "search_subtitles",
    description: "Find the moment something is said or done in the episodes. Give key words, e.g. \"gimbal lock\". Returns lines as: episode, time, text.",
    inputSchema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] },
    run: async ({ query }) => {
      subs ??= (await import("./subs.js")).default;
      const q = words(String(query));
      if (!q.length) return "Give one or two key words.";
      const hits = [];
      for (const e of ready) {
        const lines = [...e.en.ch.map(([t, n]) => [t, "chapter: " + n]), ...(subs[e.slug] ?? []).map(([s, text]) => [clock(s), text])];
        for (const [t, text] of lines) {
          const low = text.toLowerCase();
          const score = q.reduce((n, w) => n + (low.includes(w) ? 1 : 0), 0) + (low.includes(q.join(" ")) && q.length > 1 ? 2 : 0);
          if (score) hits.push({ score, line: `${code(e)} ${t} ${text}` });
        }
      }
      hits.sort((a, b) => b.score - a.score);
      return hits.length ? hits.slice(0, 7).map(h => h.line).join("\n") : "Nothing in the subtitles matches. Try other words.";
    },
  },
];

const agent = createPageAgent({
  name: "mascot",
  instructions: [
    "You are the gamedev.pl mascot on the home page of \"C++ 3D Engine From Scratch\", a YouTube series by Grzegorz.",
    "Each episode builds a 3D engine in C++ and OpenGL in Vim, with no voiceover and EN/PL subtitles, and ends with a small exercise checked by python3 check.py.",
    "Use the tools for every fact. Never invent episodes, times or commands.",
    "Point to a moment as episode and time, like E02 15:09.",
    "Answer in English, in one to four short sentences.",
    "If the tools do not answer the question, say you do not know.",
  ].join(" "),
  tools,
  nano: { language: "en", maxSteps: 4, ...(self.__silnikModel ? { languageModel: self.__silnikModel } : {}) },
});

/* ---- UI: the shared panel from ask/ask.js ---- */
function rich(text) {
  return esc(text)
    .replace(/`([^`\n]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*\n]+)\*\*/g, "<b>$1</b>")
    .replace(/\bE(\d\d)(,?\s*(?:at\s*)?)(\d{1,2}:\d\d)\b/g, (m, n, mid, t) => {
      const e = byId("E" + n);
      if (!e) return m;
      const sec = t.split(":").reduce((a, b) => a * 60 + +b, 0);
      return isLive(e)
        ? `<a href="https://www.youtube.com/watch?v=${e.video}&t=${sec}s" target="_blank" rel="noopener">E${n} ${t}</a>`
        : `<a href="#${e.slug}" data-row="${e.slug}">E${n} ${t}</a>`;
    })
    .replace(/\n/g, "<br>");
}

const { redraw } = mountAsk(agent, {
  texts: L,
  rich,
  onClick: t => {
    const link = t.closest("[data-row]");
    if (!link) return false;
    const row = document.getElementById(link.dataset.row);
    if (row) row.open = true;
    return true;
  },
});
document.addEventListener("silnik:lang", redraw);
