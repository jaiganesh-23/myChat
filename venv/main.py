from gevent import monkey
monkey.patch_all()
from flask import Flask, session, jsonify
from flask_socketio import SocketIO
from application import create_app
from application.user_database import user_Db
from application.message_database import message_Db
import openai
from datetime import datetime


# SETUP
app = create_app()
socketio = SocketIO(app, logger=True, engineio_logger=True, async_mode='gevent', ping_timeout=100)
openai.api_key = ""

# Communication Functions


@socketio.on('receive_message')
def handle_my_custom_event(json, methods=['GET', 'POST']):
    global messages
    data = dict(json)
    data['chat_room'] = data['chat_room'].lower()
    json['datetime'] = f"{datetime.now()}"

    if "bot" in data:
        message_database = message_Db()
        c_message = data["content"][5:]
        message_database.save_message(data["sender"], data["content"], data["chat_room"], data['msg_type'], data['file_dirs'])
        c_message_dict = {"role": "user", "content": c_message}
        messages.append(c_message_dict)
        completion = openai.ChatCompletion.create(
            model = "gpt-3.5-turbo",
            messages = messages
        )

        c_reply = completion.choices[0].message["content"]
        message_database.save_message("openai_bot", c_reply, data["chat_room"], 'text/img', '')
        c_reply_dict = {"role": "assistant", "content": c_reply}
        messages.append(c_reply_dict)
        
        socketio.emit('message response', json)
        json2 = json
        json2["content"] = c_reply
        json2["sender"] = "openai_bot"
        socketio.emit("message response", json2)

    else:
        message_database = message_Db()
        message_database.save_message(data["sender"], data["content"], data["chat_room"], data['msg_type'], data['file_dirs'])
        print(json)
        socketio.emit('message response', json)

if __name__ == "__main__":
    messages = []
    #nginx_result = os.system("start ./nginx.exe")
    socketio.run(app, debug=True, host='127.0.0.1', port=5000)
    #serve(app, host='127.0.0.1', port=5000, url_scheme="https")



