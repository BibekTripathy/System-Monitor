from flask import jsonify
from src.services.metrics_service import fetch_system_metrics

def get_system_metrics():
    data = fetch_system_metrics()
    return jsonify({
        "success": True,
        "data": data
    })