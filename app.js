const express = require("express");
const app = express();

app.use("/static", express.static('./static/'));

const server = require('http').createServer(app);
const io = require('socket.io')(server);

const FRAME_RATE = 30;

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
})

io.on("connection", (socket) => {
    setInterval(() => {
        server.emit('gameState', gameState)
    }, 1000 / FRAME_RATE)
})





const PORT = process.env.PORT || 8080;
app.listen(PORT, (error) => {
    if (error) {
        console.log(error);
    }
    console.log("Server is running on port", Number(PORT));
});