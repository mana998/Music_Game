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
    console.log("guessing");
    songLength = data.length;
    //console.log(songLength);
    //hide canvas
    $("#canvas").hide();
    //add guessing screen
    $("main").append(renderGuessingElement());
    //console.log("player",player);
    for (hint of player.hints) {
        $("#hints").append(renderHint(hint));
    }
    $("#song-length").text(`/${songLength}`);
    $("#current-length").text("0");
})

function renderGuessingElement() {
    return `
    <div id="guess-block">
        <h1 id="player-username">Meno</h1>
        <button id="shop-button" onClick="renderShop()">SHOP</button>
        <button id="guess-button" onClick="renderGuess()">GUESS</button>
        <div id="shop">
            <h2 class="guess-title">SHOP</h2>
        </div>
        <div id="guess">
            <h2 class="guess-title">GUESS</h2>
            <div id="answer" class="guessing-block">
            </div>
            <div class="option-buttons">
                <button onClick="play()">PLAY</button>
                <button onClick="removeLast()">REMOVE LAST</button>
                <button id = "send-answer-button" onClick="sendAnswer()" disabled>SEND ANSWER</button>
            </div>
            <div class="length"><span id="current-length"></span><span id="song-length"></span></div>
            <div id="options">
            </div>
            <h3>HINTS</h3>
            <ul id="hints">
            </ul>
        </div>
    </div>
    `
}

function renderShop() {
    $("#shop-button").hide();
    $("#guess-button").hide();
    $("#guess").hide();
    $("#shop").css("display", "inline-block");
};

function renderGuess() {
    $("#guess-button").hide();
    $("#shop-button").hide();
    $("#shop").hide();
    $("#guess").css("display", "inline-block");
    $("#options").append(renderOptions());
}

async function play() {
    for (note of player.answer) {
        await playOne(note);
    }
}

async function playOne(note) {
    let duration = note.replace(/(\d(\.\d)?)[a-z1-9]*/, '$1') / 2;
    //console.log("duration", duration);
    //console.log("play one before",  new Date().getTime());
    await playNote(note, duration);
    //console.log("play one after",  new Date().getTime());
}

async function playNote(note, duration) {
    new Sound(`./sounds/notes/${note}.mp3`).play();
    //console.log("note", note, "duration", duration);
    //sounds[note].play();
    //console.log("play note before", new Date().getTime());
    await new Promise(resolve => setTimeout(resolve, duration * 1000));
    //console.log("play note after duration", duration,  new Date().getTime());
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
    //console.log("Duration extract", duration);
    duration = Object.keys(lengths).find(key => lengths[key] === Number(duration));
    let note = hint.replace(/\d*\.[0-9.]+(.+)/, "$1");
    //console.log("Position", position, "duration", duration, "note", note);
    return `<li class="hint">Position: ${position + 1}, Note ${note}, Duration ${duration}</li>`;
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
    drawNote(note, length);
    //console.log(player);
    player.answer.push(`${lengths[length]}${note}`);
    $("#current-length").text(player.answer.length);
    if (player.answer.length === songLength) {
        $(".note-type-button").attr("disabled", true);
        $("#send-answer-button").attr("disabled", false);
    } else {
        $("#send-answer-button").attr("disabled", true);
    }
}

function drawNote(note, length) {
    $("#answer").append(`<img src="./images/notes/${lengths[length]}${(note === 'rest') ? 'rest' : ''}.png" class="${note} ${length}"></img>`);
}

function removeLast() {
    if (player.answer.length === songLength) {
        $(".note-type-button").attr("disabled", false);
    }
    player.answer.pop();
    $("#current-length").text(player.answer.length);
    $("#answer").children().last().remove();
}

function sendAnswer() {
    //console.log(player.answer);
    socket.emit("client update", {player: player});
    socket.emit("send answer", {player: player});
    $("button").attr("disabled", true);
    $("#guess").prepend(`<h2>Waiting for other players</h2>`);
}

socket.on("check answers", (data) => {
    $('#guess').contents(':not(#answer)').remove();
    $('#answer img').remove();
    $('#guess').prepend(`<h2 class = "points">Points: <span id="point">0</span></h2>`);
    $('#guess').prepend(`<h1 class = "guessing-player"></h1>`);
    checkAnswers(data);
})

async function checkAnswers(data) {
    data.song = data.song.map((note) => note.replace(/\d+\.(.+)/, "$1"));
    for (let i = 0; i < data.players.length; i++) {
    //for (guessingPlayer of data.players) {
        let guessingPlayer = data.players[i];
        let points = 0;
        $(".points").text(points).css("color", "black");
        $('.guessing-player').text(guessingPlayer.username);
        await new Promise(resolve => setTimeout(resolve, 5000));
        let index = 0;
        for (note of guessingPlayer.answer) {
            points = await showGuessNote(note, index++, points, data.song);
            //console.log("points", points);
        }
        guessingPlayer.points += points;
        await new Promise(resolve => setTimeout(resolve, 5000));
        //console.log("after play");
        $('#answer img').remove();
    }
    $(".points").text(0).css("color", "black");
    $('.guessing-player').text("CORRECT SONG");
    $('#guess .points').remove();
    for (note of data.song) {
        await showGuessNote(note);
    }
}

async function showGuessNote(note, index, points, song){
    let duration = note.replace(/(\d(\.\d)?)[a-z1-9-]*/, '$1');
    let noteType = note.replace(/\d(\.\d)?([a-z1-9-]*)/, '$2');
    noteType = noteType.replace("-", "rest");
    duration = Object.keys(lengths).find(key => lengths[key] === Number(duration));
    if (index > -1) {
        song[index] = song[index].replace("-", "rest");
        if (note === song[index]) {
            $(".points").text(++points).css("color", "green");
        } else {
            $(".points").text(--points).css("color", "red");
        }
    }
    drawNote(noteType, duration);
    await playOne(note);
    return points;
}