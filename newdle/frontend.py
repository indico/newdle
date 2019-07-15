import os

from flask import Blueprint, current_app, send_from_directory


frontend = Blueprint('frontend', __name__)


@frontend.route('/')
def index():
    return send_from_directory(os.path.join(current_app.root_path, 'client', 'build'), 'index.html')
