import express from 'express';
import {createServer} from 'http';
import {Server} from 'socket.io';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const app = express();
const server = createServer(app);
const io = new Server(server);
const __dirname = dirname(fileURLToPath(import.meta.url))

app.use(express.static("public"));

io.on("connection", (socket) => {
    console.log(`User with socked id ${socket.id} connected.  `)
});


app.get("/", (req, res) => {
    console.log("Recived GET request");
    // res.send('Hello from server');
    res.sendFile(join(__dirname + '/app/index.html'))
});

server.listen(9000, () => { 
    console.log('Server listening on port 9000');
});