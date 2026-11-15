// Mode 7a: progressive path tracer in a fragment shader over the analytic Colonnade scene.
// Unidirectional, max 4 bounces, next-event estimation for the sun only; sky and lantern are found by chance (visible noise).
import { ALBEDO } from './glsl.js';
import { program } from './raster.js';
import { COLUMNS, STAIRS, LANTERN, COLORS, CHAR, FLOOR, WALL_Z } from './scene.js';

const f = (x) => (Number.isInteger(x) ? x.toFixed(1) : String(x));
const vec = (a) => `vec3(${a.map(f).join(',')})`;

// Analytic scene intersection shared by the path tracer and the many-lights modes (7b/7c).
export const SCENE_GLSL = `
uniform vec3 u_char; uniform float u_squash; uniform float u_arm;
uint st;
float rnd(){ st = st * 747796405u + 2891336453u; uint w = ((st >> ((st >> 28u) + 4u)) ^ st) * 277803737u; w = (w >> 22u) ^ w; return float(w) / 4294967296.0; }
struct Hit { float t; vec3 n; float mat; vec3 col; };
void box(vec3 ro, vec3 rd, vec3 mn, vec3 mx, float mat, vec3 col, inout Hit h){
  vec3 inv = 1.0 / rd; vec3 t0 = (mn - ro) * inv, t1 = (mx - ro) * inv; vec3 a = min(t0, t1), b = max(t0, t1);
  float tn = max(max(a.x, a.y), a.z), tf = min(min(b.x, b.y), b.z);
  if (tn < tf && tn > 1e-4 && tn < h.t) { h.t = tn; h.mat = mat; h.col = col; h.n = -sign(rd) * step(a.yzx, a.xyz) * step(a.zxy, a.xyz); }
}
void sphere(vec3 ro, vec3 rd, vec3 c, float r, float mat, vec3 col, inout Hit h){
  vec3 oc = ro - c; float b = dot(oc, rd), cc = dot(oc, oc) - r*r, d = b*b - cc;
  if (d > 0.0) { float t = -b - sqrt(d); if (t > 1e-4 && t < h.t) { h.t = t; h.mat = mat; h.col = col; h.n = normalize(oc + rd*t); } }
}
void cyl(vec3 ro, vec3 rd, vec2 c, float r, float y1, float mat, vec3 col, inout Hit h){
  vec2 oc = ro.xz - c; float a = dot(rd.xz, rd.xz); if (a < 1e-8) return;
  float b = dot(oc, rd.xz), cc = dot(oc, oc) - r*r, d = b*b - a*cc;
  if (d > 0.0) { float t = (-b - sqrt(d)) / a; float y = ro.y + rd.y*t;
    if (t > 1e-4 && t < h.t && y >= 0.0 && y <= y1) { h.t = t; h.mat = mat; h.col = col; vec2 n = (oc + rd.xz*t)/r; h.n = vec3(n.x, 0.0, n.y); } }
}
// Vertical capsule: centre line from a to a+(0,len,0).
void capsule(vec3 ro, vec3 rd, vec3 a, float len, float r, float mat, vec3 col, inout Hit h){
  vec3 ba = vec3(0.0, len, 0.0), oa = ro - a;
  float baba = len*len, bard = ba.y*rd.y, baoa = ba.y*oa.y, rdoa = dot(rd, oa), oaoa = dot(oa, oa);
  float A = baba - bard*bard, B = baba*rdoa - baoa*bard, C = baba*oaoa - baoa*baoa - r*r*baba, D = B*B - A*C;
  if (D >= 0.0 && A > 1e-8) { float t = (-B - sqrt(D)) / A; float y = baoa + t*bard;
    if (y > 0.0 && y < baba) { if (t > 1e-4 && t < h.t) { h.t = t; h.mat = mat; h.col = col; vec3 p = oa + rd*t; h.n = normalize(vec3(p.x, 0.0, p.z)); } return; } }
  sphere(ro, rd, a, r, mat, col, h); sphere(ro, rd, a + ba, r, mat, col, h);
}
Hit trace(vec3 ro, vec3 rd){
  Hit h; h.t = 1e9; h.mat = -1.0;
  if (rd.y < 0.0) { float t = -ro.y / rd.y; vec3 p = ro + rd*t; if (t > 1e-4 && abs(p.x) <= ${f(FLOOR)} && abs(p.z) <= ${f(FLOOR)}) { h.t = t; h.n = vec3(0,1,0); h.mat = 0.0; h.col = ${vec(COLORS.floorA)}; }
    else { t = -(ro.y + 0.02) / rd.y; if (t > 1e-4) { h.t = t; h.n = vec3(0,1,0); h.mat = 6.0; h.col = vec3(0.5, 0.6, 0.42); } } }
  if (rd.z < 0.0) { float t = (${f(WALL_Z)} - ro.z) / rd.z; vec3 p = ro + rd*t; if (t > 1e-4 && t < h.t && abs(p.x) <= ${f(FLOOR)} && p.y >= 0.0 && p.y <= 4.5) { h.t = t; h.n = vec3(0,0,1); h.mat = 1.0; h.col = ${vec(COLORS.wall)}; } }
${COLUMNS.map((c) => `  cyl(ro, rd, vec2(${f(c.x)}, ${f(c.z)}), ${f(c.r)}, ${f(c.h)}, 2.0, ${vec(COLORS.column)}, h);
  box(ro, rd, vec3(${f(c.x - 0.42)}, ${f(c.h)}, ${f(c.z - 0.42)}), vec3(${f(c.x + 0.42)}, ${f(c.h + 0.18)}, ${f(c.z + 0.42)}), 2.0, ${vec(COLORS.column)}, h);`).join('\n')}
${STAIRS.map((b) => `  box(ro, rd, ${vec(b.min)}, ${vec(b.max)}, 3.0, ${vec(COLORS.stair)}, h);`).join('\n')}
  float r = ${f(CHAR.bodyR)}, hh = ${f(CHAR.bodyHH)} * u_squash; vec3 c = u_char;
  capsule(ro, rd, c + vec3(0.0, r, 0.0), 2.0*hh, r, 4.0, ${vec(COLORS.body)}, h);
  sphere(ro, rd, c + vec3(0.0, 2.0*r + 2.0*hh + ${f(CHAR.headR * 0.8)}, 0.0), ${f(CHAR.headR)}, 4.0, ${vec(COLORS.head)}, h);
  for (int i = 0; i < 2; i++) { float s = i == 0 ? -1.0 : 1.0;
    capsule(ro, rd, c + vec3(s*(r + 0.07), r + hh + 0.05 + u_arm*0.18 - 0.16, s*u_arm*0.1), 0.32, 0.065, 4.0, ${vec(COLORS.body)}, h); }
  box(ro, rd, vec3(${f(LANTERN.pos[0] - 0.03)}, 0.0, ${f(LANTERN.pos[2] - 0.03)}), vec3(${f(LANTERN.pos[0] + 0.03)}, ${f(LANTERN.pos[1] - LANTERN.r)}, ${f(LANTERN.pos[2] + 0.03)}), 3.0, vec3(0.25), h);
  sphere(ro, rd, ${vec(LANTERN.pos)}, ${f(LANTERN.r)}, 5.0, vec3(1.0, 0.72, 0.36), h);
  return h;
}
`;

