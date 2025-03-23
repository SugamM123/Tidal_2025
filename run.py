import subprocess
import sys
import os
from threading import Thread
from datetime import datetime

# ANSI colors
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def prefix_output(prefix, color, stream):
    for line in stream:
        timestamp = datetime.now().strftime('%H:%M:%S')
        try:
            decoded_line = line.decode().rstrip()
            print(f"{color}[{timestamp} {prefix}] {decoded_line}{RESET}")
        except UnicodeDecodeError:
            print(f"{color}[{timestamp} {prefix}] <decode error>{RESET}")

def run_vite():
    process = subprocess.Popen(
        "npm run dev",
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd="frontend"
    )
    
    Thread(target=prefix_output, args=("VITE", YELLOW, process.stdout), daemon=True).start()
    Thread(target=prefix_output, args=("VITE", YELLOW, process.stderr), daemon=True).start()
    return process

def run_flask():
    process = subprocess.Popen(
        "python app.py",
        shell=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd="backend"
    )
    
    Thread(target=prefix_output, args=("FLASK", BLUE, process.stdout), daemon=True).start()
    Thread(target=prefix_output, args=("FLASK", BLUE, process.stderr), daemon=True).start()
    return process

def main():
    try:
        vite_process = run_vite()
        flask_process = run_flask()
        
        # Wait for either process to finish
        vite_process.wait()
        flask_process.wait()
        
    except KeyboardInterrupt:
        print("\nShutting down servers...")
        sys.exit(0)

if __name__ == "__main__":
    main()