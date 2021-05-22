//setup canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

//amount of collectibles per round
let collectiblesAmount;

//spritesheet information
const characterWidth = 32;
const characterHeight = 32;

//left, right, middle animation values
let left;
let right;
let middle;

//answered to start a game
let answered = false;
let collecting = false;

window.addEventListener("load",() => {
    //reposition canvas to center
    reposition();
    //start the game on load
    setup();
});

window.addEventListener("resize",() => {
    //reposition canvas to center
    reposition();
});

//setup new game
function setup() {
    $("main").append(`<div class="new-player">
    <input class="username-input" type = text required>
    <button class="confirm-username-button" onClick="setupPlayer()">JOIN</button>
</div>`);
}

function setupPlayer() {
    console.log("setup");
    //select img
    let img = new Image();
    img.src = "./images/character/bard.png";
    let initial = new Img("./images/character/bard.png", 2, 0, 0, 2, 1);
    right = [2, 0];
    left = [1, 0];
    middle = [0, 1]; 
    //temporary unique username
    let username = $(".username-input").val();
    //let username = Math.random(50)*10;
    player = new Player(
        canvas.width/2, canvas.height - characterHeight, 
        32, 32,
        username,
        initial
    );

    console.log("username", username);
    console.log("player", player);
    //send data to the server
    socket.emit("client new player", {player: player});
    player.showCollectibles();
}

//player successfully added to the server
socket.on('server new player', (data) => {
    console.log(data);
    if (data.player && player && data.player.username === player.username) {
        $(".new-player").append(`<button class="start-button" onClick="confirmStart('${data.stage}');">START</button>`);
        $(".username-input").attr("disabled", true);
        $(".confirm-username-button").attr("disabled", true);
    }
    //console.log(data);
    //console.log(player.username);
    //start new game only if 1 player present
});

function confirmStart(state) {
    if (state === "starting") {
        socket.emit("start collecting", {});
        $(".start-button").attr("disabled", true);
        $(".new-player").append(`<p class="waiting">Waiting for other players</p>`)
        collecting = true;
    }
}

//draw game state
socket.on('gameState change', (data) => {
    //console.log("gamestate", data);
    /*if(data.players.length > 1) {
        console.log(data.players);
    }*/
    //fakeIt();
    draw(data);
});

//set collectible amount
socket.on('collectibles amount', (data) => {
    $(".start-button").hide()
    $(".new-player").hide();
    collectiblesAmount = data.amount;
});

//draw everything
function draw(data) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //detect collisions
    //console.log("det", player);
    collectibles = player.detectCollisions(collectibles);
    //console.log(collectibles);
    //if (result) console.log("ehm", result);
    //draw background
    //draw each player
    data.players.map(passedPlayer => {
        passedPlayer = new Player(passedPlayer.x, passedPlayer.y, passedPlayer.width, passedPlayer.height, passedPlayer.username, 
            new Img(passedPlayer.img.src, passedPlayer.img.startRow, passedPlayer.img.startColumn, passedPlayer.img.rows, passedPlayer.img.columns, passedPlayer.img.speed, '', passedPlayer.img.currentRow, passedPlayer.img.currentColumn)
        );
        passedPlayer.draw(ctx);
        //console.log(passedPlayer);
        if (player.username === passedPlayer.username) {
            player.img = passedPlayer.img;
            //console.log("player", player);
            //socket.emit("client update", {player: player});
        }
    });
    //draw objects
    drawCollectibles();
}

socket.on("new collectible", (data) => {
    let collectible = new Collectible(data.collectible.x, data.collectible.y, data.collectible.width, data.collectible.height, 
        new Img(data.collectible.img.src, data.collectible.img.startRow, data.collectible.img.startColumn, data.collectible.img.rows, data.collectible.img.columns, data.collectible.img.speed),
        data.collectible.speed, data.collectible.type, data.collectible.value)
    ;
    collectibles.push(collectible);
});

function fakeIt() {
    player.hints = ['0.1c', '1.1d', '2.1e'];
    socket.emit("no collectibles left", {});
}

function drawCollectibles() {
    let length = collectibles.length;
    //console.log("length",length);
    if (length) {
        collectibles = collectibles.filter(collectible => (collectible.y <= 500 && collectible.isColliding === false));
        if (collectibles.length < length) {
            collectiblesAmount -= length - collectibles.length;
            //console.log("amount", collectiblesAmount);
        }
        collectibles.map(collectible => {
            collectible.y += collectible.speed;
            collectible.draw(ctx);
            //console.log(collectible.isColliding);
        });
    }
    //console.log("collcetibles amount", collectiblesAmount)
    if (collectiblesAmount === 0) {
        socket.emit("no collectibles left", {});
    }
}

//move
window.addEventListener("keydown", move);
//stop
window.addEventListener("keyup", stop);

//change animation
function move(e) {
    if (collecting) {
        //move player
        let moved = true;
        switch(e.key) {
            case "A":
            case "a":
            case "ArrowLeft":
                switchImage("start", left);
                player.x -= 1 * player.speed;
                //console.log("x",player.x);
                //console.log("speed",player.speed);
                break;
            case "D":
            case "d":
            case "ArrowRight":
                switchImage("start", right);
                player.x += 1 * player.speed;
                //console.log("x",player.x);
                //console.log("speed",player.speed);
                break;
            default: 
                //prevent unnecessary updates
                moved = false;
        }
        //update server
        if (moved) updateServer();
    }
}

//change animation to standing
function stop() {
    if (collecting) {
        switchImage("start", middle);
        switchImage("current", middle);
        updateServer();
    }
}

//send player update
function updateServer() {
    socket.emit("client update", {player: player});
}

function reposition() {
    console.log("reposition");
}