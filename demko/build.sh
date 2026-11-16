#!/bin/sh
set -eu
cd "$(dirname "$0")"
sdk="${WASI_SDK_PATH:?Set WASI_SDK_PATH to your WASI SDK 34 directory}"
scratch=$(mktemp -d)
trap 'rm -rf "$scratch"' EXIT
"$sdk/bin/clang++" -std=c++20 -O3 -DNDEBUG -fno-exceptions -fno-rtti -mexec-model=reactor \
  -Wl,--strip-all -Wl,--export=raceReset -Wl,--export=raceAdvance -Wl,--export=raceShoot \
  -Wl,--export=raceState -Wl,--export=lapLength -Wl,--export=roadX -Wl,--export=roadSlopeAt \
  -Wl,--export=raceVisible -Wl,--export=raceObjects -Wl,--export=raceCueCount \
  -Wl,--export=raceCue -Wl,--export=raceClearCues -Wl,--export=buildTrack \
  -Wl,--export=trackSections -Wl,--export=trackVertices -Wl,--export=releaseTrack \
  -Wl,--export=raceActors -Wl,--export=vertices -Wl,--export=canvasFrame -Wl,--export=canvasData \
  web_race.cpp demo.cpp -o "$scratch/flight.wasm"
cp "$scratch/flight.wasm" ../docs/demko/
