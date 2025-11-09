from flask import Flask
import os
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from datetime import timedelta
import logging
from logging.handlers import RotatingFileHandler


def create_app():
    app = Flask(__name__)
    load_dotenv()

    # -------------------- CONFIGURATION --------------------
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "SQLALCHEMY_DATABASE_URI")
    app.config["JWT_SECRET_KEY"] = os.getenv(
        "JWT_SECRET_KEY", "default_secret_key")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=5)
    app.config["JWT_ALGORITHM"] = "HS256"
    # app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # -------------------- LOGGING SETUP --------------------
    # Create logs directory if not exists
    logs_dir = os.path.join(os.path.dirname(__file__), "logs")
    os.makedirs(logs_dir, exist_ok=True)

    log_file = os.path.join(logs_dir, "app.log")

    # Rotating file handler (5 MB max per file, keep 5 backups)
    file_handler = RotatingFileHandler(
        log_file, maxBytes=5 * 1024 * 1024, backupCount=5)
    file_handler.setLevel(logging.INFO)

    # Log format
    formatter = logging.Formatter(
        "%(asctime)s - %(levelname)s - %(message)s [in %(filename)s:%(lineno)d]"
    )
    file_handler.setFormatter(formatter)

    # Console handler for debugging in terminal
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    console_handler.setLevel(logging.DEBUG)

    # Add both handlers
    app.logger.addHandler(file_handler)
    app.logger.addHandler(console_handler)

    # Set overall log level
    app.logger.setLevel(logging.INFO)

    app.logger.info("✅ Logging initialized successfully")

    # -------------------- JWT & DATABASE --------------------
    jwt = JWTManager(app)

    from app.models import db
    db.init_app(app)

    migrate = Migrate(app, db)

    # -------------------- BLUEPRINTS --------------------
    from app.routes import api
    app.register_blueprint(api)

    app.logger.info("✅ Flask app and Blueprints registered successfully")

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
