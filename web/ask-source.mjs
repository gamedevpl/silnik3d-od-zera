// Copies the Neon Canal C++ sources into docs/demko/source.json so the demo's chat helper can
// search them in the browser (the page cannot read the repository itself).
// Run after changing anything in demko/: node web/ask-source.mjs
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
const root = new URL("..", import.meta.url);
const files = ["README.md", ...readdirSync(new URL("demko/", root)).filter(f => /\.(cpp|hpp|h|inc)$/.test(f)).sort()];
const out = Object.fromEntries(files.map(f => ["demko/" + f, readFileSync(new URL("demko/" + f, root), "utf8")]));
writeFileSync(new URL("docs/demko/source.json", root),
  JSON.stringify(out, null, 2) + "\n");
console.log(files.length + " files");
