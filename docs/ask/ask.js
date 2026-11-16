/* "Ask the mascot": the shared chat panel of the site. A page builds its own agent with
   createPageAgent from genaicode/browser (npm, loaded from jsDelivr) and its own tools, then calls mountAsk.
   The panel stays hidden where the browser has no built-in model.

   texts() returns the current strings: askOpen, askTitle, askNew, askClose, askNote, askPlaceholder,
   askSend, askStop, askDownload, askDownloading, askLoading, askHello, askThinking,
   askChips (array) and askTool (tool name → label shown while it runs).
   rich(text) turns the model's text into safe HTML; the default only escapes it.
   onClick(target) handles clicks on links that rich() added; return true when handled.
   onOpen() runs when the panel opens, e.g. to pause a game. */
export const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
export const basicRich = text => esc(text)
  .replace(/`([^`\n]+)`/g, "<code>$1</code>")
  .replace(/\*\*([^*\n]+)\*\*/g, "<b>$1</b>")
  .replace(/\n/g, "<br>");

export function mountAsk(agent, { texts, rich = basicRich, onClick = () => false, onOpen = () => {} }) {
  const root = document.createElement("div");
  root.className = "ask";
  root.hidden = true;
  root.innerHTML = `
  <button type="button" class="ask-open"><i class="head" aria-hidden="true"></i><span class="lbl"></span></button>
  <div class="ask-panel" role="dialog" aria-modal="false" hidden>
    <div class="ask-head"><i class="head" aria-hidden="true"></i><b></b><button type="button" class="ask-new"></button><button type="button" class="ask-close" aria-label="">×</button></div>
    <div class="ask-log" aria-live="polite"></div>
    <div class="ask-model"></div>
    <form class="ask-form"><input type="text" autocomplete="off" maxlength="300"><button type="submit"></button></form>
    <p class="ask-note"></p>
  </div>`;
  document.body.appendChild(root);
  const $ = sel => root.querySelector(sel);
  const panel = $(".ask-panel"), log = $(".ask-log"), input = $("input"), modelBox = $(".ask-model"), form = $(".ask-form");

  function draw(state) {
    const l = texts(), status = state.model.status, turns = state.session.turns, running = state.session.status === "running";
    root.hidden = status === "unavailable" || status === "checking";
    $(".ask-open .lbl").textContent = l.askOpen;
    $(".ask-head b").textContent = l.askTitle;
    $(".ask-new").textContent = l.askNew;
    $(".ask-new").hidden = !turns.length;
    $(".ask-close").setAttribute("aria-label", l.askClose);
    $(".ask-note").textContent = l.askNote;
    input.placeholder = l.askPlaceholder;
    form.querySelector("button").textContent = running ? l.askStop : l.askSend;

    const usable = status === "available";
    form.hidden = !usable;
    modelBox.hidden = usable;
    const pct = Math.round((state.model.progress ?? 0) * 100);
    if (status === "downloadable") modelBox.innerHTML = `<button type="button" class="ask-dl">${esc(l.askDownload)}</button>`;
    else if (status === "downloading") modelBox.innerHTML = `<div class="ask-bar"><i style="width:${pct}%"></i></div><small>${esc(l.askDownloading)} ${pct}%</small>`;
    else if (status === "loading") modelBox.innerHTML = `<small>${esc(l.askLoading)}</small>`;

    const out = [];
    if (!turns.length) {
      out.push(`<div class="ask-msg bot"><div class="bubble">${esc(l.askHello)}</div></div>`);
      if (usable) out.push(`<div class="ask-chips">${l.askChips.map(c => `<button type="button" data-ask="${esc(c)}">${esc(c)}</button>`).join("")}</div>`);
    }
    for (const turn of turns) {
      out.push(`<div class="ask-msg me">${esc(turn.prompt)}</div>`);
      const steps = turn.entries.filter(e => e.kind === "tool").map(e => l.askTool[e.name] ?? e.name);
      if (steps.length) out.push(`<div class="ask-steps">${steps.map(esc).join(" · ")}</div>`);
      const text = turn.entries.filter(e => e.kind === "text").map(e => e.text).join("\n").trim();
      if (text) out.push(`<div class="ask-msg bot"><div class="bubble">${rich(text)}</div></div>`);
      else if (!turn.endedAt) out.push(`<div class="ask-msg bot"><div class="bubble dim">${esc(l.askThinking)}</div></div>`);
      for (const e of turn.entries) if (e.kind === "error") out.push(`<div class="ask-err">${esc(e.message)}</div>`);
    }
    const html = out.join("");
    if (log.dataset.html !== html) { log.innerHTML = log.dataset.html = html; log.scrollTop = log.scrollHeight; }
  }

  const redraw = () => draw(agent.get());
  agent.subscribe(draw);
  redraw();

  const ask = text => { text = text.trim(); if (text) agent.send(text); };
  const open = show => { panel.hidden = !show; $(".ask-open").hidden = show; if (show) { input.focus(); onOpen(); } };
  // Keys typed into the panel must not reach a game listening on the page.
  for (const type of ["keydown", "keyup"]) root.addEventListener(type, ev => {
    ev.stopPropagation();
    if (type === "keydown" && ev.key === "Escape" && !panel.hidden) { open(false); $(".ask-open").focus(); }
  });
  root.addEventListener("click", ev => {
    const t = ev.target;
    if (t.closest(".ask-open")) open(true);
    else if (t.closest(".ask-close")) open(false);
    else if (t.closest(".ask-new")) agent.reset();
    else if (t.closest(".ask-dl")) agent.prepare().catch(() => agent.refresh());
    else if (t.closest("[data-ask]")) ask(t.closest("[data-ask]").dataset.ask);
    else onClick(t);
  });
  form.addEventListener("submit", ev => {
    ev.preventDefault();
    if (agent.get().session.status === "running") { agent.stop(); return; }
    ask(input.value);
    input.value = "";
  });
  return { root, redraw };
}
