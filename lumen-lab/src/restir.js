// Modes 7b / 7c: direct light from many small emitters.
// 7b: one uniformly random light + one shadow ray per pixel (very noisy).
// 7c: simplified ReSTIR DI after Bitterli et al. 2020: M candidates resampled into a reservoir (RIS + weighted
//     reservoir sampling), temporal reuse (history clamped to 20x), a few spatial neighbours, one visibility ray.
//     Simplifications: static camera (no reprojection), biased combination (no visibility test for neighbours'
//     samples before the final shadow ray), direct light only, no denoiser.
import { ALBEDO } from './glsl.js';
import { program } from './raster.js';
import { SCENE_GLSL, VS } from './pathtrace.js';
import { rng } from './math.js';

const COMMON = `#version 300 es
precision highp float; precision highp int;
uniform vec2 u_res; uniform uint u_seed; uniform vec3 u_eye, u_right, u_up, u_fwd; uniform float u_tanHalf;
uniform sampler2D u_lights; uniform int u_nLights;
${ALBEDO}
${SCENE_GLSL}
vec3 primaryDir(){ vec2 px = gl_FragCoord.xy / u_res * 2.0 - 1.0; return normalize(u_fwd + u_right * px.x * u_tanHalf * u_res.x / u_res.y + u_up * px.y * u_tanHalf); }
void seedRng(uint salt){ st = uint(gl_FragCoord.x) * 1973u + uint(gl_FragCoord.y) * 9277u + u_seed * 26699u + salt; rnd(); }
vec3 lightPos(int i){ return texelFetch(u_lights, ivec2(i, 0), 0).xyz; }
vec3 lightCol(int i){ return texelFetch(u_lights, ivec2(i, 1), 0).xyz; }
// unshadowed contribution of light i at point p with normal n and albedo a
vec3 contrib(int i, vec3 p, vec3 n, vec3 a){ vec3 L = lightPos(i) - p; float d2 = dot(L, L); return a / 3.14159 * lightCol(i) * max(dot(n, L * inversesqrt(d2)), 0.0) / (d2 + 0.01); }
float lum(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
float visible(int i, vec3 p, vec3 n){ vec3 L = lightPos(i) - p; float d = length(L); Hit s = trace(p + n * 2e-3, L / d); return s.t < d - 0.01 ? 0.0 : 1.0; }
vec3 skyCol(vec3 d){ return mix(vec3(0.03, 0.035, 0.07), vec3(0.012, 0.016, 0.04), smoothstep(-0.1, 0.9, d.y)); }
`;
// Reservoir texel: x = light index, y = W (unbiased contribution weight), z = M, w = primary hit distance (for neighbour rejection)
const RESAMPLE = COMMON + `
uniform sampler2D u_prev; uniform int u_M; uniform bool u_temporal;
out vec4 o;
void main(){
  seedRng(11u); vec3 rd = primaryDir(); Hit h = trace(u_eye, rd);
  if (h.mat < 0.0 || (h.mat > 4.5 && h.mat < 5.5)) { o = vec4(-1.0, 0.0, 0.0, 0.0); return; }
  vec3 p = u_eye + rd * h.t, a = albedoAt(p, h.n, h.mat, h.col);
  float y = -1.0, wSum = 0.0, M = 0.0, pSel = 0.0;
  for (int k = 0; k < u_M; k++) { // RIS: candidates uniform over lights, target = unshadowed luminance
    int i = min(u_nLights - 1, int(rnd() * float(u_nLights))); float ph = lum(contrib(i, p, h.n, a)), w = ph * float(u_nLights);
    wSum += w; M += 1.0; if (rnd() * wSum < w) { y = float(i); pSel = ph; }
  }
  float W = pSel > 0.0 ? wSum / (M * pSel) : 0.0;
  if (y >= 0.0) W *= visible(int(y), p, h.n); // one visibility ray for the chosen candidate
  if (u_temporal) {
    vec4 r = texelFetch(u_prev, ivec2(gl_FragCoord.xy), 0);
    if (r.x >= 0.0 && abs(r.w - h.t) < 0.1 * h.t) {
      float Mp = min(r.z, 20.0 * M), ph = lum(contrib(int(r.x), p, h.n, a)), w = ph * r.y * Mp;
      float w0 = pSel * W * M, sum = w0 + w; M += Mp;
      if (rnd() * sum < w) { y = r.x; pSel = ph; }
      W = pSel > 0.0 ? sum / (M * pSel) : 0.0;
    }
  }
  o = vec4(y, W, M, h.t);
}`;
const SPATIAL = COMMON + `
uniform sampler2D u_res0; uniform int u_neighbours; uniform float u_radius;
out vec4 o;
void main(){
  seedRng(23u); vec4 r = texelFetch(u_res0, ivec2(gl_FragCoord.xy), 0);
  if (r.x < 0.0 && r.z == 0.0) { o = r; return; }
  vec3 rd = primaryDir(); Hit h = trace(u_eye, rd); vec3 p = u_eye + rd * h.t, a = albedoAt(p, h.n, h.mat, h.col);
  float y = r.x, M = r.z, pSel = y >= 0.0 ? lum(contrib(int(y), p, h.n, a)) : 0.0, sum = pSel * r.y * M;
  for (int k = 0; k < u_neighbours; k++) {
    float ang = 6.2831853 * rnd(), rad = u_radius * sqrt(rnd()); ivec2 q = ivec2(gl_FragCoord.xy + vec2(cos(ang), sin(ang)) * rad);
    if (q.x < 0 || q.y < 0 || q.x >= int(u_res.x) || q.y >= int(u_res.y)) continue;
    vec4 n = texelFetch(u_res0, q, 0); if (n.x < 0.0 || abs(n.w - h.t) > 0.1 * h.t) continue;
    float ph = lum(contrib(int(n.x), p, h.n, a)), w = ph * n.y * n.z; sum += w; M += n.z;
    if (rnd() * sum < w) { y = n.x; pSel = ph; }
  }
  o = vec4(y, pSel > 0.0 ? sum / (M * pSel) : 0.0, M, h.t);
}`;
const SHADE = COMMON + `
uniform sampler2D u_res0; uniform int u_mode; uniform float u_exposure; uniform bool u_dots;
out vec4 o;
void main(){
  seedRng(37u); vec3 rd = primaryDir(); Hit h = trace(u_eye, rd); vec3 c;
  if (h.mat < 0.0) c = skyCol(rd);
  else if (h.mat > 4.5 && h.mat < 5.5) c = h.col * 3.0;
  else {
    vec3 p = u_eye + rd * h.t, a = albedoAt(p, h.n, h.mat, h.col);
    if (u_mode == 0) { // 7b: one uniformly random light, one shadow ray
      int i = min(u_nLights - 1, int(rnd() * float(u_nLights))); c = contrib(i, p, h.n, a) * float(u_nLights) * visible(i, p, h.n);
    } else {           // 7c: shade the reservoir's sample with its weight and a visibility ray
      vec4 r = texelFetch(u_res0, ivec2(gl_FragCoord.xy), 0);
      c = r.x >= 0.0 ? contrib(int(r.x), p, h.n, a) * r.y * visible(int(r.x), p, h.n) : vec3(0.0);
    }
    c += a * 0.004;
  }
  c *= u_exposure; c = c / (1.0 + 0.25 * c); o = vec4(pow(clamp(c, 0.0, 1.0), vec3(1.0/2.2)), 1.0);
}`;

