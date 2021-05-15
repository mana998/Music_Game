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
            <h2>SHOP</h2>
        </div>
        <div id="guess">
            <h2>GUESS</h2>
            <div id="answer" class="guessing-block">
            </div>
            <button onClick="play()">PLAY</button>
            <button onClick="removeLast()">REMOVE LAST</button>
            <div><span id="current-length"></span><span id="song-length"></span></div>
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
    $("#shop").show();
};

function renderGuess() {
    $("#shop-button").hide();
    $("#guess-button").hide();
    $("#shop").hide();
    $("#guess").show();
    $("#options").append(renderOptions());
}

async function play() {
    for (note of answer) {
        //console.log("note", note);
        let duration = note.replace(/(\d(\.\d)?)[a-z1-9]*/, '$1') / 2;
        //console.log("duration", duration);
        await playNote(note, duration);
    }
}

async function playNote(note, duration) {
    new Sound(`./sounds/notes/${note}.mp3`).play();
    //console.log("note", note, "duration", duration);
    //sounds[note].play();
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
    //console.log("Duration extract", duration);
    duration = Object.keys(lengths).find(key => lengths[key] === Number(duration));
    let note = hint.replace(/\d*\.[0-9.]+(.+)/, "$1");
    //console.log("Position", position, "duration", duration, "note", note);
    return `<li class="hint">Position: ${position}, Note ${note}, Duration ${duration}</li>`;
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
    $("#answer").append(`<img src="./images/notes/${lengths[length]}${(note === 'rest') ? 'rest' : ''}.png" class="${note} ${length}"></img>`);
    answer.push(`${lengths[length]}${note}`);
    $("#current-length").text(answer.length);
    if (answer.length === songLength) {
        $(".note-type-button").attr("disabled", true);
    }
}

function removeLast() {
    if (answer.length === songLength) {
        $(".note-type-button").attr("disabled", false);
    }
    answer.pop();
    $("#current-length").text(answer.length);
    $("#answer").children().last().remove();
}