//setup canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

//amount of collectibles per round
let collectiblesAmount;

//spritesheet information
const characterWidth = 32;
const characterHeight = 32;

//left, right, middle animation values
let character = {};

//draw game state
socket.on('gameState change', (data) => {
    //fakeIt();
    //check if player is in the game
    draw(data);
});

//set collectible amount
socket.on('collectibles amount', (data) => {
    $(".start-button").hide()
    $(".character-choice").hide();
    collectiblesAmount = data.amount;
});

//draw everything
function draw(data) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //detect collisions
    collectibles = player.detectCollisions(collectibles);
    //draw each player
    data.players.map(passedPlayer => {
        passedPlayer = new Player(passedPlayer.x, passedPlayer.y, passedPlayer.width, passedPlayer.height, passedPlayer.username, 
            new Img(passedPlayer.img.src, passedPlayer.img.startRow, passedPlayer.img.startColumn, passedPlayer.img.rows, passedPlayer.img.columns, passedPlayer.img.speed, '', passedPlayer.img.currentRow, passedPlayer.img.currentColumn)
        );
        passedPlayer.draw(ctx);
        if (player.username === passedPlayer.username) {
            player.img = passedPlayer.img;
            //show only if there are more players
            if (data.players.length > 1) {
                printText(15, "#248588", "center", player.username, player.x + player.width/2, player.y - 10);
            }
        } else {
            printText(15, "#9fc5ac", "center", passedPlayer.username, passedPlayer.x + player.width/2, passedPlayer.y - 10);
        }
    });
    //draw objects
    drawCollectibles();
    //draw level
    printText(20, "#248588", "right", `Level ${data.level}`, 490, 20);
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
    if (length) {
        collectibles = collectibles.filter(collectible => (collectible.y <= 500 && collectible.isColliding === false));
        if (collectibles.length < length) {
            collectiblesAmount -= length - collectibles.length;
        }
        collectibles.map(collectible => {
            collectible.y += collectible.speed;
            collectible.draw(ctx);
        });
    }
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
                switchImage("start", character.left);
                player.x -= 1 * player.speed;
                checkSides();
                break;
            case "D":
            case "d":
            case "ArrowRight":
                switchImage("start", character.right);
                player.x += 1 * player.speed;
                checkSides();
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
        switchImage("start", character.middle);
        switchImage("current", character.middle);
        updateServer();
    }
}

//send player update
function updateServer() {
    socket.emit("client update", {player: player});
}

//check sides
function checkSides() {
    if (player.x > 500 - player.width/2) player.x = 0 - player.width/2;
    if (player.x < 0 - player.width/2) player.x = 500 - player.width/2;
}

//print text
function printText(size, color, align, text, x, y) {
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.font = `${size}px Trebuchet MS`;
    ctx.fillText(text, x, y);
}