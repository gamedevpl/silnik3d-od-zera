// Unified gamedev.pl hamburger navigation menu.
// Keep byte-for-byte identical across:
//   - gamedevpl/fx-lab:           docs/src/site-menu.js
//   - gamedevpl/gdc:              docs/src/site-menu.js
//   - gamedevpl/silnik3d-od-zera: docs/site-menu.js

export const SITE_PROJECTS = [
  {
    id: "gamedev",
    href: "https://www.gamedev.pl",
    title: { en: "gamedev.pl", pl: "gamedev.pl" },
    sub: { en: "Browser games & projects", pl: "Gry przeglądarkowe i projekty" },
  },
  {
    id: "fx-lab",
    href: "https://gamedevpl.github.io/fx-lab/",
    title: { en: "FX Lab", pl: "FX Lab" },
    sub: { en: "Interactive WebGL2 & WebGPU effects", pl: "Interaktywne efekty WebGL2 i WebGPU" },
  },
  {
    id: "gdc",
    href: "https://gamedevpl.github.io/gdc/",
    title: { en: "Game Design Codex", pl: "Game Design Codex" },
    sub: { en: "Playable 3D game mechanics", pl: "Grywalne mechaniki gier 3D" },
  },
  {
    id: "lumen-lab",
    href: "https://gamedevpl.github.io/silnik3d-od-zera/lumen-lab/",
    title: { en: "Lumen Lab", pl: "Lumen Lab" },
    sub: { en: "40 years of light & shadow in games", pl: "40 lat światła i cienia w grach" },
  },
  {
    id: "silnik3d",
    href: "https://gamedevpl.github.io/silnik3d-od-zera/",
    title: { en: "C++ 3D Engine From Scratch", pl: "Silnik 3D w C++ od zera" },
    sub: { en: "YouTube series, code & exercises", pl: "Seria na YouTube, kod i zadania" },
  },
  {
    id: "neon-canal",
    href: "https://gamedevpl.github.io/silnik3d-od-zera/demko/",
    title: { en: "Neon Canal", pl: "Neon Canal" },
    sub: { en: "3D C++ / WASM neon racer", pl: "Gra wyścigowa 3D w C++ / WASM" },
  },
];

export const SITE_SOCIALS = [
  {
    id: "youtube",
    label: "YouTube",
    sub: "@gamedev_pl",
    href: "https://www.youtube.com/@gamedev_pl",
  },
  {
    id: "tiktok",
    label: "TikTok",
    sub: "@plgamedev",
    href: "https://www.tiktok.com/@plgamedev",
  },
  {
    id: "x",
    label: "X",
    sub: "@plgamedev",
    href: "https://x.com/plgamedev",
  },
  {
    id: "github",
    label: "GitHub",
    sub: "gamedevpl",
    href: "https://github.com/gamedevpl",
  },
];

