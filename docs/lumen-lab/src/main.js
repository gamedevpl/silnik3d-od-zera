// Lumen Lab: one scene, eight lighting eras. Entry point, state and the deterministic frame API used for recording.
import { perspective, lookAt, mul4, v3, ortho } from './math.js';
import { buildStatic, buildStaticParts, buildCharacter, groundBelow, Mesh, COLORS, LANTERN } from './scene.js';
import { Deferred } from './deferred.js';
import { Mode0 } from './mode0.js';
import { SdfView } from './sdf.js';
import { Restir, makeLights } from './restir.js';
import { Raster, GpuMesh } from './raster.js';
import { PathTracer } from './pathtrace.js';
import { SHOTS } from './shots.js';
import { staticOccluders, characterOccluders, buildVolume } from './volumes.js';
import { bake, sample, LM, floorPoint, wallPoint } from './lightmap.js';

const canvas = document.getElementById('c');
const gl = canvas.getContext('webgl2', { antialias: true, stencil: true, preserveDrawingBuffer: true });
if (!gl) { document.body.textContent = 'WebGL2 is required.'; throw new Error('no webgl2'); }
const raster = new Raster(gl), pt = new PathTracer(gl), deferred = new Deferred(gl, raster);
const restir = new Restir(gl), mode0 = new Mode0(gl), sdf = new SdfView(gl); const lightSets = new Map();
let parts = null; const extraMesh = new GpuMesh(gl), glassMesh = new GpuMesh(gl);
const staticMeshes = new Map();
function staticMesh(seg, lantern = true) {
  const key = seg + (lantern ? 'L' : '');
  if (!staticMeshes.has(key)) {
    const m = buildStatic(seg);
    if (lantern) m.box([LANTERN.pos[0] - 0.03, 0, LANTERN.pos[2] - 0.03], [LANTERN.pos[0] + 0.03, LANTERN.pos[1] - LANTERN.r, LANTERN.pos[2] + 0.03], [0.25, 0.25, 0.25], 3);
    if (lantern) m.capsule(LANTERN.pos, LANTERN.r, 0, 16, [1.0, 0.86, 0.5], 5);
    staticMeshes.set(key, new GpuMesh(gl).set(m, gl.STATIC_DRAW));
  }
  return staticMeshes.get(key);
}
const charMesh = new GpuMesh(gl), blobMesh = new GpuMesh(gl), rayMesh = new GpuMesh(gl), lampMesh = new GpuMesh(gl);

// Lightmap textures (R16F, bilinear). `progress` reveals texels in bake order: floor rows first, then wall rows.
let baked = null, lmTex = null, lmProgress = -1;
function lightmaps(progress) {
  if (!baked) {
    baked = bake(); lmTex = {};
    for (const [name, unit] of [['floor', 1], ['wall', 2]]) {
      const t = (lmTex[name] = gl.createTexture()); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
      for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
    }
  }
  if (progress !== lmProgress) {
    lmProgress = progress; const total = LM.floor.h + LM.wall.h; let rows = progress * total;
    for (const [name, unit] of [['floor', 1], ['wall', 2]]) {
      const b = baked[name], d = new Float32Array(b.data), full = Math.floor(Math.min(b.h, Math.max(0, rows))), part = Math.min(b.h, Math.max(0, rows)) - full;
      if (name === 'floor') d.fill(0, 0, Math.max(0, d.length - (full * b.w + Math.floor(part * b.w)))); else d.fill(0, Math.min(d.length, full * b.w + Math.floor(part * b.w)));
      rows -= b.h;
      gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, lmTex[name]);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1); gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, b.w, b.h, 0, gl.RED, gl.FLOAT, d);
    }
    gl.activeTexture(gl.TEXTURE0);
  }
  return baked;
}
// Camera-facing ribbon between two points (debug rays).
function ribbon(m, a, b, w, eye) {
  const d = v3.norm(v3.sub(b, a)), side = v3.mul(v3.norm(v3.cross(d, v3.sub(eye, a))), w);
  m.quad(v3.sub(a, side), v3.add(a, side), v3.add(b, side), v3.sub(b, side), [0, 1, 0], [1, 1, 1], 5);
}

function camera(s) {
  const aspect = canvas.width / canvas.height, fovy = (s.fov * Math.PI) / 180;
  const fwd = v3.norm(v3.sub(s.target, s.eye)), right = v3.norm(v3.cross(fwd, [0, 1, 0])), up = v3.cross(right, fwd);
  const proj = perspective(fovy, aspect, 0.1, 200);
  if (s.shade === 8) { proj[10] = -1 + 1e-6; proj[14] = -0.2; } // infinite far plane: volumes extruded to w = 0 are never clipped
  return { view: lookAt(s.eye, s.target), vp: mul4(proj, lookAt(s.eye, s.target)), eye: s.eye, fwd, right, up, tanHalf: Math.tan(fovy / 2) };
}

