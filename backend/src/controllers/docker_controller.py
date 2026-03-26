from flask import jsonify, request
from src.services.docker_service import docker_service

def list_containers():
    containers = docker_service.list_containers()
    return jsonify({
        "success": True,
        "data": containers
    })

def control_container(container_id):
    data = request.json
    action = data.get('action')
    
    if not action:
        return jsonify({"success": False, "error": "Action is required"}), 400
    
    success, message = docker_service.manage_container(container_id, action)
    if success:
        return jsonify({"success": True, "message": message})
    else:
        return jsonify({"success": False, "error": message}), 500

def get_container_logs(container_id):
    tail = request.args.get('tail', 100, type=int)
    logs = docker_service.get_container_logs(container_id, tail=tail)
    
    if logs is None:
        return jsonify({"success": False, "error": "Could not fetch logs"}), 500
    
    return jsonify({
        "success": True,
        "logs": logs
    })
