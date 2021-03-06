let collecting = false;

function showFirstInfo() {
    $("#second-help").hide();
    $("#first-help").show();
}

function showSecondInfo() {
    $("#second-help").show();
    $("#first-help").hide();
}

//setup new game
function setup() {
    $("#second-help").hide();
    $("#canvas").show();
    let result = `<div class="character-choice center">
    <h2>CHOOSE YOUR CHARACTER:</h2>
    <ul class="character-selection-list">`;
    characters.map((character, index) => {
        result += `<li class="character-select-list-item">
            <input type="radio" class="character-input" id="character-${index}" name="character" value="${index}">
            <label for="character-${index}" class="character-label enabled" id="character-label-${index}"></label>
        </li>`
    })
    result += `</ul>
        <div class="new-player">
        <input id="username-input" class="username-input" type = "text" placeholder="Username" required>
        <button class="confirm-username-button" onClick="setupPlayer()">JOIN</button>
        </div>
        </div>`
    $("main").append(result);
    //change position of picture to show specific character
    characters.map((character, index) => {
        let row = (index % 4 * 3) + 1;
        let column = Math.floor(index/4) * 4;
        $(`#character-label-${index}`).css("background-position", `left calc(${row} * -32px) top calc(${column} * -32px)`);
        $(`#character-${index}`).attr("onClick", `selectCharacter(${index})`);
    });
}

function selectCharacter(i) {
    $(`.character-label`).addClass("disabled");
    $(`#character-label-${i}`).removeClass("disabled");
    character.right = characters[i].right;
    character.left = characters[i].left;
    character.middle = characters[i].middle; 
}

function setupPlayer() {
    const username = $("#username-input").val();
    $(".info-text").remove();
    if (username) {
        if (jQuery.isEmptyObject(character)) {
            selectCharacter(0);
        }
        //remove change of character
        $(".character-input").removeAttr("onclick");
        $(`.character-label`).removeClass("enabled");
        //select img
        const img = new Image();
        img.src = "./images/character/bard.png";
        const initial = new Img("./images/character/bard.png", character.right[0], character.right[1], 0, 2, 1);
        player = new Player(
            canvas.width/2, canvas.height - characterHeight, 
            32, 32,
            username,
            initial
        );
        //send data to the server
        socket.emit("client new player", {player: player});
    }
}

//player successfully added to the server
socket.on('server new player', (data) => {
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
    }
}

socket.on("game in progress", () => {
    $("main").append(renderWait());
});

function renderWait() {
    return `<div class="info-text wait">
        <p>Game already in progress.</br>Please wait till the current game finishes.<br>(Refresh the page and try again later.)</p>
    </div>`
}

socket.on("duplicate name", () => {
    $("main").append(renderDuplicate());
})

function renderDuplicate() {
    return `<div class="info-text duplicate">
        <p>This username is already in use, please try another one.</p>
    </div>`
}

socket.on("empty name", () => {
    $("main").append(renderEmpy());
})

function renderEmpty() {
    return `<div class="info-text empty">
        <p>Please insert your username.</p>
    </div>`
}

socket.on("player ready", (data) => {
    player.showCollectibles();
})

socket.on("game over", () => {
    $("main").empty();
    $("main").append(renderGameOver())
});

socket.on("game end", (data) => {
    $("main").empty();
    $("main").append(renderGameOver(data.game));
});


function renderPlayerScore(player) {
    return `<p>${player.username} : ${player.points} points</p>`;
}

function renderGameOver(game) {
    let result = `<div class="game-over center">
    <h1>Scoreboard</h1>`;
    if (game) {
        game.players.map(gamePlayer => result += renderPlayerScore(gamePlayer));
    } else {
        result += renderPlayerScore(player);
    }
    result += `</div>`;
    return result;
}