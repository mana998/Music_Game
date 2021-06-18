const notes = ['rest','c', 'd', 'e', 'f', 'g', 'a', 'h', 'c2'];
const lengths = {
    "whole": 4,
    "dotted-half": 3,  
    "half": 2,
    "dotted-quarter": 1.5,
    "quarter": 1,
    "eighth": 0.5
};

const sounds = {};

let songLength;

let row;
let soundLength;

(function loadSounds() {
    for (note of notes) {
        for (let length in lengths) {
            if (!note.includes("rest") && !length.includes("dotted")){
                sounds[`${lengths[length]}${note}`] = new Sound(`./sounds/notes/${lengths[length]}${note}.mp3`);
            }
        };
    }
})();


const answer = [];

socket.on("guess", (data) => {
    row = 0;
    soundLength = 0;
    songLength = data.length;
    //hide canvas
    $("#canvas").hide();
    //add guessing screen
    $("main").append(renderGuessingElement());
    renderEmptyHintsTable();
    appendRow();
    for (hint of player.hints) {
        renderHint(hint);
    }
    $("#song-length").text(`/${songLength}`);
    $("#current-length").text("0");
})

function renderEmptyHintsTable() {
    let hints = `<button id="close-hints-button" onClick="$('#hints').hide()"></button>
        <h3>HINTS</h3>
        <div id="hints-table">`;
    for (let i = 0; i < songLength; i++) {
        hints += (`<div class="grid-item">
            <div class="hint-value" id="hint-position-${i}">${i+1}.</div>
            <div class="hint-value" id="hint-note-${i}">?</div>
            <div class="hint-value" id="hint-duration-${i}">?</div>
        </div>`);
    }
    hints += `</div>`;
    $("#hints").append(hints);
}

function appendRow() {
    row++;
    $("#answers").append(`<div id="answer${row}" class="guessing-block"></div>`);
}

function removeRow() {
    $(`#answers #answer${row}`).remove();
    row--;
}

function renderGuessingElement() {
    return `
    <div id="guess-block">
        <h1 id="player-username">${player.username}</h1>
        <button id="shop-button" onClick="renderShop()">SHOP</button>
        <button id="guess-button" onClick="renderGuess()">GUESS</button>
        <div id="shop">
            <h2 class="guess-title">SHOP</h2>
            <div class="shop-item">
                <img src="./images/collectibles/health.png">
                <span>Price: 5</span>
                <button id="buy-health-button" ${player.coins < 5 ? 'disabled' : ''} onClick="buyHealth();">BUY HEART</button>
            </div>
            <div class="shop-item">
                <img src="./images/collectibles/speed.png">
                <span>Price: 20</span>
                <button id="buy-speed-button" ${(player.coins < 20 || player.speed === 15) ? 'disabled' : ''} onClick="buySpeed();">BUY Speed</button>
            </div>
            <div class="shop-item">
                <img src="./images/collectibles/hints.png">
                <span>Price: 10</span>
                <button id="buy-hint-button" ${(player.coins < 10 || player.hints.length === songLength) ? 'disabled' : ''} onClick="buyHint();">BUY HINT</button>
            </div>
        </div>
        <div id="guess">
            <h2 class="guess-title">GUESS</h2>
            <button class="show-hints" onClick="$('#hints').show()">HINTS</button>
            <div id="answers"></div>
            <div class="option-buttons">
                <button onClick="play()">PLAY</button>
                <button onClick="removeLast()">REMOVE LAST</button>
                <button id = "send-answer-button" onClick="sendAnswer()" disabled>SEND ANSWER</button>
            </div>
            <div class="length"><span id="current-length"></span><span id="song-length"></span></div>
            <div id="options">
            </div>
            <div id="hints" style="display:none"></div>
        </div>
    </div>
    `
}

