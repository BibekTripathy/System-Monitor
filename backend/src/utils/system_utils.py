import psutil
import time

def get_cpu_info():
    return {
        "total": psutil.cpu_percent(interval=1),
        "per_core": psutil.cpu_percent(interval=1, percpu=True)
    }

def get_memory_info():
    mem = psutil.virtual_memory()
    return {
        "total": mem.total,
        "used": mem.used,
        "available": mem.available,
        "percent": mem.percent
    }

def get_disk_info():
    partitions = psutil.disk_partitions()
    disk_data = []

    for p in partitions:
        try:
            usage = psutil.disk_usage(p.mountpoint)
            disk_data.append({
                "device": p.device,
                "mountpoint": p.mountpoint,
                "total": usage.total,
                "used": usage.used,
                "percent": usage.percent
            })
        except:
            continue

    return disk_data

def get_uptime():
    return time.time() - psutil.boot_time()