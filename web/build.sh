#!/usr/bin/env bash
# Builds the engine at each episode tag for the browser: web/build.sh [out-dir] [tags...]
# Needs emcc (Emscripten) on PATH. Tags are not modified; web/shim adapts them.
set -euo pipefail
root=$(cd "$(dirname "$0")/.." && pwd)
out=${1:-$root/docs/play}; shift || true
mkdir -p "$out"; out=$(cd "$out" && pwd)
tags=${*:-$(git -C "$root" tag -l 'ep[0-9][0-9]' | sort)}
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
for tag in $tags; do
  src=$tmp/$tag; mkdir -p "$src" "$out/$tag"
  git -C "$root" archive "$tag" -- . ':!vendor' ':!docs' | tar -x -C "$src"
  assets=(); [ -d "$src/assets" ] && assets=(--embed-file "$src/assets@/assets")
  libs=(); [ -f "$src/audio.hpp" ] && libs=(-lopenal)
  entry=main.cpp
  if [ -f "$src/scene_view.cpp" ]; then entry=scene_view.cpp; fi
  fsapi=()
  if [ -f "$src/package.hpp" ]; then fsapi=(-sEXPORTED_RUNTIME_METHODS=FS); fi
  (cd "$src" && em++ "$entry" -std=c++17 -O2 -fexceptions -I "$root/web/shim" \
    -DENGINE_ASSET_DIR='"/assets"' \
    -sUSE_GLFW=3 -sMIN_WEBGL_VERSION=2 -sMAX_WEBGL_VERSION=2 -sASYNCIFY \
    -sALLOW_MEMORY_GROWTH -sMODULARIZE -sEXPORT_NAME=Engine -sENVIRONMENT=web \
    "${fsapi[@]}" "${assets[@]}" "${libs[@]}" -o "$out/$tag/engine.js")
  echo "$tag: $(du -ck "$out/$tag"/engine.* | tail -1 | cut -f1) KB"
done
