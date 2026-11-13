"""Build the episode exercise and sample its framebuffer."""
import os
from pathlib import Path
import subprocess
import sys
import tempfile

root = Path(__file__).resolve().parent
with tempfile.TemporaryDirectory() as tmp:
    subprocess.run(["cmake", "-S", str(root), "-B", tmp,
                    "-DCMAKE_POLICY_VERSION_MINIMUM=3.5"], check=True)
    subprocess.run(["cmake", "--build", tmp, "--config", "Release",
                    "--target", "exercise", "--parallel", "4"], check=True)
    name = "exercise.exe" if os.name == "nt" else "exercise"
    exe = next(Path(tmp).rglob(name))
    rc = subprocess.run([exe]).returncode
    print({0: "PASS", 1: "RETRY"}.get(rc, "OpenGL context or runtime error"))
    sys.exit(rc)
