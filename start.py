import os
import subprocess
import sys
import platform
import threading

def run_command(command, cwd=None, env=None):
    """Run a command and stream its output."""
    process = subprocess.Popen(
        command,
        cwd=cwd,
        env=env,
        stdout=sys.stdout,
        stderr=sys.stderr,
        shell=True if platform.system() == "Windows" else False
    )
    return process

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, 'backend')
    frontend_dir = os.path.join(root_dir, 'frontend')

    # 1. Setup Backend
    print("--- Setting up Backend ---")
    venv_dir = os.path.join(backend_dir, 'venv')
    
    # Python executable to use
    python_cmd = sys.executable

    # Check if venv exists
    if not os.path.exists(venv_dir):
        print("Creating virtual environment...")
        subprocess.run([python_cmd, '-m', 'venv', 'venv'], cwd=backend_dir, check=True)
    
    # Determine the path to the venv python executable
    if platform.system() == "Windows":
        venv_python = os.path.join(venv_dir, 'Scripts', 'python.exe')
        venv_pip = os.path.join(venv_dir, 'Scripts', 'pip.exe')
    else:
        venv_python = os.path.join(venv_dir, 'bin', 'python')
        venv_pip = os.path.join(venv_dir, 'bin', 'pip')
    
    # Install requirements
    print("Installing backend dependencies...")
    subprocess.run([venv_pip, 'install', '-r', 'requirements.txt'], cwd=backend_dir, check=True)

    # 2. Setup Frontend
    print("\n--- Setting up Frontend ---")
    npm_cmd = 'npm.cmd' if platform.system() == "Windows" else 'npm'
    
    # Install frontend dependencies
    print("Installing frontend dependencies...")
    subprocess.run([npm_cmd, 'install'], cwd=frontend_dir, check=True)

    # 3. Start both servers
    print("\n--- Starting Servers ---")
    processes = []
    
    try:
        # Start backend
        print("Starting backend server...")
        backend_cmd = [venv_python, 'run.py']
        # On Windows, using shell=True can be messy for Ctrl+C, so we pass as list
        if platform.system() == "Windows":
            backend_process = subprocess.Popen(backend_cmd, cwd=backend_dir)
        else:
            backend_process = subprocess.Popen(backend_cmd, cwd=backend_dir)
        
        processes.append(backend_process)

        # Start frontend
        print("Starting frontend server...")
        frontend_cmd = [npm_cmd, 'run', 'dev']
        if platform.system() == "Windows":
             frontend_process = subprocess.Popen(frontend_cmd, cwd=frontend_dir)
        else:
             frontend_process = subprocess.Popen(frontend_cmd, cwd=frontend_dir)
             
        processes.append(frontend_process)

        # Wait for processes
        for p in processes:
            p.wait()

    except KeyboardInterrupt:
        print("\nShutting down servers...")
        for p in processes:
            p.terminate()
        for p in processes:
            p.wait()
        print("Servers shut down gracefully.")
        sys.exit(0)

if __name__ == "__main__":
    main()
