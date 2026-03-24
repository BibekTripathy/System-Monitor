from flask import jsonify
from src.services.metrics_service import fetch_system_metrics, fetch_quick_metrics
import time

def get_system_metrics():
    data = fetch_system_metrics()
    return jsonify({
        "success": True,
        "data": data
    })

def get_system_metrics():
    try:
        data = fetch_system_metrics()
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


def get_quick_metrics():
    try:
        data = fetch_quick_metrics()
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