from flask import Blueprint
from src.controllers.metrics_controller import get_system_metrics

metrics_bp = Blueprint("metrics", __name__)

@metrics_bp.route("/system", methods=["GET"])
def system_metrics():
    return get_system_metrics()