// Mode 3: lightmap bake. A grid of samples on the floor and the back wall; one shadow ray per sample to the light
// (direct light only, no bounces), 2x2 jittered rays per texel to soften edges; the result is stored in a texture.
import { COLUMNS, STAIRS, LANTERN, FLOOR, WALL_Z } from './scene.js';
import { rng } from './math.js';

export const LM = { floor: { w: 80, h: 80 }, wall: { w: 80, h: 36 }, ambient: 0.16, power: 5.0 };

function segBox(o, d, mn, mx) { // segment o + d*t, t in (0,1)
  let t0 = 1e-4, t1 = 1 - 1e-4;
  for (let i = 0; i < 3; i++) {
    if (Math.abs(d[i]) < 1e-9) { if (o[i] < mn[i] || o[i] > mx[i]) return false; continue; }
    let a = (mn[i] - o[i]) / d[i], b = (mx[i] - o[i]) / d[i]; if (a > b) [a, b] = [b, a];
    t0 = Math.max(t0, a); t1 = Math.min(t1, b); if (t0 > t1) return false;
  }
  return true;
}
function segCyl(o, d, c) {
  const ox = o[0] - c.x, oz = o[2] - c.z, a = d[0] * d[0] + d[2] * d[2]; if (a < 1e-9) return false;
  const b = ox * d[0] + oz * d[2], cc = ox * ox + oz * oz - c.r * c.r, D = b * b - a * cc; if (D <= 0) return false;
  const s = Math.sqrt(D);
  for (const t of [(-b - s) / a, (-b + s) / a]) { const y = o[1] + d[1] * t; if (t > 1e-4 && t < 1 - 1e-4 && y >= 0 && y <= c.h) return true; }
  return false;
}
// True when the segment from p to the light is blocked by static geometry.
export function occluded(p, light) {
  const d = [light[0] - p[0], light[1] - p[1], light[2] - p[2]];
  for (const c of COLUMNS) { if (segCyl(p, d, c)) return true; if (segBox(p, d, [c.x - 0.42, c.h, c.z - 0.42], [c.x + 0.42, c.h + 0.18, c.z + 0.42])) return true; }
  for (const b of STAIRS) if (segBox(p, d, b.min, b.max)) return true;
  return false;
}
export function irradiance(p, n, light, power, vis) {
  const d = [light[0] - p[0], light[1] - p[1], light[2] - p[2]], d2 = d[0] * d[0] + d[1] * d[1] + d[2] * d[2];
  const nl = Math.max(0, (d[0] * n[0] + d[1] * n[1] + d[2] * n[2]) / Math.sqrt(d2));
  return (power * nl * vis) / d2;
}
export const floorPoint = (u, v) => [-FLOOR + u * 2 * FLOOR, 0.002, -FLOOR + v * 2 * FLOOR];
export const wallPoint = (u, v) => [-FLOOR + u * 2 * FLOOR, v * 4.5, WALL_Z + 0.002];

export function bake(light = LANTERN.pos) {
  const r = rng(7), out = {};
  for (const [name, pt, n] of [['floor', floorPoint, [0, 1, 0]], ['wall', wallPoint, [0, 0, 1]]]) {
    const { w, h } = LM[name], data = new Float32Array(w * h), vis = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let e = 0, lit = 0;
      for (let k = 0; k < 4; k++) {
        const p = pt((x + 0.25 + 0.5 * (k & 1) + (r() - 0.5) * 0.3) / w, (y + 0.25 + 0.5 * (k >> 1) + (r() - 0.5) * 0.3) / h);
        const v = occluded(p, light) ? 0 : 1; lit += v; e += irradiance(p, n, light, LM.power, v);
      }
      data[y * w + x] = LM.ambient + e / 4; vis[y * w + x] = lit;
    }
    out[name] = { w, h, data, vis };
  }
  return out;
}
// Bilinear lookup on the CPU (the character reads the lightmap below itself).
export function sample(lm, u, v) {
  const x = Math.min(lm.w - 1.001, Math.max(0, u * lm.w - 0.5)), y = Math.min(lm.h - 1.001, Math.max(0, v * lm.h - 0.5));
  const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0, d = lm.data, w = lm.w;
  return (d[y0 * w + x0] * (1 - fx) + d[y0 * w + x0 + 1] * fx) * (1 - fy) + (d[(y0 + 1) * w + x0] * (1 - fx) + d[(y0 + 1) * w + x0 + 1] * fx) * fy;
}
