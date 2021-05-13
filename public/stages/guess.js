socket.on("guess", (data) => {
    //hide canvas
    $("#canvas").hide();
    //add guessing screen
    $("body").append(renderGuessingElement());
})

renderGuessingElement() {
    return `
    
    
    `
}