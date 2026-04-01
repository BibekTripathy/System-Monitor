import psutil


from src.utils.system_utils import (
    get_cpu_info,
    get_memory_info,
    get_disk_info,
    get_network_info,
    get_uptime
)

def fetch_system_metrics():
    return {
        "cpu": get_cpu_info(),
        "memory": get_memory_info(),
        "disk": get_disk_info(),
        "network": get_network_info(),
        "uptime": get_uptime()
    }

def fetch_quick_metrics():
    import psutil
    return {
        "cpu": psutil.cpu_percent(interval=None),
        "memory": psutil.virtual_memory().percent
    }