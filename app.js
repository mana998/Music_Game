//setup express
const express = require("express");
const app = express();

//setup static dir
app.use(express.static(__dirname + '/public'));

//setup socket server
const server = require('http').createServer(app);
const io = require('socket.io')(server);

//framerate
const FRAME_RATE = 30;

//send initial html
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
})

//import game classes
const Game = require("./private/models/Game").Game;

let gameState = new Game();

io.on("connection", (socket) => {

    //send updates to everyone
    setInterval(() => {
        if (gameState.on) io.emit('gameState change', gameState);
        //gameState.on = false;
    }, 1000 / FRAME_RATE);

    //new player connected
    socket.on("client new player", (data) => {
        //console.log("new plazer");
        //console.log("plazer", data.player);
        gameState.players.push(data.player);
        //player.draw();
        if (!gameState.on) gameState.on = true;
        socket.emit("server new player", {player: "new player added"});
    })

    //player update
    socket.on("client update", (data) => {
        //find player with same username
        let player = gameState.players.find(player => player.username === data.player.username);
        //replace with new data
        gameState.players[gameState.players.indexOf(player)] = data.player;
    })
})





const PORT = process.env.PORT || 8080;
server.listen(PORT, (error) => {
    if (error) {
        console.log(error);
    }
    console.log("Server is running on port", Number(PORT));
});