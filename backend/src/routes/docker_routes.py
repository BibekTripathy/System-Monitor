from flask import Blueprint
from src.controllers.docker_controller import list_containers, control_container, get_container_logs

docker_bp = Blueprint("docker", __name__)

@docker_bp.route("/containers", methods=["GET"])
def get_all_containers():
    return list_containers()

@docker_bp.route("/containers/<container_id>/control", methods=["POST"])
def post_control_container(container_id):
    return control_container(container_id)

@docker_bp.route("/containers/<container_id>/logs", methods=["GET"])
def get_logs(container_id):
    return get_container_logs(container_id)
