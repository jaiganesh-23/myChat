from flask import Flask, session
from flask_socketio import SocketIO
from application import create_app
from application.user_database import user_Db
from application.message_database import message_Db
from waitress import serve
import time
import os
from OpenSSL import SSL, crypto
import eventlet
eventlet.monkey_patch(socket=False)


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

def create_self_signed_cert(certfile, keyfile, certargs, cert_dir="."):
    C_F = os.path.join(cert_dir, certfile)
    K_F = os.path.join(cert_dir, keyfile)
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
        open(K_F, "wb").write(crypto.dump_privatekey(crypto.FILETYPE_PEM, k))

CERT_FILE = "cert.pem"
KEY_FILE = "key.pem"
create_self_signed_cert(CERT_FILE, KEY_FILE,
                            certargs=
                            {"Country": "US",
                             "State": "NY",
                             "City": "Ithaca",
                             "Organization": "Python-Bugs",
                             "Org. Unit": "Proof of Concept"})


if __name__ == "__main__":
    socketio.run(app, debug=True, host='127.0.0.1', certfile=CERT_FILE, keyfile=KEY_FILE)
    #serve(app, host='127.0.0.1', port=8080)