export function draw(s, opts = {}) {
  const cam = camera(s);
  if (s.pt) {
    if (!pt.ok) return 0;
    return pt.render(cam, { char: s.char, squash: s.squash, arm: s.arm, sun: v3.norm(s.sun) }, opts.spp || 1, opts.ptScale || 1);
  }
  let charLight = 0, lm = null;
  if (s.shade === 4 || s.shade === 5) {
    lm = lightmaps(s.bake);
    const u = (s.char[0] + 5) / 10, v = (s.char[2] + 5) / 10, F = s.flash ? v3.sub(s.flash, s.char) : null;
    charLight = (s.bake >= 1 ? sample(lm.floor, u, v) : 0) + (F ? s.flash[3] / (1 + v3.dot(F, F)) : 0);
  }
  if (s.shade === 13) { mode0.render(s); return 0; }
  if (s.shade === 14) { sdf.render(s); return 0; }
  if (s.shade === 12) { // modes 7b / 7c
    if (!restir.ok) return 0;
    if (!lightSets.has(s.nLights)) lightSets.set(s.nLights, makeLights(s.nLights));
    restir.render(cam, { ...s, lights: lightSets.get(s.nLights) }); LL.stats = { lights: s.nLights }; return 0;
  }
  if (s.shade === 10 || s.shade === 11) return drawMode6(s, cam);
  const stat = staticMesh(s.floorSeg, s.lantern); let sm = {};
  charMesh.set(buildCharacter(s.char, s.arm, s.squash));
  if (s.shade === 6) {
    // Mode 4: orthographic depth map from the sun. bias and slope are given in metres along the light.
    const dir = v3.norm(s.sun), c = [0, 0, 1], range = 40;
    const lightVP = mul4(ortho(-9, 9, -9, 9, 1, 1 + range), lookAt(v3.add(c, v3.mul(dir, 20)), c));
    raster.shadowPass(s.smSize, lightVP, [stat, charMesh]);
    sm = { lightVP, sunDir: dir, bias: s.bias / range, slope: s.slope / range, pcf: s.pcf };
  }
  raster.begin(cam.vp, { ...sm, hdr: s.shade === 8, shade: s.shade, light: s.light, lightPow: s.lightPow, ambient: s.ambient, flash: s.flash, charLight, lightCol: s.lightCol, relief: s.relief,
    skyTop: s.sky || (s.night ? [0.012, 0.016, 0.04] : COLORS.skyTop), skyBottom: s.sky || (s.night ? [0.03, 0.035, 0.07] : COLORS.skyBottom) });
  stat.draw();
  if (s.candle) { const m = new Mesh(); m.capsule(s.light, 0.07, 0.03, 12, [1.0, 0.9, 0.55], 5); m.box([s.light[0] - 0.04, 0, s.light[2] - 0.04], [s.light[0] + 0.04, s.light[1] - 0.1, s.light[2] + 0.04], [0.9, 0.88, 0.8], 5); lampMesh.set(m).draw(); }
  if (s.bulbs2) { const m = new Mesh(); for (const b of s.bulbs2) { m.capsule(b.pos, b.r || 0.07, b.hh || 0.02, 12, b.col, 5); if (b.from) for (let i = 1; i < 30; i++) { const k = i / 30; m.capsule([b.from[0] + (b.pos[0] - b.from[0]) * k, b.from[1] + (b.pos[1] - b.from[1]) * k, b.from[2] + (b.pos[2] - b.from[2]) * k], 0.012, 0.05, 6, [0.15, 0.15, 0.15], 3); } if (b.stick) m.box([b.pos[0] - 0.025, b.pos[1] - 0.55, b.pos[2] - 0.025], [b.pos[0] + 0.025, b.pos[1] - 0.06, b.pos[2] + 0.025], [0.25, 0.16, 0.1], 3); } lampMesh.set(m).draw(); }
  if (s.flash && s.flash[3] > 0.05) { const m = new Mesh(); m.capsule(s.flash, 0.05 + 0.03 * Math.min(4, s.flash[3]), 0, 12, [1, 0.95, 0.8], 5); lampMesh.set(m).draw(); }
  charMesh.draw();
  LL.stats = {};
  if (s.shade === 8) {
    // Mode 5: ambient base pass is done; now one stencil volume + one additive lit pass per light.
    const occ = [...staticOccluders(s.hole), ...characterOccluders(s.char, s.arm, s.squash)]; let edges = 0, tris = 0;
    for (const L of s.lights) {
      const vol = buildVolume(occ, L.pos, s.vol === 'zfail', s.volRobust !== false); edges += vol.edges; tris += vol.data.length / 12;
      raster.clearStencil(); raster.volume(cam.vp, vol.data, s.vol);
      raster.litPass(cam.vp, L.pos, L.pow, L.col, [stat, charMesh]);
      if (s.volView) raster.volume(cam.vp, s.volView === 'wire' ? buildVolume(occ, L.pos, false, s.volRobust !== false).data : vol.data, s.volView);
    }
    LL.stats = { silhouetteEdges: edges, volumeTris: tris, lights: s.lights.length };
    raster.hdrPresent(s.exposure || 1);
  }
  if (s.shade === 6 && s.inset) raster.inset(s.inset[0], s.inset[1], s.inset[2]);
  if (s.blob) {
    // Mode 1: one ray straight down from the character; a flat disc where it lands.
    const gy = groundBelow(s.char), m = new Mesh();
    if (s.blobProject) {
      // "Project onto geometry": the disc is cut into strips and each strip drops onto whatever surface lies below it.
      const N = 48, R = s.blobR, [cx, , cz] = s.char;
      for (let i = 0; i < N; i++) {
        const x0 = cx - R + (2 * R * i) / N, x1 = x0 + (2 * R) / N, xm = (x0 + x1) / 2, h = Math.sqrt(Math.max(0, R * R - (xm - cx) ** 2));
        const y = groundBelow([xm, s.char[1] + 0.05, cz]) + 0.004;
        m.quad([x0, y, cz + h], [x1, y, cz + h], [x1, y, cz - h], [x0, y, cz - h], [0, 1, 0], [0, 0, 0], 5);
      }
    } else m.disc([s.char[0], gy + 0.004, s.char[2]], s.blobR, 40, [0, 0, 0], 5);
    raster.overlay(blobMesh.set(m), [0, 0, 0, 0.5]);
    if (s.debugRay) {
      const r = new Mesh(), w = 0.022, top = s.char[1] + 0.06;
      r.box([s.char[0] - w, gy, s.char[2] - w], [s.char[0] + w, top, s.char[2] + w], [1, 0, 0], 5);
      r.capsule([s.char[0], gy + 0.01, s.char[2]], 0.07, 0, 12, [1, 0, 0], 5);
      raster.overlay(rayMesh.set(r), [1, 0.12, 0.1, 0.95], false);
    }
  }
  if (s.bakeRays && s.bake > 0 && s.bake < 1) {
    // Shadow rays of the row being baked right now: lit rays in yellow, blocked rays in red.
    const total = LM.floor.h + LM.wall.h, row = s.bake * total, onFloor = row < LM.floor.h, b = onFloor ? lm.floor : lm.wall;
    const y = Math.min(b.h - 1, Math.floor(onFloor ? LM.floor.h - 1 - row : row - LM.floor.h)), lit = new Mesh(), blocked = new Mesh();
    for (let x = 2; x < b.w; x += 5) {
      const p = (onFloor ? floorPoint : wallPoint)((x + 0.5) / b.w, (y + 0.5) / b.h);
      ribbon(b.vis[y * b.w + x] ? lit : blocked, p, s.light, 0.012, cam.eye);
    }
    if (lit.p.length) raster.overlay(rayMesh.set(lit), [1, 0.85, 0.2, 0.9]);
    if (blocked.p.length) raster.overlay(rayMesh.set(blocked), [1, 0.2, 0.15, 0.9]);
  }
  return 0;
}

