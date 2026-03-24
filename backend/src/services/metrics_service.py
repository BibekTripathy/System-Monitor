import psutil

def fetch_system_metrics():
    cpu = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')

    return {
        "cpu": cpu,
        "memory": {
            "total": memory.total,
            "used": memory.used,
            "percent": memory.percent
        },
        "disk": {
            "total": disk.total,
            "used": disk.used,
            "percent": disk.percent
        }
    }

from src.utils.system_utils import (
    get_cpu_info,
    get_memory_info,
    get_disk_info,
    get_uptime
)

def fetch_system_metrics():
    return {
        "cpu": get_cpu_info(),
        "memory": get_memory_info(),
        "disk": get_disk_info(),
        "uptime": get_uptime()
    }

def fetch_quick_metrics():
    import psutil
    return {
        "cpu": psutil.cpu_percent(interval=None),
        "memory": psutil.virtual_memory().percent
    }