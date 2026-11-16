// Mode 6: deferred shading. Geometry pass writes a G-buffer (MRT); lighting is a full-screen pass that loops over the lights.
// Cook-Torrance with GGX (notation after Karis 2013), SSAO from the depth/position buffer. No shadows in this mode.
import { ALBEDO } from './glsl.js';
import { program } from './raster.js';

const G_VS = `#version 300 es
layout(location=0) in vec3 a_pos; layout(location=1) in vec3 a_nrm; layout(location=2) in vec3 a_col; layout(location=3) in float a_mat;
uniform mat4 u_vp; uniform mat4 u_view; out vec3 v_pos; out vec3 v_nrm; out vec3 v_col; out float v_mat; out float v_vz;
void main(){ v_pos = a_pos; v_nrm = a_nrm; v_col = a_col; v_mat = a_mat; v_vz = -(u_view * vec4(a_pos, 1.0)).z; gl_Position = u_vp * vec4(a_pos, 1.0); }`;
const G_FS = `#version 300 es
precision highp float;
in vec3 v_pos; in vec3 v_nrm; in vec3 v_col; in float v_mat; in float v_vz;
uniform vec2 u_ball; // roughness, metallic of the test sphere (material 7)
layout(location=0) out vec4 o_albedo; layout(location=1) out vec4 o_normal; layout(location=2) out vec4 o_pos;
${ALBEDO}
void main(){
  vec3 n = normalize(v_nrm); float rough = 0.7, metal = 0.0;
  if (v_mat < 0.5) rough = 0.55; else if (v_mat < 1.5) rough = 0.9; else if (v_mat < 2.5) rough = 0.5; else if (v_mat > 3.5 && v_mat < 4.5) rough = 0.4;
  if (v_mat > 6.5) { rough = u_ball.x; metal = u_ball.y; }
  bool emissive = v_mat > 4.5 && v_mat < 5.5;
  o_albedo = vec4(emissive ? v_col : albedoAt(v_pos, n, v_mat, v_col), rough);
  o_normal = vec4(emissive ? vec3(0.0) : n, metal);
  o_pos = vec4(v_pos, v_vz);
}`;
const FS_VS = `#version 300 es
out vec2 v_uv; void main(){ vec2 p = vec2((gl_VertexID<<1)&2, gl_VertexID&2); v_uv = p; gl_Position = vec4(p*2.0-1.0, 0.0, 1.0); }`;
const AO_FS = `#version 300 es
precision highp float; in vec2 v_uv;
uniform sampler2D u_normal; uniform sampler2D u_pos; uniform mat4 u_vp; uniform mat4 u_view; uniform float u_radius; uniform int u_samples;
out vec4 o;
float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
void main(){
  vec4 P = texture(u_pos, v_uv); vec3 n = texture(u_normal, v_uv).xyz;
  if (P.w <= 0.0 || dot(n, n) < 0.5) { o = vec4(1.0); return; }
  float occ = 0.0;
  for (int i = 0; i < u_samples; i++) {
    vec3 s = vec3(gl_FragCoord.xy, float(i) * 7.13);
    vec3 d = normalize(vec3(hash(s), hash(s + 3.7), hash(s + 9.1)) * 2.0 - 1.0); if (dot(d, n) < 0.0) d = -d;
    float len = u_radius * mix(0.15, 1.0, hash(s + 5.5));
    vec3 q = P.xyz + n * 0.02 + d * len; vec4 c = u_vp * vec4(q, 1.0); vec2 uv = c.xy / c.w * 0.5 + 0.5;
    float sceneZ = texture(u_pos, uv).w, qz = -(u_view * vec4(q, 1.0)).z;
    // depth buffer only: anything in front of the sample point counts as an occluder (this is where halos come from)
    if (sceneZ > 0.0 && sceneZ < qz - 0.02) occ += 1.0;
  }
  o = vec4(vec3(1.0 - occ / float(u_samples)), 1.0);
}`;
const LIGHT_FS = `#version 300 es
precision highp float; in vec2 v_uv;
uniform sampler2D u_albedo; uniform sampler2D u_normal; uniform sampler2D u_pos; uniform sampler2D u_ao;
uniform vec3 u_eye; uniform int u_count; uniform vec4 u_lpos[64]; uniform vec3 u_lcol[64];
uniform float u_ambient; uniform int u_view; uniform bool u_useAo; uniform vec3 u_skyTop; uniform vec3 u_skyBot; uniform vec2 u_texel;
out vec4 o;
const float PI = 3.14159265;
void main(){
  vec4 A = texture(u_albedo, v_uv), N = texture(u_normal, v_uv), P = texture(u_pos, v_uv);
  vec2 uv = v_uv;
  if (u_view == 1) { // the four buffers side by side
    uv = fract(v_uv * 2.0); int k = int(v_uv.x * 2.0) + 2 * int((1.0 - v_uv.y) * 2.0);
    A = texture(u_albedo, uv); N = texture(u_normal, uv); P = texture(u_pos, uv);
    vec3 c = k == 0 ? A.rgb : k == 1 ? N.xyz * 0.5 + 0.5 : k == 2 ? vec3(1.0 - clamp(P.w / 18.0, 0.0, 1.0)) * step(0.001, P.w) : vec3(A.a, N.a, 0.0);
    o = vec4(pow(c, vec3(k == 0 ? 2.2 : 2.2)), 1.0); return;
  }
  if (P.w <= 0.0) { o = vec4(mix(u_skyBot, u_skyTop, smoothstep(0.25, 1.0, v_uv.y)), 1.0); return; }
  float ao = 0.0; for (int i = -1; i <= 2; i++) for (int j = -1; j <= 2; j++) ao += texture(u_ao, v_uv + (vec2(float(i), float(j)) - 0.5) * u_texel).r; ao /= 16.0;
  if (u_view == 2) { o = vec4(vec3(pow(ao, 2.2)), 1.0); return; }
  if (u_view == 3) { // light list per 16x16 screen tile, as a tiled renderer builds it: lights reaching any of 5 sample points of the tile
    vec2 res = 1.0 / u_texel, t0 = floor(gl_FragCoord.xy / 16.0) * 16.0; int hits = 0;
    vec4 Q[5]; Q[0] = texture(u_pos, (t0 + vec2(1.0, 1.0)) / res); Q[1] = texture(u_pos, (t0 + vec2(15.0, 1.0)) / res); Q[2] = texture(u_pos, (t0 + vec2(1.0, 15.0)) / res);
    Q[3] = texture(u_pos, (t0 + vec2(15.0, 15.0)) / res); Q[4] = texture(u_pos, (t0 + vec2(8.0)) / res);
    for (int i = 0; i < u_count; i++) { bool any = false; for (int j = 0; j < 5; j++) { vec3 L = u_lpos[i].xyz - Q[j].xyz; if (Q[j].w > 0.0 && dot(L, L) <= u_lpos[i].w * u_lpos[i].w) any = true; } if (any) hits++; }
    vec3 heat = hits <= 1 ? vec3(0.08, 0.16, 0.45) : hits <= 3 ? vec3(0.1, 0.55, 0.6) : hits <= 7 ? vec3(0.95, 0.8, 0.25) : hits <= 15 ? vec3(1.0, 0.5, 0.12) : vec3(0.95, 0.15, 0.1);
    float lum = dot(A.rgb, vec3(0.3, 0.55, 0.15)) * 0.55 + 0.04;
    vec3 c = hits == 0 ? vec3(lum * 0.6) : mix(vec3(lum), heat, 0.62);
    vec2 g = gl_FragCoord.xy - t0; if (g.x < 1.0 || g.y < 1.0) c *= 0.75;
    o = vec4(pow(c, vec3(2.2)), 1.0); return; } // emissive
  vec3 n = normalize(N.xyz), V = normalize(u_eye - P.xyz); float rough = max(A.a, 0.04), metal = N.a, a = rough * rough, a2 = a * a;
  vec3 F0 = mix(vec3(0.04), A.rgb, metal), diff = A.rgb * (1.0 - metal);
  vec3 c = diff * u_ambient * ao + F0 * u_ambient * ao * metal * 2.0;
  float nv = max(dot(n, V), 1e-3), k = (rough + 1.0) * (rough + 1.0) / 8.0;
  for (int i = 0; i < u_count; i++) {
    vec3 L = u_lpos[i].xyz - P.xyz; float d2 = dot(L, L); if (d2 > u_lpos[i].w * u_lpos[i].w) continue; // light only where it reaches
    L = normalize(L); float nl = max(dot(n, L), 0.0); if (nl <= 0.0) continue;
    vec3 H = normalize(L + V); float nh = max(dot(n, H), 0.0), vh = max(dot(V, H), 0.0);
    float D = a2 / (PI * pow(nh * nh * (a2 - 1.0) + 1.0, 2.0));
    float G = (nl / (nl * (1.0 - k) + k)) * (nv / (nv * (1.0 - k) + k));
    vec3 F = F0 + (1.0 - F0) * pow(2.0, (-5.55473 * vh - 6.98316) * vh);
    float fall = 1.0 / d2 * pow(clamp(1.0 - d2 / (u_lpos[i].w * u_lpos[i].w), 0.0, 1.0), 2.0);
    c += (diff / PI + D * G * F / (4.0 * nl * nv)) * u_lcol[i] * nl * fall * PI;
  }
  o = vec4(c, 1.0);
}`;

