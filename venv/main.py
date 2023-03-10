from flask import Flask, session
from flask_socketio import SocketIO
from application import create_app
from application.user_database import user_Db
from application.message_database import message_Db
from waitress import serve
import time


# SETUP
app = create_app()
socketio = SocketIO(app)

# Communication Functions


@socketio.on('receive_message')
def handle_my_custom_event(json, methods=['GET', 'POST']):

    data = dict(json)
    data['chat_room'] = data['chat_room'].lower()
    if "sender" in data:
        message_database = message_Db()
        message_database.save_message(data["sender"], data["content"], data["chat_room"])
        print(json)

    socketio.emit('message response', json)

# MAINLINE


if __name__ == "__main__":
    #socketio.run(app, debug=True, host='0.0.0.0', allow_unsafe_werkzeug=True)
    serve(app, host='127.0.0.1', port=8080)



