// Forward rasteriser for modes 0-2 (more modes plug in through u_mode).
import { ALBEDO } from './glsl.js';

const VS = `#version 300 es
layout(location=0) in vec3 a_pos; layout(location=1) in vec3 a_nrm; layout(location=2) in vec3 a_col; layout(location=3) in float a_mat;
uniform mat4 u_vp; uniform int u_mode; uniform vec3 u_light; uniform float u_lightPow;
out vec3 v_pos; out vec3 v_nrm; out vec3 v_col; out float v_mat; out vec3 v_vlight;
void main(){
  v_pos = a_pos; v_nrm = a_nrm; v_col = a_col; v_mat = a_mat;
  vec3 L = u_light - a_pos; float d2 = dot(L, L);
  v_vlight = vec3(u_lightPow * max(dot(normalize(a_nrm), normalize(L)), 0.0) / d2); // Gouraud: lit at vertices only
  gl_Position = u_vp * vec4(a_pos, 1.0);
}`;
const FS = `#version 300 es
precision highp float;
in vec3 v_pos; in vec3 v_nrm; in vec3 v_col; in float v_mat; in vec3 v_vlight;
uniform int u_mode; uniform vec3 u_light; uniform float u_lightPow; uniform vec4 u_tint; uniform float u_ambient;
uniform bool u_linear; uniform highp sampler2D u_shadow; uniform mat4 u_lightVP; uniform vec3 u_sunDir; uniform float u_bias; uniform float u_slope; uniform int u_pcf; uniform float u_smSize;
uniform bool u_relief;
uniform sampler2D u_lmFloor; uniform sampler2D u_lmWall; uniform vec4 u_flash; uniform float u_charLight; uniform vec3 u_lightCol;
out vec4 o;
${ALBEDO}
void main(){
  if (u_mode == 9) { o = u_tint; return; }                 // flat overlay colour (blob, debug ray)
  vec3 n = normalize(v_nrm);
  vec3 alb = albedoAt(v_pos, n, v_mat, v_col);
  vec3 c = alb;                                             // mode 0/1: albedo only
  if (u_mode == 2) c = alb * (u_ambient + u_lightCol * v_vlight);        // Gouraud
  if (u_mode == 3) { vec3 L = u_light - v_pos; c = alb * (u_ambient + u_lightCol * u_lightPow * max(dot(n, normalize(L)), 0.0) / dot(L, L)); } // per pixel
  if (u_mode == 4 || u_mode == 5) {                         // lightmap only / albedo x lightmap
    float e;
    if (v_mat < 0.5) e = texture(u_lmFloor, (v_pos.xz + 5.0) / 10.0).r;
    else if (v_mat < 1.5) e = texture(u_lmWall, vec2((v_pos.x + 5.0) / 10.0, v_pos.y / 4.5)).r;
    else if (v_mat > 3.5 && v_mat < 4.5) e = u_charLight;   // character: one lightmap sample below its feet
    else if (v_mat > 5.5) e = u_ambient;
    else { vec3 L = u_light - v_pos; e = u_ambient + u_lightPow * max(dot(n, normalize(L)), 0.0) / dot(L, L); }
    if (u_relief && v_mat < 1.5 && v_mat > 0.5) {           // simplified directional bake: baked light keeps its dominant direction,
      vec2 t = vec2(v_pos.x * 2.0, v_pos.y * 4.0); t.x += 0.5 * mod(floor(t.y), 2.0); vec2 f = fract(t) - 0.5; // so a normal map can react to it
      vec3 nb = normalize(vec3(-f.x * smoothstep(0.3, 0.5, abs(f.x)) * 3.0, -f.y * smoothstep(0.25, 0.5, abs(f.y)) * 3.0, 1.0));
      vec3 Ld = normalize(u_light - v_pos); e *= max(dot(nb, Ld), 0.0) / max(Ld.z, 0.15);
    }
    vec3 F = u_flash.xyz - v_pos;                           // dynamic light added on top of the baked value
    e += u_flash.w * max(dot(n, normalize(F)), 0.0) / (1.0 + dot(F, F));
    c = (u_mode == 4 ? vec3(1.0) : alb) * e * u_lightCol;
  }
  if (u_mode == 6) {                                        // shadow map: depth from the light, one compare per tap
    vec4 lp = u_lightVP * vec4(v_pos, 1.0); vec3 q = lp.xyz / lp.w * 0.5 + 0.5;
    float ndl = max(dot(n, u_sunDir), 0.0);
    float bias = u_bias + u_slope * clamp(sqrt(1.0 - ndl * ndl) / max(ndl, 0.05), 0.0, 10.0);
    float vis = 0.0, cnt = 0.0;
    for (int i = -u_pcf; i <= u_pcf; i++) for (int j = -u_pcf; j <= u_pcf; j++) {
      float d = texture(u_shadow, q.xy + vec2(float(i), float(j)) / u_smSize).r;
      vis += (q.z - bias <= d) ? 1.0 : 0.0; cnt += 1.0;
    }
    vis /= cnt; if (q.x < 0.0 || q.x > 1.0 || q.y < 0.0 || q.y > 1.0 || q.z > 1.0) vis = 1.0;
    c = alb * (u_ambient + u_lightCol * ndl * vis);
  }
  if (u_mode == 8) c = alb * u_ambient;                     // ambient-only base pass (mode 5)
  if (v_mat > 4.5 && v_mat < 5.5) c = (u_mode == 3 && u_ambient == 0.0) ? vec3(0.0) : v_col;
  o = u_linear ? vec4(c, 1.0) : vec4(pow(clamp(c, 0.0, 1.0), vec3(1.0/2.2)), 1.0);
}`;
const SKY_VS = `#version 300 es
out vec2 v_uv; void main(){ vec2 p = vec2((gl_VertexID<<1)&2, gl_VertexID&2); v_uv = p; gl_Position = vec4(p*2.0-1.0, 0.999, 1.0); }`;
const SKY_FS = `#version 300 es
precision highp float; in vec2 v_uv; uniform vec3 u_top; uniform vec3 u_bot; uniform bool u_linear; out vec4 o;
void main(){ vec3 c = mix(u_bot, u_top, smoothstep(0.25, 1.0, v_uv.y)); o = vec4(u_linear ? c : pow(c, vec3(1.0/2.2)), 1.0); }`;

