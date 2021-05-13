const notes = ['c', 'd', 'e', 'f', 'g', 'a', 'h', 'c2'];
const lengths = {
    full: 4, 
    half: 2, 
    quarter: 1,
    eighth: 0.5
};
const answer = [];

socket.on("guess", (data) => {
    //hide canvas
    $("#canvas").hide();
    //add guessing screen
    $("main").append(renderGuessingElement());
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
            <div id="options">
            </div>
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

function renderNotes() {

}

function play() {

}

function renderOptions() {
    let options;
    notes.map(note => {
        options += renderOption(note);
    })
    return options;
}

function renderOption(note) {
    return `<button onClick="selectLength('${note}')">${note}</button>`;
}

function selectLength(note) {
    $("body").append(generateLengths(note));
}

function generateLengths(note) {
    let lengthBlock = `<div class="length-block">`;
    for (let length in lengths) {
        console.log(length);
        lengthBlock += `<img src="./images/notes/${lengths[length]}.png" onClick="addNote('${note}', '${length}')"></img>`;
    };
    lengthBlock += `</div>`;
    return lengthBlock;
}

function addNote(note, length) {
    $("body .length-block").remove();
    $("#answer").append(`<img src="./images/notes/${lengths[length]}.png" class="${note} ${length}"></img>`);
    answer.push(`${length}${note}`);
}

function removeLast() {
    answer.pop();
    $("#answer").children().last().remove();
}