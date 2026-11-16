// Scripted, deterministic shots (DEMOS.md section 4). Each returns the full scene state for a time t in seconds.
import { smooth, clamp, rng } from './math.js';
import { STAIR_TOP } from './scene.js';

// One jump cycle of period T: crouch, parabola, landing squash.
export function jump(t, T = 1.15, H = 1.05) {
  const u = ((t % T) + T) % T / T;
  if (u < 0.14) return { y: 0, squash: 1 - 0.28 * Math.sin((u / 0.14) * Math.PI * 0.5), arm: -u / 0.14 };
  if (u < 0.74) { const a = (u - 0.14) / 0.6; return { y: 4 * H * a * (1 - a), squash: 1.08, arm: 1 - Math.abs(a - 0.5) }; }
  if (u < 0.88) { const a = (u - 0.74) / 0.14; return { y: 0, squash: 1 - 0.25 * Math.sin(a * Math.PI), arm: 0 }; }
  return { y: 0, squash: 1, arm: 0 };
}
const SUN = [-0.55, 0.8, 0.45];
const base = { blobProject: false, relief: false, smSize: 1024, bias: 0.03, slope: 0.03, pcf: 1, inset: null, lantern: true, night: false, candle: false, bake: 1, bakeRays: false, flash: null, lightCol: [1, 1, 1], shade: 0, blob: false, blobR: 0.4, debugRay: false, pt: false, floorSeg: 1, light: [-0.9, 1.7, 2.6], lightPow: 4, ambient: 0.05, sun: SUN, fov: 34, arm: 0, squash: 1 };
// Vertical (9:16) framing of the jumping character.
const camJumpV = (t) => ({ eye: [2.2 + 0.25 * Math.sin(t * 0.5), 2.1, 9.6], target: [0.1, 0.72, 3] });
const camJumpH = (t) => ({ eye: [3.2 + 0.3 * Math.sin(t * 0.4), 2.1, 9.5], target: [0.3, 1.2, 2] });

function jumper(t, o) {
  const j = jump(t);
  return { ...base, ...o, char: [0, j.y, 3], squash: j.squash, arm: j.arm };
}
function stairEdge(t, o) {
  // Walk along the top step to its edge and stop with the centre 0.08 m from the drop.
  const x = 4.3 - (4.3 - 3.18) * smooth(t / 2.2), walking = t < 2.2;
  return { ...base, ...o, char: [x, STAIR_TOP + (walking ? Math.abs(Math.sin(t * 9)) * 0.04 : 0), 3.9], arm: walking ? Math.sin(t * 9) * 0.5 : 0, squash: 1 };
}
const camStairV = (t) => { const k = smooth((t - 1.6) / 2.0); return { eye: [2.2 + 0.4 * k, 2.2 - 1.15 * k, 12 - 2.5 * k], target: [3.05, 0.75 - 0.1 * k, 3.9] }; };
const camStairH = (t) => { const k = smooth((t - 1.6) / 2.0); return { eye: [2.0, 2.2 - 0.4 * k, 11 - 2 * k], target: [3.0, 1.0, 3.75] }; };

const WARM = [1.0, 0.86, 0.66];
// Mode 2: candle 0.5 m above the middle of a floor made of `seg` x `seg` quads. Gouraud lights vertices only.
const candleScene = (t, v, o) => ({ ...base, night: true, lantern: false, candle: true, light: [0, 0.5, 2.5], lightPow: 1.6, ambient: 0.05, lightCol: WARM,
  char: [-1.6, 0, 3.4], eye: v ? [3.4 + 0.3 * Math.sin(t * 0.4), 5.2, 10.5] : [4.5 + 0.3 * Math.sin(t * 0.4), 4.2, 9.5], target: [0, 0.3, 2.2], fov: v ? 36 : 30, ...o });
