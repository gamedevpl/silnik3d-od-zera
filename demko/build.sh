#!/bin/sh
set -eu
cd "$(dirname "$0")"
"${WASI_SDK_PATH:?Set WASI_SDK_PATH to your WASI SDK 34 directory}/bin/clang++" \
  -std=c++17 -O3 -DNDEBUG -fno-exceptions -fno-rtti -mexec-model=reactor \
  -Wl,--export=fly -Wl,--strip-all demo.cpp -o ../docs/demko/flight.wasm
