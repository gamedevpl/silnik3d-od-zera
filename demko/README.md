# Neon Canal

[Play Neon Grand Prix in your browser](https://gamedevpl.github.io/silnik3d-od-zera/demko/).

Seven ships race around a 2,304-unit circuit for as many laps as you like. Your position depends on total distance traveled. The game saves your fastest full lap on this device.

Each heat is a core relay. The gold diamond marks the carrier. Hit that ship or overtake within 4.8 metres alongside on the same deck to steal its cargo. Carry it through the gold gate for one point. Bypass the gate and the next one is worth another point, up to three. Miss the gate with three points aboard and the cargo is lost. Whoever steals the core inherits its value. After delivery the nearest other flying ship gets a fresh core. The first pilot to bank five points wins the heat. The next heat starts on the same circuit, with lap times and race positions intact.

Rivals line up for violet pads, spend energy on overdrive and choose whether to bank or carry. The HUD shows the courier and the leading rival score alongside yours.

At the amber and teal arrows, pick a side before the island. Take the raised suspension bridge on the left for a tailwind, or stay low in the right-hand canal to recharge boost. Both routes rejoin at the foot of the harbor viaduct. The first sweeping bend climbs above the warehouses. The skyline opens up at the crest before the track curves back down to the waterfront. Climbing costs speed and descending gives it back.

At the city crest, the upper circuit breaks over a diagonal, teal-lit lower track. Set up wide, turn toward the mint landing lights before takeoff and let the ship carry that line across the gap. Q and E tighten left and right turns respectively. A short tap helps recover a late entry. Holding the brake costs exit speed.

The waterfront opens onto basalt sea stacks, striped lighthouses and rock arches. Two elevated launch rails carry the pack over ferries. Look for the paired mint lights on the receiving deck. Cross between them for 12 energy and an exit boost. Steering has less authority in the air, so choose a line before the lip.

The first gold gate sits inside the lower canal. Carriers can take the high bridge to raise the stake. Rivals set up before the fork and choose different entries when chasing the carrier around the harbor bend. Tap airbrake while steering to pivot, then release to carry speed. Hold it for sustained braking.

Both player and rival ships have limited sideways thrust. A tighter radius and higher speed demand more of it. The hull can point into a turn while momentum carries it wide. A smooth outside entry gives you room to cut toward the apex and unwind the steering on exit. Holding full lock under load scrubs speed. Boost as you straighten up to carry speed onto the next straight.

A full boost cell lasts about 12 seconds on its own. Release the boost to recharge. The ship carries speed into the next bend until you apply the airbrake.

Violet chevrons offer a choice. Coast across one to take the regular pad payout (24 energy, one shield point, and a rocket every second payout). Hold Boost with at least 35 energy at the crossing to spend 35 instead: overdrive runs for 2.35 seconds, even if you release Boost. Taking damage cuts overdrive short. The pack has a limited catch-up allowance. A clean overdrive exit can buy a lasting lead.

A rival behind you can fire its cannon. One ahead can drop a slower plasma pulse into your path. The two-note warning marks your current lane. Change lanes before the red shot crosses it. A shot can also strike another hull or a barrier.

Tuck into the teal wake behind a rival and ease off the boost for about a second. When the wake is charged, steer to either side while boosting to launch a slingshot. Holding boost on the same line gives you normal thrust and keeps the charge in reserve. Green boost pads give you a burst of speed and restore one shield point. The mint sight shows where the nose is pointing. Lead crossing ships with the cannon. Its bolts fly straight and burst against city façades. Rockets follow the launch lane around bends and over the bridge. Amber barriers sweep across the track. Watch the red light on their leading end and pass behind them or shoot them out. A broken ring around a ship marks a direct hit. Scraping the rail costs speed. Hull contact transfers momentum along the contact normal. A sideswipe rolls both ships and rubs off lateral speed. A rear impact pushes the leading ship forward. Rivals also collide with each other. A hard impact costs shield, and holding a wing against a rail scrubs speed and throws sparks. A damaged engine releases smoke at two shield points and burns at one. The gas carries the velocity of the nozzle at release, slows in the air and rises. The cannon throws a short fan of sparks on contact. A rocket produces an expanding pressure ring and a fireball that cools into smoke. Losing the last point breaks the hull apart before an automatic restart. Rivals can also be disabled and rejoin the race.

| Control | Action |
| --- | --- |
| ← → or A / D | Steer |
| ↑ or W | Boost |
| Q / E | Left / right airbrake |
| ↓ or S | Apply the airbrake for a tighter turn |
| Space / R | Fire the cannon / launch a rocket |
| P or Esc | Pause or resume |

Press **Space**, click the race view or tap it to start or resume. During the race, drag sideways to steer. On a trackpad, a horizontal two-finger swipe also steers. On a touchscreen, steer with one thumb and hold **Boost** with the other. The game opens in English. Select **PL** in the browser to switch to Polish.

Starting the race plays the original 150 BPM soundtrack from *I have a vibe, for a new game*. After the first 48 seconds, the section from 0:16 to 0:48 loops. Boost accelerates the original stereo ion-drive loop to 2.1× speed. Its recorded pulses tighten as the motor winds up and spread out again on release. The cannon, rocket, rail scrape and hull breakup have distinct sounds synthesized in C++.

## Source code

- [Ship hulls, turbine nacelles, cockpits and team paint](racer.hpp)
- [Ion-drive recordings](../docs/demko/ion-drive.flac) and [synthesized race effects](sound_bank.hpp)
- [Lane markings, exhausts and track geometry](demo.cpp)
- [Color and emission map for harbor windows, surface maps for the bridge, cladding and hull, and soft smoke and flame textures](materials.hpp)
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

To rebuild `docs/demko/flight.wasm`, point `WASI_SDK_PATH` at WASI SDK 34 and run `./demko/build.sh`. Run `node --test demko/tests/endless.mjs` to compare seven laps against a native C++ replay and check the slingshot controls.

## Native macOS version

Building requires macOS 13 or later, a Metal-capable GPU and Apple’s Command Line Tools. Run these commands from the repository root.

```sh
./demko/macos/build.sh
open 'build/macos/Neon Canal.app'
```

Press **Return** to start. The keyboard controls above also work on Mac, and **M** toggles sound. To switch languages, open the application menu and choose **Polski** or **English**.

The app runs offline, includes the soundtrack and saves your best lap locally. It shares the browser version’s C++ simulation and ship models, with Metal for graphics and AVFoundation for audio.
