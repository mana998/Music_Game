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

let gameState;
const Utils = new UtilsObject();

//collectible items
//initialize for 1st level
//let currentColletibles = [];

//interval timer
let timer;

//answered amount
let answered = 0;

//store connected players
const sockets = {};

io.on("connection", (socket) => {

    //new player connected
    socket.on("client new player", (data) => {
        if (!gameState) {
            gameState = new Game();
            //load in first batch of songs
            gameState.loadSongs(require(`./private/levels/${levels[(gameState.level-1)/5]}`));
        }
        //check username duplicate
        if (gameState.on) {
            socket.join('waiting');
            socket.emit("game in progress");
        } else if (gameState.players.some((player) => player.username === data.player.username)){
            socket.emit("duplicate name", {username: data.player.username});
        } else {
            //add player to active players
            sockets[socket.id] = data.player.username;
            gameState.players.push(data.player);
            socket.join('playing');
            io.emit("server new player", {stage: gameState.stage, player: data.player});
            socket.emit("player ready");
        }
    })

    //player update
    socket.on("client update", (data) => {
        if (gameState.players) {
            //find player with same username
            const player = gameState.players.find(player => player.username === data.player.username);
            //replace with new data
            gameState.players[gameState.players.indexOf(player)] = data.player;
        }
    })

    socket.on("start collecting", (data) => {
        answered++;
        if (answered === gameState.players.length) {
            //order according to score
            gameState.players.sort((first, second) => {
                return second.points - first.points;
            });
            if (!gameState.on) {
                gameState.on = true;
                collectibles = gameState.generateCollectibles(Utils.getRandomNumber(0, gameState.songs.length, 1));
            }
            if (data.stage === "new level") {
                if (gameState.level === 20) {
                    io.to("playing").emit("game end", {game: gameState});
                    //reset game
                    gameState = null;
                    clearInterval(timer);
                    return;
                }
                // end of level 5, 10, 15, 20
                if (gameState.level % 5 === 0) gameState.loadSongs(require(`./private/levels/${levels[(gameState.level)/5]}`));
                gameState.level++;
                collectibles = gameState.generateCollectibles(Utils.getRandomNumber(0, gameState.songs.length, 1));
            }
            //send amount of collectibles to client
            startInterval();
            gameState.stage = "collect";
            io.to('playing').emit("collectibles amount", {amount: collectibles.length});
            //recursively generate collectibles
            generateCollectible();
            answered = 0;
        }
    });

    socket.on("no collectibles left", (data) => {
        //stop interval for frequent updates
        clearInterval(timer);
        if (gameState.stage !== "guess") {
            io.to('playing').emit("guess", {length : gameState.song.length});
            gameState.stage = "guess";
        }
    })

    socket.on("send answer", (data) => {
        answered++;
        if (answered === gameState.players.length) {
            io.to('playing').emit("check answers", {players: gameState.players, song: gameState.song})
            answered = 0;
        }
    })

    socket.on("get hint", (data) => {
        const unusedHints = gameState.song.filter((hint) => !data.hints.includes(hint));
        const hint = unusedHints[Utils.getRandomNumber(0, unusedHints.length, true)];
        socket.emit("new hint", {hint: hint});
    })

    socket.on("client lost", (data) => {
        gameState.players = gameState.players.filter((player) => player.username !== data.player.username);
        socket.leave('playing');
        socket.emit("game over");
        if (gameState.players.length === 0) {
            //reset game
            gameState = null;
            clearInterval(timer);
        }
    })

    socket.on("disconnect", () => {
        if (gameState) gameState.players = gameState.players.filter((player) => player.username !== sockets[socket.id]);
        delete sockets[socket.id];
        if (Object.keys(sockets).length === 0) {
            //reset game
            gameState = null;
            clearInterval(timer);
        }
    })

})

async function generateCollectible() {
    if (gameState) {
        const item = collectibles.shift();
        //set custom timeout for each collectible
        //min and max limit depends on level
        const random = Utils.getRandomNumber(6 - gameState.level / 3, (10 - gameState.level / 3))*1000;
        await new Promise(resolve => setTimeout(resolve, random));
        //currentColletibles.push(item);
        io.to('playing').emit("new collectible", {collectible: item});
        if (collectibles.length) {
            generateCollectible();
        }
        //return item;
    }
}

function startInterval() {
    //send updates to everyone
    timer = setInterval(() => {
        if (gameState && gameState.on) io.to('playing').emit('gameState change', gameState);
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