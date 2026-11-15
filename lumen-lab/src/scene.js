// Scene "Colonnade": analytic description shared by the rasteriser, the CPU ray caster and the path tracer.
import { v3 } from './math.js';

export const FLOOR = 5;            // floor spans [-5,5] in x and z
export const WALL_Z = -5;          // back wall, 6 m behind the columns
export const COLUMNS = [[-2, 1], [0, 1], [2, 1]].map(([x, z]) => ({ x, z, r: 0.3, h: 3 }));
// Stairs: 4 steps of 0.2 m rising towards +x. Each entry is an axis-aligned box [min,max].
export const STAIRS = [0, 1, 2, 3].map((i) => ({ min: [1.6 + 0.5 * i, 0, 2.2], max: [4.6, 0.2 * (i + 1), 4.2] }));
export const STAIR_TOP = 0.8;
export const LANTERN = { pos: [-0.9, 1.7, 2.6], r: 0.12 };

export const COLORS = {
  floorA: [0.78, 0.72, 0.62], floorB: [0.66, 0.6, 0.52], wall: [0.74, 0.5, 0.4], column: [0.9, 0.88, 0.82],
  stair: [0.62, 0.68, 0.74], body: [1.0, 0.62, 0.12], head: [1.0, 0.82, 0.62], skyTop: [0.42, 0.68, 0.98], skyBottom: [0.86, 0.93, 1.0],
};

// Mesh builder: positions, normals, colours, material id (0 floor, 1 wall, 2 column, 3 stair, 4 character, 5 emissive).
export class Mesh {
  constructor() { this.p = []; this.n = []; this.c = []; this.m = []; }
  tri(a, b, c, n, col, mat) { for (const v of [a, b, c]) { this.p.push(...v); this.n.push(...n); this.c.push(...col); this.m.push(mat); } }
  quad(a, b, c, d, n, col, mat) { this.tri(a, b, c, n, col, mat); this.tri(a, c, d, n, col, mat); }
  box(min, max, col, mat) {
    const [x0, y0, z0] = min, [x1, y1, z1] = max;
    this.quad([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], [0, 1, 0], col, mat);
    this.quad([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [0, -1, 0], col, mat);
    this.quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1], col, mat);
    this.quad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [0, 0, -1], col, mat);
    this.quad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0], col, mat);
    this.quad([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [1, 0, 0], col, mat);
  }
  // Per-vertex normals (smooth) for round shapes.
  triS(a, b, c, na, nb, nc, col, mat) { this.p.push(...a, ...b, ...c); this.n.push(...na, ...nb, ...nc); for (let i = 0; i < 3; i++) { this.c.push(...col); this.m.push(mat); } }
  cylinder(cx, cz, r, y0, y1, seg, col, mat) {
    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * Math.PI * 2, a1 = ((i + 1) / seg) * Math.PI * 2;
      const n0 = [Math.cos(a0), 0, Math.sin(a0)], n1 = [Math.cos(a1), 0, Math.sin(a1)];
      const p00 = [cx + n0[0] * r, y0, cz + n0[2] * r], p10 = [cx + n1[0] * r, y0, cz + n1[2] * r];
      const p01 = [cx + n0[0] * r, y1, cz + n0[2] * r], p11 = [cx + n1[0] * r, y1, cz + n1[2] * r];
      this.triS(p00, p11, p10, n0, n1, n1, col, mat); this.triS(p00, p01, p11, n0, n0, n1, col, mat);
      this.tri([cx, y1, cz], p11, p01, [0, 1, 0], col, mat);
    }
  }
  // Sphere / capsule along Y: centre c, radius r, half height hh of the cylindrical part.
  capsule(c, r, hh, seg, col, mat) {
    const rings = 8, pts = [];
    for (let j = 0; j <= rings * 2; j++) {
      const phi = (j / (rings * 2)) * Math.PI - Math.PI / 2, off = j < rings ? -hh : j > rings ? hh : 0;
      const row = [];
      for (let i = 0; i <= seg; i++) {
        const th = (i / seg) * Math.PI * 2, n = [Math.cos(phi) * Math.cos(th), Math.sin(phi), Math.cos(phi) * Math.sin(th)];
        row.push({ n, p: [c[0] + n[0] * r, c[1] + n[1] * r + off, c[2] + n[2] * r] });
      }
      pts.push(row);
      if (j === rings) { // duplicate the equator ring to stretch the cylinder
        pts[pts.length - 1] = row.map((v) => ({ n: v.n, p: [v.p[0], v.p[1] - hh, v.p[2]] }));
        pts.push(row.map((v) => ({ n: v.n, p: [v.p[0], v.p[1] + hh, v.p[2]] })));
      }
    }
    for (let j = 0; j < pts.length - 1; j++) for (let i = 0; i < seg; i++) {
      const a = pts[j][i], b = pts[j][i + 1], d = pts[j + 1][i], e = pts[j + 1][i + 1];
      this.triS(a.p, d.p, e.p, a.n, d.n, e.n, col, mat); this.triS(a.p, e.p, b.p, a.n, e.n, b.n, col, mat);
    }
  }
  disc(c, r, seg, col, mat) {
    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * Math.PI * 2, a1 = ((i + 1) / seg) * Math.PI * 2;
      this.tri(c, [c[0] + Math.cos(a1) * r, c[1], c[2] + Math.sin(a1) * r], [c[0] + Math.cos(a0) * r, c[1], c[2] + Math.sin(a0) * r], [0, 1, 0], col, mat);
    }
  }
}

