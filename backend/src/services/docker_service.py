import docker
from flask import current_app

class DockerService:
    def __init__(self):
        try:
            self.client = docker.from_env()
        except Exception as e:
            print(f"Error connecting to Docker: {e}")
            self.client = None

    def list_containers(self, all=True):
        if not self.client:
            return []
        
        containers = self.client.containers.list(all=all)
        return [
            {
                "id": c.short_id,
                "name": c.name,
                "status": c.status,
                "image": c.image.tags[0] if c.image.tags else "unknown",
                "state": c.attrs.get('State', {})
            } for c in containers
        ]

    def manage_container(self, container_id, action):
        if not self.client:
            return False, "Docker client not available"
        
        try:
            container = self.client.containers.get(container_id)
            if action == "start":
                container.start()
            elif action == "stop":
                container.stop()
            elif action == "restart":
                container.restart()
            elif action == "remove":
                container.remove(force=True)
            else:
                return False, f"Invalid action: {action}"
            return True, f"Container {action}ed successfully"
        except Exception as e:
            return False, str(e)

    def get_container_logs(self, container_id, tail=100):
        if not self.client:
            return None
        
        try:
            container = self.client.containers.get(container_id)
            logs = container.logs(tail=tail).decode('utf-8')
            return logs
        except Exception as e:
            return f"Error fetching logs: {str(e)}"

    def close(self):
        """Close the Docker client connection pool."""
        if self.client:
            try:
                self.client.close()
            except Exception:
                pass
            self.client = None

docker_service = DockerService()
