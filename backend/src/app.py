import os
import sys
from flask import Flask, send_from_directory
from flask_cors import CORS
from src.routes.metrics_routes import metrics_bp
from src.routes.docker_routes import docker_bp
from src.routes.process_routes import process_bp

def get_frontend_dir():
    """Return the absolute path to the compiled frontend/dist directory."""
    if getattr(sys, 'frozen', False):
        # Running inside a PyInstaller bundle
        return os.path.join(sys._MEIPASS, 'frontend', 'dist')
    else:
        # Running normally - up from backend/src/ to project root, then frontend/dist
        current_dir = os.path.dirname(os.path.abspath(__file__))
        return os.path.abspath(os.path.join(current_dir, '..', '..', 'frontend', 'dist'))

def create_app():
    frontend_dir = get_frontend_dir()
    
    # Configure Flask to use frontend_dir as the static folder
    app = Flask(__name__, static_folder=frontend_dir, static_url_path='')
    CORS(app)

    app.register_blueprint(metrics_bp, url_prefix="/api/metrics")
    app.register_blueprint(docker_bp, url_prefix="/api/docker")
    app.register_blueprint(process_bp, url_prefix="/api/processes")

    # Serve the React application for any unknown paths (for SPA routing)
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_frontend(path):
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        else:
            return send_from_directory(app.static_folder, 'index.html')

    return app