const FS = `#version 300 es
precision highp float;
uniform sampler2D u_prev; uniform float u_count; uniform uint u_seed; uniform vec2 u_res;
uniform vec3 u_eye, u_right, u_up, u_fwd; uniform float u_tanHalf;
uniform vec3 u_sun; uniform int u_maxBounce;
out vec4 o;
${ALBEDO}
${SCENE_GLSL}
vec3 sky(vec3 d){ return mix(${vec(COLORS.skyBottom)}, ${vec(COLORS.skyTop)}, smoothstep(-0.1, 0.9, d.y)) * 0.8; }
vec3 cosDir(vec3 n){ float a = 6.2831853 * rnd(), z = rnd() * 2.0 - 1.0; float r = sqrt(max(0.0, 1.0 - z*z)); return normalize(n + vec3(r*cos(a), r*sin(a), z) * 0.9999); }
void main(){
  st = uint(gl_FragCoord.x) * 1973u + uint(gl_FragCoord.y) * 9277u + u_seed * 26699u + 1u; rnd();
  vec2 px = (gl_FragCoord.xy + vec2(rnd(), rnd())) / u_res * 2.0 - 1.0;
  vec3 rd = normalize(u_fwd + u_right * px.x * u_tanHalf * u_res.x / u_res.y + u_up * px.y * u_tanHalf), ro = u_eye;
  vec3 L = vec3(0.0), T = vec3(1.0);
  for (int b = 0; b <= u_maxBounce; b++) {
    Hit h = trace(ro, rd);
    if (h.mat < 0.0) { L += T * sky(rd); break; }
    if (h.mat > 4.5 && h.mat < 5.5) { L += T * h.col * 30.0; break; }
    vec3 p = ro + rd * h.t; T *= albedoAt(p, h.n, h.mat, h.col);
    vec3 sd = normalize(u_sun + 0.03 * (vec3(rnd(), rnd(), rnd()) * 2.0 - 1.0)); // small disc: soft penumbra
    float nl = dot(h.n, sd);
    if (nl > 0.0) { Hit s = trace(p + h.n * 1e-3, sd); if (s.mat < 0.0) L += T * vec3(3.6, 3.2, 2.6) * nl / 3.14159 * 1.0; }
    ro = p + h.n * 1e-3; rd = cosDir(h.n);
  }
  vec3 prev = texture(u_prev, gl_FragCoord.xy / u_res).rgb;
  o = vec4(mix(prev, min(L, vec3(20.0)), 1.0 / (u_count + 1.0)), 1.0);
}`;
export const VS = `#version 300 es
void main(){ vec2 p = vec2((gl_VertexID<<1)&2, gl_VertexID&2); gl_Position = vec4(p*2.0-1.0, 0.0, 1.0); }`;
const SHOW = `#version 300 es
precision highp float; uniform sampler2D u_tex; uniform vec2 u_res; uniform float u_exposure; out vec4 o;
void main(){ vec3 c = texture(u_tex, gl_FragCoord.xy / u_res).rgb * u_exposure; c = c / (1.0 + c * 0.35); o = vec4(pow(clamp(c, 0.0, 1.0), vec3(1.0/2.2)), 1.0); }`;