// Mode 6: shade 10 = deferred, shade 11 = forward multipass (one additive pass per light over every object).
function drawMode6(s, cam) {
  if (!deferred.ok) return 0;
  if (!parts) parts = buildStaticParts().map((m) => new GpuMesh(gl).set(m, gl.STATIC_DRAW));
  charMesh.set(buildCharacter(s.char, s.arm, s.squash));
  const ex = new Mesh();
  ex.box([LANTERN.pos[0] - 0.03, 0, LANTERN.pos[2] - 0.03], [LANTERN.pos[0] + 0.03, LANTERN.pos[1] - 0.1, LANTERN.pos[2] + 0.03], [0.25, 0.25, 0.25], 3);
  ex.capsule(LANTERN.pos, 0.07, 0.02, 12, [1.0, 0.8, 0.45], 5);
  if (s.ballPos) ex.capsule(s.ballPos, 0.4, 0, 40, s.ballCol || [0.95, 0.75, 0.35], 7);
  if (s.bulbs) for (const l of s.lights.slice(1)) ex.capsule(l.pos, 0.05, 0, 6, l.col, 5);
  extraMesh.set(ex);
  const meshes = [...parts, charMesh, extraMesh], sky = { skyTop: [0.012, 0.016, 0.04], skyBottom: [0.03, 0.035, 0.07] };
  let drawCalls = 0;
  if (s.shade === 10) {
    deferred.render(cam, { ...s, ...sky }, meshes); drawCalls = meshes.length + 2;
  } else {
    raster.begin(cam.vp, { hdr: true, shade: 8, light: [0, 0, 0], lightPow: 0, ambient: s.ambient, ...sky });
    for (const m of meshes) m.draw(); drawCalls = meshes.length;
    for (const L of s.lights) { raster.litPass(cam.vp, L.pos, L.pow, L.col, meshes); drawCalls += meshes.length; }
  }
  if ((s.shade === 11 || s.forwardGlass) && !s.view) {
    // Transparent glass shade: it cannot live in the G-buffer (one surface per pixel), so it needs a forward pass.
    const g = new Mesh(); g.capsule(LANTERN.pos, 0.2, 0.06, 24, [1, 1, 1], 5); glassMesh.set(g);
    gl.bindFramebuffer(gl.FRAMEBUFFER, raster.hdr.fbo); gl.viewport(0, 0, raster.hdr.w, raster.hdr.h);
    gl.useProgram(raster.main.p); gl.uniformMatrix4fv(raster.main.u.u_vp, false, cam.vp); raster.overlay(glassMesh, [0.55, 0.8, 1.0, 0.3]); drawCalls++;
  }
  raster.hdrPresent(s.exposure || 1);
  LL.stats = { drawCalls, lights: s.lights.length, objects: meshes.length };
  return 0;
}

