import os
import subprocess

result = subprocess.Popen(["./nginx-1.22.1", "start .\nginx.exe"])
result.poll()