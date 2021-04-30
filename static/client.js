//setup socket
const socket = io();

//setup canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

window.addEventListener("load",
    () => {
        //set size of canvas to fullscreen
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        //start the game on load
        setup();
    }
);

//setup new game
function setup() {
    //call server to get new data

}

io.on('')


function draw() {

}