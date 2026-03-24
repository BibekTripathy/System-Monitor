import psutil
import time

def get_processes(sort_by="cpu", limit=15):
    processes = []
    for p in psutil.process_iter():
        try:
            p.cpu_percent(interval=None)
        except:
            continue

    time.sleep(0.5)

    for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent', 'status']):
        try:
            processes.append(proc.info)
        except:
            continue

    key = "cpu_percent" if sort_by == "cpu" else "memory_percent"
    processes = sorted(processes, key=lambda x: x.get(key, 0), reverse=True)

    return processes[:limit]