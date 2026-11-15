// Mode 7d: signed distance field of the columns (top-down slice) and sphere tracing: a ray jumps by the distance
// to the nearest surface, so it crosses empty space in a few big steps.
import { program } from './raster.js';
import { VS } from './pathtrace.js';
import { COLUMNS } from './scene.js';
const f = (x) => (Number.isInteger(x) ? x.toFixed(1) : String(x));
const FS = `#version 300 es
precision highp float; uniform vec2 u_res; uniform vec2 u_origin; uniform vec2 u_dir; uniform float u_steps; out vec4 o;
float sdf(vec2 p){ float d = 1e9;
${COLUMNS.map((c) => `  d = min(d, length(p - vec2(${f(c.x)}, ${f(c.z)})) - ${f(c.r)});`).join('\n')}
  d = min(d, p.y + 4.0); return d; }
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y; vec2 p = vec2(uv.x * 9.0, -uv.y * 9.0 + 0.6);
  float d = sdf(p); vec3 c = d > 0.0 ? mix(vec3(0.05, 0.2, 0.45), vec3(0.95, 0.75, 0.3), 1.0 - exp(-0.55 * d)) : vec3(0.9, 0.88, 0.82);
  c *= 0.8 + 0.2 * cos(d * 25.0); c = mix(c, vec3(1.0), 1.0 - smoothstep(0.0, 0.02, abs(d)));
  float px = 9.0 / u_res.y; vec2 q = u_origin; float t = 0.0;
  for (int i = 0; i < 24; i++) {
    if (float(i) >= u_steps) break;
    float r = sdf(q); float ring = abs(length(p - q) - r);
    c = mix(c, vec3(1.0), (1.0 - smoothstep(px, px * 2.5, ring)) * 0.9);
    c = mix(c, vec3(1.0, 0.25, 0.2), 1.0 - smoothstep(0.05, 0.06, length(p - q)));
    vec2 n = q + u_dir * r; float frac = clamp(u_steps - float(i), 0.0, 1.0);
    vec2 pa = p - q, ba = (n - q) * frac; float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
    c = mix(c, vec3(1.0, 0.25, 0.2), 1.0 - smoothstep(px * 1.5, px * 3.0, length(pa - ba * h)));
    if (r < 0.01) break; q = n;
  }
  o = vec4(pow(c, vec3(1.0 / 2.2)), 1.0);
}`;
export class SdfView {
  constructor(gl) { this.gl = gl; this.prog = program(gl, VS, FS); this.vao = gl.createVertexArray(); }
  render(s) {
    const gl = this.gl, u = this.prog.u; gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, gl.canvas.width, gl.canvas.height); gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND);
    gl.useProgram(this.prog.p); gl.uniform2f(u.u_res, gl.canvas.width, gl.canvas.height); gl.uniform2fv(u.u_origin, s.sdfOrigin); gl.uniform2fv(u.u_dir, s.sdfDir); gl.uniform1f(u.u_steps, s.sdfSteps);
    gl.bindVertexArray(this.vao); gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}
