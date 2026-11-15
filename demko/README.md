# Neon Canal

[Play Neon Grand Prix in your browser](https://gamedevpl.github.io/silnik3d-od-zera/demko/).

Seven ships race around a 1,152-unit circuit for as many laps as you like. Your position depends on total distance traveled. The game saves your fastest full lap on this device.

Tuck in behind a rival to gain speed and recharge your boost, then pull out to pass on either side. Green boost pads give you a burst of speed and restore one shield point. Use the cannon or rockets to slow rivals and clear orange mines. Scraping the rail costs speed. If you lose your last shield point, your ship slows for repairs and rejoins the race.

| Control | Action |
| --- | --- |
| ← → or A / D | Steer |
| ↑ or W | Boost |
| ↓ or S | Apply the airbrake for a tighter turn |
| Space / R | Fire the cannon / launch a rocket |
| P or Esc | Pause or resume |

Press **Space**, click the race view or tap it to start or resume. During the race, drag sideways to steer. On a trackpad, a horizontal two-finger swipe also steers. On a touchscreen, steer with one thumb and hold **Boost** with the other. The game opens in English. Select **PL** in the browser to switch to Polish.

Starting the race plays the original 150 BPM soundtrack from *I have a vibe, for a new game*. After the first 48 seconds, the section from 0:16 to 0:48 loops. Engine and weapon sounds respond to your inputs independently of the music.

## Source code

- [Ship models, lane markings and track geometry in C++](demo.cpp)
- [Race physics, rival pilots and collisions in C++](race.hpp)
- [WebGL renderer and Canvas 2D fallback](../docs/demko/renderer.js)
- [Browser controls and HUD](../docs/demko/app.js)
- [Music playback and synthesized sound effects](../docs/demko/audio.js)

## Run or build the browser version

To play locally, serve the prebuilt files from the repository root and open [the local game](http://localhost:8000/demko/).

```sh
python3 -m http.server --directory docs 8000
```

To rebuild, point `WASI_SDK_PATH` at WASI SDK 34. Put Binaryen 133’s `wasm2js` on your `PATH` or set `WASM2JS` to its executable. Then run `./demko/build.sh`. The script compiles the simulation and geometry into `docs/demko/flight.wasm`. It also generates a JavaScript version of the same C++ simulation for browsers with WebAssembly disabled.

Run `node --test demko/tests/endless.mjs` to check both browser builds against five laps recorded before the simulation moved to C++.

## Native macOS version

Building requires macOS 13 or later, a Metal-capable GPU and Apple’s Command Line Tools. Run these commands from the repository root.

```sh
./demko/macos/build.sh
open 'build/macos/Neon Canal.app'
```

Press **Return** to start. The keyboard controls above also work on Mac, and **M** toggles sound. To switch languages, open the application menu and choose **Polski** or **English**.

The app runs offline, includes the soundtrack and saves your best lap locally. It shares the browser version’s C++ simulation and ship models, with Metal for graphics and AVFoundation for audio.
