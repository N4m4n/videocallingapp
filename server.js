import express from 'express';
import {createServer} from 'http';
import {Server} from 'socket.io';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const app = express();
const server = createServer(app);
const io = new Server(server);
const __dirname = dirname(fileURLToPath(import.meta.url))

const allUsers = {};

app.use(express.static("public"));

io.on("connection", (socket) => {
    console.log(`User with socked id ${socket.id} connected.  `)
    socket.on("join-user" , (userName) => {
        console.log(`${userName} joined the chat.`);
        allUsers[userName] =  {userName, userId: socket.id}; 
        console.log(allUsers);
        // emit an event to show others tht someone new joined.
        io.emit("joined",  (allUsers));
    })
    

    socket.on("offer", offerData => {
        console.log(offerData.from);
        console.log(offerData.to);
        console.log(offerData.offer);
        io.to(allUsers[offerData.to].userId).emit("offer", offerData);
    })

    socket.on("answer", answerData => {
        io.to(allUsers[answerData.from].userId).emit("answer", answerData); 
    })

    socket.on("icecandidate", candidate => {
        socket.broadcast.emit("icecandidate", candidate);
    })
});


app.get("/", (req, res) => {
    console.log("Recived GET request");
    // res.send('Hello from server');
    res.sendFile(join(__dirname + '/app/index.html'))
});

server.listen(9000, () => { 
    console.log('Server listening on port 9000');
});