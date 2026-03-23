from flask import Flask
from src.routes.metrics_routes import metrics_bp

def create_app():
    app = Flask(__name__)

    app.register_blueprint(metrics_bp, url_prefix="/api/metrics")

    return app