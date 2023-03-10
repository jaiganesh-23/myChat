
async function add_message(msg, scroll){
    var message = msg["content"];
    var chat_room = msg["chat_room"];
    var usr_name = msg["sender"];
    var logged_usr_name = await load_name();

    var message_div = document.getElementById("messages");
    var content = ``;

    if (usr_name == logged_usr_name){
        content = ` 
                        <div class = "message">
                            <p><span>${usr_name}</span>: ${message}</p>
                        </div>
                    `;
    }
    else{
        content = `
                        <div class = "message right">
                            <p><span>${usr_name}</span>: ${message}</p>
                        </div>
                    `;
    }
    message_div.innerHTML += content;

    if(scroll){
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

async function load_name(){
    return await fetch("/get_name")
        .then(async function (response) {
            return await response.json();
        })
        .then(async function (text) {
            return await text["name"];
        });
}


async function load_rooms(){
    return await fetch("/get_rooms")
        .then(async function (response) {
            console.log(response);
            return await response.json();
        })
        .then(function (text) {
            return text;
        })
}

async function get_messages(room_name){
    return await fetch(`/get_messages/${room_name}`)
        .then (async function (response) {
            console.log(response);
            return await response.json();
        })
        .then(function (text) {
            return text;
        })
}

var username = load_name();

async function add_chat_rooms(){
    var rooms_container = document.getElementById("rooms-container");
    var rooms = await load_rooms();
    console.log(rooms);
    for(let i=0;i<rooms.length;i++){
        room = rooms[i];
        var room_name = room["chat_room"];
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

async function load_chat(chat_room){
    var chat_container = document.getElementById("chat-container");
    var chat_room_header = document.getElementById("chat-room-header");
    chat_room_header.textContent = chat_room.toUpperCase();
    var message_div = document.getElementById("messages");
    message_div.innerHTML = ``;
    let messages = await get_messages(chat_room.toLowerCase());
    let scroll = false;
    console.log(messages);
    for(let i=0;i<messages.length;i++){
        msg = messages[i];
        if(i == messages.length-1){
            scroll = true;
        }
        add_message(msg, scroll);
    }
}

add_chat_rooms();

var socket = io.connect("http://"+document.domain+ ":" +location.port);
socket.on("connect", async function() {
    //setTimeout(function(){}, 5000);
    var usr_name = await load_name();
    var room_name = document.getElementById("chat-room-header").textContent;
    console.log(usr_name);
    if(usr_name != ""){
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
    var send_message = $("button#send").on("click", async function(e) {
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

function loadRoom(id){
    var message_node_list = id.childNodes;
    var room = message_node_list[3].textContent;
    load_chat(room);
}





