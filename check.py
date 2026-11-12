from pathlib import Path
import os
import subprocess
import sys
import tempfile

project = Path(__file__).resolve().parent
with tempfile.TemporaryDirectory() as tmp:
    exe = Path(tmp) / ("exercise.exe" if os.name == "nt" else "exercise")
    subprocess.run([os.environ.get("CXX", "c++"), "-std=c++17", "-I", str(project),
                    str(project / "exercise.cpp"), "-o", str(exe)], check=True)
    result = subprocess.run([str(exe)])
    print("PASS" if result.returncode == 0 else "RETRY")
    sys.exit(result.returncode)
