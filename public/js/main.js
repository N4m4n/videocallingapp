const createUserButton = document.getElementById("create-new-user");
const newUserName = document.getElementById("username");
const newUserSection = document.querySelector(".username-section");
const socket = io();

createUserButton.addEventListener("click", (e)=> {
    const userName = newUserName.value;
    if(userName !== ""){
        console.log(userName);
        // The emit can have any event name just make sure tht u use the same event name on the server side (socket.on('eventName'));
        socket.emit("join-user", userName);
        newUserSection.style.display = "none";

    }
});