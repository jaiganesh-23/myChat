#from gevent import monkey
#monkey.patch_all()
from flask import Flask, session, jsonify
from flask_socketio import SocketIO
from application import create_app
from application.user_database import user_Db
from application.message_database import message_Db
from waitress import serve
import time
import os
from OpenSSL import SSL, crypto
import subprocess
import openai
from datetime import datetime


# SETUP
app = create_app()
socketio = SocketIO(app, logger=True, engineio_logger=True)
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

    

# MAINLINE

def create_self_signed_cert(certfile, keyfile, certargs, cert_dir=".", nginx_dir="./conf"):
    C_F = os.path.join(cert_dir, certfile)
    C_F2 = os.path.join(nginx_dir, certfile)
    K_F = os.path.join(cert_dir, keyfile)
    K_F2 = os.path.join(nginx_dir, keyfile)
    if not os.path.exists(C_F) or not os.path.exists(K_F):
        k = crypto.PKey()
        k.generate_key(crypto.TYPE_RSA, 2048)
        cert = crypto.X509()
        cert.get_subject().C = certargs["Country"]
        cert.get_subject().ST = certargs["State"]
        cert.get_subject().L = certargs["City"]
        cert.get_subject().O = certargs["Organization"]
        cert.get_subject().OU = certargs["Org. Unit"]
        cert.get_subject().CN = 'Example'
        cert.set_serial_number(1000)
        cert.gmtime_adj_notBefore(0)
        cert.gmtime_adj_notAfter(315360000)
        cert.set_issuer(cert.get_subject())
        cert.set_pubkey(k)
        cert.sign(k, 'sha1')
        open(C_F, "wb").write(crypto.dump_certificate(crypto.FILETYPE_PEM, cert))
        open(C_F2, "wb").write(crypto.dump_certificate(crypto.FILETYPE_PEM, cert))
        open(K_F, "wb").write(crypto.dump_privatekey(crypto.FILETYPE_PEM, k))
        open(K_F2, "wb").write(crypto.dump_privatekey(crypto.FILETYPE_PEM, k))

CERT_FILE = "cert.pem"
KEY_FILE = "key.pem"



if __name__ == "__main__":
    messages = []
    create_self_signed_cert(CERT_FILE, KEY_FILE,
                            certargs=
                            {"Country": "AA",
                             "State": "AA",
                             "City": "ABCD",
                             "Organization": "ABCD",
                             "Org. Unit": "ABCD"})
    #nginx_result = os.system("start ./nginx.exe")
    socketio.run(app, debug=True, host='127.0.0.1', port=5000)
    #serve(app, host='127.0.0.1', port=5000, url_scheme="https")



