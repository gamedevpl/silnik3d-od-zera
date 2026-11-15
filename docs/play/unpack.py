"""Unpack a browser exhibition into a new folder for the native scene-view."""
import json
from pathlib import Path
import sys

source, target = map(Path, sys.argv[1:3])
if source.stat().st_size > 2_000_000:
    sys.exit("Gallery exceeds 2 MB")
data = json.loads(source.read_text(encoding="utf8"))
import re
material = data["floor.mat"].split()
if len(material) != 2 or material[0] != "map" or not re.fullmatch(r"[a-zA-Z0-9_-][a-zA-Z0-9_.-]{0,100}", material[1]):
    sys.exit("Invalid material")
expected = {"exhibit.scene", "floor.mat", "models.boxes", "camera.txt", material[1]}
if len(expected) != 5 or set(data) != expected or not all(isinstance(v,str) for v in data.values()):
    sys.exit("Invalid gallery files")
target.mkdir()
for name in sorted(expected):
    (target / name).write_bytes(data[name].encode("utf8"))