export function program(gl, vs, fs) {
  const p = gl.createProgram();
  for (const [t, s] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) {
    const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) + '\n' + s.split('\n').map((l, i) => `${i + 1}: ${l}`).join('\n'));
    gl.attachShader(p, sh);
  }
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  const u = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) { const info = gl.getActiveUniform(p, i); u[info.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(p, info.name); }
  return { p, u };
}

export class GpuMesh {
  constructor(gl) { this.gl = gl; this.vao = gl.createVertexArray(); this.bufs = [0, 1, 2, 3].map(() => gl.createBuffer()); this.count = 0; }
  set(mesh, usage) {
    const gl = this.gl; gl.bindVertexArray(this.vao);
    [[mesh.p, 3], [mesh.n, 3], [mesh.c, 3], [mesh.m, 1]].forEach(([arr, size], i) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bufs[i]); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), usage || gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(i); gl.vertexAttribPointer(i, size, gl.FLOAT, false, 0, 0);
    });
    this.count = mesh.p.length / 3; gl.bindVertexArray(null); return this;
  }
  draw() { const gl = this.gl; gl.bindVertexArray(this.vao); gl.drawArrays(gl.TRIANGLES, 0, this.count); }
}

const DEPTH_VS = `#version 300 es
layout(location=0) in vec3 a_pos; uniform mat4 u_vp; void main(){ gl_Position = u_vp * vec4(a_pos, 1.0); }`;
const DEPTH_FS = `#version 300 es
precision highp float; void main(){}`;
const PRESENT_FS = `#version 300 es
precision highp float; in vec2 v_uv; uniform sampler2D u_tex; uniform float u_exposure; out vec4 o;
void main(){ vec3 c = texture(u_tex, v_uv).rgb * u_exposure; c = c / (1.0 + 0.25 * c); o = vec4(pow(clamp(c, 0.0, 1.0), vec3(1.0/2.2)), 1.0); }`;
const BLIT_FS = `#version 300 es
precision highp float; in vec2 v_uv; uniform highp sampler2D u_tex; out vec4 o;
void main(){ float d = texture(u_tex, v_uv).r; o = vec4(vec3(1.0 - pow(d, 1.5)), 1.0); }`;

const VOL_VS = `#version 300 es
layout(location=0) in vec4 a_pos; uniform mat4 u_vp; uniform vec3 u_light;
void main(){ gl_Position = u_vp * (a_pos.w > 0.5 ? a_pos : vec4(a_pos.xyz, 0.0)); }`;
const VOL_FS = `#version 300 es
precision highp float; uniform vec4 u_tint; out vec4 o; void main(){ o = u_tint; }`;

