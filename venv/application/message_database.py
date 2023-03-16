import sqlite3
from sqlite3 import Error
from datetime import datetime

FILE = "messages.db"
MESSAGE_TABLE = "message_Table"


class message_Db:
    """
    Stores the messages sent by users and handles the messages to be
    updated in website.
    """
    def __init__(self):
        try:
            self.conn = sqlite3.connect(FILE)
        except Exception as e:
            print(e)

        self.cursor = self.conn.cursor()
        self._create_table()

    def _create_table(self):
        query = f"""CREATE TABLE IF NOT EXISTS {MESSAGE_TABLE}
                    (id INTEGER PRIMARY KEY AUTOINCREMENT, sender TEXT, 
                    content TEXT, chat_room TEXT , datetime TEXT)"""
        d_query = f"""DROP TABLE IF EXISTS {MESSAGE_TABLE}"""

        #self.conn.execute(d_query)
        self.conn.execute(query)
        self.conn.commit()

    def save_message(self, username, message, chatroom):
        print(username, message, chatroom)
        query = f"""INSERT INTO {MESSAGE_TABLE} VALUES (?, ?, ?, ?, ?)"""
        connection = sqlite3.connect(FILE)
        cursor = connection.cursor()
        cursor.execute(query, (None, username, message, chatroom, datetime.now()))
        connection.commit()

    def get_messages(self, chatroom, limit=30):
        conn = sqlite3.connect(FILE)
        cursor = conn.cursor()
        query = f"SELECT * FROM {MESSAGE_TABLE} where chat_room = ?"
        cursor.execute(query, (chatroom,))
        messages = cursor.fetchall()
        messages_list = []
        for msg in messages:
            msg_dict = {"id":msg[0], "sender": msg[1], "content": msg[2], "chat_room": msg[3], "datetime": msg[4]}
            messages_list.append(msg_dict)

        messages_list = messages_list[len(messages_list)-limit:]
        #messages_list = sorted(messages_list, key= lambda x: x["time"], reverse=True)
        return messages_list



