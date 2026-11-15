// Mode 5: stencil shadow volumes (Crow 1977; Heidmann 1991; depth-fail variant with caps).
// Occluders are closed convex pieces. Silhouette edges are found on the CPU per light and extruded to infinity (w = 0).
import { COLUMNS, STAIRS, CHAR } from './scene.js';
import { v3 } from './math.js';

function piece(verts, tris) { // orient triangles outward (pieces are convex)
  const c = verts.reduce((a, v) => v3.add(a, v), [0, 0, 0]).map((x) => x / verts.length);
  const t = tris.map(([a, b, d]) => (v3.dot(v3.cross(v3.sub(verts[b], verts[a]), v3.sub(verts[d], verts[a])), v3.sub(verts[a], c)) < 0 ? [a, d, b] : [a, b, d]));
  return { verts, tris: t, c };
}
function boxPiece(mn, mx) {
  const v = []; for (let i = 0; i < 8; i++) v.push([i & 1 ? mx[0] : mn[0], i & 2 ? mx[1] : mn[1], i & 4 ? mx[2] : mn[2]]);
  return piece(v, [[0, 1, 3], [0, 3, 2], [4, 5, 7], [4, 7, 6], [0, 1, 5], [0, 5, 4], [2, 3, 7], [2, 7, 6], [0, 2, 6], [0, 6, 4], [1, 3, 7], [1, 7, 5]]);
}
// Stack of rings (capsule, cylinder, sphere): rings = [[y, radius], ...] around (cx, cz), closed with pole vertices.
function latPiece(cx, cz, rings, seg) {
  const v = [], t = [], n = rings.length;
  for (const [y, r] of rings) for (let i = 0; i < seg; i++) { const a = (i / seg) * Math.PI * 2; v.push([cx + Math.cos(a) * r, y, cz + Math.sin(a) * r]); }
  const bot = v.push([cx, rings[0][0], cz]) - 1, top = v.push([cx, rings[n - 1][0], cz]) - 1;
  for (let j = 0; j < n - 1; j++) for (let i = 0; i < seg; i++) { const a = j * seg + i, b = j * seg + ((i + 1) % seg); t.push([a, b, b + seg], [a, b + seg, a + seg]); }
  for (let i = 0; i < seg; i++) { t.push([bot, i, (i + 1) % seg]); t.push([top, (n - 1) * seg + i, (n - 1) * seg + ((i + 1) % seg)]); }
  return piece(v, t);
}
function capsuleRings(y0, r, len) { // vertical capsule: bottom sphere centre y0, top centre y0+len
  const out = []; for (let k = 0; k <= 4; k++) { const a = (k / 4) * Math.PI / 2; out.push([y0 - Math.cos(a) * r, Math.max(0.02, Math.sin(a) * r)]); }
  for (let k = 0; k <= 4; k++) { const a = (k / 4) * Math.PI / 2; out.push([y0 + len + Math.sin(a) * r, Math.max(0.02, Math.cos(a) * r)]); }
  return out;
}
export function staticOccluders(hole = false) {
  const out = [];
  for (const c of COLUMNS) { out.push(latPiece(c.x, c.z, [[0.003, c.r * 0.985], [c.h, c.r * 0.985]], 28)); out.push(boxPiece([c.x - 0.417, c.h + 0.003, c.z - 0.417], [c.x + 0.417, c.h + 0.177, c.z + 0.417])); }
  for (const b of STAIRS) out.push(boxPiece(b.min.map((x) => x + 0.003), b.max.map((x) => x - 0.003)));
  if (hole) out[2].tris.splice(6, 1); // BUG toggle: one triangle missing from the middle column (open mesh)
  return out;
}
export function characterOccluders(pos, arm, squash) {
  const [x, y, z] = pos, r = CHAR.bodyR * 0.93, hh = CHAR.bodyHH * squash, cy = y + CHAR.bodyR + hh, out = [];
  out.push(latPiece(x, z, capsuleRings(y + CHAR.bodyR, r, 2 * hh), 14));
  out.push(latPiece(x, z, capsuleRings(y + CHAR.bodyR * 2 + 2 * hh + CHAR.headR * 0.8, CHAR.headR * 0.93, 0), 12));
  for (const s of [-1, 1]) out.push(latPiece(x + s * (CHAR.bodyR + 0.07), z + s * arm * 0.1, capsuleRings(cy + 0.05 + arm * 0.18 - 0.16, 0.058, 0.32), 8));
  return out;
}
// Build the volume for one light. Returns Float32Array of vec4 positions (triangles) plus side-quad count for stats.
export function buildVolume(pieces, L, caps, robust) {
  const out = []; let edges = 0;
  const push = (p, w) => out.push(p[0], p[1], p[2], w);
  for (const pc of pieces) {
    const facing = pc.tris.map(([a, b, c]) => v3.dot(v3.cross(v3.sub(pc.verts[b], pc.verts[a]), v3.sub(pc.verts[c], pc.verts[a])), v3.sub(L, pc.verts[a])) > 0);
    const edgeMap = new Map();
    pc.tris.forEach(([a, b, c], ti) => { for (const [i, j] of [[a, b], [b, c], [c, a]]) { const k = i < j ? i + '_' + j : j + '_' + i; (edgeMap.get(k) || edgeMap.set(k, []).get(k)).push([ti, i, j]); } });
    const inside = v3.add(pc.c, v3.mul(v3.norm(v3.sub(pc.c, L)), 0.5)); // a point inside the volume
    for (const list of edgeMap.values()) {
      // silhouette: shared by a lit and an unlit triangle; an open edge of a lit triangle also extrudes (this is what leaks)
      const lit = list.filter(([ti]) => facing[ti]); if (lit.length !== 1 || (list.length === 2 && facing[list[0][0]] === facing[list[1][0]])) continue;
      let a = pc.verts[lit[0][1]], b = pc.verts[lit[0][2]]; const da = v3.sub(a, L), db = v3.sub(b, L);
      // orient the side quad away from the mesh: the lit triangle's third vertex lies on the occluder's side of the plane (edge, light).
      // (A single 'inside' point per piece fails when the light comes close to a long or thin piece, e.g. the swinging lamp by a column.)
      const tri = pc.tris[lit[0][0]], c = pc.verts[tri.find((k) => k !== lit[0][1] && k !== lit[0][2])];
      if (v3.dot(v3.cross(v3.sub(b, a), da), v3.sub(a, robust ? c : inside)) < 0) { [a, b] = [b, a]; } // mode-5 demos keep the classic look (and its leak)
      const ea = v3.sub(a, L), eb = v3.sub(b, L);
      push(a, 1); push(b, 1); push(eb, 0); push(a, 1); push(eb, 0); push(ea, 0); edges++;
    }
    if (caps) pc.tris.forEach(([a, b, c], ti) => {
      if (facing[ti]) { push(pc.verts[a], 1); push(pc.verts[b], 1); push(pc.verts[c], 1); }
      else { push(v3.sub(pc.verts[a], L), 0); push(v3.sub(pc.verts[b], L), 0); push(v3.sub(pc.verts[c], L), 0); }
    });
  }
  return { data: new Float32Array(out), edges };
}
