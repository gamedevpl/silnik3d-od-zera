#!/bin/sh
set -eu
cd "$(dirname "$0")"
out=../docs/demko
sdk="${WASI_SDK_PATH:?Set WASI_SDK_PATH to your WASI SDK 34 directory}"
wasm2js="${WASM2JS:-wasm2js}"
scratch=$(mktemp -d)
trap 'rm -rf "$scratch"' EXIT
build() {
  "$sdk/bin/clang++" -std=c++20 -DNDEBUG -fno-exceptions -fno-rtti -mexec-model=reactor \
  -Wl,--strip-all -Wl,--export=raceReset -Wl,--export=raceAdvance -Wl,--export=raceShoot \
  -Wl,--export=raceState -Wl,--export=lapLength -Wl,--export=roadX -Wl,--export=roadSlopeAt \
  -Wl,--export=raceVisible -Wl,--export=raceObjects -Wl,--export=raceCueCount \
  -Wl,--export=raceCue -Wl,--export=raceClearCues "$@" web_race.cpp
}
build -O3 demo.cpp -Wl,--export=sectionStart -Wl,--export=sceneBlock -Wl,--export=actors \
  -Wl,--export=vertices -Wl,--export=objectBuffer -o "$scratch/flight.wasm"
# Canvas handles drawing when WebAssembly is unavailable, so translate just the simulation.
build -Oz -o "$scratch/race.wasm"
"$wasm2js" "$scratch/race.wasm" --all-features -O -o "$scratch/compat.js"
# Resolve the standalone generator's WASI import in browsers without an import map.
sed -e 's/[[:space:]]*$//' -e "s/from 'wasi_snapshot_preview1'/from '.\/wasi.js'/" "$scratch/compat.js" > "$scratch/race-compat.generated.js"
cp "$scratch/flight.wasm" "$scratch/race-compat.generated.js" "$out/"