export function makeLights(n, seed = 5) {
  const r = rng(seed), out = [], pal = [[1, 0.5, 0.3], [0.4, 0.65, 1], [0.5, 1, 0.55], [1, 0.9, 0.4], [1, 0.4, 0.8]];
  for (let i = 0; i < n; i++) out.push({ pos: [-4.8 + 9.6 * r(), 0.25 + 2.6 * r() * r(), -4.6 + 9.4 * r()], col: pal[Math.floor(r() * pal.length)].map((c) => (c * 14) / n * (0.4 + 1.2 * r())) });
  return out;
}

export class Restir {
  constructor(gl) {
    this.gl = gl; this.ok = !!gl.getExtension('EXT_color_buffer_float'); if (!this.ok) return;
    this.resample = program(gl, VS, RESAMPLE); this.spatial = program(gl, VS, SPATIAL); this.shade = program(gl, VS, SHADE);
    this.vao = gl.createVertexArray(); this.seed = 1; this.w = 0; this.n = 0; this.history = false;
  }
  setLights(lights) {
    const gl = this.gl; if (this.n === lights.length) return; this.n = lights.length; const d = new Float32Array(this.n * 8);
    lights.forEach((l, i) => { d.set([...l.pos, 0], i * 4); d.set([...l.col, 0], (this.n + i) * 4); });
    this.ltex = gl.createTexture(); gl.activeTexture(gl.TEXTURE9); gl.bindTexture(gl.TEXTURE_2D, this.ltex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, this.n, 2, 0, gl.RGBA, gl.FLOAT, d);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); gl.activeTexture(gl.TEXTURE0);
    this.history = false;
  }
  resize(W, H) {
    const gl = this.gl; if (W === this.w && H === this.h) return; this.w = W; this.h = H;
    this.tex = [0, 1, 2].map(() => { const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA32F, W, H);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); return t; });
    this.fbo = this.tex.map((t) => { const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0); return f; });
    this.history = false; this.cur = 0;
  }
  common(prog, cam, s) {
    const gl = this.gl, u = prog.u; gl.useProgram(prog.p);
    gl.uniform2f(u.u_res, this.w, this.h); gl.uniform1ui(u.u_seed, this.seed++); gl.uniform3fv(u.u_eye, cam.eye); gl.uniform3fv(u.u_right, cam.right); gl.uniform3fv(u.u_up, cam.up); gl.uniform3fv(u.u_fwd, cam.fwd);
    gl.uniform1f(u.u_tanHalf, cam.tanHalf); gl.uniform3fv(u.u_char, s.char); gl.uniform1f(u.u_squash, s.squash); gl.uniform1f(u.u_arm, s.arm);
    gl.uniform1i(u.u_lights, 9); gl.uniform1i(u.u_nLights, this.n);
  }
  // s: {lights, restir: bool, M, temporal, neighbours, char, squash, arm, exposure}
  render(cam, s) {
    const gl = this.gl; this.setLights(s.lights); this.resize(gl.canvas.width, gl.canvas.height);
    gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND); gl.bindVertexArray(this.vao); gl.viewport(0, 0, this.w, this.h); gl.activeTexture(gl.TEXTURE0);
    let final = this.tex[0];
    if (s.restir) {
      const prev = this.tex[this.cur], a = (this.cur + 1) % 3, b = (this.cur + 2) % 3;
      this.common(this.resample, cam, s); gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo[a]); gl.bindTexture(gl.TEXTURE_2D, prev);
      gl.uniform1i(this.resample.u.u_prev, 0); gl.uniform1i(this.resample.u.u_M, s.M); gl.uniform1i(this.resample.u.u_temporal, s.temporal && this.history ? 1 : 0); gl.drawArrays(gl.TRIANGLES, 0, 3);
      this.common(this.spatial, cam, s); gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo[b]); gl.bindTexture(gl.TEXTURE_2D, this.tex[a]);
      gl.uniform1i(this.spatial.u.u_res0, 0); gl.uniform1i(this.spatial.u.u_neighbours, s.neighbours); gl.uniform1f(this.spatial.u.u_radius, 24 * (this.w / 1080)); gl.drawArrays(gl.TRIANGLES, 0, 3);
      this.cur = b; this.history = true; final = this.tex[b];
    } else this.history = false;
    this.common(this.shade, cam, s); gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.bindTexture(gl.TEXTURE_2D, final);
    gl.uniform1i(this.shade.u.u_res0, 0); gl.uniform1i(this.shade.u.u_mode, s.restir ? 1 : 0); gl.uniform1f(this.shade.u.u_exposure, s.exposure || 1); gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}
