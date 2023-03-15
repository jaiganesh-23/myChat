
async function add_message(msg, scroll) {
    var message = msg["content"];
    var chat_room = msg["chat_room"];
    var usr_name = msg["sender"];
    var logged_usr_name = await load_name();

    var message_div = document.getElementById("messages");
    let content = document.createElement("div");


    content.classList.add("message");
    let m_p = document.createElement("p");
    let profile_img_path = await get_profile_img_path(usr_name);
    let s_index = profile_img_path.indexOf("profile-images");
    profile_img_path = "../static/" + profile_img_path.substring(s_index);
    m_p.classList.add("msg");
    m_p.innerHTML = `
                        <img src=${profile_img_path} class="profile-icon">    
                        <span class="usr-name">${usr_name}</span>: ${message}
    `;
    content.appendChild(m_p);

    let m_span = m_p.childNodes[3];
    m_span.addEventListener("mouseenter", (e) => {
        let c_span = e.target;
        let message_div = c_span.parentElement.parentElement;
        let c_usr_name = c_span.textContent;

        
        
        let add_m_p = document.createElement("a");
        add_m_p.setAttribute("href", `/friend_request/${c_usr_name}`);
        add_m_p.classList.add("add-friend");
        add_m_p.innerHTML = `Add friend:${c_usr_name}`;
        if(message_div.childNodes.length <2) message_div.prepend(add_m_p);
    })
    content.addEventListener("mouseleave", (e)=>{
        let m_div = e.target;

        let p_div = m_div.childNodes[0];
        if(p_div.classList.contains("add-friend")) p_div.remove();
    })

    if(logged_usr_name != usr_name) content.classList.add("right");
    message_div.appendChild(content);

    if (scroll) {
        scrolltobottom("messages");
    }
}


function scrolltobottom(id) {
    var div = document.getElementById(id);
    $("#" + id).animate({
        scrollTop: div.scrollHeight - div.clientHeight,
    },
        500);
}

async function load_name() {
    return await fetch("/get_name")
        .then(async function (response) {
            return await response.json();
        })
        .then(async function (text) {
            return await text["name"];
        });
}


async function load_rooms() {
    return await fetch("/get_rooms")
        .then(async function (response) {
            console.log(response);
            return await response.json();
        })
        .then(function (text) {
            return text;
        })
}

async function get_messages(room_name) {
    return await fetch(`/get_messages/${room_name}`)
        .then(async function (response) {
            console.log(response);
            return await response.json();
        })
        .then(function (text) {
            return text;
        })
}

async function get_profile_img_path(username){
    return await fetch("/get_profile_img/" + username)
        .then(async function (response) {
            return await response.json();
        });
}

var username = load_name();

async function add_chat_rooms() {
    var rooms_container = document.getElementById("rooms-container");
    var rooms = await load_rooms();
    console.log(rooms);
    for (let i = 0; i < rooms.length; i++) {
        let room = rooms[i];
        var room_name = i==0? room["chat_room"]: room["friend"];
        room_name = room_name.toUpperCase();
        var room_div = `<div class = "chat-room" onclick = "loadRoom(this)">
                            <i class='bx bx-user'></i>
                            <h4>${room_name}</h4>
                        </div>
                        <hr>`;
        rooms_container.innerHTML += room_div;
    }
    load_chat(rooms[0]["chat_room"]);
}

async function load_chat(chat_room) {
    var chat_container = document.getElementById("chat-container");
    var chat_room_header = document.getElementById("chat-room-header");
    chat_room_header.textContent = chat_room.toUpperCase();
    var message_div = document.getElementById("messages");
    message_div.innerHTML = ``;
    let messages = await get_messages(chat_room.toLowerCase());
    let scroll = false;
    console.log(messages);
    for (let i = 0; i < messages.length; i++) {
        msg = messages[i];
        if (i == messages.length - 1) {
            scroll = true;
        }
        add_message(msg, scroll);
    }
}

add_chat_rooms();

var socket;
window.addEventListener("DOMContentLoaded", function(){
    socket = io.connect("https://" + document.domain + ":" + location.port);

    socket.on("connect", async function () {
        //setTimeout(function(){}, 5000);
        var usr_name = await load_name();
        var room_name = document.getElementById("chat-room-header").textContent;
        console.log(usr_name);
        if (usr_name != "") {
            socket.emit("receive_message", {
                content: usr_name + " just connected to the server!",
                chat_room: room_name,
                sender: usr_name,
                connect: true,
            });
            socket.emit("receive_message", {
                content: "<----- Welcome to the server " + usr_name + " ----->",
                chat_room: room_name,
                sender: usr_name,
                connect: true,
            });
        }
        var send_message = $("button#send").on("click", async function (e) {
            e.preventDefault();
    
            //get input from message box
            let msg_input = document.getElementById("msg");
            let user_input = msg_input.value;
            let user_name = await load_name();
            let room_name = document.getElementById("chat-room-header").textContent;
            console.log(user_input);
            //clear msg box value
            msg_input.value = "";
    
            //send message to other users
            socket.emit("receive_message", {
                content: user_input,
                chat_room: room_name,
                sender: user_name,
            });
        });
    });
    socket.on("disconnect", async function () {
        var user_name = await load_name();
        var room_name = document.getElementById("chat-room-header").textContent;
        socket.emit("receive_message", {
            content: user_name + " just left the server...",
            chat_room: room_name,
            sender: user_name,
        });
    });
    socket.on("message response", function (msg) {
        console.log(msg);
        add_message(msg, true);
    })
})









