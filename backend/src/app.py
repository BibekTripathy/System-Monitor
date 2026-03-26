from flask import Flask
from flask_cors import CORS
from src.routes.metrics_routes import metrics_bp
from src.routes.docker_routes import docker_bp
from src.routes.process_routes import process_bp

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.register_blueprint(metrics_bp, url_prefix="/api/metrics")
    app.register_blueprint(docker_bp, url_prefix="/api/docker")
    app.register_blueprint(process_bp, url_prefix="/api/processes")

    return app