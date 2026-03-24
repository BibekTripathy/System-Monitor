from flask import jsonify, request
from src.services.process_service import get_processes
import time

def list_processes():
    try:
        sort = request.args.get("sort", "cpu")
        data = get_processes(sort_by=sort)

        return jsonify({
            "success": True,
            "data": data,
            "timestamp": time.time(),
            "error": None
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "data": None,
            "error": str(e)
        }), 500