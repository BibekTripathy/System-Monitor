from time import time
import psutil
class ProcessService:
    def list_processes(self, limit=50):
        processes = []
        for p in psutil.process_iter():
            try:
                p.cpu_percent(interval=None)
            except:
                continue

        time.sleep(0.5)
        
        for proc in psutil.process_iter(['pid', 'name', 'username', 'status', 'cpu_percent', 'memory_percent']):
            try:
                processes.append(proc.info)
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                pass
        
        # Sort by CPU usage and limit
        processes.sort(key=lambda x: x.get('cpu_percent', 0), reverse=True)
        return processes[:limit]

    def kill_process(self, pid):
        try:
            process = psutil.Process(pid)
            process.terminate() # Or process.kill() for forceful
            return True, f"Process {pid} terminated"
        except psutil.NoSuchProcess:
            return False, "Process not found"
        except psutil.AccessDenied:
            return False, "Permission denied"
        except Exception as e:
            return False, str(e)

process_service = ProcessService()
