import express from 'express';

const app = express();

app.get("/", (req, res) => {
    console.log("Recived GET request");
    res.send('Hello from server');
})

app.listen(9000, () => {
    console.log('Server listening on port 9000');
})