export const SITE_ICONS = {
  open: `<svg viewBox="0 0 14 14" shape-rendering="crispEdges" aria-hidden="true"><rect x="1" y="2" width="12" height="2" fill="currentColor"/><rect x="1" y="6" width="12" height="2" fill="currentColor"/><rect x="1" y="10" width="12" height="2" fill="currentColor"/></svg>`,
  close: `<svg viewBox="0 0 14 14" shape-rendering="crispEdges" aria-hidden="true"><rect x="2" y="2" width="2" height="1" fill="currentColor"/><rect x="10" y="2" width="2" height="1" fill="currentColor"/><rect x="2" y="3" width="3" height="1" fill="currentColor"/><rect x="9" y="3" width="3" height="1" fill="currentColor"/><rect x="3" y="4" width="3" height="1" fill="currentColor"/><rect x="8" y="4" width="3" height="1" fill="currentColor"/><rect x="4" y="5" width="6" height="1" fill="currentColor"/><rect x="5" y="6" width="4" height="2" fill="currentColor"/><rect x="4" y="8" width="6" height="1" fill="currentColor"/><rect x="3" y="9" width="3" height="1" fill="currentColor"/><rect x="8" y="9" width="3" height="1" fill="currentColor"/><rect x="2" y="10" width="3" height="1" fill="currentColor"/><rect x="9" y="10" width="3" height="1" fill="currentColor"/><rect x="2" y="11" width="2" height="1" fill="currentColor"/><rect x="10" y="11" width="2" height="1" fill="currentColor"/></svg>`,
  youtube: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8ZM9.6 15.6V8.4L15.9 12l-6.3 3.6Z"/></svg>`,
  tiktok: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19.6 6.7a4.8 4.8 0 0 1-3.8-4.7h-3.4v13.4a2.9 2.9 0 1 1-2-2.7V9.2a6.4 6.4 0 1 0 5.4 6.3V8.7a8.2 8.2 0 0 0 4.8 1.5V6.8c-.3 0-.7 0-1-.1Z"/></svg>`,
  x: `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  github: `<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.72 1.22 1.88.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.65-.89-3.65-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.19c0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>`,
};

const MENU_CSS = `
.gdpl-menu-anchor{position:relative}
.gdpl-menu-host{z-index:250!important}
.gdpl-menu-main{z-index:250!important}
.gdpl-menu-btn{
  flex:none;display:inline-flex;align-items:center;justify-content:center;
  width:34px;min-width:34px;height:34px;min-height:34px;padding:0;margin:0;
  border:0;border-radius:0;cursor:pointer;touch-action:manipulation;
  background:#221e33e8;color:var(--cream,#ffe1a2);
  box-shadow:0 0 0 2px var(--ink,#151423),3px 3px 0 2px rgba(0,0,0,.4);
  transition:none;
}
.gdpl-menu-btn:hover{background:#352f4d;color:#fff3dc;border:0}
.gdpl-menu-btn:active{transform:translate(2px,2px);box-shadow:0 0 0 2px var(--ink,#151423),1px 1px 0 2px rgba(0,0,0,.4)}
.gdpl-menu-btn:focus-visible{outline:2px solid var(--turquoise,#00e4ac);outline-offset:3px}
.gdpl-menu-btn[aria-expanded="true"]{background:var(--amber,#eea75e);color:var(--ink,#151423)}
.gdpl-menu-btn[aria-expanded="true"]:hover{background:#f5b877;color:var(--ink,#151423)}
.gdpl-menu-btn svg{width:15px;height:15px;display:block;image-rendering:pixelated}
.gdpl-site-menu{
  position:absolute;top:calc(100% + 10px);left:0;z-index:250;
  width:min(312px,calc(100vw - 24px));max-height:calc(100dvh - 76px);overflow-y:auto;
  padding:8px;display:flex;flex-direction:column;gap:3px;box-sizing:border-box;
  background:#1d1a2bf8;border:0;border-top:3px solid var(--amber,#eea75e);border-radius:0;
  box-shadow:0 0 0 3px var(--ink,#151423),8px 8px 0 3px rgba(0,0,0,.5);
  -webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);
  color:var(--cream,#ffe1a2);text-align:left;text-shadow:none;
  font-family:var(--sans,'Proxima Nova',Proxima,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif);
}
.gdpl-site-menu[hidden]{display:none!important}
.gdpl-site-menu-label{
  padding:4px 8px 3px;
  font:700 10.5px/1.2 var(--pix,"Courier New",Courier,"Liberation Mono",monospace);
  letter-spacing:.11em;text-transform:uppercase;color:var(--mint,#76ddaf);
}
.gdpl-site-menu-sep{height:2px;margin:5px 2px 3px;background:#312c46;flex:none}
.gdpl-site-menu-item{
  display:flex;align-items:center;justify-content:space-between;gap:10px;
  padding:7px 9px;color:var(--cream,#ffe1a2);text-decoration:none;text-shadow:none;
  background:transparent;border:0;border-radius:0;box-shadow:none;min-height:0;
  white-space:normal;text-align:left;
}
.gdpl-site-menu-item:hover{background:#2d2744;color:#fff3dc;text-decoration:none}
.gdpl-site-menu-item:focus-visible{outline:2px solid var(--turquoise,#00e4ac);outline-offset:-2px}
.gdpl-site-menu-item[aria-current="page"]{
  background:#29243d;box-shadow:inset 3px 0 0 var(--amber,#eea75e);
}
.gdpl-site-menu-text{display:flex;flex-direction:column;gap:1px;min-width:0}
.gdpl-site-menu-text strong{font:700 13.5px/1.18 var(--sans,'Proxima Nova',Proxima,-apple-system,sans-serif);color:#fff3dc}
.gdpl-site-menu-text small{font:600 11.5px/1.25 var(--sans,'Proxima Nova',Proxima,-apple-system,sans-serif);color:var(--muted,#b3a39a)}
.gdpl-site-menu-badge{
  flex:none;font:700 10px/1.2 var(--pix,"Courier New",Courier,"Liberation Mono",monospace);
  letter-spacing:.06em;text-transform:uppercase;padding:2px 6px;
  background:var(--amber,#eea75e);color:var(--ink,#151423);
}
.gdpl-site-menu-ext{
  flex:none;font:700 13px/1 var(--pix,"Courier New",Courier,"Liberation Mono",monospace);
  color:var(--mint,#76ddaf);opacity:.9;
}
.gdpl-site-menu-socials{
  display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;padding:3px 2px 2px;
}
.gdpl-site-menu-social{
  display:flex;align-items:center;gap:8px;min-width:0;padding:7px 8px;
  background:#262238;box-shadow:inset 0 0 0 1px #36304e;
  color:var(--cream,#ffe1a2);text-decoration:none;text-shadow:none;
}
.gdpl-site-menu-social:hover{background:#322c4a;box-shadow:inset 0 0 0 1px var(--social-accent,var(--amber,#eea75e));color:#fff3dc;text-decoration:none}
.gdpl-site-menu-social:focus-visible{outline:2px solid var(--turquoise,#00e4ac);outline-offset:-2px}
.gdpl-site-menu-social-ico{
  flex:none;width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;
  color:var(--social-accent,#fff3dc);
}
.gdpl-site-menu-social-ico svg{width:16px;height:16px;display:block}
.gdpl-site-menu-social-txt{display:flex;flex-direction:column;gap:0;min-width:0}
.gdpl-site-menu-social-txt strong{font:700 12.5px/1.15 var(--sans,'Proxima Nova',Proxima,-apple-system,sans-serif);color:#fff3dc;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gdpl-site-menu-social-txt small{font:600 10.5px/1.2 var(--pix,"Courier New",Courier,"Liberation Mono",monospace);color:var(--muted,#b3a39a);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gdpl-site-menu-social[data-social="youtube"]{--social-accent:#ff5c5c}
.gdpl-site-menu-social[data-social="tiktok"]{--social-accent:#00e4ac}
.gdpl-site-menu-social[data-social="x"]{--social-accent:#f0f4f8}
.gdpl-site-menu-social[data-social="github"]{--social-accent:#ffe1a2}
`;

function injectStyles() {
  if (document.getElementById("gdpl-site-menu-css")) return;
  const style = document.createElement("style");
  style.id = "gdpl-site-menu-css";
  style.textContent = MENU_CSS;
  document.head.appendChild(style);
}

function escapeAttr(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Mount and manage the unified gamedev.pl hamburger menu.
 * @param {object} opts
 * @param {string|null} opts.currentSite - "gamedev" | "fx-lab" | "gdc" | "lumen-lab" | "silnik3d" | "neon-canal" | null
 * @param {() => string} [opts.getLang] - returns "pl" or "en"
 * @param {() => string} [opts.getGithubUrl] - per-page GitHub link (defaults to https://github.com/gamedevpl)
 * @param {string} [opts.githubSub] - short caption under GitHub (e.g. "fx-lab", "gdc", "silnik3d-od-zera")
 * @param {Element|null} [opts.anchor] - container holding #menuBtn (defaults to header .brand)
 * @param {HTMLButtonElement|null} [opts.button] - existing #menuBtn (created at start of anchor if missing)
 * @param {(open: boolean) => void} [opts.onToggle] - optional callback when toggled
 * @param {() => void} [opts.onBeforeOpen] - optional hook (e.g. close catalog modal)
 */
export function initSiteMenu(opts = {}) {
  injectStyles();

  const anchor = opts.anchor || document.querySelector("header .brand") || document.querySelector("header");
  if (!anchor) return null;
  anchor.classList.add("gdpl-menu-anchor");

  let btn = opts.button || document.getElementById("menuBtn");
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "menuBtn";
    btn.type = "button";
    btn.setAttribute("aria-haspopup", "menu");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", "siteMenu");
    anchor.insertBefore(btn, anchor.firstChild);
  }
  btn.classList.add("menu-btn", "gdpl-menu-btn");

  let menu = document.getElementById("siteMenu");
  if (!menu) {
    menu = document.createElement("div");
    menu.id = "siteMenu";
    menu.setAttribute("role", "menu");
    menu.hidden = true;
    anchor.appendChild(menu);
  }
  menu.classList.add("site-menu", "gdpl-site-menu");

  let open = false;

  const getLang = () => {
    const raw = typeof opts.getLang === "function" ? opts.getLang() : (document.documentElement.lang || "en");
    return String(raw).toLowerCase().startsWith("pl") ? "pl" : "en";
  };

  function render() {
    const lang = getLang();
    const pl = lang === "pl";
    const ghHref = (typeof opts.getGithubUrl === "function" && opts.getGithubUrl()) || "https://github.com/gamedevpl";
    const ghSub = opts.githubSub || "gamedevpl";

    btn.setAttribute("aria-label", open ? (pl ? "Zamknij menu" : "Close menu") : (pl ? "Menu nawigacji" : "Navigation menu"));
    btn.setAttribute("aria-expanded", String(open));
    btn.innerHTML = open ? SITE_ICONS.close : SITE_ICONS.open;

    const projectItems = SITE_PROJECTS.map((item) => {
      const isCurrent = opts.currentSite && item.id === opts.currentSite;
      const title = item.title[lang];
      const sub = item.sub[lang];
      if (isCurrent) {
        return `<a class="gdpl-site-menu-item" role="menuitem" aria-current="page" href="#top" data-menu-close="1">
          <span class="gdpl-site-menu-text"><strong>${title}</strong><small>${sub}</small></span>
          <span class="gdpl-site-menu-badge">${pl ? "TUTAJ" : "HERE"}</span>
        </a>`;
      }
      return `<a class="gdpl-site-menu-item" role="menuitem" href="${escapeAttr(item.href)}" target="_blank" rel="noopener">
        <span class="gdpl-site-menu-text"><strong>${title}</strong><small>${sub}</small></span>
        <span class="gdpl-site-menu-ext" aria-hidden="true">↗</span>
      </a>`;
    }).join("");

    const socialItems = SITE_SOCIALS.map((s) => {
      const href = s.id === "github" ? ghHref : s.href;
      const sub = s.id === "github" ? ghSub : s.sub;
      return `<a class="gdpl-site-menu-social" role="menuitem" data-social="${s.id}" href="${escapeAttr(href)}" target="_blank" rel="noopener" title="${escapeAttr(s.label + " · " + sub)}">
        <span class="gdpl-site-menu-social-ico">${SITE_ICONS[s.id]}</span>
        <span class="gdpl-site-menu-social-txt"><strong>${s.label}</strong><small>${escapeAttr(sub)}</small></span>
      </a>`;
    }).join("");

    menu.innerHTML = `
      <div class="gdpl-site-menu-label">${pl ? "Projekty" : "Projects"}</div>
      ${projectItems}
      <div class="gdpl-site-menu-sep" role="separator"></div>
      <div class="gdpl-site-menu-label">${pl ? "Kanały i kod" : "Social & code"}</div>
      <div class="gdpl-site-menu-socials">${socialItems}</div>
    `;

    menu.querySelectorAll('[data-menu-close="1"]').forEach((el) => {
      el.addEventListener("click", (ev) => {
        ev.preventDefault();
        setOpen(false);
      });
    });
  }

  function setOpen(next, restoreFocus = false) {
    const target = !!next;
    if (target && typeof opts.onBeforeOpen === "function") opts.onBeforeOpen();
    open = target;
    menu.hidden = !open;
    anchor.closest("header")?.classList.toggle("gdpl-menu-host", open);
    anchor.closest("main")?.classList.toggle("gdpl-menu-main", open);
    render();
    if (typeof opts.onToggle === "function") opts.onToggle(open);
    if (!open && restoreFocus) btn.focus();
  }

  btn.addEventListener("click", (ev) => {
    ev.stopPropagation();
    setOpen(!open);
  });

  document.addEventListener("pointerdown", (ev) => {
    if (open && !anchor.contains(ev.target)) setOpen(false);
  });

  // Capture phase so Escape closes the menu before page shortcuts (e.g. game pause).
  window.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape" && open) {
      ev.preventDefault();
      ev.stopPropagation();
      setOpen(false, true);
    }
  }, { capture: true });

  render();

  return {
    render,
    setOpen,
    isOpen: () => open,
  };
}

if (typeof window !== "undefined") {
  window.GDPL_SITE_MENU = { init: initSiteMenu, PROJECTS: SITE_PROJECTS, SOCIALS: SITE_SOCIALS, ICONS: SITE_ICONS };
}
