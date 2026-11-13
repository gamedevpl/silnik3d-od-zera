"""Compile the episode exercise in a temporary directory; a GL window is unnecessary."""
import os
from pathlib import Path
import subprocess
import sys
import tempfile
project=Path(__file__).resolve().parent
with tempfile.TemporaryDirectory() as tmp:
    exe=Path(tmp)/("exercise.exe" if os.name=="nt" else "exercise")
    cxx=os.environ.get("CXX","c++")
    subprocess.run([cxx,"-std=c++17",f'-DENGINE_ASSET_DIR="{(project/"assets").as_posix()}"',
                    str(project/"exercise.cpp"),"-o",str(exe)], check=True)
    result=subprocess.run([exe]).returncode
    print({0:"PASS",1:"RETRY"}.get(result,"ERROR"))
    sys.exit(result)
