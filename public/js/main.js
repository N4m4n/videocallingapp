// HTML Elements
const createUserButton = document.getElementById("create-new-user");
const newUserName = document.getElementById("username");
const newUserSection = document.querySelector(".username-section");
const myVideo = document.getElementById("video1");
const remoteVideo = document.getElementById("video2");
remoteVideo.style.transform = 'scaleX(-1)';
let localStream;
const socket = io();

// Singleton peerconnection object
const PeerConnection = (function () {
    let peerConnection;
    const createPeerConnection = () => {

        // the stun server url to get the public ip address of the machine
        const config = {
            iceServers: [{urls: "stun:stun.easycall.pl:3478"}]
        }
        // This is a browser api.  
        peerConnection = new RTCPeerConnection(config)

        // Adding all the localstream to the peerconnection object.
        localStream.getTracks().forEach( track => {
            peerConnection.addTrack(track, localStream);
        })

        // listen for streams from other people
        peerConnection.ontrack = function (event) {
            console.log("ontrach");
            remoteVideo.srcObject = event.streams[0];
        } 

        // event handler for recieving the icecandidate. 
        peerConnection.onicecandidate = function (event) {
            if (event.candidate) {
                socket.emit("icecandidate", event.candidate);
            }
        }

        return peerConnection;
    }
    return {
        getInstance: () => {
            if (!peerConnection) {
                peerConnection = createPeerConnection();
            }
            return peerConnection;
        }
    }
})();

const startCall = async (user) => {

    const peerConnectionObject = PeerConnection.getInstance();
    const offer = await peerConnectionObject.createOffer();

    await peerConnectionObject.setLocalDescription(offer);

    // send offer to signalling server
    socket.emit("offer", {from: newUserName.value, to: user.userName, offer: peerConnectionObject.localDescription}); 
};

const startMyVideo = async  () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStream = stream;
    myVideo.srcObject = stream;
    myVideo.style.transform = 'scaleX(-1)';
};


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
            callButton.addEventListener ("click", (e) => {
                startCall(usersList[key]);
            });
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

        // The emit can have any event name just make sure tht u use the same event name on the server side (socket.on('eventName'));
        socket.emit("join-user", userName);
        newUserSection.style.display = "none";
 
    }
});

socket.on("joined",  allUsers => {
    getUsersList(allUsers, socket.id);
})


// for the remote side
socket.on("offer", async (offerData) => {
    const peerConnectionObject = PeerConnection.getInstance();
    await peerConnectionObject.setRemoteDescription(offerData.offer);
    const answer = await peerConnectionObject.createAnswer();
    await peerConnectionObject.setLocalDescription(answer);
    socket.emit("answer", {from: offerData.from, to: offerData.to, answer:  peerConnectionObject.localDescription });
})

// for local again (who started the offer has got the answer)
socket.on("answer", async(answerData) => {
    const peerConnectionObject = PeerConnection.getInstance();
    await peerConnectionObject.setRemoteDescription(answerData.answer); 
})

socket.on("icecandidate", async(candidate) => {
    const peerConnectionObject = PeerConnection.getInstance();
    console.log(candidate, 'candidate');
    await peerConnectionObject.addIceCandidate(new RTCIceCandidate(candidate));
}) 

startMyVideo();