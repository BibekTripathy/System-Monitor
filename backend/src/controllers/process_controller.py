from flask import jsonify, request
from src.services.process_service import process_service

def get_processes():
    limit = request.args.get('limit', 50, type=int)
    processes = process_service.list_processes(limit=limit)
    return jsonify({
        "success": True,
        "data": processes
    })

def terminate_process(pid):
    success, message = process_service.kill_process(int(pid))
    if success:
        return jsonify({"success": True, "message": message})
    else:
        return jsonify({"success": False, "error": message}), 500
