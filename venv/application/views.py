from flask import Blueprint
from flask import Flask, render_template, url_for, session, request, redirect, flash, jsonify
from .user_database import user_Db
from .message_database import message_Db

view = Blueprint("views", __name__)

# GLOBAL CONSTANTS
USER_NAME = 'name'
MSG_LIMIT = 30

# VIEWS

@view.route("/", methods=["GET", "POST"])
@view.route("/home/", methods=["GET", "POST"])
@view.route("/home/<user>", methods=["GET", "POST"])
def home(logged_user=None):
    if request.method == "POST":
        name = request.form["fullName"]
        username = request.form["userName"]
        password = request.form["password"]
        email = request.form["email"]
        gender = request.form["gender"]
        age = request.form["age"]
        user_db = user_Db()
        user_db.register_user(name, username, email, password, age, gender)
        flash(f"{username} registered successfully")
        return redirect(url_for("views.login"))

    return render_template("home.html", **{"session": session, "user":logged_user})


@view.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["userName"]
        password = request.form["password"]

        user_db = user_Db()
        found_user = user_db.check_user(username)
        if found_user:
            user = user_db.get_user(username)
            if user["password"] == password:
                session[USER_NAME] = username
                flash(f"Username {username} Authenticated, login successful")
                return redirect(url_for("views.user"))

            else:
                flash("Invalid username or password")
                return redirect(url_for("views.login"))

        else:
            flash(f"Username {username} not registered")
            return redirect(url_for("views.login"))
    else:
        return render_template("login.html", **{"session": session})


@view.route("/user")
def user():
    if USER_NAME in session:
        return render_template("user.html", session=session)
    else:
        flash("Login First to start chatting")
        return render_template("home.html")


@view.route("/get_name")
def get_name():
    """
    :return: a json object storing name of logged in user
    """
    data = {"name": ""}
    if USER_NAME in session:
        data["name"] = session[USER_NAME]
    print(data)
    return jsonify(data)


@view.route("/get_rooms")
def get_rooms():
    user_db = user_Db()
    rooms = user_db.get_chat_rooms(session[USER_NAME])
    print(rooms)
    return rooms

@view.route("/get_messages")
@view.route("/get_messages/<room_name>")
def get_messages(room_name=None):
    message_db = message_Db()
    print(room_name)
    messages = message_db.get_messages(room_name)
    print(messages)
    return messages

@view.route("/logout")
def logout():
    if USER_NAME in session:
        flash(f"{session[USER_NAME]} logged out successfully")
        session.pop(USER_NAME, None)
    else:
        flash("Login first to logout")
    return redirect(url_for("views.home"))

@view.route("/friend_request/<friend_name>")
def friend_request(friend_name=None):
    if USER_NAME not in session:
        flash("You are not logged in to make a friend request")
        return redirect(url_for("views.home"))

    else:
        user_name = session[USER_NAME]
        user_db = user_Db()
        user_db.register_friend(user_name, friend_name)
        return redirect(url_for("views.user"))

@view.route("/get_user_details/<user_name>")
def get_user_details(user_name):
    """
    :return: a json object storing name of logged in user
    """
    print("user: " +  user_name)
    return user_name


@view.route("/profile")
@view.route("/profile/<user_name>")
def get_profile(user_name = None):
    if USER_NAME not in session:
        flash("You are not logged in to view your profile")
        return redirect(url_for("views.home"))
    
    else:
        user_name = session[USER_NAME]
        user_db = user_Db()
        found_user = user_db.check_user(user_name)
        if(found_user):
            return render_template("profile.html", **{"user": user_name})
        else:
            flash("Profile for requested user does not exist.")
            return redirect(url_for("views.home"))








