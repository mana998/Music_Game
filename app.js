//setup express
const express = require("express");
const app = express();

//setup static dir
app.use(express.static(__dirname + '/public'));

//setup socket server
const server = require('http').createServer(app);
const io = require('socket.io')(server);

//reading file
const fs = require('fs');
const levels = ["level1-5.json", "level6-10.json", "level11-15.json", "level16-20.json"];

//framerate
const FRAME_RATE = 30;

//send initial html
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
})

//import game classes
const Game = require("./private/models/Game").Game;
const UtilsObject = require("./private/models/Utils").Utils;

let gameState = new Game();
const Utils = new UtilsObject();

//load in first batch of songs
gameState.loadSongs(require(`./private/levels/${levels[(gameState.level-1)/5]}`));
//collectible items
//initialize for 1st level
let collectibles = gameState.generateCollectibles(Utils.getRandomNumber(0, gameState.songs.length, 1));
//console.log(collectibles);
let currentColletibles = [];

//interval timer
let timer;

//answered amount
let answered = 0;

io.on("connection", (socket) => {

    //new player connected
    socket.on("client new player", (data) => {
        //console.log("new plazer");
        //console.log("plazer", data.player);
        gameState.players.push(data.player);
        //player.draw();
        if (!gameState.on) gameState.on = true;
        socket.emit("server new player", {state: gameState.state});
    })

    //player update
    socket.on("client update", (data) => {
        //find player with same username
        let player = gameState.players.find(player => player.username === data.player.username);
        //replace with new data
        //console.log(player);
        gameState.players[gameState.players.indexOf(player)] = data.player;
    })

    socket.on("start collecting", (data) => {
        //send amount of collectibles to client
        startInterval();
        console.log("start");
        //console.log(collectibles.length);
        gameState.stage = "collect";
        io.emit("collectibles amount", {amount: collectibles.length});
        //recursively generate collectibles
        generateCollectible();
    });

    socket.on("no collectibles left", (data) => {
        //stop interval for frequent updates
        clearInterval(timer);
        //console.log("no left");
        //console.log("next");
        if (gameState.stage !== "guess") {
            io.emit("guess", {length : gameState.song.length});
            gameState.stage = "guess";
        }
    })

    socket.on("send answer", (data) => {
        answered++;
        //console.log(answered);
        //console.log("players", gameState.players.length);
        if (answered === gameState.players.length) {
            io.emit("check answers", {players: gameState.players, song: gameState.song})
        }
    })
})

async function generateCollectible() {
    let item = collectibles.shift();
    //console.log(collectibles.length);
    //set custom timeout for each collectible
    //console.log("gamestate", gameState.level, " ", 10 / gameState.level, " ", 30)
    //max wait limit is 30 sec
    //min limit depends on level
    let random = Utils.getRandomNumber(10 / gameState.level, 10)*1000;
    console.log(random);
    await new Promise(resolve => setTimeout(resolve, random));
    console.log("item", item);
    currentColletibles.push(item);
    io.emit("new collectible", {collectible: item});
    if (collectibles.length) {
        generateCollectible();
    }
    //return item;
}

function startInterval() {
    //send updates to everyone
    timer = setInterval(() => {
        if (gameState.on) io.emit('gameState change', gameState);
        //gameState.on = false;
    }, 1000 / FRAME_RATE);
}


const PORT = process.env.PORT || 8080;
server.listen(PORT, (error) => {
    if (error) {
        console.log(error);
    }
    console.log("Server is running on port", Number(PORT));
});