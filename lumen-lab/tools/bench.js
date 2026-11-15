// node tools/bench.js out.json [--w 1920 --h 1080 --frames 60]
// GPU frame-time bench for the EN film: renders each shot on a fixed frame and times it with a 1-pixel readback
// (forces the GPU to finish). Run with LL_GPU=1 on a real GPU; SwiftShader numbers are meaningless.
const { chromium } = require('playwright'); const http = require('http'); const fs = require('fs'); const path = require('path');
const root = path.join(__dirname, '..');
const types = { '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css' };
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0]));
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const MODES = [['palette', 'D0-b-levels'], ['blob shadow', 'D1-a'], ['vertex (Gouraud)', 'D2-a'], ['per-pixel', 'D2-a-pp'], ['lightmap', 'D3-b-final'],
  ['stencil volumes, 1 light', 'D5-clean'], ['stencil volumes, 8 lights', 'D5-d-8'], ['shadow map', 'D4-clean'], ['forward, 50 lights', 'D6-a'], ['deferred, 50 lights', 'D6-a-def'],
  ['path tracing, 1 spp', 'D7-a'], ['ReSTIR, 1000 lights', 'D7-c-on'], ['1000 lights, no ReSTIR', 'D7-b']];
const SWEEP = [1, 2, 4, 8, 16, 32, 64];
(async () => {
  await new Promise((r) => srv.listen(0, r));
  const W = +arg('w', 1920), H = +arg('h', 1080), N = +arg('frames', 60);
  const b = await chromium.launch(process.env.LL_GPU ? { channel: process.env.LL_CHANNEL || undefined, args: ['--use-angle=' + (process.env.LL_ANGLE || 'metal'), '--enable-gpu', '--ignore-gpu-blocklist'] } : {});
  const p = await b.newPage({ viewport: { width: W, height: H } }); p.on('pageerror', (e) => console.log('[err]', e.message));
  await p.goto(`http://localhost:${srv.address().port}/index.html?bench=1`); await p.waitForFunction('window.LLready');
  const gpu = await p.evaluate(() => { const g = document.createElement('canvas').getContext('webgl2'); const e = g.getExtension('WEBGL_debug_renderer_info'); return e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : g.getParameter(g.RENDERER); });
  console.log('renderer:', gpu);
  const time = (id, spp = 1) => p.evaluate(async ([id, W, H, N, spp]) => {
    LL.resize(W, H); const c = document.getElementById('c'), gl = c.getContext('webgl2'), px = new Uint8Array(4);
    const one = () => { LL.render(id, 1.0, { spp }); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); };
    LL.resetPT(); for (let i = 0; i < 10; i++) one();
    const ts = []; for (let i = 0; i < N; i++) { const t0 = performance.now(); one(); ts.push(performance.now() - t0); }
    ts.sort((a, b) => a - b); return { median: +ts[N >> 1].toFixed(2), p10: +ts[Math.floor(N * 0.1)].toFixed(2), p90: +ts[Math.floor(N * 0.9)].toFixed(2), stats: LL.stats };
  }, [id, W, H, N, spp]);
  const out = { gpu, width: W, height: H, frames: N, date: new Date().toISOString(), modes: [], sweep: [], spp: null };
  for (const [name, id] of MODES) { const r = await time(id); out.modes.push({ name, id, ...r }); console.log(name.padEnd(28), r.median, 'ms'); }
  for (const n of SWEEP) { const f = await time(`B-fwd-${n}`), d = await time(`B-def-${n}`); out.sweep.push({ lights: n, forward: f.median, deferred: d.median, fwdDraws: f.stats.drawCalls, defDraws: d.stats.drawCalls }); console.log('lights', n, 'fwd', f.median, 'def', d.median); }
  // Path-tracing convergence: samples per pixel until the frame is within 2% RMSE of a 4096-spp reference (smaller canvas: it is slow).
  // Many-light noise: relative RMSE of one frame against a 512-frame mean of uniform light sampling (unbiased), 480x270, 8-bit output.
  out.manyLights = await p.evaluate(() => {
    LL.resize(480, 270); const gl = document.getElementById('c').getContext('webgl2'), n = 480 * 270 * 4, buf = new Uint8Array(n);
    const grab = (id) => { LL.render(id, 1.0, { spp: 1 }); gl.readPixels(0, 0, 480, 270, gl.RGBA, gl.UNSIGNED_BYTE, buf); return buf; };
    const ref = new Float64Array(n); LL.resetPT(); for (let k = 0; k < 512; k++) { const b = grab('D7-b'); for (let i = 0; i < n; i++) ref[i] += b[i] / 512; }
    let mean = 0; for (let i = 0; i < n; i += 4) mean += (ref[i] + ref[i + 1] + ref[i + 2]) / 3; mean /= n / 4;
    const err = (img) => { let e = 0; for (let i = 0; i < n; i += 4) for (let c = 0; c < 3; c++) { const d = img[i + c] - ref[i + c]; e += d * d; } return Math.sqrt(e / (n / 4 * 3)) / mean; };
    const avg = (id, frames) => { const acc = new Float64Array(n); for (let k = 0; k < frames; k++) { const b = grab(id); for (let i = 0; i < n; i++) acc[i] += b[i] / frames; } return acc; };
    const uniform1 = err(avg('D7-b', 1)), uniform3 = err(avg('D7-b', 3));
    LL.resetPT(); for (let k = 0; k < 30; k++) grab('D7-c-on'); const restir = err(avg('D7-c-on', 1));
    LL.resetPT(); for (let k = 0; k < 30; k++) grab('D7-c-ris'); const ris = err(avg('D7-c-ris', 1));
    return { uniform1: +uniform1.toFixed(3), uniform3: +uniform3.toFixed(3), restirOnly1: +ris.toFixed(3), restir1: +restir.toFixed(3) };
  }); console.log('many lights rel. RMSE:', JSON.stringify(out.manyLights));
  if (!process.argv.includes('--nospp')) { out.spp = await p.evaluate(() => { LL.resize(480, 270); return LL.measureSpp('D7-a', 4096, 0.02); }); console.log('spp until clean:', out.spp.clean); }
  fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 1)); await b.close(); srv.close();
})();
