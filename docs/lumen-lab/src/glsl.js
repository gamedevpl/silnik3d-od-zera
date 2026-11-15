// Shared GLSL: procedural albedo so the rasteriser and the path tracer show the same surfaces.
export const ALBEDO = `
float hash21(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
// mat: 0 floor, 1 wall, 2 column, 3 stair, 4 character, 5 emissive/unlit
vec3 albedoAt(vec3 p, vec3 n, float mat, vec3 base){
  if (mat < 0.5) { // floor: 1 m stone tiles with thin joints
    vec2 t = p.xz; vec2 id = floor(t); vec2 f = fract(t);
    float joint = step(0.03, f.x) * step(0.03, f.y);
    float v = 0.88 + 0.12 * hash21(id);
    float chk = mod(id.x + id.y, 2.0) < 0.5 ? 1.0 : 0.86;
    return base * v * chk * mix(0.55, 1.0, joint);
  }
  if (mat < 1.5) { // wall: bricks
    vec2 t = vec2(p.x * 2.0, p.y * 4.0); float row = floor(t.y); t.x += 0.5 * mod(row, 2.0);
    vec2 id = floor(t); vec2 f = fract(t);
    float joint = step(0.04, f.x) * step(0.1, f.y);
    return base * (0.85 + 0.15 * hash21(id)) * mix(0.6, 1.0, joint);
  }
  if (mat < 2.5) { // column: flutes
    float a = atan(n.z, n.x); float fl = 0.9 + 0.1 * cos(a * 16.0);
    return base * (abs(n.y) > 0.5 ? 1.0 : fl);
  }
  if (mat < 3.5) { // stairs: darker riser edge
    float edge = abs(n.y) > 0.5 ? 1.0 : 0.82;
    return base * edge;
  }
  return base;
}
`;
