async function load_name(){
    return await fetch("/get_name")
        .then(async function (response) {
            return await response.json();
        })
        .then(async function (text) {
            return await text["name"];
        });
}


async function load_profile(username){
    return await fetch("/get_user_details/" + username)
        .then(async function (response) {
            return await response.json();
        });
}


async function load_user_details(){
    let user_name = await load_name();
    let pdetails = await load_profile(user_name);

    let name = pdetails["name"], email = pdetails["email"], gender = pdetails["gender"];


    let name_top = document.createElement("p");
    name_top.textContent = user_name;
    name_top.classList.add("name-top");

    let profile_img = document.createElement("img")
    profile_img.setAttribute("src", "../static/male-icon.jpg")
    profile_img.classList.add("profile-img")

    let user_name_p = document.createElement("p");
    user_name_p.textContent = user_name;
    user_name_p.classList.add("user-name");

    let name_p = document.createElement("p");
    name_p.textContent = name;
    name_p.classList.add("name");

    let email_p = document.createElement("p");
    email_p.textContent = email;
    email_p.classList.add("email");

    let buttons_div = document.createElement("div");
    buttons_div.classList.add("buttons-div");

    let edit_profile_button = document.createElement("button");
    edit_profile_button.classList.add("edit-profile-button", "bn");
    edit_profile_button.textContent = "Edit Profile";

    let edit_settings_button = document.createElement("button");
    edit_settings_button.classList.add("edit-settings-button", "bn");
    edit_settings_button.textContent = "Settings";

    let delete_account_button = document.createElement("button");
    delete_account_button.classList.add("delete-account-button", "bn");
    delete_account_button.textContent = "Delete Account";


    let profile_section = document.querySelector(".profile-section");

    profile_section.appendChild(name_top);
    profile_section.appendChild(profile_img);
    profile_section.appendChild(name_p);
    profile_section.appendChild(user_name_p);
    profile_section.appendChild(email_p);
    buttons_div.appendChild(edit_profile_button);
    buttons_div.appendChild(edit_settings_button);
    profile_section.appendChild(buttons_div);
    profile_section.appendChild(delete_account_button);
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


async function load_profile_details(){
    let user_name = await load_name();
    let pdetails = await load_profile(user_name);

    let name = pdetails["name"], email = pdetails["email"], gender = pdetails["gender"];
    let rooms = await load_rooms();

    let profile_user_name = document.createElement("p");
    profile_user_name.textContent = user_name;
    profile_user_name.classList.add("profile-user-name");

    let profile_name = document.createElement("p");
    profile_name.textContent = name;
    profile_name.classList.add("profile-name");


    let friends_header = document.createElement("p");
    friends_header.textContent = "Friends";
    friends_header.classList.add("friends-header");

    let header_hr = document.createElement("hr");
    header_hr.classList.add("header-hr");

    let friends_container = document.createElement("div");

    for(let i=1;i<rooms.length;i++){
        let friend_div = document.createElement("div");
        let friend_name = rooms[i]["friend"];
        friend_div.innerHTML = `<div class = "friend-div">
                                    <i class='bx bx-user'></i>
                                    <h4>${friend_name}</h4>
                                </div>
                                <hr>`;
        friends_container.appendChild(friend_div);
    }

    let bio_header = document.createElement("p");
    bio_header.textContent = "Bio";
    bio_header.classList.add("bio-header");

    let header_hr2 = document.createElement("hr");
    header_hr2.classList.add("header-hr");

    let bio = document.createElement("p");
    bio.textContent = "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Vitae unde veniam deleniti, non facilis ratione. Error, laborum! Ex numquam aliquam, quam inventore incidunt quis neque laborum qui enim id architecto.";
    bio.classList.add("bio");

    let profile_container = document.querySelector(".user-details");

    profile_container.appendChild(profile_user_name);
    profile_container.appendChild(profile_name);
    profile_container.appendChild(bio_header);
    profile_container.appendChild(header_hr2);
    profile_container.appendChild(bio);
    profile_container.appendChild(friends_header);
    profile_container.appendChild(header_hr);
    profile_container.appendChild(friends_container);
    
}


load_user_details();
load_profile_details();