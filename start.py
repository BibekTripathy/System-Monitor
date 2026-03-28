import os
import subprocess
import sys
import platform
import signal
import atexit
import threading

# Global list of managed processes for cleanup
_processes = []
_shutting_down = False
_shutdown_lock = threading.Lock()


def kill_process_tree(proc):
    """Kill a process and ALL of its children (the entire process tree).

    On Linux/macOS we use process groups (os.killpg) so that every child
    spawned by the process is also killed.
    On Windows we use 'taskkill /T /F /PID' which does the same thing.
    """
    if proc.poll() is not None:
        return  # already dead

    try:
        if platform.system() == "Windows":
            # /T = kill child processes, /F = force
            subprocess.run(
                ['taskkill', '/T', '/F', '/PID', str(proc.pid)],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
        else:
            # Kill the entire process group
            os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
    except (OSError, ProcessLookupError):
        pass  # process already gone

    # Give it a moment then force-kill if still alive
    try:
        proc.wait(timeout=5)
    except subprocess.TimeoutExpired:
        try:
            if platform.system() == "Windows":
                subprocess.run(
                    ['taskkill', '/T', '/F', '/PID', str(proc.pid)],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                )
            else:
                os.killpg(os.getpgid(proc.pid), signal.SIGKILL)
        except (OSError, ProcessLookupError):
            pass


def shutdown_all():
    """Terminate every managed process tree. Safe to call multiple times."""
    global _shutting_down
    with _shutdown_lock:
        if _shutting_down:
            return
        _shutting_down = True

    print("\nShutting down servers...")
    for p in _processes:
        kill_process_tree(p)
    print("All servers shut down.")


# ── Register cleanup so it runs on ANY exit ──────────────────────
atexit.register(shutdown_all)


def _signal_handler(signum, frame):
    """Handle SIGINT/SIGTERM by cleaning up and exiting."""
    shutdown_all()
    sys.exit(0)


signal.signal(signal.SIGINT, _signal_handler)
signal.signal(signal.SIGTERM, _signal_handler)


def start_process(command, cwd=None, env=None):
    """Start a subprocess in its own process group so we can kill the tree."""
    kwargs = dict(
        cwd=cwd,
        env=env,
        stdout=sys.stdout,
        stderr=sys.stderr,
    )

    if platform.system() == "Windows":
        # CREATE_NEW_PROCESS_GROUP lets us kill the group later
        kwargs['creationflags'] = subprocess.CREATE_NEW_PROCESS_GROUP
        kwargs['shell'] = True
    else:
        # Put the child in its own process group
        kwargs['preexec_fn'] = os.setsid

    process = subprocess.Popen(command, **kwargs)
    _processes.append(process)
    return process


def watch_process(proc, name, stop_event):
    """Watch a process and signal shutdown when it exits."""
    proc.wait()
    if not _shutting_down:
        print(f"\n'{name}' exited (code {proc.returncode}). Shutting down...")
        stop_event.set()


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
    stop_event = threading.Event()

    # Start backend (--no-reload avoids Flask spawning a reloader child)
    print("Starting backend server...")
    backend_env = os.environ.copy()
    backend_env['PYTHONUNBUFFERED'] = '1'
    backend_cmd = [venv_python, 'run.py', '--no-reload']
    backend_process = start_process(backend_cmd, cwd=backend_dir, env=backend_env)

    # Start frontend
    print("Starting frontend server...")
    frontend_cmd = [npm_cmd, 'run', 'dev']
    frontend_process = start_process(frontend_cmd, cwd=frontend_dir)

    # Watch both processes in background threads — if either exits, shut down
    threading.Thread(
        target=watch_process, args=(backend_process, "Backend", stop_event), daemon=True
    ).start()
    threading.Thread(
        target=watch_process, args=(frontend_process, "Frontend", stop_event), daemon=True
    ).start()

    # Block until one of the watchers signals or a signal arrives
    try:
        stop_event.wait()
    except KeyboardInterrupt:
        pass

    shutdown_all()
    sys.exit(0)


if __name__ == "__main__":
    main()