// Static geometry. `floorSeg` subdivides the floor (used by the Gouraud mode).
export function buildStatic(floorSeg = 1) {
  const m = new Mesh(), C = COLORS, s = (2 * FLOOR) / floorSeg;
  for (let i = 0; i < floorSeg; i++) for (let j = 0; j < floorSeg; j++) {
    const x0 = -FLOOR + i * s, z0 = -FLOOR + j * s;
    m.quad([x0, 0, z0 + s], [x0 + s, 0, z0 + s], [x0 + s, 0, z0], [x0, 0, z0], [0, 1, 0], C.floorA, 0);
  }
  { const G = 60, g = [0.5, 0.6, 0.42]; m.quad([-G, -0.02, G], [G, -0.02, G], [G, -0.02, -G], [-G, -0.02, -G], [0, 1, 0], g, 6); }
  m.quad([-FLOOR, 0, WALL_Z], [FLOOR, 0, WALL_Z], [FLOOR, 4.5, WALL_Z], [-FLOOR, 4.5, WALL_Z], [0, 0, 1], C.wall, 1);
  for (const c of COLUMNS) { m.cylinder(c.x, c.z, c.r, 0, c.h, 28, C.column, 2); m.box([c.x - 0.42, c.h, c.z - 0.42], [c.x + 0.42, c.h + 0.18, c.z + 0.42], C.column, 2); }
  for (const b of STAIRS) m.box(b.min, b.max, C.stair, 3);
  return m;
}

// The same static scene as separate objects (forward multipass counts draw calls = objects x lights).
export function buildStaticParts() {
  const C = COLORS, parts = [], add = (f) => { const m = new Mesh(); f(m); parts.push(m); };
  add((m) => m.quad([-FLOOR, 0, FLOOR], [FLOOR, 0, FLOOR], [FLOOR, 0, -FLOOR], [-FLOOR, 0, -FLOOR], [0, 1, 0], C.floorA, 0));
  add((m) => { const G = 60; m.quad([-G, -0.02, G], [G, -0.02, G], [G, -0.02, -G], [-G, -0.02, -G], [0, 1, 0], [0.5, 0.6, 0.42], 6); });
  add((m) => m.quad([-FLOOR, 0, WALL_Z], [FLOOR, 0, WALL_Z], [FLOOR, 4.5, WALL_Z], [-FLOOR, 4.5, WALL_Z], [0, 0, 1], C.wall, 1));
  for (const c of COLUMNS) { add((m) => m.cylinder(c.x, c.z, c.r, 0, c.h, 28, C.column, 2)); add((m) => m.box([c.x - 0.42, c.h, c.z - 0.42], [c.x + 0.42, c.h + 0.18, c.z + 0.42], C.column, 2)); }
  for (const b of STAIRS) add((m) => m.box(b.min, b.max, C.stair, 3));
  return parts;
}

// Character: capsule body, head, two arms. `pos` is the point between the feet.
export const CHAR = { bodyR: 0.22, bodyHH: 0.26, headR: 0.17 };
export function buildCharacter(pos, armSwing = 0, squash = 1) {
  const m = new Mesh(), C = COLORS, [x, y, z] = pos, r = CHAR.bodyR, hh = CHAR.bodyHH * squash;
  const cy = y + r + hh;
  m.capsule([x, cy, z], r, hh, 20, C.body, 4);
  m.capsule([x, cy + hh + r + CHAR.headR * 0.8, z], CHAR.headR, 0, 18, C.head, 4);
  for (const s of [-1, 1]) m.capsule([x + s * (r + 0.07), cy + 0.05 + armSwing * 0.18, z + s * armSwing * 0.1], 0.065, 0.16, 10, C.body, 4);
  return m;
}

// CPU ray cast straight down from `p`: returns the height of the first surface below (floor or stairs).
export function groundBelow(p) {
  let y = 0;
  for (const b of STAIRS) if (p[0] >= b.min[0] && p[0] <= b.max[0] && p[2] >= b.min[2] && p[2] <= b.max[2] && b.max[1] <= p[1] + 1e-4) y = Math.max(y, b.max[1]);
  return y;
}
export { v3 };