function resize(w, h) { canvas.width = w; canvas.height = h; }
const LL = (window.LL = {
  shots: Object.keys(SHOTS), spp: 0, stats: {},
  resize,
  // Deterministic frame: shot id, time in seconds. For path-traced shots call frames in order.
  render(id, t, opts = {}) { const vertical = canvas.height > canvas.width; const s = SHOTS[id](t, vertical); LL.spp = draw(s, opts); return LL.spp; },
  resetPT() { pt.reset(); pt.seed = 1; restir.seed = 1; restir.history = false; },
  finish() { gl.finish(); },
  // "spp until clean": first sample count whose RMSE against a refSpp reference drops below `limit` (relative to mean luminance).
  measureSpp(id, refSpp = 4096, limit = 0.02) {
    const s = SHOTS[id](0, false); pt.seed = 1000003; pt.reset(); pt.key = ''; draw(s, { spp: refSpp }); const ref = pt.read();
    let mean = 0; for (let i = 0; i < ref.length; i += 4) mean += (ref[i] + ref[i + 1] + ref[i + 2]) / 3; mean /= ref.length / 4;
    pt.seed = 1; pt.reset(); const curve = []; let n = 0, clean = null;
    while (n < refSpp) {
      const step = Math.max(1, Math.floor(n / 8)); draw(s, { spp: step }); n += step; const cur = pt.read(); let e = 0;
      for (let i = 0; i < ref.length; i += 4) for (let k = 0; k < 3; k++) { const d = cur[i + k] - ref[i + k]; e += d * d; }
      const rmse = Math.sqrt(e / (ref.length / 4 * 3)) / mean; curve.push([n, +rmse.toFixed(4)]); if (rmse < limit && clean === null) { clean = n; break; }
    }
    return { clean, refSpp, limit, curve, width: canvas.width, height: canvas.height };
  },
  overlay(html) { const o = document.getElementById('ov'); html = html.replace(/\{\{(\w+)\}\}/g, (m, k) => (LL.stats && LL.stats[k] != null ? LL.stats[k] : '–')); if (o.dataset.h !== html) { o.dataset.h = html; o.innerHTML = html; } },
  blank() { gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.clearColor(0.05, 0.063, 0.078, 1); gl.clear(gl.COLOR_BUFFER_BIT); LL.stats = {}; },
  async imagesReady() { await Promise.all([...document.images].map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; })))); },
});

// Interactive preview: ?shot=D1-a
const q = new URLSearchParams(location.search);
if (q.get('shot')) {
  const id = q.get('shot'), t0 = performance.now();
  resize(innerWidth * devicePixelRatio, innerHeight * devicePixelRatio);
  const loop = () => { LL.render(id, ((performance.now() - t0) / 1000) % 12, { spp: 1 }); requestAnimationFrame(loop); };
  loop();
}
window.LLready = true;
