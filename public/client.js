//setup socket
const socket = io();

//setup canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

//current player
let player;

//amount of collectibles per round
let collectiblesAmount;

//spritesheet information
const characterWidth = 32;
const characterHeight = 32;

//left, right, middle animation values
let left;
let right;
let middle;

let collectibles = [];

window.addEventListener("load",() => {
    //set size of canvas to fullscreen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    //start the game on load
    setup();
});

window.addEventListener("resize",() => {
    //set size of canvas to fullscreen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

//setup new game
function setup() {
    //select img
    let img = new Image();
    img.src = "./images/character/bard.png";
    let initial = new Img("./images/character/bard.png", 2, 0, 0, 2, 1);
    right = [2, 0];
    left = [1, 0];
    middle = [0, 1]; 
    //temporary unique username
    let username = Math.random(50)*10;
    player = new Player(
        window.innerWidth/2, window.innerHeight - characterHeight, 
        32, 32,
        username,
        initial
    );
    //send data to the server
    socket.emit("client new player", {player: player});
}

//player successfully added to the server
socket.on('server new player', (data) => {
    //console.log(data);
    console.log(player.username);
    socket.emit("start collecting", {});
});

//draw game state
socket.on('gameState change', (data) => {
    //console.log("gamestate");
    draw(data);
});

//set collectible amount
socket.on('collectibles amount', (data) => {
    collectiblesAmount = data.amount;
});

//draw everything
function draw(data) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //draw background
    //draw each player
    data.players.map(passedPlayer => {
        passedPlayer = new Player(passedPlayer.x, passedPlayer.y, passedPlayer.width, passedPlayer.height, passedPlayer.username, 
            new Img(passedPlayer.img.src, passedPlayer.img.startRow, passedPlayer.img.startColumn, passedPlayer.img.rows, passedPlayer.img.columns, passedPlayer.img.speed, '', passedPlayer.img.currentRow, passedPlayer.img.currentColumn)
        );
        //make all players on the bottom even on different sized screens
        passedPlayer.y = window.innerHeight - characterHeight;
        passedPlayer.draw(ctx);
        if (player.username === passedPlayer.username) {
            player = passedPlayer;
            //socket.emit("client update", {player: player});
        }
    });
    //draw objects
    drawCollectibles();
}

socket.on("new collectible", (data) => {
    //change x position to match screen size
    data.collectible.x = window.innerWidth * data.collectible.x;
    let collectible = new Collectible(data.collectible.x, data.collectible.y, data.collectible.width, data.collectible.height, 
        new Img(data.collectible.img.src, data.collectible.img.startRow, data.collectible.img.startColumn, data.collectible.img.rows, data.collectible.img.columns, data.collectible.img.speed),
        data.collectible.speed, data.collectible.type, data.collectible.value)
    ;
    collectibles.push(collectible);
    console.log("new", collectibles);
    console.log("one", collectible);
});

function drawCollectibles() {
    let length = collectibles.length;
    if (length) {
        collectibles.map(collectible => {
            collectible.y += collectible.speed;
            collectible.draw(ctx);
        });
        collectibles = collectibles.filter(collectible => collectible.y <= window.innerHeight)
        if (collectibles.length < length) {
            collectiblesAmount -= length - collectibles.length;
        }
        if (collectiblesAmount === 0) {
            socket.emit("no collectibles left", {});
        }
    }
    //console.log("collcetibles amount", collectiblesAmount)
}

//move
window.addEventListener("keydown", move);
//stop
window.addEventListener("keyup", stop);

//change animation
function move(e) {
    //move player
    let moved = true;
    switch(e.key) {
        case "A":
        case "a":
        case "ArrowLeft":
            switchImage("start", left);
            player.x -= 1 * player.speed;
            break;
        case "D":
        case "d":
        case "ArrowRight":
            switchImage("start", right);
            player.x += 1 * player.speed;
            break;
        default: 
            //prevent unnecessary updates
            moved = false;
    }
    //update server
    if (moved) updateServer();
}

//change animation to standing
function stop() {
    switchImage("start", middle);
    switchImage("current", middle);
    updateServer();
}

//send player update
function updateServer() {
    socket.emit("client update", {player: player});
}

/*//update spreadsheet values
function switchImage(value, array){
    player.img[`${value}Row`] = array[0];
    player.img[`${value}Column`] = array[1];
}*/