from flask import Blueprint
from src.controllers.proces_controller import list_processes

process_bp = Blueprint("process", __name__)

@process_bp.route("/", methods=["GET"])
def processes():
    return list_processes()