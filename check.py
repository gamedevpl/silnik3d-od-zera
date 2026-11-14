"""Build and run the episode exercise using a local C++17 compiler."""
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

project = Path(__file__).resolve().parent
compiler = os.environ.get("CXX") or shutil.which("c++") or shutil.which("cl")
if not compiler:
    sys.exit("A C++17 compiler is required (c++, clang++, g++ or cl).")

with tempfile.TemporaryDirectory() as temp:
    output = Path(temp) / ("exercise.exe" if os.name == "nt" else "exercise")
    source = str(project / "exercise.cpp")
    if Path(compiler).stem.lower() in {"cl", "clang-cl"}:
        args = ["/nologo", "/std:c++17", "/EHsc", source, f"/Fe:{output}"]
    else:
        args = ["-std=c++17", source, "-o", str(output)]
    subprocess.run([compiler, *args], cwd=temp, check=True)
    status = subprocess.run([output], cwd=temp).returncode
    print({0: "PASS", 1: "RETRY"}.get(status, "ERROR"))
    sys.exit(status)
