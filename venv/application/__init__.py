from flask import Flask


def create_app():
    app = Flask(__name__)
    app.secret_key = "hello"

    with app.app_context():
        # Importing components of app
        from .views import view
        from .message_database import message_Db
        from .user_database import user_Db

        app.register_blueprint(view, url_prefix="/")

    return app