export class Deferred {
  constructor(gl, raster) {
    this.gl = gl; this.raster = raster; this.ok = !!gl.getExtension('EXT_color_buffer_float'); if (!this.ok) return;
    this.g = program(gl, G_VS, G_FS); this.ao = program(gl, FS_VS, AO_FS); this.light = program(gl, FS_VS, LIGHT_FS); this.w = 0;
  }
  target() {
    const gl = this.gl, r = this.raster; r.hdrBind(); const W = r.hdr.w, H = r.hdr.h;
    if (W !== this.w || H !== this.h) {
      this.w = W; this.h = H; const mk = (fmt, unit) => { const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); gl.texStorage2D(gl.TEXTURE_2D, 1, fmt, W, H);
        for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.NEAREST], [gl.TEXTURE_MAG_FILTER, gl.NEAREST], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v); return t; };
      this.tex = [mk(gl.RGBA8, 5), mk(gl.RGBA16F, 6), mk(gl.RGBA32F, 7)]; this.aoTex = mk(gl.RGBA8, 8);
      this.fbo = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
      this.tex.forEach((t, i) => gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, t, 0));
      this.rb = gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER, this.rb); gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH24_STENCIL8, W, H);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this.rb);
      this.aoFbo = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, this.aoFbo); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.aoTex, 0);
      // the HDR target shares this depth buffer so a forward pass for transparents can run after lighting
      gl.bindFramebuffer(gl.FRAMEBUFFER, r.hdr.fbo); gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this.rb);
      gl.activeTexture(gl.TEXTURE0);
    }
  }
  // cam: {vp, view, eye}; s: {lights:[{pos,pow,col,radius}], ambient, view, ao, aoRadius, aoSamples, ball:[rough,metal], sky}
  render(cam, s, meshes) {
    const gl = this.gl, r = this.raster; this.target();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo); gl.viewport(0, 0, this.w, this.h); gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1, gl.COLOR_ATTACHMENT2]);
    gl.disable(gl.BLEND); gl.enable(gl.DEPTH_TEST); gl.depthMask(true); gl.depthFunc(gl.LEQUAL); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    gl.useProgram(this.g.p); gl.uniformMatrix4fv(this.g.u.u_vp, false, cam.vp); gl.uniformMatrix4fv(this.g.u.u_view, false, cam.view); gl.uniform2fv(this.g.u.u_ball, s.ball);
    for (const m of meshes) m.draw();
    gl.bindVertexArray(r.emptyVao); gl.disable(gl.DEPTH_TEST);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.aoFbo); gl.useProgram(this.ao.p);
    gl.uniform1i(this.ao.u.u_normal, 6); gl.uniform1i(this.ao.u.u_pos, 7); gl.uniformMatrix4fv(this.ao.u.u_vp, false, cam.vp); gl.uniformMatrix4fv(this.ao.u.u_view, false, cam.view);
    gl.uniform1f(this.ao.u.u_radius, s.aoRadius); gl.uniform1i(this.ao.u.u_samples, s.aoSamples); gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindFramebuffer(gl.FRAMEBUFFER, r.hdr.fbo); gl.depthMask(false); const L = this.light; gl.useProgram(L.p);
    gl.uniform1i(L.u.u_albedo, 5); gl.uniform1i(L.u.u_normal, 6); gl.uniform1i(L.u.u_pos, 7); gl.uniform1i(L.u.u_ao, 8);
    gl.uniform3fv(L.u.u_eye, cam.eye); gl.uniform1f(L.u.u_ambient, s.ambient); gl.uniform1i(L.u.u_view, s.view); gl.uniform1i(L.u.u_useAo, s.ao ? 1 : 0);
    gl.uniform3fv(L.u.u_skyTop, s.skyTop); gl.uniform3fv(L.u.u_skyBot, s.skyBottom); gl.uniform2f(L.u.u_texel, 1 / this.w, 1 / this.h);
    const n = Math.min(64, s.lights.length), lp = new Float32Array(256), lc = new Float32Array(192);
    for (let i = 0; i < n; i++) { const l = s.lights[i]; lp.set([...l.pos, l.radius || 30], i * 4); lc.set(l.col.map((c) => c * l.pow), i * 3); }
    gl.uniform1i(L.u.u_count, n); gl.uniform4fv(L.u.u_lpos, lp); gl.uniform3fv(L.u.u_lcol, lc);
    gl.drawArrays(gl.TRIANGLES, 0, 3); gl.depthMask(true); gl.enable(gl.DEPTH_TEST);
  }
}
