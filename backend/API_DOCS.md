# Mini DevOps Dashboard API Documentation

Base URL: `http://localhost:5000/api`

## 1. System Metrics
Endpoints for general system resource usage.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/metrics/system` | Fetch CPU, RAM, and Disk usage stats. |

---

## 2. Docker Container Management
Endpoints for monitoring and controlling Docker containers.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/docker/containers` | List all containers (ID, Name, Status, Image). |
| **POST** | `/docker/containers/<id>/control` | Control container state. Body: `{ "action": "start/stop/restart/remove" }` |
| **GET** | `/docker/containers/<id>/logs` | Fetch container logs. Query: `?tail=100` |

---

## 3. OS Process Management
Endpoints for managing host system processes.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/processes/` | List top processes by CPU usage. Query: `?limit=50` |
| **POST** | `/processes/<pid>/kill` | Terminate a specific process by PID. |

---

## Response Format
All responses are JSON and follow this structure:
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message if applicable"
}
```
Errors return `success: false` and an `error` message.