export class Raster {
  constructor(gl) {
    this.gl = gl; this.main = program(gl, VS, FS); this.sky = program(gl, SKY_VS, SKY_FS); this.emptyVao = gl.createVertexArray();
    this.vol = program(gl, VOL_VS, VOL_FS); this.volVao = gl.createVertexArray(); this.volBuf = gl.createBuffer();
    this.present = program(gl, SKY_VS, PRESENT_FS); this.hdr = null; this.linear = false;
    this.depth = program(gl, DEPTH_VS, DEPTH_FS); this.blit = program(gl, SKY_VS, BLIT_FS); this.smSize = 0;
  }
  // Depth-only pass from the light into a size x size depth texture (texture unit 3).
  shadowPass(size, lightVP, meshes) {
    const gl = this.gl;
    if (size !== this.smSize) {
      this.smSize = size; this.smTex = gl.createTexture(); gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, this.smTex);
      gl.texStorage2D(gl.TEXTURE_2D, 1, gl.DEPTH_COMPONENT24, size, size);
      for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.NEAREST], [gl.TEXTURE_MAG_FILTER, gl.NEAREST], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
      this.smFbo = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, this.smFbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.smTex, 0); gl.drawBuffers([gl.NONE]); gl.readBuffer(gl.NONE);
      gl.activeTexture(gl.TEXTURE0);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.smFbo); gl.viewport(0, 0, size, size); gl.enable(gl.DEPTH_TEST); gl.depthMask(true); gl.disable(gl.BLEND);
    gl.clear(gl.DEPTH_BUFFER_BIT); gl.useProgram(this.depth.p); gl.uniformMatrix4fv(this.depth.u.u_vp, false, lightVP);
    for (const m of meshes) m.draw();
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  // Linear HDR target (RGBA16F + depth/stencil) at 2x resolution; presented with tone mapping and gamma.
  hdrBind() {
    const gl = this.gl, W = gl.canvas.width * 2, H = gl.canvas.height * 2;
    if (!this.hdr || this.hdr.w !== W || this.hdr.h !== H) {
      const tex = gl.createTexture(); gl.activeTexture(gl.TEXTURE4); gl.bindTexture(gl.TEXTURE_2D, tex); gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA16F, W, H);
      for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
      const rb = gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER, rb); gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH24_STENCIL8, W, H);
      const fbo = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0); gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, rb);
      this.hdr = { tex, fbo, w: W, h: H }; gl.activeTexture(gl.TEXTURE0);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.hdr.fbo); gl.viewport(0, 0, this.hdr.w, this.hdr.h);
  }
  hdrPresent(exposure = 1) {
    const gl = this.gl; gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND); gl.disable(gl.STENCIL_TEST); gl.useProgram(this.present.p);
    gl.activeTexture(gl.TEXTURE4); gl.bindTexture(gl.TEXTURE_2D, this.hdr.tex); gl.uniform1i(this.present.u.u_tex, 4); gl.uniform1f(this.present.u.u_exposure, exposure); gl.activeTexture(gl.TEXTURE0);
    gl.bindVertexArray(this.emptyVao); gl.drawArrays(gl.TRIANGLES, 0, 3); gl.enable(gl.DEPTH_TEST);
  }
  // Shadow volume into the stencil buffer. zfail: Carmack's-reverse style counting on depth fail (needs caps).
  volume(vp, data, mode) {
    const gl = this.gl; gl.useProgram(this.vol.p); gl.uniformMatrix4fv(this.vol.u.u_vp, false, vp);
    gl.bindVertexArray(this.volVao); gl.bindBuffer(gl.ARRAY_BUFFER, this.volBuf); gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LESS); gl.depthMask(false); gl.disable(gl.CULL_FACE);
    if (mode === 'zpass' || mode === 'zfail') {
      gl.colorMask(false, false, false, false); gl.enable(gl.STENCIL_TEST); gl.stencilFunc(gl.ALWAYS, 0, 0xff);
      if (mode === 'zpass') { gl.stencilOpSeparate(gl.FRONT, gl.KEEP, gl.KEEP, gl.INCR_WRAP); gl.stencilOpSeparate(gl.BACK, gl.KEEP, gl.KEEP, gl.DECR_WRAP); }
      else { gl.stencilOpSeparate(gl.FRONT, gl.KEEP, gl.DECR_WRAP, gl.KEEP); gl.stencilOpSeparate(gl.BACK, gl.KEEP, gl.INCR_WRAP, gl.KEEP); }
      gl.drawArrays(gl.TRIANGLES, 0, data.length / 4);
      gl.colorMask(true, true, true, true);
    } else { // debug views: 'wire' translucent sides, 'heat' additive overdraw
      gl.disable(gl.STENCIL_TEST); gl.enable(gl.BLEND);
      if (mode === 'heat') { gl.blendFunc(gl.ONE, gl.ONE); gl.disable(gl.DEPTH_TEST); gl.uniform4f(this.vol.u.u_tint, 0.05, 0.012, 0.0, 1); }
      else { gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.uniform4f(this.vol.u.u_tint, 0.35, 0.6, 1.0, 0.16); }
      gl.drawArrays(gl.TRIANGLES, 0, data.length / 4);
      gl.disable(gl.BLEND); gl.enable(gl.DEPTH_TEST);
    }
    gl.depthMask(true); gl.depthFunc(gl.LEQUAL);
  }
  // Additive lit pass where the stencil says "not in shadow".
  litPass(vp, light, pow, col, meshes) {
    const gl = this.gl, m = this.main; gl.useProgram(m.p); gl.uniformMatrix4fv(m.u.u_vp, false, vp);
    gl.uniform1i(m.u.u_mode, 3); gl.uniform1f(m.u.u_ambient, 0); gl.uniform3fv(m.u.u_light, light); gl.uniform1f(m.u.u_lightPow, pow); gl.uniform3fv(m.u.u_lightCol, col);
    gl.enable(gl.STENCIL_TEST); gl.stencilFunc(gl.EQUAL, 0, 0xff); gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE); gl.depthFunc(gl.LEQUAL); gl.depthMask(false);
    for (const x of meshes) x.draw();
    gl.disable(gl.BLEND); gl.disable(gl.STENCIL_TEST); gl.depthMask(true);
  }
  clearStencil() { const gl = this.gl; gl.clearStencil(0); gl.clear(gl.STENCIL_BUFFER_BIT); }
  // Depth-map inset (fraction of the canvas: x, y, size).
  inset(x, y, w) {
    const gl = this.gl, W = gl.canvas.width, H = gl.canvas.height, px = Math.round(w * W);
    gl.viewport(Math.round(x * W), Math.round(y * H), px, px); gl.disable(gl.DEPTH_TEST); gl.useProgram(this.blit.p);
    gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, this.smTex); gl.uniform1i(this.blit.u.u_tex, 3); gl.activeTexture(gl.TEXTURE0);
    gl.bindVertexArray(this.emptyVao); gl.drawArrays(gl.TRIANGLES, 0, 3); gl.enable(gl.DEPTH_TEST); gl.viewport(0, 0, W, H);
  }
  begin(vp, s) {
    const gl = this.gl, { p, u } = this.sky;
    this.linear = !!s.hdr;
    if (s.hdr) this.hdrBind(); else { gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, gl.canvas.width, gl.canvas.height); }
    gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    gl.disable(gl.BLEND); gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.disable(gl.CULL_FACE);
    gl.useProgram(p); gl.uniform3fv(u.u_top, s.skyTop); gl.uniform3fv(u.u_bot, s.skyBottom); gl.uniform1i(u.u_linear, this.linear ? 1 : 0);
    gl.depthMask(false); gl.bindVertexArray(this.emptyVao); gl.drawArrays(gl.TRIANGLES, 0, 3); gl.depthMask(true);
    const m = this.main; gl.useProgram(m.p);
    gl.uniformMatrix4fv(m.u.u_vp, false, vp); gl.uniform1i(m.u.u_mode, s.shade); gl.uniform1i(m.u.u_linear, this.linear ? 1 : 0);
    gl.uniform3fv(m.u.u_light, s.light); gl.uniform1f(m.u.u_lightPow, s.lightPow); gl.uniform1f(m.u.u_ambient, s.ambient);
    gl.uniform4fv(m.u.u_flash, s.flash || [0, 0, 0, 0]); gl.uniform1f(m.u.u_charLight, s.charLight || 0); gl.uniform3fv(m.u.u_lightCol, s.lightCol || [1, 1, 1]);
    gl.uniform1i(m.u.u_relief, s.relief ? 1 : 0); gl.uniform1i(m.u.u_lmFloor, 1); gl.uniform1i(m.u.u_lmWall, 2); gl.uniform1i(m.u.u_shadow, 3);
    if (s.lightVP) { gl.uniformMatrix4fv(m.u.u_lightVP, false, s.lightVP); gl.uniform3fv(m.u.u_sunDir, s.sunDir); gl.uniform1f(m.u.u_bias, s.bias); gl.uniform1f(m.u.u_slope, s.slope); gl.uniform1i(m.u.u_pcf, s.pcf); gl.uniform1f(m.u.u_smSize, this.smSize); }
  }
  // Translucent flat-colour overlay (blob shadow, debug ray).
  overlay(mesh, rgba, depthTest = true) {
    const gl = this.gl, m = this.main;
    gl.uniform1i(m.u.u_mode, 9); gl.uniform4fv(m.u.u_tint, rgba);
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
    if (!depthTest) gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(-2, -2);
    mesh.draw();
    gl.disable(gl.POLYGON_OFFSET_FILL); gl.enable(gl.DEPTH_TEST); gl.depthMask(true); gl.disable(gl.BLEND);
  }
}
