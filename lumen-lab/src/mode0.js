// Mode 0b / 0c: palette-indexed 2D top-down view (own pixel art, own palette).
// The frame holds palette indices only. Light = which of 32 colour maps the index is looked up through
// (16 sector light levels), and palette cycling rotates the flame entries. No direction, no occlusion.
import { program } from './raster.js';
import { VS } from './pathtrace.js';
import { COLUMNS, STAIRS } from './scene.js';

const f = (x) => (Number.isInteger(x) ? x.toFixed(1) : String(x));
const FS = `#version 300 es
precision highp float;
uniform vec2 u_res; uniform float u_level; uniform vec2 u_lantern; uniform vec2 u_char; uniform float u_cycle; uniform float u_strip; uniform float u_sector;
out vec4 o;
const vec3 PAL[24] = vec3[24](
  vec3(0.02,0.02,0.04), vec3(0.62,0.56,0.47), vec3(0.52,0.47,0.40), vec3(0.62,0.36,0.28), vec3(0.45,0.25,0.20), vec3(0.86,0.84,0.78), vec3(0.60,0.58,0.54), vec3(0.50,0.56,0.62),
  vec3(1.00,0.60,0.12), vec3(1.00,0.82,0.62), vec3(0.20,0.20,0.22), vec3(0.36,0.42,0.30), vec3(0.3,0.3,0.3), vec3(0.4,0.4,0.4), vec3(0.5,0.5,0.5), vec3(0.6,0.6,0.6),
  vec3(1.00,0.95,0.60), vec3(1.00,0.85,0.35), vec3(1.00,0.70,0.20), vec3(1.00,0.52,0.12), vec3(0.95,0.36,0.08), vec3(0.80,0.24,0.06), vec3(0.95,0.36,0.08), vec3(1.00,0.70,0.20));
float hash21(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
// palette index of the art at world position (x, z) in metres, sampled at 32 px per metre
int art(vec2 w){
  vec2 px = floor(w * 32.0);
  if (abs(w.x) > 5.0 || w.y > 5.0) return 11;
  if (w.y < -1.2) return 0;
  int idx = mod(floor(w.x) + floor(w.y), 2.0) < 0.5 ? 1 : 2;
  vec2 fr = fract(w); if (fr.x < 0.04 || fr.y < 0.04) idx = 6;
  if (w.y < -0.5) { vec2 b = vec2(px.x / 16.0 + 0.5 * mod(floor(px.y / 6.0), 2.0), px.y / 6.0); idx = (fract(b.x) < 0.08 || fract(b.y) < 0.2) ? 4 : 3; }
${STAIRS.map((b, i) => `  if (w.x > ${f(b.min[0])} && w.x < ${f(b.max[0])} && w.y > ${f(b.min[2])} && w.y < ${f(b.max[2])}) idx = ${i % 2 ? 6 : 7};`).join('\n')}
${COLUMNS.map((c) => `  { float d = length(w - vec2(${f(c.x)}, ${f(c.z)})); if (d < 0.44) idx = 6; if (d < 0.32) idx = 5; }`).join('\n')}
  { float d = length(w - u_char); if (d < 0.3) idx = 8; if (length(w - u_char - vec2(0.0, 0.02)) < 0.16) idx = 9; }
  { vec2 q = floor((w - u_lantern) * 32.0); float d = max(abs(q.x), abs(q.y)); if (d < 7.0) idx = 10; if (abs(q.x) + abs(q.y) < 6.0) idx = 16 + int(mod(abs(q.x) + abs(q.y) + floor(hash21(q) * 2.0) + u_cycle, 8.0)); }
  return idx;
}
void main(){
  float scale = floor(u_res.x / 320.0); vec2 lo = floor(gl_FragCoord.xy / scale), size = floor(u_res / scale);
  vec2 w = vec2((lo.x - size.x * 0.5) / 32.0, -(lo.y - size.y * 0.5) / 32.0 + 1.5);
  int idx = art(w);
  // sector light level 0..15; the lantern's sector is a plain rectangle that is simply brighter
  float level = u_level; vec2 d = abs(w - u_lantern); if (max(d.x, d.y * 0.8) < u_sector) level = min(15.0, u_level + 7.0);
  float row = clamp(31.0 - level * 2.0 - 1.0, 0.0, 31.0); // which of the 32 colour maps
  if (idx >= 16) row = 0.0;                                // flame entries are full bright
  vec3 c = floor(PAL[idx] * (1.0 - row / 32.0) * 31.0 + 0.5) / 31.0;
  if (u_strip > 0.5 && lo.y < 14.0) { // debug strip: the palette itself (24 entries), with cycling applied
    int k = int(lo.x / (size.x / 24.0)); if (k >= 16) k = 16 + int(mod(float(k - 16) + u_cycle, 8.0)); c = PAL[k]; if (lo.y > 12.0) c = vec3(0.0);
  }
  o = vec4(pow(c, vec3(1.0 / 1.1)), 1.0);
}`;
export class Mode0 {
  constructor(gl) { this.gl = gl; this.prog = program(gl, VS, FS); this.vao = gl.createVertexArray(); }
  render(s) {
    const gl = this.gl, u = this.prog.u; gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, gl.canvas.width, gl.canvas.height); gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND);
    gl.useProgram(this.prog.p); gl.uniform2f(u.u_res, gl.canvas.width, gl.canvas.height); gl.uniform1f(u.u_level, s.level); gl.uniform2f(u.u_lantern, s.lantern2d[0], s.lantern2d[1]);
    gl.uniform2f(u.u_char, s.char[0], s.char[2]); gl.uniform1f(u.u_cycle, s.cycle); gl.uniform1f(u.u_strip, s.strip ? 1 : 0); gl.uniform1f(u.u_sector, s.sector);
    gl.bindVertexArray(this.vao); gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}