// Mode 3: lightmap. Night scene lit by the lantern only.
const lmBase = { ...base, night: true, shade: 5, light: [-0.9, 1.7, 2.6], lightPow: 5, ambient: 0.16, lightCol: WARM, char: [1.2, 0, 3.2] };
const camLmV = (t) => ({ eye: [2.6 + 0.35 * Math.sin(t * 0.35), 5.0, 11.5], target: [-0.2, 0.2, 0.9], fov: 38 });
const camLmH = (t) => ({ eye: [3.5 + 0.4 * Math.sin(t * 0.35), 3.8, 10], target: [-0.3, 1.0, 0.5], fov: 34 });
const camLm = (t, v) => (v ? camLmV(t) : camLmH(t));
function flashWalk(t, v) {
  // A flash pulses near the wall; the character walks through the lantern's pool of light and never casts a shadow.
  const u = (t % 2.4) / 2.4, pow = u < 0.5 ? 9 * Math.pow(Math.sin((u / 0.5) * Math.PI), 2) : 0;
  const x = 2.6 - 5.2 * smooth(t / 7);
  return { ...lmBase, ...camLm(t, v), flash: [2.4, 1.3, -4.3, pow], char: [x, Math.abs(Math.sin(t * 9)) * 0.04, 3.3], arm: Math.sin(t * 9) * 0.5 };
}

// Mode 4: shadow map from the sun. The character finally casts a moving shadow.
function sunWalk(t, v, o) {
  const x = -2.6 + 5.2 * (0.5 - 0.5 * Math.cos(t * 0.7)), j = jump(t, 1.6, 0.8);
  return { ...base, shade: 6, lantern: false, ambient: 0.28, lightCol: [1.0, 0.95, 0.85], char: [x, j.y, 3.2], squash: j.squash, arm: j.arm,
    eye: v ? [2.4 + 0.3 * Math.sin(t * 0.4), 4.6, 11.5] : [3.4 + 0.4 * Math.sin(t * 0.4), 3.6, 10], target: v ? [0, 0.3, 1.6] : [0, 1.0, 1.2], fov: v ? 38 : 34, ...o };
}
const closeUp = (t, v) => ({ eye: [1.6, 1.5, 6.2], target: [0.2, 0.25, 2.6], fov: v ? 40 : 30 });

// Mode 5: stencil shadow volumes, lantern as a point light. Everything is dynamic.
const LAMP = { pos: [-0.9, 1.7, 2.6], pow: 5, col: WARM };
function volScene(t, v, o) {
  const x = 0.6 + 1.6 * Math.sin(t * 0.8);
  return { ...base, shade: 8, night: true, ambient: 0.02, exposure: 1.6, vol: 'zfail', volView: null, hole: false, lights: [LAMP], char: [x, 0, 3.0 + 0.5 * Math.cos(t * 0.8)], arm: Math.sin(t * 8) * 0.4,
    ...camLm(t, v), ...o };
}
const moreLights = (n) => Array.from({ length: n }, (_, i) => (i === 0 ? LAMP : { pos: [-4 + ((i * 2.3) % 8), 1.2 + (i % 3) * 0.5, 4.2 - ((i * 1.7) % 4)], pow: 2.5, col: [[1, 0.6, 0.4], [0.5, 0.7, 1], [0.6, 1, 0.6]][i % 3] }));
// camera walks behind the middle column into its shadow volume (z-pass breaks there)
const camInto = (t) => { const k = smooth(t / 5); return { eye: [3.2 - 2.45 * k, 1.6 - 0.2 * k, 6.5 - 6.55 * k], target: [1.5 - 1.2 * k, 1.2, -4], fov: 50 }; };

// Mode 6: deferred + PBR + SSAO.
const manyLights = (n) => { const r = rng(42); return [{ ...LAMP, pow: 4, radius: 14 }, ...Array.from({ length: n - 1 }, () => ({ pos: [-4.6 + 9.2 * r(), 0.35 + 1.6 * r(), -4 + 8.6 * r()], pow: 0.5, radius: 3.2, col: [[1, 0.45, 0.3], [0.4, 0.65, 1], [0.5, 1, 0.55], [1, 0.9, 0.4]][Math.floor(r() * 4)] }))]; };
const defBase = { ...base, shade: 10, ambient: 0.05, exposure: 1.5, lights: [{ ...LAMP, pow: 4, radius: 14 }], view: 0, ao: true, aoRadius: 0.5, aoSamples: 16, ball: [0.4, 0], ballPos: null, forwardGlass: true, bulbs: false, char: [1.3, 0, 3.2] };
const walkAround = (t) => ({ char: [0.6 + 1.6 * Math.sin(t * 0.8), 0, 3.0 + 0.5 * Math.cos(t * 0.8)], arm: Math.sin(t * 8) * 0.4 });

