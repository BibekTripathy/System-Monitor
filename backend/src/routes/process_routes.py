from flask import Blueprint
from src.controllers.process_controller import get_processes, terminate_process

process_bp = Blueprint("process", __name__)

@process_bp.route("/", methods=["GET"])
def list_all_processes():
    return get_processes()

@process_bp.route("/<pid>/kill", methods=["POST"])
def kill_os_process(pid):
    return terminate_process(pid)
