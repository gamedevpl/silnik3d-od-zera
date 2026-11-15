#!/bin/sh
set -eu
here=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
app="${1:-$here/../../build/macos}/Neon Canal.app"
contents="$app/Contents"
mkdir -p "$contents/MacOS" "$contents/Resources"
xcrun clang++ -std=c++20 -O2 -fobjc-arc -mmacosx-version-min=13.0 \
    "$here/main.mm" "$here/../demo.cpp" \
    -framework Cocoa -framework Metal -framework MetalKit -framework AVFoundation -framework QuartzCore \
    -o "$contents/MacOS/NeonCanal"
cp "$here/Canal.metal" "$here/../../docs/demko/vibe-score.mp3" "$contents/Resources/"
cp "$here/Info.plist" "$contents/Info.plist"
codesign --force --sign - --timestamp=none "$app"
printf '%s\n' "$app"
