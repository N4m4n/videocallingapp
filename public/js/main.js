const createUserButton = document.getElementById("create-new-user");
const newUserName = document.getElementById("username");
const newUserSection = document.querySelector(".username-section");
const socket = io();


function getUsersList(usersList, userId) {
    const ul = document.getElementById('participants-list');
    ul.replaceChildren();
   
    Object.keys(usersList).forEach(key => {
        console.log();
        console.log(userId);
        const li = document.createElement('li');
        let textToDisplay = key
        if (userId === usersList[key]['userId']) {
            textToDisplay = textToDisplay + ' (you)';
        } 
        li.textContent = textToDisplay; // Set the text of the list item to the key (item name)
        if (userId !== usersList[key]['userId']) {
            console.log("reachhed");
            const callButton = document.createElement('button');
            callButton.classList.add('call-button');
            callButton.textContent = 'Call';
            li.appendChild(callButton);
        }
        ul.appendChild(li);     
    });
}

createUserButton.addEventListener("click", (e)=> {
    const userName = newUserName.value;
    if(userName !== ""){
        console.log(userName);
        // The emit can have any event name just make sure tht u use the same event name on the server side (socket.on('eventName'));
        socket.emit("join-user", userName);
        newUserSection.style.display = "none";
 
    }
});

socket.on("joined",  allUsers => {
    getUsersList(allUsers, socket.id);
})