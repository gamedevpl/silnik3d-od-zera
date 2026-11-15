// The native folder and the browser download contain the same five text assets.
function galleryFiles(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw Error("Invalid gallery");
  const required = ["floor.mat", "exhibit.scene", "models.boxes", "camera.txt"];
  if (!required.every(key => typeof value[key] === "string")) throw Error("Incomplete gallery");
  const words = value["floor.mat"].trim().split(/\s+/);
  const safe = name => /^[a-zA-Z0-9_-][a-zA-Z0-9_.-]{0,100}$/.test(name);
  if (words.length !== 2 || words[0] !== "map" || !safe(words[1])) throw Error("Invalid floor.mat");
  const names = [...required, words[1]];
  if (new Set(names).size !== 5 || Object.keys(value).length !== 5 ||
      !names.every(name => Object.hasOwn(value,name) && typeof value[name] === "string"))
    throw Error("Missing or unexpected gallery file");
  return Object.fromEntries(names.map(name => [name,value[name]]));
}

function setupGallery(ep, pl, canvas) {
  let engine, folder;
  const controls = document.createElement("p");
  const download = document.createElement("button");
  download.type = "button"; download.disabled = true;
  download.textContent = pl ? "Pobierz wyeksportowaną wystawę" : "Download exported exhibition";
  download.onclick = () => {
    const fs = engine.FS, entries = fs.readdir(folder).filter(n => n !== "." && n !== "..");
    const value = Object.fromEntries(entries.map(n => [n,fs.readFile(folder+"/"+n,{encoding:"utf8"})]));
    const url = URL.createObjectURL(new Blob([JSON.stringify(galleryFiles(value))],{type:"application/json"}));
    const a = document.createElement("a"); a.href=url; a.download="exhibit.gallery"; a.click();
    setTimeout(() => URL.revokeObjectURL(url),1000); canvas.focus();
  };
  const label = document.createElement("label"), input = document.createElement("input");
  label.textContent = pl ? " Otwórz otrzymaną wystawę " : " Open a received exhibition ";
  input.type="file"; input.accept=".gallery"; label.append(input);
  const message=document.createElement("span"); message.setAttribute("role","status");
  const key="gallery-import-"+ep;
  input.onchange = async () => {
    try {
      const file=input.files[0]; if (!file) return;
      if (file.size>2000000) throw Error("2 MB");
      sessionStorage.setItem(key,JSON.stringify(galleryFiles(JSON.parse(await file.text()))));
      location.reload();
    } catch (err) {message.textContent=(pl?"Błąd pliku: ":"File error: ")+err.message;}
  };
  controls.append(download,label,message); document.getElementById("bar").after(controls);
  const incoming = sessionStorage.getItem(key); sessionStorage.removeItem(key);
  const data = incoming && galleryFiles(JSON.parse(incoming));
  return {
    options: data ? {arguments:["/received"],preRun:[m=>{
      m.FS.mkdir("/received"); for(const [name,text] of Object.entries(data)) m.FS.writeFile("/received/"+name,text);
    }]} : {},
    ready(m) { engine=m; },
    title(t) { const match=/^Export: (gallery-pack-\d+)$/.exec(t); if (match){folder="/"+match[1];download.disabled=false;} }
  };
}
