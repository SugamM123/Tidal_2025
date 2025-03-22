import asyncio
import sys
from asyncio.subprocess import Process
import os
import subprocess

# ANSI color codes
BLUE = '\033[94m'
GREEN = '\033[92m'
YELLOW = '\033[93m'
RESET = '\033[0m'

def setup_environment():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dir = os.path.join(base_dir, 'frontend')
    backend_dir = os.path.join(base_dir, 'backend')

    print(f"{YELLOW}Setting up environments...{RESET}")
    
    # Install frontend dependencies
    print(f"{GREEN}Installing frontend dependencies...{RESET}")
    subprocess.run(['npm', 'install'], cwd=frontend_dir, check=True)
    
    # Install backend dependencies
    print(f"{BLUE}Installing backend dependencies...{RESET}")
    subprocess.run(['pip', 'install', '-r', 'requirements.txt'], cwd=backend_dir, check=True)
    subprocess.run(['pip', 'install', 'flask'], cwd=backend_dir, check=True)

async def stream_output(prefix: str, stream: asyncio.StreamReader, color: str):
    while True:
        line = await stream.readline()
        if not line:
            break
        text = line.decode('utf-8').strip()
        if text:
            print(f"{color}{prefix}: {text}{RESET}")

async def run_process(cmd: list[str], prefix: str, color: str, cwd: str = None, env: dict = None) -> Process:
    process_env = os.environ.copy()
    if env:
        process_env.update(env)

    process = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
        cwd=cwd,
        env=process_env
    )
    
    # Stream both stdout and stderr
    await asyncio.gather(
        stream_output(f"{prefix} [OUT]", process.stdout, color),
        stream_output(f"{prefix} [ERR]", process.stderr, color)
    )
    
    return process

async def main():
    # First setup the environment
    try:
        setup_environment()
    except subprocess.CalledProcessError as e:
        print(f"Failed to setup environment: {e}")
        return

    # Get the directory containing this script
    base_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dir = os.path.join(base_dir, 'frontend')
    backend_dir = os.path.join(base_dir, 'backend')

    # Set up environment variables for Flask
    flask_env = {
        'FLASK_APP': 'app.py',
        'FLASK_ENV': 'development'
    }

    # Start both servers
    processes = await asyncio.gather(
        run_process(
            ['python', '-m', 'flask', 'run'],
            'Backend',
            BLUE,
            cwd=backend_dir,
            env=flask_env
        ),
        run_process(
            ['npm', 'run', 'dev'],
            'Frontend',
            GREEN,
            cwd=frontend_dir
        )
    )
    
    # Wait for both processes to complete
    try:
        await asyncio.gather(*(
            asyncio.create_task(process.wait())
            for process in processes
        ))
    except KeyboardInterrupt:
        print("\nShutting down servers...")
        for process in processes:
            process.terminate()
        await asyncio.gather(*(
            asyncio.create_task(process.wait())
            for process in processes
        ))

if __name__ == "__main__":
    try:
        if sys.platform == 'win32':
            # Enable ANSI colors on Windows
            import ctypes
            kernel32 = ctypes.windll.kernel32
            kernel32.SetConsoleMode(kernel32.GetStdHandle(-11), 7)
    except:
        pass

    print(f"{YELLOW}Starting development servers...{RESET}")
    asyncio.run(main())