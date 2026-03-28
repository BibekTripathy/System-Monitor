import sys
import atexit
import warnings

# Suppress the harmless "leaked semaphore" warning from Python 3.14+'s
# multiprocessing resource tracker. Flask's debug server allocates a
# semaphore internally; when we SIGTERM the process, it doesn't get a
# chance to clean it up. The OS reclaims it immediately — this is cosmetic.
warnings.filterwarnings(
    "ignore",
    message="resource_tracker:.*leaked semaphore",
    category=UserWarning,
)

from src.app import create_app

app = create_app()

# Clean up Docker client connection pool on exit
from src.services.docker_service import docker_service
atexit.register(docker_service.close)

if __name__ == "__main__":
    # --no-reload is passed by start.py to prevent Flask from spawning
    # a reloader child process that survives parent termination.
    use_reloader = "--no-reload" not in sys.argv
    app.run(debug=True, use_reloader=use_reloader)