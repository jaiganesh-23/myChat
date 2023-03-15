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

async function get_profile_img_path(username){
    return await fetch("/get_profile_img/" + username)
        .then(async function (response) {
            return await response.json();
        });
}

async function update_profile_img(){
    let user_name = await load_name();
    let img_path = await get_profile_img_path(user_name);
    let s_index = img_path.indexOf("profile-images");
    img_path = "../static/" + img_path.substring(s_index);
    let profile_img = document.querySelector(".profile-img");
    profile_img.setAttribute("src", img_path);
}

async function load_user_details(){
    let user_name = await load_name();
    let pdetails = await load_profile(user_name);

    let name = pdetails["name"], email = pdetails["email"], gender = pdetails["gender"];


    let name_top = document.createElement("p");
    name_top.textContent = user_name;
    name_top.classList.add("name-top");

    let profile_img = document.createElement("img")
    let profile_img_path = await get_profile_img_path(user_name);
    let s_index = profile_img_path.indexOf("profile-images");
    profile_img_path = "../static/" + profile_img_path.substring(s_index);
    profile_img.setAttribute("src", profile_img_path);
    profile_img.classList.add("profile-img")

    let profile_img_upload = document.createElement("input");
    profile_img_upload.setAttribute("id", "profile-img-upload");
    profile_img_upload.setAttribute("type", "file");
    profile_img_upload.setAttribute("multiple", "file");
    profile_img_upload.setAttribute("name", "upload");

    let profile_img_button = document.createElement("button");
    profile_img_button.setAttribute("id", "img-upload-btn");
    profile_img_button.innerHTML = "<i class='bx bxs-plus-circle upload-icon'></i>";

    profile_img_button.addEventListener('click', function () {
        console.log("clicked");
        let form_data = new FormData();
        let ins = document.getElementById('profile-img-upload').files.length;
               
        for (let x = 0; x < ins; x++) {
            form_data.append("files[]", document.getElementById('profile-img-upload').files[x]);
        }
        
        $.ajax({
            url: "https://" + document.domain + ":" + location.port + "/profile/profile-img-upload", // point to server-side URL
            dataType: 'json', // what to expect back from server
            cache: false,
            contentType: false,
            processData: false,
            data: form_data,
            type: 'post',
            success: function (response) { // print success response
                print(response.message)
                update_profile_img();
            },
            error: function (response) {
                print(response.message) // print error response
            }
        });
    });


    let profile_img_p = document.createElement("p");
    profile_img_p.classList.add("profile-img-p");
    profile_img_p.textContent = "Choose and Upload Image";

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
    profile_section.appendChild(profile_img_button);
    profile_section.appendChild(profile_img_upload);
    profile_section.appendChild(profile_img_p);
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
    friends_container.classList.add("friends-container");

    for(let i=1;i<rooms.length;i++){
        let friend_div = document.createElement("div");
        friend_div.classList.add("friend-div");
        let friend_name = rooms[i]["friend"];
        let profile_img_path = await get_profile_img_path(friend_name);
        let s_index = profile_img_path.indexOf("profile-images");
        profile_img_path = "../static/" + profile_img_path.substring(s_index);
        friend_div.innerHTML = `
                                    <img src=${profile_img_path} class="profile-icon">
                                    <p>${friend_name}</p>
                                `;
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


    