// Modes 7b / 7c: 1000 small lights, static camera.
const manyBase = (t, v) => ({ ...base, shade: 12, nLights: 1000, restir: false, M: 32, temporal: true, neighbours: 3, exposure: 2.2, char: [0.6 + 1.2 * Math.sin(t * 0.5), 0, 3.0], arm: Math.sin(t * 6) * 0.3,
  ...(v ? { eye: [2.6, 4.6, 11.5], target: [-0.2, 1.0, 0.6], fov: 38 } : { eye: [3.5, 3.8, 10], target: [-0.3, 1.0, 0.5], fov: 34 }) });

// Mode 0b / 0c: 2D palette view.
const pal = (t, o) => ({ ...base, shade: 13, level: 4, lantern2d: [-0.9, 2.6], cycle: 0, strip: true, sector: 2.4, char: [1.2 + 0.8 * Math.sin(t * 0.8), 0, 3.2], eye: [0, 1, 1], target: [0, 0, 0], ...o });

// Mood scenes (labelled "nasza scena" in the films): generic, no copied levels. Stencil volumes, one moving light, no ambient.
function swingLamp(t, v) {
  const piv = [0.2, 4.6, 4.6], L = 2.4, a = 0.5 * Math.sin(t * 1.5), pos = [piv[0] + L * Math.sin(a), piv[1] - L * Math.cos(a), piv[2] + 0.2 * Math.sin(t * 0.7)];
  return volScene(t, v, { volRobust: true, lantern: false, ambient: 0.004, exposure: 1.5, sky: [0.002, 0.002, 0.003], lights: [{ pos, pow: 1.5, col: [0.82, 0.9, 1.0] }], bulbs2: [{ pos, col: [0.9, 0.95, 1.0], from: piv }],
    char: [-0.4 + 0.3 * Math.sin(t * 0.4), 0, 2.4], arm: 0.1 * Math.sin(t * 2), eye: v ? [2.2, 2.4, 10.5] : [3.0, 2.2, 9.6], target: [-0.2, 1.2, 1.0], fov: v ? 40 : 36 });
}
function torchWalk(t, v) {
  const x = 1.3 - 4.8 * smooth(t / 9), z = 3.2, flick = 1 + 0.1 * Math.sin(t * 17) + 0.07 * Math.sin(t * 29.3 + 1) + 0.05 * Math.sin(t * 7.1);
  const pos = [x + 0.48, 1.38 + 0.02 * Math.sin(t * 11), z + 0.18];
  return volScene(t, v, { volRobust: true, lantern: false, ambient: 0.003, exposure: 1.8, sky: [0.002, 0.002, 0.003], lights: [{ pos, pow: 2.0 * flick, col: [1.0, 0.56, 0.24] }], bulbs2: [{ pos, r: 0.05, hh: 0.04, col: [1.0, 0.55, 0.15], stick: true }],
    char: [x, Math.abs(Math.sin(t * 7)) * 0.03, z], arm: Math.sin(t * 7) * 0.25, eye: v ? [x * 0.5 + 1.6, 2.4, 10] : [x * 0.5 + 2.2, 2.0, 9.4], target: [x * 0.6 - 0.2, 1.1, 1.5], fov: v ? 40 : 34 });
}
export const SHOTS = {
  'M-swing': swingLamp,
  'M-torch': torchWalk,
  'D6-c-off': (t, v) => ({ ...SHOTS['D6-c'](0, v), forwardGlass: false }),
  'D6-c-on': (t, v) => ({ ...SHOTS['D6-c'](9, v), forwardGlass: true }),
  'D6-c-fwd': (t, v) => ({ ...SHOTS['D6-c'](9, v), shade: 11 }),
  // camera keeps moving: accumulation resets every frame, so the image stays at 1 sample per pixel
  'D7-a-move': (t, v) => ({ ...base, pt: true, char: [0, 0, 3], eye: [3.2 + 1.2 * Math.sin(t * 0.6), 2.1, 9.5], target: [0.3, 1.2, 2], fov: 30 }),
  'D5-d-8': (t, v) => volScene(t, v, { lights: moreLights(8) }),
  'D1-c': (t, v) => stairEdge(t + 3, { blob: true, blobProject: Math.floor(t / 2) % 2 === 1, ...(v ? camStairV(t + 3) : camStairH(t + 3)), fov: v ? 30 : 26 }),
  'D3-d': (t, v) => ({ ...lmBase, relief: Math.floor(t / 2.5) % 2 === 1, lightCol: [3.0, 2.6, 2.0], eye: [-0.6 + 0.25 * t, 1.5, -0.4], target: [-0.6 + 0.25 * t, 1.4, -5], fov: 46, char: [3.5, 0, 3] }),
  'D7-d': (t) => { const a = -0.42 + 0.1 * Math.sin(t * 0.3); return { ...base, shade: 14, sdfOrigin: [-3.6, 4.2], sdfDir: [Math.cos(a), Math.sin(a) ], sdfSteps: (t * 1.5) % 14, char: [0, 0, 3], eye: [0, 1, 1], target: [0, 0, 0] }; },
  // sector light slider 0 -> 15 -> 4
  'D0-b-levels': (t) => pal(t, { sector: 0, level: Math.round(t < 4 ? 15 * smooth(t / 4) : 15 - 11 * smooth((t - 4) / 2)) }),
  // lantern carried behind the middle column: the wall behind stays lit (no occlusion in the model)
  'D0-b': (t) => pal(t, { lantern2d: [-0.9 + 0.9 * smooth(t / 3), 2.6 - 2.35 * smooth(t / 3)] }),
  'D0-c': (t) => pal(t, { cycle: Math.floor(t * 10) }),
  'D7-b': (t, v) => manyBase(t, v),
  'D7-c': (t, v) => ({ ...manyBase(t, v), restir: Math.floor(t / 2) % 2 === 1 }),
  'D7-c-on': (t, v) => ({ ...manyBase(t, v), restir: true }),
  'D7-c-ris': (t, v) => ({ ...manyBase(t, v), restir: true, temporal: false, neighbours: 0 }),
  'D6-a': (t, v) => ({ ...defBase, shade: 11, ...camLm(t, v), ...walkAround(t), lights: manyLights(50), bulbs: true }),
  'D6-a-def': (t, v) => ({ ...defBase, ...camLm(t, v), ...walkAround(t), lights: manyLights(50), bulbs: true }),
  'D6-b': (t, v) => ({ ...defBase, ...camLm(0, v), view: 1 }),
  // EN film: light-reach heat map (what tiled / clustered light culling exploits) and static bench shots for the light sweep.
  'D6-tiles': (t, v) => ({ ...defBase, ...camLm(t, v), ...walkAround(t), lights: manyLights(50), bulbs: true, view: 3 }),
  ...Object.fromEntries([1, 2, 4, 8, 16, 32, 64].flatMap((n) => [[`B-fwd-${n}`, (t, v) => ({ ...defBase, shade: 11, ...camLm(0, v), lights: manyLights(n), bulbs: true, forwardGlass: false })],
    [`B-def-${n}`, (t, v) => ({ ...defBase, ...camLm(0, v), lights: manyLights(n), bulbs: true, forwardGlass: false })]])),
  'D6-c': (t, v) => ({ ...defBase, eye: [0.3, 1.9, 5.6], target: [-0.9, 1.5, 2.6], fov: v ? 40 : 30, forwardGlass: t > 3 }),
  'D6-d': (t, v) => ({ ...defBase, ambient: 0.35, eye: [1.6 - 0.5 * smooth(t / 6), 1.0, 5.2 - 2.2 * smooth(t / 6)], target: [0, 0.3, 1], fov: 36, char: [0.55, 0, 1.25], ao: Math.floor(t / 1.5) % 2 === 1, view: 0 }),
  'D6-d-ao': (t, v) => ({ ...SHOTS['D6-d'](t, v), view: 2, ao: true }),
  'D6-e': (t, v) => ({ ...defBase, ambient: 0.35, eye: [0.6, 1.4, 6.5], target: [0.4, 1.0, 0], fov: 34, char: [0.9 + 0.8 * Math.sin(t * 0.7), 0, -3.4], aoRadius: 0.5 + 2.5 * smooth((t - 1) / 3), aoSamples: t > 5 ? 4 : 16 }),
  'D6-f': (t, v) => ({ ...defBase, eye: [-0.2, 1.1, 6.2], target: [-0.3, 0.6, 3.4], fov: v ? 40 : 28, ballPos: [-0.1, 0.4, 3.6], char: [2.5, 0, 2],
    ball: [t < 4 ? 0.05 + 0.95 * smooth(t / 4) : 1 - 0.75 * smooth((t - 4) / 3), t > 4 ? 1 : 0] }),
  'D5-a': (t, v) => volScene(t, v, { volView: 'wire', eye: [3 * Math.cos(t * 0.3) + 0.5, 3.2, 8 + 2 * Math.sin(t * 0.3)], target: [0, 1.2, 1], fov: v ? 44 : 36 }),
  'D5-clean': (t, v) => volScene(t, v, {}),
  'D5-b': (t, v) => volScene(0, v, { vol: 'zpass', ...camInto(t) }),
  'D5-c': (t, v) => volScene(0, v, { vol: 'zfail', ...camInto(t) }),
  'D5-d': (t, v) => volScene(t, v, { volView: 'heat', lights: moreLights([1, 2, 4, 8][Math.min(3, Math.floor(t / 2))]) }),
  'D5-d-clean': (t, v) => volScene(t, v, { lights: moreLights([1, 2, 4, 8][Math.min(3, Math.floor(t / 2))]) }),
  'D5-e': (t, v) => volScene(t, v, { hole: true, volRobust: false }), // classic orientation keeps the visible leak
  'D4-a': (t, v) => sunWalk(t, v, { inset: v ? [0.06, 0.74, 0.34] : [0.76, 0.6, 0.2] }),
  'D4-clean': (t, v) => sunWalk(t, v, {}),
  'D4-b': (t, v) => ({ ...sunWalk(0, v, { bias: 0, slope: 0, pcf: 0 }), ...closeUp(t, v), char: [0.3, 0, 3.0], squash: 1, arm: 0 }),
  // bias slider: 0 (acne) -> slope-scaled (clean) -> far too large (shadow detaches: peter panning)
  'D4-c': (t, v) => { const k = t < 2 ? 0 : t < 5 ? smooth((t - 2) / 1.5) * 0.03 : 0.03 + smooth((t - 5) / 2.5) * 0.9;
    return { ...sunWalk(0, v, { bias: k, slope: Math.min(k, 0.03), pcf: 0 }), ...closeUp(t, v), char: [0.3, 0, 3.0], squash: 1, arm: 0 }; },
  'D2-a': (t, v) => candleScene(t, v, { shade: 2, floorSeg: 1 }),
  'D2-a-black': (t, v) => candleScene(t, v, { shade: 2, floorSeg: 1, ambient: 0.0 }),
  'D4-a-big': (t, v) => sunWalk(t, v, { inset: [0.54, 0.36, 0.42] }),
  'D2-a-pp': (t, v) => candleScene(t, v, { shade: 3, floorSeg: 1 }),
  'D2-b': (t, v) => candleScene(t, v, { shade: 2, floorSeg: [1, 3, 9, 33][Math.min(3, Math.floor(t / 1.5))] }),
  'D3-a': (t, v) => ({ ...lmBase, ...camLm(t, v), bake: clamp(t / 10, 0, 1), bakeRays: true }),
  'D3-b': (t, v) => ({ ...lmBase, ...camLm(t, v), shade: [4, 0, 5][Math.min(2, Math.floor(t / 2))] }),
  'D3-b-lm': (t, v) => ({ ...lmBase, ...camLm(t, v), shade: 4 }),
  'D3-b-final': (t, v) => ({ ...lmBase, ...camLm(t, v) }),
  'D3-c': flashWalk,
  'D3-walk': (t, v) => ({ ...flashWalk(t, v), flash: null }),
  'D0-a': (t, v) => jumper(t, { ...(v ? camJumpV(t) : camJumpH(t)), fov: v ? 29 : 30 }),
  'D1-a': (t, v) => jumper(t, { blob: true, ...(v ? camJumpV(t) : camJumpH(t)), fov: v ? 29 : 30 }),
  'D1-a-debug': (t, v) => jumper(t, { blob: true, debugRay: true, ...(v ? camJumpV(t) : camJumpH(t)), fov: v ? 29 : 30 }),
  'D1-b': (t, v) => stairEdge(t, { blob: true, ...(v ? camStairV(t) : camStairH(t)), fov: v ? 30 : 26 }),
  'D1-b-debug': (t, v) => stairEdge(t, { blob: true, debugRay: true, ...(v ? camStairV(t) : camStairH(t)), fov: v ? 30 : 26 }),
  'D7-a': (t, v) => ({ ...base, pt: true, char: [0, 0, 3], ...(v ? camJumpV(0) : camJumpH(0)), fov: v ? 29 : 30 }),
};
