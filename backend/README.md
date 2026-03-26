# System Monitor (Backend)

## Overview

A simple Flask-based backend API for collecting and serving system metrics such as CPU, memory, and disk usage.

---

## File Structure

* `app.py` – Flask app factory
* `metrics_routes.py` – Defines API routes (e.g., `/api/metrics`)
* `metrics_controller.py` – Handles request/response logic
* `metrics_service.py` – Core logic for gathering metrics
* `system_utils.py` – Helper functions for system-level data

---

## Requirements

* Python 3.8+
* pip
* Docker (running)

---

## Setup

### 1. Docker Permissions (Linux)
To run the Docker APIs without root, add your user to the `docker` group:

```bash
sudo usermod -aG docker $USER
```
*Note: You may need to log out and back in for changes to take effect.*

### 2. Open terminal in backend directory

```bash
cd backend
```

### 2. Create a virtual environment

#### Windows:

```bash
python -m venv venv
venv\Scripts\Activate.ps1   # PowerShell
venv\Scripts\activate.bat   # Command Prompt
```

#### Linux/macOS:

```bash
python3 -m venv venv
source venv/bin/activate
```

---

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

---

## Run the Application

```bash
python run.py
```

By default, the server runs at:

```
http://127.0.0.1:5000
```

---

## API Endpoints

### 1. System Metrics
* **GET `/api/metrics/system`** - Fetch CPU, Memory, and Disk stats.

### 2. Docker Containers
* **GET `/api/docker/containers`** - List all containers.
* **POST `/api/docker/containers/<id>/control`** - Start/Stop/Restart containers.
* **GET `/api/docker/containers/<id>/logs`** - Fetch container logs.

### 3. OS Processes
* **GET `/api/processes/`** - List top processes by CPU.
* **POST `/api/processes/<pid>/kill`** - Terminate a specific process.

---

## Project Structure

```
backend/
  run.py
  requirements.txt
  API_DOCS.md
  src/
    app.py
    routes/
      metrics_routes.py
      docker_routes.py
      process_routes.py
    controllers/
      metrics_controller.py
      docker_controller.py
      process_controller.py
    services/
      metrics_service.py
      docker_service.py
      process_service.py
    utils/
      system_utils.py
```

---

## Tips

* Ensure the correct Python interpreter is selected in VS Code:
  `Ctrl + Shift + P → Python: Select Interpreter`

* If you see:

  ```
  ModuleNotFoundError: No module named 'flask'
  ```

  Activate your virtual environment and install dependencies:

  ```bash
  pip install flask
  ```

---