function renderShop() {
    $("#guess-button").show();
    $("#guess-button").addClass("top-right-button");
    $("#shop-button").hide();
    $("#guess").hide();
    $("#shop").css("display", "inline-block");
};

function renderGuess() {
    $("#shop-button").show();
    $("#guess-button").hide();
    $("#shop-button").addClass("top-right-button");
    $("#shop").hide();
    $("#guess").css("display", "inline-block");
    if ($("#options").children().length === 0) {
        $("#options").append(renderOptions());
    }
}

async function play() {
    for (note of player.answer) {
        await playOne(note);
    }
}

async function playOne(note) {
    let duration = note.replace(/(\d(\.\d)?)[a-z1-9]*/, '$1') / 2;
    await playNote(note, duration);
}

async function playNote(note, duration) {
    new Sound(`./sounds/notes/${note}.mp3`).play();
    await new Promise(resolve => setTimeout(resolve, duration * 1000));
}

function renderOptions() {
    let options = '';
    notes.map(note => {
        options += renderOption(note);
    })
    return options;
}

function renderOption(note) {
    return `<button class="note-type-button" onClick="selectLength('${note}')">${note}</button>`;
}

function renderHint(hint) {
    let position = hint.split('.')[0];
    let duration = hint.replace(/\d*\.([0-9.]+).+/, "$1");
    duration = Object.keys(lengths).find(key => lengths[key] === Number(duration));
    let note = hint.replace(/\d*\.[0-9.]+(.+)/, "$1");
    $(`#hint-note-${position}`).text(note !== "-" ? note.toUpperCase() : "REST");
    $(`#hint-duration-${position}`).text(duration);
}

function selectLength(note) {
    $("body").append(generateLengths(note));
}

function generateLengths(note) {
    let lengthBlock = `<div class="length-block">`;
    for (let length in lengths) {
        if (note.includes("rest") && !length.includes("dotted")) {
            lengthBlock += `<img src="./images/notes/${lengths[length]}rest.png" onClick="addNote('${note}', '${length}')"></img>`;
        } else if (!note.includes("rest")){
            lengthBlock += `<img src="./images/notes/${lengths[length]}.png" onClick="addNote('${note}', '${length}')"></img>`;
        }
    };
    lengthBlock += `</div>`;
    return lengthBlock;
}

function addNote(note, length) {
    $("body .length-block").remove();
    if (soundLength / row >= 16 && player.answer.length < songLength) {
        appendRow();
    }
    drawNote(note, length);
    player.answer.push(`${lengths[length]}${note}`);
    soundLength += lengths[length];
    $("#current-length").text(player.answer.length);
    if (player.answer.length === songLength) {
        $(".note-type-button").attr("disabled", true);
        $("#send-answer-button").attr("disabled", false);
    } else {
        $("#send-answer-button").attr("disabled", true);
    }
}

function drawNote(note, length) {
    $(`#answer${row}`).append(`<img src="./images/notes/${lengths[length]}${(note === 'rest') ? 'rest' : ''}.png" class="${note} ${length}"></img>`);
}

function removeLast() {
    if (player.answer.length === songLength) {
        $(".note-type-button").attr("disabled", false);
    }
    let answer = player.answer.pop();
    $("#current-length").text(player.answer.length);

    answer = answer.replace(/([0-9\.]+).*/, "$1");
    $(`#answer${Math.ceil((soundLength - answer)/ 16 + 0.0001)}`).children().last().remove();
    soundLength -= answer;
    if (soundLength / (row - 1) < 16) {
        removeRow();
    }
}

function sendAnswer() {
    socket.emit("client update", {player: player});
    socket.emit("send answer", {player: player});
    $("button").attr("disabled", true);
    $("#guess").prepend(`<h2>Waiting for other players</h2>`);
}

socket.on("check answers", (data) => {
    $('#guess').contents(':not(#answers)').remove();
    $('#answers div').remove();
    $('#guess').prepend(`<h2 class = "points">Points: <span id="point">0</span></h2>`);
    $('#guess').prepend(`<h1 class = "guessing-player"></h1>`);
    checkAnswers(data);
})

