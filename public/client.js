//setup socket
const socket = io();

//setup canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

//current player
let player;

//spritesheet information
const characterWidth = 32;
const characterHeight = 32;

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
    console.log("setup");
    //select img
    let img = new Image();
    img.src = "./images/character/bard.png";
    //temporary unique username
    let username = Math.random(50)*10;
    player = new Player(
        window.innerWidth/2, window.innerHeight - characterHeight, 
        32, 32,
        username,
        new Img("./images/character/bard.png", 2, 0, 0, 2, 1)
    );
    //send data to the server
    socket.emit("client new player", {player: player});
}

//player successfully added to the server
socket.on('server new player', (data) => {
    //console.log(data);
    console.log(player.username);
});

//draw game state
socket.on('gameState change', (data) => {
    //console.log("gamestate");
    draw(data);
});

//draw everything
function draw(data) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //draw background
    //draw objects
    //draw each player
    data.players.map(passedPlayer => {
        passedPlayer = new Player(player.x, player.y, player.width, player.height, player.username, 
            new Img(player.img.src, player.img.startRow, player.img.startColumn, player.img.rows, player.img.columns, player.img.speed, '', player.img.currentRow, player.img.currentColumn)
        );
        //make all players on the bottom even on different sized screens
        passedPlayer.y = window.innerHeight - characterHeight;
        passedPlayer.draw(ctx);
        if (player.username === passedPlayer.username) {
            player = passedPlayer;
            socket.emit("client update", {player: player});
        }
    });
}

//move
window.addEventListener("keydown", move);
//stop
window.addEventListener("keyup", stop);

//change animation
function move(e) {
    //move player
    switch(e.key) {
        case "A":
        case "a":
        case "ArrowLeft":
            player.x -= 1 * player.speed;
            break;
        case "D":
        case "d":
        case "ArrowRight":
            player.x += 1 * player.speed;
            break;
    }
    //update server
    socket.emit("client update", {player: player});
}

//change animation to standing
function stop() {

}
