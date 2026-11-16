# Neon Canal

[Play Neon Grand Prix in your browser](https://gamedevpl.github.io/silnik3d-od-zera/demko/).

Seven ships race around a 1,152-unit circuit for as many laps as you like. Your position depends on total distance traveled. The game saves your fastest full lap on this device.

At the amber and teal arrows, pick a side before the island. Take the raised suspension bridge on the left for a tailwind, or stay low in the right-hand canal to recharge boost. Both routes rejoin before the shipyard chicane. The airbrake helps hold the inside line through its two reversals.

Tuck into the teal wake behind a rival and ease off the boost for about a second. When the wake is charged, steer to either side while boosting to launch a slingshot. Holding boost on the same line gives you normal thrust and keeps the charge in reserve. Green boost pads give you a burst of speed and restore one shield point. Gold brackets mark a rival your rocket can track. You can also fire straight down an empty lane to clear a mine. A broken ring around a ship marks a direct hit. Scraping the rail costs speed. A glancing contact pushes both ships apart. A hard impact costs shield, and holding a wing against a rail scrubs speed and throws sparks. A damaged ship smokes at two shield points and trails flame at one. Losing the last point breaks the hull apart before an automatic restart. Rivals can also be disabled and rejoin the race.

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
- [Tileable normal and roughness maps for steel and facade glass](materials.hpp)
- [Contact sparks, damaged engines and hull fragments](damage_fx.hpp)
- [Race physics, rival pilots and collisions in C++](race.hpp)
- [Curved track meshes shared by Metal and WebGL](track_mesh.hpp)
- [Projected scenery, ships and reflections for Canvas 2D](canvas_scene.hpp)
- [WebGL and Canvas browser bindings](../docs/demko/renderer.js)
- [Browser controls and HUD](../docs/demko/app.js)
- [Music playback and synthesized sound effects](../docs/demko/audio.js)

## Run or build the browser version

To play locally, serve the prebuilt files from the repository root and open [the local game](http://localhost:8000/demko/).

```sh
python3 -m http.server --directory docs 8000
```

The browser requires WebAssembly. WebGL draws the full scene on the GPU. When WebGL is unavailable, the same WebAssembly module projects the scene for Canvas 2D.

To rebuild `docs/demko/flight.wasm`, point `WASI_SDK_PATH` at WASI SDK 34 and run `./demko/build.sh`. Run `node --test demko/tests/endless.mjs` to compare five laps against a native C++ replay and check the slingshot controls.

## Native macOS version

Building requires macOS 13 or later, a Metal-capable GPU and Apple’s Command Line Tools. Run these commands from the repository root.

```sh
./demko/macos/build.sh
open 'build/macos/Neon Canal.app'
```

Press **Return** to start. The keyboard controls above also work on Mac, and **M** toggles sound. To switch languages, open the application menu and choose **Polski** or **English**.

The app runs offline, includes the soundtrack and saves your best lap locally. It shares the browser version’s C++ simulation and ship models, with Metal for graphics and AVFoundation for audio.