async function checkAnswers(data) {
    data.song = data.song.map((note) => note.replace(/\d+\.(.+)/, "$1"));
    for (let i = 0; i < data.players.length; i++) {
        row = 0;
        soundLength = 0;
        appendRow();
    //for (guessingPlayer of data.players) {
        let guessingPlayer = data.players[i];
        let points = 0;
        $(".points").text(points).css("color", "black");
        $('.guessing-player').text(guessingPlayer.username);
        await new Promise(resolve => setTimeout(resolve, 5000));
        let index = 0;
        for (note of guessingPlayer.answer) {
            points = await showGuessNote(note, index++, points, data.song);
        }
        if (guessingPlayer.username === player.username) {
            player.points += points;
            if (points < 0) {
                player.health += points;
                $(`#health-value`).text(player.health);
            }
            $(`#points-value`).text(player.points);
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
        $('#answers div').remove();
    }
    row = 0;
    soundLength = 0;
    appendRow();
    $(".points").text(0).css("color", "black");
    $('.guessing-player').text("CORRECT SONG");
    $('#guess .points').remove();
    let index = 0;
    for (note of data.song) {
        await showGuessNote(note, index++, '', data.song);
    }
    $("main #guess-block").remove();
    $("#canvas").show();
    player.answer = [];
    player.hints = [];
    $(`#hints-value`).text(player.hints.length);
    player.checkHealth();
    if (player.health > 0) {
        socket.emit("client update", {player: player});
        socket.emit("start collecting", {stage: "new level"});
    }
}

async function showGuessNote(note, index, points, song){
    let duration = note.replace(/(\d(\.\d)?)[a-z1-9-]*/, '$1');
    let noteType = note.replace(/\d(\.\d)?([a-z1-9-]*)/, '$2');
    noteType = noteType.replace("-", "rest");
    duration = Object.keys(lengths).find(key => lengths[key] === Number(duration));
    drawNote(noteType, duration);
    if (typeof(points) === "number" && index > -1) {
        song[index] = song[index].replace("-", "rest");
        if (note === song[index]) {
            $(".points").text(++points).css("color", "green");
            $(`#answer${row}`).children().last().css("filter", "brightness(5) hue-rotate(142deg) contrast(1) saturate(6)")
        } else {
            $(".points").text(--points).css("color", "red");
            $(`#answer${row}`).children().last().css("filter", "brightness(4.5) hue-rotate(16deg) contrast(0.75) saturate(10)")
        }
    }
    soundLength += lengths[duration];
    if (soundLength / row >= 16 && song.length > index + 1 ) {
        appendRow();
    }
    note = note.replace("-", "rest");
    await playOne(note);
    return points;
}

function buyHealth() {
    player.coins -= 5;
    player.health += 1;
    $(`#health-value`).text(player.health);
    $(`#coins-value`).text(player.coins);
    checkMoney();
}

function buySpeed() {
    player.coins -= 20;
    player.speed += 1;
    $(`#speed-value`).text(player.speed);
    $(`#coins-value`).text(player.coins);
    checkMoney();
}


function buyHint() {
    player.coins -= 10;
    socket.emit("get hint", {hints: player.hints});
}

socket.on("new hint", (data) => {
    player.hints.push(data.hint);
    renderHint(data.hint);
    $(`#hints-value`).text(player.hints.length);
    $(`#coins-value`).text(player.coins);
    checkMoney();
});

function checkMoney() {
    if (player.coins < 20 || player.speed === 15) {
        $("#buy-speed-button").attr("disabled", true);
    }
    if (player.coins < 10 || player.hints.length === songLength) {
        $("#buy-hint-button").attr("disabled", true);
    }
    if (player.coins < 5) {
        $("#buy-health-button").attr("disabled", true);
    }
}