export class PathTracer {
  constructor(gl) {
    this.gl = gl; this.ok = !!gl.getExtension('EXT_color_buffer_float'); this.lin = gl.getExtension('OES_texture_float_linear') ? gl.LINEAR : gl.NEAREST;
    if (!this.ok) return;
    this.pt = program(gl, VS, FS); this.show = program(gl, VS, SHOW); this.vao = gl.createVertexArray();
    this.count = 0; this.seed = 1; this.w = 0; this.h = 0; this.key = '';
  }
  resize(w, h) {
    const gl = this.gl; if (w === this.w && h === this.h) return; this.w = w; this.h = h;
    this.tex = [0, 1].map(() => { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA32F, w, h);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); return t; });
    this.fbo = this.tex.map((t) => { const fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0); return fb; });
    this.count = 0;
  }
  reset() { this.count = 0; }
  // Current accumulation as linear RGB floats (for the RMSE measurement).
  read() { const gl = this.gl, d = new Float32Array(this.w * this.h * 4); gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo[this.count & 1]); gl.readPixels(0, 0, this.w, this.h, gl.RGBA, gl.FLOAT, d); gl.bindFramebuffer(gl.FRAMEBUFFER, null); return d; }
  // cam: {eye, right, up, fwd, tanHalf}; s: {char, squash, arm, sun}; spp: samples added this frame.
  render(cam, s, spp, scale = 1) {
    const gl = this.gl, W = Math.round(gl.canvas.width * scale), H = Math.round(gl.canvas.height * scale); this.resize(W, H);
    const key = JSON.stringify([cam.eye, cam.fwd, s.char, s.squash]); if (key !== this.key) { this.key = key; this.count = 0; }
    gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND); gl.bindVertexArray(this.vao);
    const { p, u } = this.pt; gl.useProgram(p); gl.viewport(0, 0, W, H);
    gl.uniform2f(u.u_res, W, H); gl.uniform3fv(u.u_eye, cam.eye); gl.uniform3fv(u.u_right, cam.right); gl.uniform3fv(u.u_up, cam.up); gl.uniform3fv(u.u_fwd, cam.fwd);
    gl.uniform1f(u.u_tanHalf, cam.tanHalf); gl.uniform3fv(u.u_char, s.char); gl.uniform1f(u.u_squash, s.squash); gl.uniform1f(u.u_arm, s.arm);
    gl.uniform3fv(u.u_sun, s.sun); gl.uniform1i(u.u_maxBounce, 4); gl.uniform1i(u.u_prev, 0); gl.activeTexture(gl.TEXTURE0);
    for (let i = 0; i < spp; i++) {
      const src = this.count & 1, dst = 1 - src;
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo[dst]); gl.bindTexture(gl.TEXTURE_2D, this.tex[src]);
      gl.uniform1f(u.u_count, this.count); gl.uniform1ui(u.u_seed, this.seed++);
      gl.drawArrays(gl.TRIANGLES, 0, 3); this.count++;
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    const sh = this.show; gl.useProgram(sh.p); gl.bindTexture(gl.TEXTURE_2D, this.tex[this.count & 1]);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, this.lin); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, this.lin);
    gl.uniform2f(sh.u.u_res, gl.canvas.width, gl.canvas.height); gl.uniform1f(sh.u.u_exposure, 1.0); gl.uniform1i(sh.u.u_tex, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    return this.count;
  }
}
