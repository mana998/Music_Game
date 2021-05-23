//answered to start a game
let answered = false;
let collecting = false;

window.addEventListener("load",() => {
    setup();
});


//setup new game
function setup() {
    $("main").append(`<div class="new-player">
        <input id="username-input" class="username-input" type = "text" required>
        <button class="confirm-username-button" onClick="setupPlayer()">JOIN</button>
    </div>`);
}

function setupPlayer() {
    //select img
    let img = new Image();
    img.src = "./images/character/bard.png";
    let initial = new Img("./images/character/bard.png", 2, 0, 0, 2, 1);
    right = [2, 0];
    left = [1, 0];
    middle = [0, 1]; 
    let username = $("#username-input").val();
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

socket.on("game in progress", () => {
    console.log("wait");
    $("main").append(renderWait());
});

function renderWait() {
    return `<div class="wait"
        <p>Game already in progress.</br>Please wait till current game finishes.<br>(Refresh the page and try again later.)</p>
    </div>`
}

socket.on("game over", () => {
    console.log("game over");
    $("main").empty();
    $("main").append(renderGameOver())
});

function renderGameOver() {
    console.log("player", player);
    return `<div class="game-over">
        <h1>Game Over</h1>
        <p>Username: ${player.username}</p>
        <p>Score: ${player.points}</p>
    </div>`
}