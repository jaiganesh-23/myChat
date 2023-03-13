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
            return await response.text();
        });
}


async function get_details(){
    let user_name = await load_name();
    let pdetails = await load_profile(user_name);
    console.log(pdetails);
}

get_details();